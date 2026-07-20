import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { Pagination, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyIcon from "@mui/icons-material/VpnKey";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import SearchIcon from "@mui/icons-material/Search";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import LastLoginCell from "../../components/settings/LastLoginCell";
import usePermissions from "../../hooks/usePermissions";
import adminUserService from "../../services/adminUsers/adminUserService";
import rbacService from "../../services/rbac/rbacService";
import type { RootState } from "../../redux/store";
import { SUPER_ADMIN_CODE, type AdminUserListItem, type RoleListItem } from "../../types/rbac";

const PAGE_SIZE = 25;

const headClass =
  "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500";

const errorMessage = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? fallback;
};

export default function AdminUsersPage() {
  const { can } = usePermissions();
  const currentUserId = useSelector((state: RootState) => state.auth.user_id);

  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminUserService
      .list({
        page,
        page_size: PAGE_SIZE,
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(roleFilter ? { role_id: Number(roleFilter) } : {}),
        ...(activeFilter ? { is_active: activeFilter === "active" } : {}),
      })
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err) => setError(errorMessage(err, "İstifadəçilər yüklənərkən xəta baş verdi.")))
      .finally(() => setLoading(false));
  }, [page, q, roleFilter, activeFilter]);

  useEffect(() => {
    const timer = setTimeout(load, q ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, q]);

  useEffect(() => {
    if (can("roles.read")) {
      rbacService.getRoles().then(setRoles).catch(() => setRoles([]));
    }
  }, [can]);

  /**
   * Invariants R4/R5 are enforced server side inside the transaction; these are
   * the same rules restated so the destructive control is simply absent rather
   * than producing a 409 after a confirm dialog.
   */
  const activeSuperAdmins = items.filter(
    (item) => item.role?.code === SUPER_ADMIN_CODE && item.is_active
  );

  const isProtected = (user: AdminUserListItem) =>
    user.id === currentUserId ||
    (user.role?.code === SUPER_ADMIN_CODE && user.is_active && activeSuperAdmins.length <= 1);

  const runAction = async (
    action: () => Promise<unknown>,
    confirm: { title: string; text?: string; confirmText: string; danger?: boolean },
    successTitle: string
  ) => {
    const { isConfirmed } = await Swal.fire({
      title: confirm.title,
      text: confirm.text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: confirm.danger ? "#d33" : "#3085d6",
      cancelButtonColor: confirm.danger ? "#3085d6" : "#d33",
      confirmButtonText: confirm.confirmText,
      cancelButtonText: "İmtina",
      reverseButtons: true,
    });
    if (!isConfirmed) return;

    try {
      await action();
      Swal.fire({ icon: "success", title: successTitle, showConfirmButton: false, timer: 1500 });
      load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: errorMessage(err, "Əməliyyat yerinə yetirilmədi."),
      });
    }
  };

  const handleToggleActive = (user: AdminUserListItem) =>
    runAction(
      () =>
        user.is_active
          ? adminUserService.deactivate(user.id)
          : adminUserService.activate(user.id),
      {
        title: user.is_active
          ? `"${user.username}" hesabı deaktiv edilsin?`
          : `"${user.username}" hesabı aktiv edilsin?`,
        text: user.is_active ? "İstifadəçi sistemə daxil ola bilməyəcək." : undefined,
        confirmText: user.is_active ? "Deaktiv et" : "Aktiv et",
        danger: user.is_active,
      },
      user.is_active ? "Hesab deaktiv edildi" : "Hesab aktiv edildi"
    );

  const handleDelete = (user: AdminUserListItem) =>
    runAction(
      () => adminUserService.remove(user.id),
      {
        title: `"${user.username}" silinsin?`,
        text: "Bu əməliyyat geri alına bilməz!",
        confirmText: "Bəli, sil",
        danger: true,
      },
      "İstifadəçi silindi"
    );

  const handleResetPassword = async (user: AdminUserListItem) => {
    const { value, isConfirmed } = await Swal.fire({
      title: `"${user.username}" üçün yeni şifrə`,
      input: "password",
      inputPlaceholder: "Ən azı 8 simvol",
      inputAttributes: { autocomplete: "new-password" },
      inputValidator: (input) =>
        !input || input.length < 8 ? "Şifrə ən azı 8 simvol olmalıdır" : null,
      showCancelButton: true,
      confirmButtonText: "Şifrəni dəyiş",
      cancelButtonText: "İmtina",
      reverseButtons: true,
    });
    if (!isConfirmed || !value) return;

    try {
      await adminUserService.resetPassword(user.id, { password: value });
      Swal.fire({
        icon: "success",
        title: "Şifrə yeniləndi",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: errorMessage(err, "Şifrə yenilənərkən xəta baş verdi."),
      });
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const selectClass =
    "h-10 appearance-none rounded-lg border border-gray-300 bg-transparent px-3 pr-8 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  return (
    <>
      <PageMeta title="İstifadəçilər | AzTU Admin" description="Admin hesablarının idarə edilməsi" />
      <PageBreadcrumb pageTitle="İstifadəçilər" />

      <ComponentCard
        title="Admin istifadəçiləri"
        desc={`${total} hesab — rol, status və son giriş`}
        actions={
          can("admin_users.create") && (
            <Link
              to="/settings/admin-users/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Yeni istifadəçi
            </Link>
          )
        }
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon fontSize="small" />
            </span>
            <input
              type="text"
              value={q}
              placeholder="İstifadəçi adı ilə axtar"
              onChange={(event) => {
                setPage(1);
                setQ(event.target.value);
              }}
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent py-2 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>

          <select
            className={selectClass}
            value={roleFilter}
            onChange={(event) => {
              setPage(1);
              setRoleFilter(event.target.value);
            }}
          >
            <option value="" className="dark:bg-gray-900">
              Bütün rollar
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id} className="dark:bg-gray-900">
                {role.name_az}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={activeFilter}
            onChange={(event) => {
              setPage(1);
              setActiveFilter(event.target.value);
            }}
          >
            <option value="" className="dark:bg-gray-900">
              Bütün statuslar
            </option>
            <option value="active" className="dark:bg-gray-900">
              Aktiv
            </option>
            <option value="inactive" className="dark:bg-gray-900">
              Deaktiv
            </option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
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
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/50">
                  <TableRow>
                    <TableCell isHeader className={headClass}>
                      İstifadəçi
                    </TableCell>
                    <TableCell isHeader className={`${headClass} w-44`}>
                      Rol
                    </TableCell>
                    <TableCell isHeader className={`${headClass} w-28`}>
                      Status
                    </TableCell>
                    <TableCell isHeader className={`${headClass} w-52`}>
                      Son giriş
                    </TableCell>
                    <TableCell isHeader className={`${headClass} w-40 text-right`}>
                      Əməliyyatlar
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.map((user) => {
                    const isSelf = user.id === currentUserId;
                    const locked = isProtected(user);

                    return (
                      <TableRow
                        key={user.id}
                        className="border-b border-gray-50 transition-colors last:border-b-0 hover:bg-gray-50/60 dark:border-gray-800 dark:hover:bg-gray-800/40"
                      >
                        <TableCell className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                              {user.username.slice(0, 2).toLocaleUpperCase("az")}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {user.username}
                                {isSelf && (
                                  <span className="ml-2 text-xs font-normal text-gray-400">
                                    (siz)
                                  </span>
                                )}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                                {new Date(user.created_at).toLocaleDateString("az-AZ")} tarixindən
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-3.5">
                          {user.role ? (
                            <Badge
                              size="sm"
                              color={user.role.code === SUPER_ADMIN_CODE ? "primary" : "light"}
                            >
                              {user.role.name_az}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-300 dark:text-gray-600">Rolsuz</span>
                          )}
                        </TableCell>

                        <TableCell className="px-5 py-3.5">
                          <Badge size="sm" color={user.is_active ? "success" : "error"}>
                            {user.is_active ? "Aktiv" : "Deaktiv"}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-5 py-3.5">
                          <LastLoginCell value={user.last_login_at} />
                        </TableCell>

                        <TableCell className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {can("admin_users.reset_password") && (
                              <button
                                type="button"
                                title="Şifrəni dəyiş"
                                onClick={() => handleResetPassword(user)}
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-200"
                              >
                                <KeyIcon sx={{ fontSize: 18 }} />
                              </button>
                            )}

                            {can(["admin_users.activate", "admin_users.deactivate"]) && !locked && (
                              <button
                                type="button"
                                title={user.is_active ? "Deaktiv et" : "Aktiv et"}
                                onClick={() => handleToggleActive(user)}
                                className={`rounded-lg p-1.5 transition-colors ${
                                  user.is_active
                                    ? "text-success-500 hover:bg-success-50 dark:hover:bg-success-500/10"
                                    : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                                }`}
                              >
                                {user.is_active ? (
                                  <ToggleOnIcon sx={{ fontSize: 20 }} />
                                ) : (
                                  <ToggleOffIcon sx={{ fontSize: 20 }} />
                                )}
                              </button>
                            )}

                            {can("admin_users.update") && (
                              <Link
                                to={`/settings/admin-users/${user.id}`}
                                title="Düzəliş et"
                                className="rounded-lg p-1.5 text-amber-500 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              >
                                <EditIcon sx={{ fontSize: 18 }} />
                              </Link>
                            )}

                            {can("admin_users.delete") && !locked && (
                              <button
                                type="button"
                                title="Sil"
                                onClick={() => handleDelete(user)}
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

                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="px-5 py-12 text-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          İstifadəçi tapılmadı
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {pageCount > 1 && (
              <div className="mt-5 flex justify-center">
                <Stack spacing={2}>
                  <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    shape="rounded"
                    color="primary"
                  />
                </Stack>
              </div>
            )}
          </>
        )}
      </ComponentCard>
    </>
  );
}
