import { researchProjectSchema, type ResearchProjectInput } from '@/lib/validation/researchProjectSchema';
import prisma from '@/lib/prisma';

export class ResearchProjectServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function createResearchProject(params: {
  actorUserId: string;
  tenantId?: string;
  tenantSlug?: string;
  input: ResearchProjectInput;
}): Promise<{ projectId: string }> {
  const parsed = researchProjectSchema.parse(params.input);

  let tenantId = params.tenantId;
  if (!tenantId && params.tenantSlug) {
    const tenant = await prisma.tenant.findUnique({ where: { slug: params.tenantSlug } });
    if (!tenant) {
      throw new ResearchProjectServiceError('Workspace not found.', 404);
    }
    tenantId = tenant.id;
  }

  if (!tenantId) {
    throw new ResearchProjectServiceError('Workspace identifier is required.', 400);
  }

  const membership = await prisma.tenantMembership.findUnique({
    where: {
      tenantId_userId: { tenantId, userId: params.actorUserId },
    },
  });

  if (!membership) {
    throw new ResearchProjectServiceError('You are not a member of this workspace.', 403);
  }

  const project = await prisma.researchProject.create({
    data: {
      tenantId,
      createdById: params.actorUserId,
      title: parsed.title,
      shortTitle: parsed.shortTitle,
      description: parsed.description,
      discipline: parsed.discipline,
      aim: parsed.aim,
      institution: parsed.institution,
      programmeType: parsed.programmeType,
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      targetCompletionDate: parsed.targetCompletionDate ? new Date(parsed.targetCompletionDate) : null,
      keywords: parsed.keywords,
      tags: parsed.tags,
      privacy: parsed.privacy,
      status: 'DRAFT',
      phase: 'RESEARCH_DISCOVERY',
    },
  });

  await prisma.projectMembership.create({
    data: {
      projectId: project.id,
      userId: params.actorUserId,
      role: 'OWNER',
    },
  });

  await prisma.researchPhase.create({
    data: {
      projectId: project.id,
      phase: 'RESEARCH_DISCOVERY',
      sequence: 0,
      status: 'PENDING',
    },
  });

  return { projectId: project.id };
}
