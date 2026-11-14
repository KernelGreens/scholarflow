# ScholarFlow AI — Workplan & Logical Slices

This document defines the **execution-oriented workplan**: a sequence of small,
independently deliverable **logical slices**, each with entry criteria, exit
criteria, and acceptance tests. The master implementation plan lives in
`docs/IMPLEMENTATION_PLAN.md`; this file breaks it into executable slices.

---

## How to read this plan

- A **slice** is a vertical, end-to-end increment that can be demoed and tested on
  its own. Slices are implemented strictly in the order below; later slices may
  depend on earlier ones but never block a slice's own acceptance tests.
- Each slice declares: **Goal**, **In scope**, **Out of scope**, **Acceptance
  criteria**, **Tests**, **Deliverables**, and **Exit criteria**.
- Phase gates: a phase is only closed when its exit criteria are met and recorded
  in the phase report (implementation + validation results).

---

## Phase 0 — Repository inspection & technical planning

### Slice 0.1 — Repository assessment and technical decision record
- Goal: establish the current state and freeze key architectural decisions.
- Exit: `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/IMPLEMENTATION_PLAN.md`,
  `docs/SECURITY.md`, `docs/N8N_INTEGRATION.md` created and reviewed.

---

## Phase 1 — SaaS foundation (target: first working vertical slice)

### Slice 1.1 — Initialise application shell (Next.js 16 App Router, strict TS, Tailwind, shadcn/ui, RHF+Zod)
- Goal: runnable `next dev` application with design system and app shell.
- Exit: `npm run dev` boots; `/` renders; `tsc --noEmit` clean.

### Slice 1.2 — Database layer: Prisma 7 schema, migrations, PostgreSQL client
- Goal: Prisma client operational against local PostgreSQL.
- Exit: `prisma migrate dev` produces migration; `prisma db push`/migrate ok; unit
  tests for client creation pass.

### Slice 1.3 — Authentication and session management
- Goal: register / login / logout / session, protected routes.
- Exit: auth flow tests pass; `/login`, `/register` functional; middleware
  protects `/dashboard`.

### Slice 1.4 — Multi-tenancy: tenants, memberships, RBAC, workspace switching
- Goal: tenant + membership + role models with authorisation service and tenant
  scoping helpers.
- Exit: unit tests for permission evaluation; cross-tenant isolation tests.

### Slice 1.5 — Research project management
- Goal: create/edit research projects, lifecycle phases, onboarding wizard draft.
- Exit: project CRUD + validation tests pass.

### Slice 1.6 — Phase 1 acceptance & validation
- Goal: register → workspace → project → dashboard end-to-end.
- Exit: Phase 1 acceptance criteria met and verified by automated tests.

---

## Phase 2 — Research Discovery MVP

### Slice 2.1 — Research domains + search strategies + workflow catalogue (definitions)
### Slice 2.2 — AutomationRun + durable dispatch job + n8n webhook contract + callbacks
### Slice 2.3 — Publication ingestion + literature library + domain summary persistence
### Slice 2.4 — Phase 2 acceptance & validation

---

## Phase 3 — Evidence and research positioning

### Slice 3.1 — Evidence records + evidence matrix + screening
### Slice 3.2 — Claim → evidence traceability + research gap matrix
### Slice 3.3 — Novelty pressure test + positioning statement + human review
### Slice 3.4 — Phase 3 acceptance & validation

---

## Phase 4 — Secure document intelligence

### Slice 4.1 — Object storage abstraction + private quarantine + upload validation
### Slice 4.2 — ClamAV scan integration + clean/approved storage + extraction worker
### Slice 4.3 — Phase 4 acceptance & validation

---

## Phase 5 — Research design and collaboration

### Slice 5.1 — Aims/objectives/questions + alignment matrix
### Slice 5.2 — Conceptual framework builder
### Slice 5.3 — Milestones/tasks + supervisor invitations + review workflows
### Slice 5.4 — Phase 5 acceptance & validation

---

## Phase 6 — Methodology, experiments and writing

### Slice 6.1 — Methodology plans + datasets + experiments + metrics
### Slice 6.2 — Writing studio + document versions + citation export
### Slice 6.3 — Phase 6 acceptance & validation

---

## Phase 7 — Commercial SaaS readiness

### Slice 7.1 — Plans, entitlements, usage ledger, reservations
### Slice 7.2 — Subscription management + payment provider abstraction
### Slice 7.3 — Admin operations + tenant analytics + data export/deletion
### Slice 7.4 — Phase 7 acceptance & validation

---

## Phase 8 — Production hardening

### Slice 8.1 — Deployment config (Docker Compose, reverse proxy, TLS)
### Slice 8.2 — Observability (logs, metrics, health checks, alerting)
### Slice 8.3 — Security hardening + penetration tests
### Slice 8.4 — Phase 8 acceptance & validation

---

## Phase 9 — First end-to-end vertical slice (integration across phases)

### Slice 9.1 — Researcher registers → workspace → PhD project → SIWES-like domain
### Slice 9.2 — Literature search run via n8n (mock executor while credentials pending)
### Slice 9.3 — Publications + evidence + summary persisted → human review → export
### Slice 9.4 — Phase 9 acceptance & validation

---

## Delivery rules

1. One logical slice per implementation session where possible; do not start the
   next slice until the current slice's acceptance tests pass.
2. Every phase closes with: implementation summary, validation results, known
   limitations, acceptance checklist, decisions needing researcher approval, and
   remaining risks.
3. Tests must be executed, not merely written. "Passing" claims require actual
   successful runs in the phase report.
4. Mock executors are acceptable only until real n8n credentials land; mocks must
   be clearly labelled and covered by contract tests.
5. No hardcoded SIWES / WEI / WDI / domain seed content in business logic; the demo
   project is seed data only.

---

## Environment / execution notes (learnt during Phase 0)

- Shell is PowerShell-compatible: avoid `&&`; use `;` separators; use `& "C:\path\to.exe"` for native executables with arguments.
- npm/npx PowerShell wrappers are blocked by execution policy; invoke via
  `node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" <args>`.
- PostgreSQL 18 server binaries exist at `C:\Program Files\PostgreSQL\18\bin`;
  a local cluster can be initialised with `initdb` + `pg_ctl` for isolated testing.
- Next.js latest = 16.4.6; Prisma latest = 7.x (check during implementation);
  Auth.js latest stable version to be verified.
- Docker is unavailable in this environment; local PostgreSQL replaces
  containerised infra for development until Phase 8.

If any command blocks progress, the operator should be asked for explicit
instructions before deviation.
