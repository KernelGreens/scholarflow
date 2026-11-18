import prisma from '@/lib/prisma';

export type PublicationIngestResult = {
  ingested: number;
  skipped: number;
};

type RunResultsPayload = {
  publications?: unknown;
};

function extractPublicationRecords(results: unknown): Array<Record<string, unknown>> {
  if (!results || typeof results !== 'object') {
    return [];
  }
  const payload = results as RunResultsPayload;
  if (!Array.isArray(payload.publications)) {
    return [];
  }
  const records: Array<Record<string, unknown>> = [];
  for (const item of payload.publications) {
    if (item && typeof item === 'object') {
      records.push(item as Record<string, unknown>);
    }
  }
  return records;
}

export async function ingestRunPublications(runId: string): Promise<PublicationIngestResult> {
  const run = await prisma.automationRun.findUnique({ where: { id: runId } });
  if (!run || run.status !== 'COMPLETED' || !run.results) {
    // Do not fabricate outputs; nothing to ingest without a completed run + results payload.
    return { ingested: 0, skipped: 0 };
  }

  const records = extractPublicationRecords(run.results);
  let ingested = 0;
  let skipped = 0;

  for (const record of records) {
    const externalId = typeof record.externalId === 'string' ? record.externalId : '';
    if (!externalId) {
      skipped += 1;
      continue;
    }
    const input = {
      tenantId: run.tenantId,
      projectId: run.projectId,
      runId: run.id,
      externalId,
      title: typeof record.title === 'string' ? record.title : '',
      authors: (record.authors ?? undefined) as never,
      year: typeof record.year === 'number' ? record.year : null,
      source: typeof record.source === 'string' ? record.source : null,
      url: typeof record.url === 'string' ? record.url : null,
      doi: typeof record.doi === 'string' ? record.doi : null,
      type: typeof record.type === 'string' ? record.type : null,
      abstract: typeof record.abstract === 'string' ? record.abstract : null,
      metadata: (record.metadata ?? undefined) as never,
    };

    await prisma.publication.upsert({
      where: { projectId_externalId: { projectId: run.projectId, externalId } },
      create: input,
      update: input,
    });
    ingested += 1;
  }

  return { ingested, skipped };
}

export async function listPublicationsByProject(projectId: string) {
  return prisma.publication.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
}
