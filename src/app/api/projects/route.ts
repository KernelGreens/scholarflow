import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { researchProjectSchema } from '@/lib/validation/researchProjectSchema';
import { ResearchProjectServiceError, createResearchProject } from '@/lib/application/researchProjectService';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown>;
  const parsed = researchProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Resolve tenant from workspace slug when provided, otherwise use the raw identifier.
  let tenantId = parsed.data.tenantId;
  const slug = typeof body?.slug === 'string' ? body.slug : undefined;
  if (slug) {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (tenant) {
      // Authorisation: the actor must be a member of this tenant.
      const membership = await prisma.tenantMembership.findUnique({
        where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      });
      if (!membership) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      tenantId = tenant.id;
    }
  }

  try {
    const { projectId } = await createResearchProject({
      actorUserId: user.id,
      tenantId,
      input: parsed.data,
    });

    return NextResponse.json({ projectId }, { status: 201 });
  } catch (error) {
    if (error instanceof ResearchProjectServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[api/projects] failed to create project', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId query parameter is required' }, { status: 400 });
  }

  const projects = await prisma.researchProject.findMany({
    where: { tenantId },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ projects });
}
