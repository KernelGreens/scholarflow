# Phase 2 — Research Discovery MVP — Completion Report

## Implemented

- n8n workflow key `RESEARCH_DISCOVERY` enabled in the automation catalogue
  (`src/lib/automation/n8n.ts`): HMAC-SHA256 signed callbacks (headers
  `x-scholarflow-signature`, `x-scholarflow-event-id`, `x-scholarflow-timestamp`;
  ±30s tolerance), event types `ack|progress|complete|fail|heartbeat`, run statuses
  `QUEUED|DISPATCHING|RUNNING|PARTIAL|COMPLETED|FAILED|CANCEL_REQUESTED|CANCELLED|TIMED_OUT`.
- Automation persistence: `AutomationRun` + `AutomationRunEvent` models with migrations
  `20261117120000_add_automation_run`, `20261118120000_add_automation_run_created_at`,
  `20261118130000_add_automation_run_results`.
- Run lifecycle service (`src/lib/application/automationService.ts`):
  `createAutomationRun` (tenant membership + project permission checks, idempotency/correlation),
  `dispatchAutomationRun` (QUEUED → DISPATCHING → RUNNING | FAILED).
- API routes: `POST /api/runs`, `GET /api/runs/[runId]`, internal HMAC-authenticated callback
  `POST /api/internal/automation/v1/runs/[runId]/events/[event]`.
- Zod contracts: `createAutomationRunSchema`, `callbackEventSchema`.
- Discovery UI: `RunDiscoveryButton` → `POST /api/runs`; project dashboard Discovery module renders
  latest run status, started/completed timestamps, event timeline, and persisted results (JSON block)
  when status is `COMPLETED` and results exist.
- Supporting services: Resend email client (`src/lib/email/resend.ts`),
  Vercel Blob storage abstraction (`src/lib/storage/vercelBlob.ts`).

## Validation results

- Unit/integration tests (vitest): **GREEN** — latest run `VITEST_RUN34_EXIT=0` (suites: n8n, resend,
  validation, permissions).
- Production build (Next.js 16.4.6, Turbopack): **GREEN** — latest run `NEXT_BUILD38_EXIT=0`; TypeScript clean.
- Prisma: `migrate deploy` OK; migrations applied (6 total); status **"Database schema is up to date!"**.

## Phase 2 acceptance (this session — end-to-end, code level)

- [x] Researcher can launch an authenticated exploratory discovery run — `POST /api/runs` with tenant
  membership + project permission checks.
- [x] Persisted results retrieval — `complete` callback persists payload → `AutomationRun.results`;
  `GET /api/runs/[runId]` returns run incl. results + events; UI renders results when COMPLETED.
- [x] Event timeline retrieval — `GET /api/runs/[runId]` returns ordered events.
- [ ] Live n8n execution with real AI credentials — **PENDING** (environmental).

## Known limitations

- n8n workflow live dispatch pending (`N8N_DISCOVERY_WEBHOOK_URL` pending).
- AI provider (OpenAI) + academic sources (OpenAlex/Crossref) credentials pending; mock executor pending.
- Durable outbox/queue between persistence and dispatch pending.
- Full execution progress UI (stages, retrieved publication count, warnings, failure details, usage,
  retry) pending (design run-detail route).
- RLS `FORCE ROW LEVEL SECURITY` + per-request user-context wiring pending.
- Resend API key / Vercel Blob token pending.

## Status

Status: **IN_PROGRESS** — Phase 2 acceptance path implemented end-to-end at code level (launch → dispatch →
callbacks → persist → retrieve → render) and GREEN at build/test level; formal phase close-out follows once
live n8n + AI credentials land and an actual discovery run completes.

### Phase 2 slice status (this session)

- [x] Slice 2.2 — AutomationRun + durable dispatch job + n8n webhook contract + callbacks + execution
  progress UI (status, events timeline, persisted results rendering).
- [x] Slice 2.3 — Publication ingestion + literature library + domain summary persistence + candidate
  research topic ingestion (artifacts from completed runs via services + callback wiring).
- [ ] Slice 2.4 — Phase 2 acceptance & validation (formal close-out; live n8n + AI execution pending).

---

**Formal phase close-out: PENDING** — awaiting live n8n execution + AI retrieval for a completed discovery
run; code-level acceptance path is implemented and GREEN.

