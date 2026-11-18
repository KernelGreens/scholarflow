import prisma from '@/lib/prisma';

export type DomainSummaryIngestResult = {
  ingested: number;
  skipped: number;
};

type RunResultsPayload = {
  domainSummaries?: unknown;
};

function extractDomainSummaryRecords(results: unknown): Array<Record<string, unknown>> {
  if (!results || typeof results !== 'object') {
    return [];
  }
  const payload = results as RunResultsPayload;
  if (!Array.isArray(payload.domainSummaries)) {
    return [];
  }
  const records: Array<Record<string, unknown>> = [];
  for (const item of payload.domainSummaries) {
    if (item && typeof item === 'object') {
      records.push(item as Record<string, unknown>);
    }
  }
  return records;
}

export async function ingestRunDomainSummaries(runId: string): Promise<DomainSummaryIngestResult> {
  const run = await prisma.automationRun.findUnique({ where: { id: runId } });
  if (!run || run.status !== 'COMPLETED' || !run.results) {
    // Do not fabricate outputs; nothing to ingest without a completed run + results payload.
    return { ingested: 0, skipped: 0 };
  }

  const records = extractDomainSummaryRecords(run.results);
  let ingested = 0;
  let skipped = 0;

  for (const record of records) {
    const domain = typeof record.domain === 'string' ? record.domain : '';
    if (!domain) {
      skipped += 1;
      continue;
    }
    const summary = typeof record.summary === 'string' ? record.summary : '';
    const input = {
      tenantId: run.tenantId,
      projectId: run.projectId,
      runId: run.id,
      domain,
      summary,
      sources: (record.sources ?? undefined) as never,
      metadata: (record.metadata ?? undefined) as never,
    };

    await prisma.domainSummary.upsert({
      where: { projectId_domain: { projectId: run.projectId, domain } },
      create: input,
      update: input,
    });
    ingested += 1;
  }

  return { ingested, skipped };
}

export async function listDomainSummariesByProject(projectId: string) {
  return prisma.domainSummary.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
}
