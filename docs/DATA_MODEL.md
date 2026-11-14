# ScholarFlow AI — Data Model

Baseline data model for Phase 1 (SaaS foundation) and reference for later phases.
Final schema evolves incrementally per phase; this document tracks the canonical
entity model.

## 1. Identity and tenancy (Phase 1 baseline)

- `User` — id, email, name, emailVerified, image, createdAt, updatedAt.
- `Account` — provider, providerAccountId, userId, accessToken?, refreshToken?,
  expiresAt?.
- `Session` — sessionToken, userId, expiresAt, createdAt.
- `VerificationToken` — identifier, expires, token.
- `Tenant` — id, slug, name, type (PERSONAL / GROUP / INSTITUTION), createdAt, updatedAt.
- `TenantMembership` — tenantId, userId, role, createdAt, updatedAt.
- `Invitation` — tenantId, email, role, invitedByUserId, status, expiresAt, acceptedAt, createdAt, updatedAt.
- `ProjectMembership` — projectId, userId, role (OWNER / RESEARCHER / SUPERVISOR / REVIEWER / VIEWER), createdAt, updatedAt.

## 2. Research management (Phase 1 baseline)

- `ResearchProject` — tenantId, title, shortTitle?, description?, discipline?,
  status (DRAFT / ACTIVE / PAUSED / COMPLETED / ARCHIVED), phase (Research Discovery … Completed),
  aim?, createdAt, updatedAt, createdById, institution?, startDate?, targetCompletionDate?,
  privacy (PRIVATE / SHARED / PUBLIC).
- `ResearchPhase` — projectId, phase, order, status, startedAt?, completedAt?, notes?.

## 3. Literature / evidence / positioning models

Introduced in later phases (2–3); not part of Phase 1 baseline.

## 4. Automation (Phase 2)

- `WorkflowDefinition` — key, name, description, n8n workflow id, version,
  inputSchemaVersion, outputSchemaVersion, enabled, requiredPermission, usageCreditEstimate, plans.
- `AutomationRun` — id, tenantId, projectId, workflowKey, workflowVersion, status
  (QUEUED/DISPATCHING/RUNNING/PARTIAL/COMPLETED/FAILED/CANCEL_REQUESTED/CANCELLED/TIMED_OUT),
  correlationId, idempotencyKey, requestedBy, startedAt?, completedAt?, usage.
- `AutomationRunEvent` — runId, type, status, payload, timestamp.
- `AutomationSchedule` — tenantId, projectId, workflowKey, cron, timezone, enabled.
- `AutomationArtefact` — runId, projectId, type, storageKey, content.
- `AutomationOutbox` — eventId, aggregateId, type, payload, status, attempts, createdAt, updatedAt.

## 5. Commercial & governance models

- `Plan`, `PlanEntitlement`, `Subscription`, `UsageLedger`, `UsageReservation`,
  `BillingCustomer`, `PaymentTransaction`, `BillingWebhookEvent`.
- `AuditLog`, `SecurityEvent`, `DataExportRequest`, `DataDeletionRequest`.

## 6. Conventions

- Every tenant-owned table has `tenantId` (required in Phase 1, optional-with-scope
  later where global reference data applies).
- Timestamps: `createdAt`, `updatedAt`; versioning fields where history matters.
- Monetary values: integer minor units (e.g. kobo/cents) — never floats.
- Enums stored as Prisma enums or strings per migration strategy; enums chosen here
  become the source of truth in `prisma/schema.prisma`.

## 7. Migrations

- Migrations live in `prisma/migrations/<timestamp>_<name>/`.
- Baseline Phase 1 migration set to be generated via `prisma migrate dev`.
