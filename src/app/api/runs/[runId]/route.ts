import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hasProjectPermission } from '@/lib/auth/permissions';

interface RouteContext {
  params: Promise<{ runId: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { runId } = await context.params;

  const run = await prisma.automationRun.findUnique({
    where: { id: runId },
  });

  if (!run) {
    return NextResponse.json({ error: 'Automation run not found.' }, { status: 404 });
  }

  const membership = await prisma.tenantMembership.findUnique({
    where: { tenantId_userId: { tenantId: run.tenantId, userId: user.id } },
  });

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const project = await prisma.researchProject.findUnique({ where: { id: run.projectId } });
  if (!project || project.tenantId !== run.tenantId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!hasProjectPermission(membership.role, 'project:view')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const events = await prisma.automationRunEvent.findMany({
    where: { runId: run.id },
    orderBy: { timestamp: 'asc' },
  });

  // `results` is persisted on the run when a `complete` callback carries a payload.
  return NextResponse.json({ run: { ...run, events } });
}
