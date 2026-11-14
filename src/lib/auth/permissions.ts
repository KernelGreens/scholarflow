export const TENANT_ROLES = [
  'OWNER',
  'WORKSPACE_ADMIN',
  'RESEARCHER',
  'SUPERVISOR',
  'REVIEWER',
  'VIEWER',
] as const;

export type TenantRole = (typeof TENANT_ROLES)[number];

export type ProjectMembershipRole = 'OWNER' | 'RESEARCHER' | 'SUPERVISOR' | 'REVIEWER' | 'VIEWER';

export type Permission =
  | 'project:create'
  | 'project:update'
  | 'project:delete'
  | 'project:view'
  | 'project:collaborate'
  | 'review:submit'
  | 'review:approve';

const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 6,
  WORKSPACE_ADMIN: 5,
  RESEARCHER: 4,
  SUPERVISOR: 3,
  REVIEWER: 2,
  VIEWER: 1,
};

export function roleWeight(role: string | null | undefined): number {
  if (!role) return 0;
  return ROLE_HIERARCHY[role] ?? 0;
}

export function can(role: string | null | undefined, permission: Permission): boolean {
  const weight = roleWeight(role);
  switch (permission) {
    case 'project:create':
      return weight >= ROLE_HIERARCHY.RESEARCHER;
    case 'project:update':
      return weight >= ROLE_HIERARCHY.WORKSPACE_ADMIN;
    case 'project:delete':
      return weight >= ROLE_HIERARCHY.OWNER;
    case 'project:view':
      return weight >= ROLE_HIERARCHY.VIEWER;
    case 'project:collaborate':
      return weight >= ROLE_HIERARCHY.SUPERVISOR;
    case 'review:submit':
      return weight >= ROLE_HIERARCHY.REVIEWER;
    case 'review:approve':
      return weight >= ROLE_HIERARCHY.WORKSPACE_ADMIN;
    default:
      return false;
  }
}

export function hasProjectPermission(
  membershipRole: string | null | undefined,
  permission: Permission
): boolean {
  return can(membershipRole, permission);
}

export function canAccessTenant(
  _userId: string,
  _tenantId: string,
  membershipRole: string | null | undefined
): boolean {
  // Tenant-level access requires an explicit, recognised membership role with at
  // least viewer-level access. Cross-tenant denial is enforced by scoped queries.
  return roleWeight(membershipRole) >= ROLE_HIERARCHY.VIEWER;
}
