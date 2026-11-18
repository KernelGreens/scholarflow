-- CreateTable
CREATE TABLE "DomainSummary" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "runId" TEXT,
    "domain" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sources" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DomainSummary_projectId_domain_key" ON "DomainSummary"("projectId", "domain");

-- CreateIndex
CREATE INDEX "DomainSummary_tenantId_projectId_idx" ON "DomainSummary"("tenantId", "projectId");

-- AddForeignKey
ALTER TABLE "DomainSummary" ADD CONSTRAINT "DomainSummary_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainSummary" ADD CONSTRAINT "DomainSummary_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainSummary" ADD CONSTRAINT "DomainSummary_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AutomationRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- EnableRowLevelSecurity
ALTER TABLE "DomainSummary" ENABLE ROW LEVEL SECURITY;

-- CreatePolicy
CREATE POLICY "tenant_isolation_domain_summary" ON "DomainSummary"
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
