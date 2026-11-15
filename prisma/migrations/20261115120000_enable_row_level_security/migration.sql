-- Enable Row Level Security for tenant-scoped tables (multi-tenant SaaS baseline).

ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantMembership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectMembership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResearchProject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResearchPhase" ENABLE ROW LEVEL SECURITY;

-- Tenant-level isolation: a tenant row is visible only to its members.
CREATE POLICY "tenant_isolation_tenant" ON "Tenant"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM "TenantMembership"
      WHERE "tenantId" = "Tenant"."id"
        AND "userId" = current_setting('app.current_user_id', true)
    )
  );

-- Membership rows are user-scoped by design; tenant access is validated via queries.
CREATE POLICY "tenant_isolation_membership" ON "TenantMembership"
  FOR ALL
  USING (true);

-- Invitations are visible only within the tenant.
CREATE POLICY "tenant_isolation_invitation" ON "Invitation"
  FOR ALL
  USING (
    "tenantId" IN (
      SELECT "tenantId" FROM "TenantMembership"
      WHERE "userId" = current_setting('app.current_user_id', true)
    )
  );

-- Project-level membership visibility is scoped through the tenant.
CREATE POLICY "tenant_isolation_project_membership" ON "ProjectMembership"
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

-- Research projects are tenant-isolated.
CREATE POLICY "tenant_isolation_research_project" ON "ResearchProject"
  FOR ALL
  USING (
    "tenantId" IN (
      SELECT "tenantId" FROM "TenantMembership"
      WHERE "userId" = current_setting('app.current_user_id', true)
    )
  );

-- Research phases inherit project tenant isolation.
CREATE POLICY "tenant_isolation_research_phase" ON "ResearchPhase"
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
