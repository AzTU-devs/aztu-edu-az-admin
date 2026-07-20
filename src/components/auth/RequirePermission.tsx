import { Navigate, Outlet, useLocation } from "react-router";
import usePermissions from "../../hooks/usePermissions";
import { permissionForPath } from "../../config/routePermissions";

type RequirePermissionProps = {
  /** Explicit requirement. Omitted, the route's entry in routePermissions is used. */
  perm?: string | string[];
  children?: React.ReactNode;
};

/**
 * Route-level gate, mirroring the server's PERMISSION_ENFORCEMENT_MODE.
 *
 * Under "enforce" a missing permission redirects to /403. Under "audit" it warns
 * and renders anyway — the same permissive posture the API takes. That matters:
 * a route missing from routePermissions would otherwise be unreachable in the
 * dashboard even though the API would have served it, and no request is ever
 * issued for a screen the guard blocked, so the server's audit mode cannot
 * compensate. The API re-checks every request regardless, so rendering here
 * leaks no data — a forbidden call still fails server-side.
 */
export default function RequirePermission({ perm, children }: RequirePermissionProps) {
  const { can, isAuditMode } = usePermissions();
  const location = useLocation();

  const required = perm ?? permissionForPath(location.pathname);

  if (!can(required)) {
    if (!isAuditMode) {
      return <Navigate to="/403" replace state={{ from: location.pathname, required }} />;
    }
    console.warn(
      `[rbac] audit mode: allowing ${location.pathname} despite missing permission`,
      required
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
