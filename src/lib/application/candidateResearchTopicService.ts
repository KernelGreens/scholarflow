import prisma from '@/lib/prisma';

export type CandidateResearchTopicIngestResult = {
  ingested: number;
  skipped: number;
};

type RunResultsPayload = {
  candidateTopics?: unknown;
};

function extractCandidateTopicRecords(results: unknown): Array<Record<string, unknown>> {
  if (!results || typeof results !== 'object') {
    return [];
  }
  const payload = results as RunResultsPayload;
  if (!Array.isArray(payload.candidateTopics)) {
    return [];
  }
  const records: Array<Record<string, unknown>> = [];
  for (const item of payload.candidateTopics) {
    if (item && typeof item === 'object') {
      records.push(item as Record<string, unknown>);
    }
  }
  return records;
}

export async function ingestRunCandidateResearchTopics(
  runId: string
): Promise<CandidateResearchTopicIngestResult> {
  const run = await prisma.automationRun.findUnique({ where: { id: runId } });
  if (!run || run.status !== 'COMPLETED' || !run.results) {
    // Do not fabricate outputs; nothing to ingest without a completed run + results payload.
    return { ingested: 0, skipped: 0 };
  }

  const records = extractCandidateTopicRecords(run.results);
  let ingested = 0;
  let skipped = 0;

  for (const record of records) {
    const proposedTitle = typeof record.proposedTitle === 'string' ? record.proposedTitle : '';
    if (!proposedTitle) {
      skipped += 1;
      continue;
    }
    const externalId = typeof record.externalId === 'string' ? record.externalId : `${run.id}-${ingested + skipped + 1}`;
    const input = {
      tenantId: run.tenantId,
      projectId: run.projectId,
      runId: run.id,
      externalId,
      proposedTitle,
      researchProblem: typeof record.researchProblem === 'string' ? record.researchProblem : null,
      domain: typeof record.domain === 'string' ? record.domain : null,
      motivation: typeof record.motivation === 'string' ? record.motivation : null,
      possibleResearchQuestions: (record.possibleResearchQuestions ?? undefined) as never,
      existingApproaches: (record.existingApproaches ?? undefined) as never,
      potentialContribution: typeof record.potentialContribution === 'string' ? record.potentialContribution : null,
      availableEvidence: (record.availableEvidence ?? undefined) as never,
      knownLimitations: typeof record.knownLimitations === 'string' ? record.knownLimitations : null,
      feasibility: typeof record.feasibility === 'string' ? record.feasibility : null,
      requiredData: typeof record.requiredData === 'string' ? record.requiredData : null,
      researcherNotes: typeof record.researcherNotes === 'string' ? record.researcherNotes : null,
      reviewStatus: typeof record.reviewStatus === 'string' ? record.reviewStatus : 'SUGGESTED',
      metadata: (record.metadata ?? undefined) as never,
    };

    await prisma.candidateResearchTopic.upsert({
      where: { projectId_externalId: { projectId: run.projectId, externalId } },
      create: input,
      update: input,
    });
    ingested += 1;
  }

  return { ingested, skipped };
}

export async function listCandidateResearchTopicsByProject(projectId: string) {
  return prisma.candidateResearchTopic.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
}
