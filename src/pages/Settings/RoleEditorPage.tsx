import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import RoleForm, { type RoleFormValues } from "../../components/settings/RoleForm";
import PermissionMatrix from "../../components/settings/PermissionMatrix";
import usePermissions from "../../hooks/usePermissions";
import rbacService from "../../services/rbac/rbacService";
import {
  SUPER_ADMIN_CODE,
  type PermissionDomainGroup,
  type RoleDetail,
} from "../../types/rbac";

const EMPTY_FORM: RoleFormValues = { code: "", name_az: "", name_en: "", description: "" };

const errorMessage = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? fallback;
};

export default function RoleEditorPage() {
  const { role_id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();

  const isNew = role_id === undefined;
  const roleId = isNew ? null : Number(role_id);

  const [domains, setDomains] = useState<PermissionDomainGroup[]>([]);
  const [role, setRole] = useState<RoleDetail | null>(null);
  const [form, setForm] = useState<RoleFormValues>(EMPTY_FORM);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof RoleFormValues, string>>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([
      rbacService.getPermissions(),
      roleId === null ? Promise.resolve(null) : rbacService.getRole(roleId),
    ])
      .then(([permissionGroups, roleDetail]) => {
        if (cancelled) return;
        setDomains(permissionGroups);
        if (roleDetail) {
          setRole(roleDetail);
          setForm({
            code: roleDetail.code,
            name_az: roleDetail.name_az,
            name_en: roleDetail.name_en,
            description: roleDetail.description ?? "",
          });
          setSelected(roleDetail.permissions);
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
  }, [roleId]);

  /**
   * super_admin holds zero grant rows by design and the server answers 409 to any
   * edit of its set (invariant R2). The matrix is locked so the refusal is stated
   * up front rather than arriving as an error after the user has done the work.
   */
  const isSuperAdmin = role?.code === SUPER_ADMIN_CODE;
  const canEdit = isNew ? can("roles.create") : can("roles.update");
  const canEditPermissions = isNew
    ? can("roles.create")
    : can("roles.update_permissions") && !isSuperAdmin;

  const validate = (): boolean => {
    const next: Partial<Record<keyof RoleFormValues, string>> = {};
    if (!form.name_az.trim()) next.name_az = "Ad tələb olunur";
    if (!form.name_en.trim()) next.name_en = "Ad tələb olunur";
    if (isNew) {
      if (!form.code.trim()) next.code = "Kod tələb olunur";
      else if (!/^[a-z][a-z0-9_]*$/.test(form.code)) next.code = "Yalnız kiçik hərf və alt xətt";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      if (isNew) {
        const createdId = await rbacService.createRole({
          code: form.code.trim(),
          name_az: form.name_az.trim(),
          name_en: form.name_en.trim(),
          description: form.description,
          permissions: selected,
        });
        await Swal.fire({
          icon: "success",
          title: "Rol yaradıldı",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate(`/settings/roles/${createdId}`, { replace: true });
        return;
      }

      if (roleId === null) return;

      if (can("roles.update")) {
        await rbacService.updateRole(roleId, {
          name_az: form.name_az.trim(),
          name_en: form.name_en.trim(),
          description: form.description,
        });
      }

      if (canEditPermissions) {
        await rbacService.updateRolePermissions(roleId, { permissions: selected });
      }

      Swal.fire({
        icon: "success",
        title: "Rol yeniləndi",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: errorMessage(err, "Rol yadda saxlanılarkən xəta baş verdi."),
      });
    } finally {
      setSaving(false);
    }
  };

  const title = isNew ? "Yeni rol" : role?.name_az ?? "Rol";
  const totalPermissions = useMemo(
    () => domains.reduce((sum, group) => sum + group.permissions.length, 0),
    [domains]
  );

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
        <PageBreadcrumb pageTitle="Rol" />
        <ComponentCard title="Xəta">
          <p className="text-sm text-error-500">{loadError}</p>
        </ComponentCard>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`${title} | AzTU Admin`} description="Rol və icazələrin idarə edilməsi" />
      <PageBreadcrumb pageTitle={title} />

      <div className="space-y-6">
        <ComponentCard
          title="Rol məlumatları"
          desc={
            isNew
              ? "Rolu adlandırın, sonra aşağıdan icazələri seçin"
              : `Bu rola ${role?.user_count ?? 0} istifadəçi bağlıdır`
          }
        >
          <RoleForm
            values={form}
            onChange={setForm}
            errors={errors}
            codeLocked={!isNew}
            isSystem={Boolean(role?.is_system)}
            disabled={!canEdit || saving}
          />
        </ComponentCard>

        <ComponentCard
          title="İcazələr"
          desc={`${totalPermissions} icazədən ibarət kataloq — bölmə üzrə seçin`}
        >
          <PermissionMatrix
            domains={domains}
            selected={selected}
            onChange={setSelected}
            lockedAll={isSuperAdmin}
            disabled={!canEditPermissions || saving}
          />
        </ComponentCard>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/settings/roles")} disabled={saving}>
            İmtina
          </Button>
          {canEdit && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Yadda saxlanılır..." : isNew ? "Rol yarat" : "Yadda saxla"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
