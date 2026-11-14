# ScholarFlow AI — Testing Strategy (Phase 1 baseline)

## 1. Tooling

- Unit/integration: **Vitest** (+ Supertest-style route handler tests where feasible).
- E2E: deferred to Phase 1 acceptance slice (Playwright added with Phase 2+ where
  required by phase acceptance).
- DB: real PostgreSQL 18 instance for integration tests (local cluster); migrations
  applied via `prisma migrate deploy`.

## 2. Phase 1 test suites

### Unit
- Zod research-project input validation (`lib/validation/researchProjectSchema.ts`).
- Permission evaluation (`lib/auth/permissions.ts`): OWNER/WORKSPACE_ADMIN/RESEARCHER/
  SUPERVISOR/REVIEWER/VIEWER matrix + project-level override.
- Tenant resolution / membership validation.
- Usage calculations (Phase 7 later).

### Integration
- Auth: register → verify/login → session; protected route returns 401 when unauthenticated.
- Tenant: user in Tenant A cannot read Tenant B project (cross-tenant isolation).
- Workspace switching: membership validated on switch.
- Research project creation persists and validates.

### E2E
- Phase 1 acceptance: register → create workspace → create research project →
  project visible in workspace switcher.

## 3. Running tests

```bash
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" test
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" test:watch
```

## 4. Acceptance rule

Tests must be executed. Passing claims require actual successful runs.
