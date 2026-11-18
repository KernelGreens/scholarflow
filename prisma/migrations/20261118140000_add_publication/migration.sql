-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "runId" TEXT,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" JSONB,
    "year" INTEGER,
    "source" TEXT,
    "url" TEXT,
    "doi" TEXT,
    "type" TEXT,
    "abstract" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Publication_projectId_externalId_key" ON "Publication"("projectId", "externalId");

-- CreateIndex
CREATE INDEX "Publication_tenantId_projectId_idx" ON "Publication"("tenantId", "projectId");

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AutomationRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- EnableRowLevelSecurity
ALTER TABLE "Publication" ENABLE ROW LEVEL SECURITY;

-- CreatePolicy
CREATE POLICY "tenant_isolation_publication" ON "Publication"
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
