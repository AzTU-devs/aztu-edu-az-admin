import { useMemo } from "react";
import usePermissions from "../hooks/usePermissions";
import { NavGroup, filterNavByPermission, navGroups } from "./navConfig";

/**
 * The one permission-filtered nav tree, shared by the sidebar and the header.
 * Both must agree — breadcrumbs that name a hidden section are worse than no
 * breadcrumbs. Memoised on the grant set so the identity is stable across
 * renders, which keeps the sidebar's submenu height measurements from thrashing.
 */
export const useNavGroups = (): NavGroup[] => {
  const { can, permissions, isSuperAdmin } = usePermissions();

  return useMemo(
    () => filterNavByPermission(navGroups, can),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [permissions, isSuperAdmin]
  );
};

export default useNavGroups;
