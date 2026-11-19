import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createIdeationSession } from '@/lib/application/ideationSessionService';

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    tenantId?: string;
    interest?: string;
    motivation?: string | null;
    context?: unknown;
    desiredOutcome?: unknown;
  } | null;

  const interest = typeof body?.interest === 'string' ? body.interest.trim() : '';
  if (interest.length < 2) {
    return NextResponse.json({ error: 'Research interest is required.' }, { status: 400 });
  }

  const tenantId = typeof body?.tenantId === 'string' ? body.tenantId : '';
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
  }

  const membership = await prisma.tenantMembership.findUnique({
    where: { tenantId_userId: { tenantId, userId: user.id } },
  });
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const created = await createIdeationSession({
    tenantId,
    ownerId: user.id,
    interest,
    motivation: body?.motivation ?? null,
    context: body?.context,
    desiredOutcome: body?.desiredOutcome,
  });

  return NextResponse.json({ session: created }, { status: 201 });
}
