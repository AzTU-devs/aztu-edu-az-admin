import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

export type PermissionCheck = (permission: string | string[] | undefined) => boolean;

export interface Permissions {
  can: PermissionCheck;
  canAny: (permissions: string[]) => boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  roleCode: string | null;
  roleName: string | null;
  /** True while the server is running permissively; guards warn instead of blocking. */
  isAuditMode: boolean;
}

/**
 * Mirrors the server check: a super admin short-circuits and never consults the
 * grant list (it is empty by design). This is presentation only — the API is the
 * authority, and every guarded route is re-checked server side per request.
 */
export const usePermissions = (): Permissions => {
  const isSuperAdmin = useSelector((state: RootState) => state.auth.is_super_admin);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const role = useSelector((state: RootState) => state.auth.role);
  const enforcementMode = useSelector((state: RootState) => state.auth.enforcement_mode);

  return useMemo(() => {
    const granted = permissions ?? [];

    const canAny = (keys: string[]) => {
      if (isSuperAdmin) return true;
      return keys.some((key) => granted.includes(key));
    };

    const can: PermissionCheck = (permission) => {
      if (permission === undefined) return true;
      if (isSuperAdmin) return true;
      return Array.isArray(permission)
        ? canAny(permission)
        : granted.includes(permission);
    };

    return {
      can,
      canAny,
      isSuperAdmin: Boolean(isSuperAdmin),
      permissions: granted,
      roleCode: role?.code ?? null,
      roleName: role?.name_az ?? null,
      isAuditMode: enforcementMode !== 'enforce',
    };
  }, [isSuperAdmin, permissions, role, enforcementMode]);
};

export default usePermissions;
