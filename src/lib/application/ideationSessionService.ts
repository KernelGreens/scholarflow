import prisma from '@/lib/prisma';

export type IdeationSessionCreateInput = {
  tenantId: string;
  ownerId: string;
  interest: string;
  motivation?: string | null;
  context?: unknown;
  desiredOutcome?: unknown;
};

export async function createIdeationSession(input: IdeationSessionCreateInput) {
  return prisma.ideationSession.create({
    data: {
      tenantId: input.tenantId,
      ownerId: input.ownerId,
      interest: input.interest,
      motivation: input.motivation ?? null,
      context: (input.context ?? undefined) as never,
      desiredOutcome: (input.desiredOutcome ?? undefined) as never,
    },
  });
}

export async function listIdeationSessionsByTenantOwner(tenantId: string, ownerId: string) {
  return prisma.ideationSession.findMany({
    where: { tenantId, ownerId },
    orderBy: { createdAt: 'desc' },
  });
}
