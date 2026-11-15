# ScholarFlow AI — Implementation Plan

See also: `docs/WORKPLAN.md` (logical slices), `docs/ARCHITECTURE.md`,
`docs/DATA_MODEL.md`, `docs/SECURITY.md`, `docs/N8N_INTEGRATION.md`.

## Phase 0 — Repository inspection and technical planning

Status: IN_PROGRESS

Deliverables:
- Architecture assessment — `docs/ARCHITECTURE.md`.
- Data model baseline — `docs/DATA_MODEL.md`.
- Implementation roadmap — this document.
- Security baseline — `docs/SECURITY.md`.
- n8n contract baseline — `docs/N8N_INTEGRATION.md`.

Exit criteria: Phase 0 documentation set complete; architectural decisions
recorded; blockers identified.

## Phase 1 — SaaS foundation

Goal: working authentication, tenancy, RBAC, research project management, database
with migrations, seed data.

Slices: see `docs/WORKPLAN.md` (Slices 1.1–1.6).

Acceptance criteria:
- User can register and create a workspace.
- User can create a research project.
- User can belong to multiple workspaces.
- Tenant isolation verified.
- Demonstration research project creatable from seed data.

Exit criteria: above met with executed tests; Phase 1 report produced.

## Phase 2 — Research Discovery MVP

Goal: domain configuration, search strategy, n8n dispatch, publication ingestion,
domain summary generation/persistence, human review.

## Phase 3 — Evidence and research positioning

## Phase 4 — Secure document intelligence

## Phase 5 — Research design and collaboration

## Phase 6 — Methodology, experiments and writing

## Phase 7 — Commercial SaaS readiness

## Phase 8 — Production hardening

## Phase 9 — First end-to-end vertical slice

## Phase sequencing and dependencies

Phase order is fixed by the master specification. No phase may be started before
the previous phase's exit criteria are met.

## Open decisions requiring researcher approval

- Auth provider strategy (Auth.js credentials + email magic link vs. external IdP).
- Default AI provider and budget ceilings.
- Default plan catalogue and pricing (Phase 7).
- ~~RLS adoption timing and migration strategy~~ — resolved in Phase 1: RLS enabled via tenant-scoped
  policies (`20261115120000_enable_row_level_security`).

## Risks and mitigations (Phase 0 assessment)

- Next.js 16 / Prisma 7 / Auth.js version compatibility — verify at install time.
- No Docker in target environment — use local PostgreSQL for development.
- External credentials (OpenAlex, Crossref, OpenAI, n8n) pending — use mock executor.
