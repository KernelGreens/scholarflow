-- CreateEnum
CREATE TYPE "AutomationRunStatus" AS ENUM ('QUEUED', 'DISPATCHING', 'RUNNING', 'PARTIAL', 'COMPLETED', 'FAILED', 'CANCEL_REQUESTED', 'CANCELLED', 'TIMED_OUT');

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "workflowKey" TEXT NOT NULL DEFAULT 'RESEARCH_DISCOVERY',
    "workflowVersion" INTEGER NOT NULL DEFAULT 1,
    "status" "AutomationRunStatus" NOT NULL DEFAULT 'QUEUED',
    "correlationId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "usage" JSON,

    CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRunEvent" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT,
    "payload" JSON,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationRunEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutomationRun_correlationId_key" ON "AutomationRun"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationRun_idempotencyKey_key" ON "AutomationRun"("idempotencyKey");

-- CreateIndex
CREATE INDEX "AutomationRun_tenantId_status_idx" ON "AutomationRun"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AutomationRunEvent_runId_timestamp_idx" ON "AutomationRunEvent"("runId", "timestamp");

-- AddForeignKey
ALTER TABLE "AutomationRun" ADD CONSTRAINT "AutomationRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AutomationRun" ADD CONSTRAINT "AutomationRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AutomationRunEvent" ADD CONSTRAINT "AutomationRunEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AutomationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
