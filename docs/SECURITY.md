# ScholarFlow AI — Security

## 1. Scope

Covers authentication, authorisation, tenant isolation, input handling, file
security, AI data handling, n8n callbacks, and audit requirements.

## 2. Authentication and session

- Auth.js managed sessions (JWT strategy default for this phase; database sessions
  deferred).
- Email verification where appropriate; password policies via Zod + server-side checks.
- Password reset: token-based flow implemented
  (`POST /api/auth/forgot-password` issues a reset token; `POST /api/auth/reset-password`
  consumes it). Email delivery via SMTP/n8n notification remains pending.
- Secure, httpOnly, SameSite session cookies; CSRF protection for state-changing
  mutations (Server Actions / route handlers) via double-submit or framework support.

## 3. Authorisation

- Central authorisation service: `can(userId, tenantId, projectId, action, roleScope)`.
- Platform roles: PLATFORM_SUPER_ADMIN, PLATFORM_SUPPORT_ADMIN.
- Tenant roles: OWNER, WORKSPACE_ADMIN, RESEARCHER, SUPERVISOR, REVIEWER, VIEWER.
- Project-level membership overrides via `ProjectMembership`.
- Enforcement in server-side services and route handlers; UI hiding is cosmetic only.

## 4. Tenant isolation

- Server-resolved tenant context only; client-supplied `tenantId` never trusted.
- Tenant-scoped queries in repositories.
- Cross-tenant access returns not-found semantics (no existence leak).
- Object storage keys scoped by tenant.
- Background jobs carry tenant context and must re-validate membership before side effects.
- Row Level Security enabled in PostgreSQL on all tenant-scoped tables
  (`Tenant`, `TenantMembership`, `Invitation`, `ProjectMembership`, `ResearchProject`,
  `ResearchPhase`) via `ENABLE ROW LEVEL SECURITY` plus tenant-scoped policies
  (`tenant_isolation_*`). Access is evaluated against the per-request user context
  (`current_setting('app.current_user_id', ...)`). `FORCE ROW LEVEL SECURITY` and wiring the
  per-request context into the Prisma connection remain future work.

## 5. Web application security

- Zod validation on all external input (route handlers, server actions, forms).
- React XSS protection via framework; sanitize rich text/markdown before rendering.
- Security headers (CSP, X-Frame-Options, Referrer-Policy, HSTS) via proxy/middleware.
- Rate limiting on auth, automation triggers, callbacks.

## 6. File upload and document security (Phase 4 baseline design)

- Upload → private quarantine → SHA-256 → type/signature validation → ClamAV → clean/rejected → extraction → approved storage.
- Fail closed when scanner unavailable.
- Signed short-lived URLs for approved private files.
- SSRF protection on any remote fetch.

## 7. AI governance and data protection

- Versioned prompts; provider abstraction; token/cost tracking.
- Per-project AI processing policy (allow external / prohibit).
- Never send confidential institutional data to external AI without authorisation.

## 8. n8n security

- Fixed approved webhook registry; no user-supplied destinations.
- Authenticated production webhooks; HMAC-verified callbacks; timestamp validation;
  replay protection; idempotency; rate limiting; audit logging.

## 9. Audit

- Security/audit events recorded for auth, tenant, authorisation, automation,
  document, and AI governance actions.

## 10. Operational security

- Secrets via environment variables (no secrets in NEXT_PUBLIC_*).
- No logging of tokens/keys/secrets or complete confidential documents.
- Encryption in transit (TLS); encrypted backups.

## 11. Known limitations

- Rate limiting backend (Redis) integration pending.
- RLS `FORCE ROW LEVEL SECURITY` and per-request user-context wiring into the Prisma connection
  are pending (owner-bypass currently applies to the migration/Prisma connection user).
- Support-admin elevated access design still open.
