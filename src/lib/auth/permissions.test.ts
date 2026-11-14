import { describe, expect, it } from 'vitest';
import { can, canAccessTenant } from './permissions';

describe('permission evaluation', () => {
  it('allows an OWNER to delete a project', () => {
    expect(can('OWNER', 'project:delete')).toBe(true);
  });

  it('allows a WORKSPACE_ADMIN to update a project', () => {
    expect(can('WORKSPACE_ADMIN', 'project:update')).toBe(true);
  });

  it('allows a RESEARCHER to create a project', () => {
    expect(can('RESEARCHER', 'project:create')).toBe(true);
  });

  it('allows a VIEWER to view a project', () => {
    expect(can('VIEWER', 'project:view')).toBe(true);
  });

  it('does not allow a VIEWER to update a project', () => {
    expect(can('VIEWER', 'project:update')).toBe(false);
  });

  it('does not allow an unauthenticated user to submit reviews', () => {
    expect(can(null, 'review:submit')).toBe(false);
  });

  it('does not allow a RESEARCHER to approve reviews', () => {
    expect(can('RESEARCHER', 'review:approve')).toBe(false);
  });

  it('exposes a tenant-level access helper', () => {
    expect(canAccessTenant('user_1', 'tenant_1', 'OWNER')).toBe(true);
    expect(canAccessTenant('user_1', 'tenant_2', 'VIEWER')).toBe(true);
    expect(canAccessTenant('user_1', 'tenant_2', null)).toBe(false);
  });
});
