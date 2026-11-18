import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hasProjectPermission } from '@/lib/auth/permissions';
import { verifyCallbackSignature, getN8nSigningSecret, CALLBACK_EVENT_TYPES, type CallbackEventType } from '@/lib/automation/n8n';
import { callbackEventSchema } from '@/lib/validation/automationRunSchema';
import { ingestRunPublications } from '@/lib/application/publicationService';
import { ingestRunDomainSummaries } from '@/lib/application/domainSummaryService';

interface RouteContext {
  params: Promise<{ runId: string; event: string }>;
}

export async function POST(req: Request, context: RouteContext) {
  const { runId, event } = await context.params;

  const rawBody = await req.text();
  const signature = req.headers.get('x-scholarflow-signature') ?? '';
  const timestamp = req.headers.get('x-scholarflow-timestamp') ?? undefined;

  const valid = verifyCallbackSignature({
    rawBody,
    signature,
    secret: getN8nSigningSecret(),
    timestamp,
  });

  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const parsedBody = (() => {
    try {
      return JSON.parse(rawBody);
    } catch {
      return null;
    }
  })();

  const parsedEvent = callbackEventSchema.safeParse(parsedBody);
  if (!parsedEvent.success) {
    return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 });
  }

  const eventType = parsedEvent.data.type as CallbackEventType;
  const allowedEvents: ReadonlySet<string> = new Set<string>(CALLBACK_EVENT_TYPES);
  if (!allowedEvents.has(event) || event !== eventType) {
    return NextResponse.json({ error: 'Event type mismatch' }, { status: 400 });
  }

  const run = await prisma.automationRun.findUnique({ where: { id: runId } });
  if (!run) {
    return NextResponse.json({ error: 'Automation run not found.' }, { status: 404 });
  }

  let nextStatus: string | null = run.status;
  if (eventType === 'complete') {
    nextStatus = 'COMPLETED';
  } else if (eventType === 'fail') {
    nextStatus = 'FAILED';
  } else if (eventType === 'progress') {
    nextStatus = 'PARTIAL';
  }

  const shouldPersistResults = nextStatus === 'COMPLETED' && parsedEvent.data.payload != null;

  const updatedRun = nextStatus
    ? await prisma.automationRun.update({
        where: { id: runId },
        data: {
          status: nextStatus as never,
          completedAt: nextStatus === 'COMPLETED' || nextStatus === 'FAILED' ? new Date() : run.completedAt,
          ...(shouldPersistResults ? { results: parsedEvent.data.payload as never } : {}),
        },
        include: { events: true },
      })
    : await prisma.automationRun.findUnique({
        where: { id: runId },
        include: { events: true },
      });

  if (nextStatus === 'COMPLETED') {
    const publicationIngestion = await ingestRunPublications(runId);
    console.log('[api/internal/automation] publication ingestion', publicationIngestion);
    const domainSummaryIngestion = await ingestRunDomainSummaries(runId);
    console.log('[api/internal/automation] domain summary ingestion', domainSummaryIngestion);
  }

  await prisma.automationRunEvent.create({
    data: {
      runId,
      type: eventType,
      status: parsedEvent.data.status ?? nextStatus ?? undefined,
      payload: (parsedEvent.data.payload ?? undefined) as never,
      timestamp: new Date(),
    },
  });

  return NextResponse.json({ ok: true, run: updatedRun });
}
