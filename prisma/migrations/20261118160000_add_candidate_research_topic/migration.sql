-- CreateTable
CREATE TABLE "CandidateResearchTopic" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "runId" TEXT,
    "externalId" TEXT NOT NULL,
    "proposedTitle" TEXT NOT NULL,
    "researchProblem" TEXT,
    "domain" TEXT,
    "motivation" TEXT,
    "possibleResearchQuestions" JSONB,
    "existingApproaches" JSONB,
    "potentialContribution" TEXT,
    "availableEvidence" JSONB,
    "knownLimitations" TEXT,
    "feasibility" TEXT,
    "requiredData" TEXT,
    "researcherNotes" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'SUGGESTED',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateResearchTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateResearchTopic_projectId_externalId_key" ON "CandidateResearchTopic"("projectId", "externalId");

-- CreateIndex
CREATE INDEX "CandidateResearchTopic_tenantId_projectId_idx" ON "CandidateResearchTopic"("tenantId", "projectId");

-- AddForeignKey
ALTER TABLE "CandidateResearchTopic" ADD CONSTRAINT "CandidateResearchTopic_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateResearchTopic" ADD CONSTRAINT "CandidateResearchTopic_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateResearchTopic" ADD CONSTRAINT "CandidateResearchTopic_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AutomationRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- EnableRowLevelSecurity
ALTER TABLE "CandidateResearchTopic" ENABLE ROW LEVEL SECURITY;

-- CreatePolicy
CREATE POLICY "tenant_isolation_candidate_research_topic" ON "CandidateResearchTopic"
  FOR ALL
  USING (
    "projectId" IN (
      SELECT "projectId" FROM "ResearchProject"
      WHERE "tenantId" IN (
        SELECT "tenantId" FROM "TenantMembership"
        WHERE "userId" = current_setting('app.current_user_id', true)
      )
    )
  );
