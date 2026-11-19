-- CreateTable
CREATE TABLE "IdeationSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "motivation" TEXT,
    "context" JSONB,
    "desiredOutcome" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdeationSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdeationSession_tenantId_ownerId_idx" ON "IdeationSession"("tenantId", "ownerId");

-- AddForeignKey
ALTER TABLE "IdeationSession" ADD CONSTRAINT "IdeationSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeationSession" ADD CONSTRAINT "IdeationSession_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- EnableRowLevelSecurity
ALTER TABLE "IdeationSession" ENABLE ROW LEVEL SECURITY;

-- CreatePolicy
CREATE POLICY "tenant_isolation_ideation_session" ON "IdeationSession"
  FOR ALL
  USING (
    "tenantId" IN (
      SELECT "tenantId" FROM "TenantMembership"
      WHERE "userId" = current_setting('app.current_user_id', true)
    )
  );
