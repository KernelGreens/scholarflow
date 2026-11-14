# ScholarFlow AI — Architecture

## 1. Purpose and scope

ScholarFlow AI is a multi-tenant SaaS research operating system for doctoral
researchers and academic teams. It orchestrates the research lifecycle from
discovery through positioning, design, experimentation, writing, and defence.

This document describes the architecture implemented **so far** (Phase 0 assessment
baseline) and the target architecture for all phases.

## 2. Architectural style

- **Initial pattern:** modular monolith (Next.js App Router).
- **Independent services introduced later:** background job worker, document
  processing worker, n8n-facing automation integration.
- **Deliberately not yet microservices:** no service mesh, no separate auth service,
  no separate database per tenant in the SaaS phase.

## 3. Layering

```
Presentation  →  App (use cases, services, orchestration)  →  Domain  →  Infrastructure
```

- Presentation: `app/**` routes, `components/**`, `lib/**` UI helpers.
- Application: `lib/application/**` services, job orchestration, permissions,
  workflow coordination.
- Domain: `prisma/schema.prisma` models + domain types.
- Infrastructure: Prisma repositories, AI provider adapters, n8n client,
  storage adapters, queue adapters, payment adapters, audit logging.

## 4. Current implementation baseline (Phase 0 → Phase 1 target)

Implemented or planned for Phase 1:

- Next.js 16 (App Router, React 19, strict TypeScript, Tailwind CSS v4, shadcn/ui
  new-york style, Radix, Lucide, React Hook Form, Zod, TanStack Table, Recharts,
  React Flow where needed).
- Next.js **proxy.ts** (request interception) — not relied on as sole auth boundary.
- Auth.js (or equivalent) compatible session handling.
- Prisma ORM **7** with `prisma.config.ts`, explicit generated client output, and
  PostgreSQL driver adapter (e.g. `@prisma/adapter-pg`).
- PostgreSQL 18 (shared database, shared schema, explicit `tenantId` columns).
- Background job queue: durable queue (e.g. BullMQ/Redis or DB-backed outbox) —
  to be wired in Phase 2.

## 5. Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Monolith | Next.js modular monolith | Fast MVP delivery; avoids premature decomposition. |
| DB | Shared PG schema, explicit tenantId | Simple SaaS isolation phase; RLS optional later. |
| Auth | Auth.js vNext | Provider-agnostic, fits App Router. |
| ORM | Prisma 7 | Required by specification. |
| Automation | n8n (external) + internal callback API | n8n stays execution engine, not system of record. |
| AI | Provider abstraction (OpenAI first) | Permit local/other models later. |
| Storage | S3-compatible + provider abstraction | MinIO self-hosted. |

## 6. n8n integration boundary

- Next.js server → durable dispatch job → worker → authenticated n8n production
  webhook (`X-Scholarflow-Signature` style HMAC or scoped service token).
- Callback API: `/api/internal/automation/v1/runs/[runId]/events`.
- Callback tenant resolution is always from persisted `AutomationRun`, never from
  request body alone.

See `docs/N8N_INTEGRATION.md`.

## 7. Tenant isolation strategy

- Tenant context resolved server-side from authenticated membership.
- Repositories filter by resolved `tenantId` in addition to explicit filters.
- Cross-tenant attempts return 404-style not-found responses to avoid existence
  leaks.
- Object storage keys namespaced by tenant.

## 8. Security baseline

See `docs/SECURITY.md`.

## 9. Environment variables (Phase 0 baseline)

Documented in `.env.example` (to be created in Phase 1).

## 10. References

- `docs/DATA_MODEL.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/WORKPLAN.md`
- `docs/SECURITY.md`
- `docs/N8N_INTEGRATION.md`
