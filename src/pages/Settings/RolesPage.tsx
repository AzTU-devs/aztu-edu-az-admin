import { useEffect, useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ShieldIcon from "@mui/icons-material/Shield";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import usePermissions from "../../hooks/usePermissions";
import rbacService from "../../services/rbac/rbacService";
import { SUPER_ADMIN_CODE, type RoleListItem } from "../../types/rbac";

const headClass =
  "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500";

const errorMessage = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? fallback;
};

export default function RolesPage() {
  const { can } = usePermissions();
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    rbacService
      .getRoles()
      .then(setRoles)
      .catch((err) => setError(errorMessage(err, "Rollar yüklənərkən xəta baş verdi.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  /**
   * Invariant R6 lives on the server, but a role with users attached needs a
   * destination before the request is worth making — so the reassignment target
   * is collected here and sent as `reassign_to_role_id`.
   */
  const handleDelete = async (role: RoleListItem) => {
    if (role.is_system) {
      await Swal.fire({
        icon: "info",
        title: "Sistem rolu silinmir",
        text: "Bu rol sistemin işləməsi üçün tələb olunur.",
      });
      return;
    }

    let reassignToRoleId: number | undefined;

    if (role.user_count > 0) {
      const targets = roles.filter((item) => item.id !== role.id);
      const { value, isConfirmed } = await Swal.fire({
        title: `"${role.name_az}" rolunu sil`,
        html: `Bu rola <b>${role.user_count}</b> istifadəçi bağlıdır. Onlar hansı rola keçirilsin?`,
        icon: "warning",
        input: "select",
        inputOptions: targets.reduce<Record<string, string>>((acc, item) => {
          acc[String(item.id)] = item.name_az;
          return acc;
        }, {}),
        inputPlaceholder: "Yeni rol seçin",
        inputValidator: (selected) => (selected ? null : "Rol seçmək lazımdır"),
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sil və köçür",
        cancelButtonText: "İmtina",
        reverseButtons: true,
      });
      if (!isConfirmed) return;
      reassignToRoleId = Number(value);
    } else {
      const { isConfirmed } = await Swal.fire({
        title: `"${role.name_az}" rolunu silmək istəyirsiniz?`,
        text: "Bu əməliyyat geri alına bilməz!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Bəli, sil",
        cancelButtonText: "İmtina",
        reverseButtons: true,
      });
      if (!isConfirmed) return;
    }

    try {
      await rbacService.deleteRole(role.id, reassignToRoleId);
      Swal.fire({
        icon: "success",
        title: "Rol silindi",
        showConfirmButton: false,
        timer: 1500,
      });
      load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: errorMessage(err, "Rol silinərkən xəta baş verdi."),
      });
    }
  };

  return (
    <>
      <PageMeta title="Rollar | AzTU Admin" description="İcazə rollarının idarə edilməsi" />
      <PageBreadcrumb pageTitle="Rollar" />

      <ComponentCard
        title="Rollar"
        desc="Hər rol icazələr toplusudur — istifadəçilər rol vasitəsilə səlahiyyət alır"
        actions={
          can("roles.create") && (
            <Link
              to="/settings/roles/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Yeni rol
            </Link>
          )
        }
      >
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm font-medium text-error-500">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
            >
              Yenidən cəhd et
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/50">
                <TableRow>
                  <TableCell isHeader className={headClass}>
                    Rol
                  </TableCell>
                  <TableCell isHeader className={`${headClass} w-40`}>
                    Kod
                  </TableCell>
                  <TableCell isHeader className={`${headClass} w-32`}>
                    İcazə
                  </TableCell>
                  <TableCell isHeader className={`${headClass} w-32`}>
                    İstifadəçi
                  </TableCell>
                  <TableCell isHeader className={`${headClass} w-28 text-right`}>
                    Əməliyyatlar
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {roles.map((role) => {
                  const isSuperAdmin = role.code === SUPER_ADMIN_CODE;

                  return (
                    <TableRow
                      key={role.id}
                      className="border-b border-gray-50 transition-colors last:border-b-0 hover:bg-gray-50/60 dark:border-gray-800 dark:hover:bg-gray-800/40"
                    >
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {isSuperAdmin && (
                            <ShieldIcon sx={{ fontSize: 18 }} className="text-brand-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {role.name_az}
                            </p>
                            {role.description && (
                              <p className="mt-0.5 line-clamp-1 text-xs text-gray-400 dark:text-gray-500">
                                {role.description}
                              </p>
                            )}
                          </div>
                          {role.is_system && (
                            <Badge size="sm" color="light">
                              sistem
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-3.5">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                          {role.code}
                        </span>
                      </TableCell>

                      <TableCell className="px-5 py-3.5">
                        {role.permission_count === null ? (
                          <Badge size="sm" color="primary">
                            Hamısı
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {role.permission_count}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="px-5 py-3.5">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {role.user_count}
                        </span>
                      </TableCell>

                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/settings/roles/${role.id}`}
                            title={can("roles.update") ? "Düzəliş et" : "Bax"}
                            className="rounded-lg p-1.5 text-amber-500 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          >
                            <EditIcon sx={{ fontSize: 18 }} />
                          </Link>
                          {can("roles.delete") && !role.is_system && (
                            <button
                              type="button"
                              title="Sil"
                              onClick={() => handleDelete(role)}
                              className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {roles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-12 text-center">
                      <p className="text-sm text-gray-400 dark:text-gray-500">Rol tapılmadı</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </ComponentCard>
    </>
  );
}
