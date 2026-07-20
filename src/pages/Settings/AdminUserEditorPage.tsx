import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import LastLoginCell from "../../components/settings/LastLoginCell";
import AdminUserForm, { type AdminUserFormValues } from "../../components/settings/AdminUserForm";
import usePermissions from "../../hooks/usePermissions";
import adminUserService from "../../services/adminUsers/adminUserService";
import rbacService from "../../services/rbac/rbacService";
import type { RootState } from "../../redux/store";
import { SUPER_ADMIN_CODE, type AdminUserListItem, type RoleListItem } from "../../types/rbac";

const EMPTY_FORM: AdminUserFormValues = {
  username: "",
  password: "",
  first_name: "",
  last_name: "",
  role_id: null,
  is_active: true,
  profile_image: null,
  profile_image_files: [],
};

const errorMessage = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? fallback;
};

export default function AdminUserEditorPage() {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const currentUserId = useSelector((state: RootState) => state.auth.user_id);

  const isNew = user_id === undefined;
  const userId = isNew ? null : Number(user_id);

  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [user, setUser] = useState<AdminUserListItem | null>(null);
  const [form, setForm] = useState<AdminUserFormValues>(EMPTY_FORM);
  const [initialRoleId, setInitialRoleId] = useState<number | null>(null);
  const [isLastSuperAdmin, setIsLastSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof AdminUserFormValues, string>>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    /**
     * The list endpoint is the only read path for admin users, so the row being
     * edited is picked out of it. That same page also answers "is this the last
     * active super admin" (invariant R4) without a second endpoint.
     */
    // 100 is the server's cap; asking for more is a 422, not a clamp.
    Promise.all([rbacService.getRoles(), adminUserService.list({ page: 1, page_size: 100 })])
      .then(([roleList, page]) => {
        if (cancelled) return;
        setRoles(roleList);

        const superAdmins = page.items.filter(
          (item) => item.role?.code === SUPER_ADMIN_CODE && item.is_active
        );

        if (userId !== null) {
          const found = page.items.find((item) => item.id === userId) ?? null;
          if (!found) {
            setLoadError("İstifadəçi tapılmadı.");
            return;
          }
          setUser(found);
          setInitialRoleId(found.role?.id ?? null);
          setIsLastSuperAdmin(
            found.role?.code === SUPER_ADMIN_CODE && found.is_active && superAdmins.length <= 1
          );
          setForm({
            username: found.username,
            password: "",
            first_name: found.first_name ?? "",
            last_name: found.last_name ?? "",
            role_id: found.role?.id ?? null,
            is_active: found.is_active,
            profile_image: found.profile_image,
            profile_image_files: [],
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err, "Məlumat yüklənərkən xəta baş verdi."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isSelf = userId !== null && userId === currentUserId;

  const validate = (): boolean => {
    const next: Partial<Record<keyof AdminUserFormValues, string>> = {};
    if (!form.username.trim()) next.username = "İstifadəçi adı tələb olunur";
    if (isNew && form.password.length < 8) next.password = "Şifrə ən azı 8 simvol olmalıdır";
    if (form.role_id === null) next.role_id = "Rol seçmək lazımdır";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || form.role_id === null) return;
    setSaving(true);

    try {
      if (isNew) {
        const createdId = await adminUserService.create({
          username: form.username.trim(),
          password: form.password,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          role_id: form.role_id,
          is_active: form.is_active,
        });
        // The account already exists at this point, so an image failure must not
        // send the admin back to a form that would now 409 on the username.
        if (form.profile_image_files.length > 0) {
          try {
            await adminUserService.uploadProfileImage(createdId, form.profile_image_files[0]);
          } catch (err) {
            Swal.fire({
              icon: "warning",
              title: "Hesab yaradıldı, şəkil yüklənmədi",
              text: errorMessage(err, "Profil şəklini redaktə səhifəsindən yenidən yükləyin."),
            });
          }
        }
        await Swal.fire({
          icon: "success",
          title: "İstifadəçi yaradıldı",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/settings/admin-users", { replace: true });
        return;
      }

      if (userId === null) return;

      await adminUserService.update(userId, {
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        is_active: form.is_active,
      });

      if (form.profile_image_files.length > 0) {
        const path = await adminUserService.uploadProfileImage(userId, form.profile_image_files[0]);
        setForm((prev) => ({ ...prev, profile_image: path, profile_image_files: [] }));
      }

      if (form.role_id !== initialRoleId && can("admin_users.assign_role")) {
        await adminUserService.assignRole(userId, { role_id: form.role_id });
        setInitialRoleId(form.role_id);
      }

      Swal.fire({
        icon: "success",
        title: "İstifadəçi yeniləndi",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: errorMessage(err, "Yadda saxlanılarkən xəta baş verdi."),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (userId === null) return;

    const { value, isConfirmed } = await Swal.fire({
      title: "Yeni şifrə təyin et",
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
      await adminUserService.resetPassword(userId, { password: value });
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

  const canEdit = isNew ? can("admin_users.create") : can("admin_users.update");
  const fullName = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") : "";
  const title = isNew ? "Yeni istifadəçi" : fullName || user?.username || "İstifadəçi";

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress size={32} />
      </div>
    );
  }

  if (loadError) {
    return (
      <>
        <PageBreadcrumb pageTitle="İstifadəçi" />
        <ComponentCard title="Xəta">
          <p className="text-sm text-error-500">{loadError}</p>
        </ComponentCard>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`${title} | AzTU Admin`} description="Admin hesabının idarə edilməsi" />
      <PageBreadcrumb pageTitle={title} />

      <div className="space-y-6">
        {!isNew && user && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Son giriş
              </p>
              <div className="mt-2">
                <LastLoginCell value={user.last_login_at} />
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Cari rol
              </p>
              <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {user.role?.name_az ?? "Rolsuz"}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Yaradılıb
              </p>
              <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {new Date(user.created_at).toLocaleDateString("az-AZ")}
              </p>
            </div>
          </div>
        )}

        <ComponentCard
          title="Hesab məlumatları"
          desc={isNew ? "Yeni admin hesabı yaradın və rol təyin edin" : "Hesabı və rolunu yeniləyin"}
          actions={
            !isNew &&
            can("admin_users.reset_password") && (
              <button
                type="button"
                onClick={handleResetPassword}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-500 transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/10"
              >
                Şifrəni dəyiş
              </button>
            )
          }
        >
          <AdminUserForm
            values={form}
            onChange={setForm}
            roles={roles}
            errors={errors}
            isEdit={!isNew}
            isSelf={isSelf}
            isLastSuperAdmin={isLastSuperAdmin}
            disabled={!canEdit || saving}
          />
        </ComponentCard>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/settings/admin-users")}
            disabled={saving}
          >
            İmtina
          </Button>
          {canEdit && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Yadda saxlanılır..." : isNew ? "İstifadəçi yarat" : "Yadda saxla"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
