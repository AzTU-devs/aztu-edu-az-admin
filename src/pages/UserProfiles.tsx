import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import { EyeCloseIcon, EyeIcon } from "../icons";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import Button from "../components/ui/button/Button";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import LastLoginCell, { formatDateTime } from "../components/settings/LastLoginCell";
import authService from "../services/auth/authService";
import { setSession } from "../redux/slices/authSlice";
import { getImageUrl } from "../util/imageUrl";
import { groupPermissionKeys, type MeData } from "../types/rbac";

/** Mirrors PASSWORD_MIN_LENGTH on the server. */
const PASSWORD_MIN_LENGTH = 8;

const EMPTY_FORM = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

type PasswordForm = typeof EMPTY_FORM;

const errorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: { message?: string; detail?: unknown } } })?.response
    ?.data;
  if (data?.message) return data.message;
  return typeof data?.detail === "string" ? data.detail : fallback;
};

interface PasswordFieldProps {
  id: keyof PasswordForm;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function PasswordField({
  id,
  label,
  value,
  placeholder,
  error,
  disabled,
  onChange,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Label htmlFor={id}>
        {label} <span className="text-error-500">*</span>
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          error={Boolean(error)}
          hint={error}
          onChange={(e) => onChange(e.target.value)}
        />
        <span
          onClick={() => setVisible(!visible)}
          className="absolute right-4 top-[22px] z-30 -translate-y-1/2 cursor-pointer"
        >
          {visible ? (
            <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
          ) : (
            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
          )}
        </span>
      </div>
    </div>
  );
}

export default function UserProfiles() {
  const dispatch = useDispatch();

  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<PasswordForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordForm, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    // Read fresh instead of off the persisted store: a role or permission change
    // made elsewhere would otherwise show the admin a stale version of their own
    // account. The same payload refreshes the session the rest of the app reads.
    authService
      .me()
      .then((data) => {
        if (cancelled) return;
        setMe(data);
        dispatch(setSession(data));
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err, "Profil məlumatları yüklənmədi."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const permissionGroups = useMemo(
    () => groupPermissionKeys(me?.permissions ?? []),
    [me?.permissions]
  );

  const fullName = me ? [me.first_name, me.last_name].filter(Boolean).join(" ") : "";
  const displayName = fullName || me?.username || "Profil";
  const initials = (fullName || me?.username || "?").slice(0, 2).toLocaleUpperCase("az");

  const setField = (field: keyof PasswordForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof PasswordForm, string>> = {};
    if (!form.current_password) next.current_password = "Cari şifrəni daxil edin";
    if (form.new_password.length < PASSWORD_MIN_LENGTH) {
      next.new_password = `Şifrə ən azı ${PASSWORD_MIN_LENGTH} simvol olmalıdır`;
    } else if (form.new_password === form.current_password) {
      next.new_password = "Yeni şifrə cari şifrədən fərqli olmalıdır";
    }
    if (form.confirm_password !== form.new_password) {
      next.confirm_password = "Şifrələr uyğun gəlmir";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const message = await authService.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setForm(EMPTY_FORM);
      setErrors({});
      Swal.fire({
        icon: "success",
        title: "Şifrə dəyişdirildi",
        text: message,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: errorMessage(err, "Şifrə dəyişdirilmədi. Yenidən cəhd edin."),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress size={32} />
      </div>
    );
  }

  if (loadError || !me) {
    return (
      <>
        <PageBreadcrumb pageTitle="Profil" />
        <ComponentCard title="Xəta">
          <p className="text-sm text-error-500">{loadError ?? "Profil məlumatları tapılmadı."}</p>
        </ComponentCard>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`${displayName} | AzTU Admin`} description="Hesab məlumatları və şifrə" />
      <PageBreadcrumb pageTitle="Profil" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 dark:bg-brand-500/15">
              {me.profile_image ? (
                <img
                  src={getImageUrl(me.profile_image)}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-brand-500 dark:text-brand-400">
                  {initials}
                </span>
              )}
            </span>

            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {displayName}
              </h2>
              <p className="mt-1 font-mono text-sm text-gray-500 dark:text-gray-400">
                {me.username}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    me.is_active
                      ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400"
                      : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                  }`}
                >
                  {me.is_active ? "Aktiv" : "Deaktiv"}
                </span>
                {me.is_super_admin && (
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    Super admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Son giriş
            </p>
            <div className="mt-2">
              <LastLoginCell value={me.last_login_at} />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Rol
            </p>
            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              {me.role?.name_az ?? "Rolsuz"}
            </p>
            {me.role && (
              <p className="mt-0.5 font-mono text-xs text-gray-400 dark:text-gray-500">
                {me.role.code}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Yaradılıb
            </p>
            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              {me.created_at ? formatDateTime(me.created_at) : "—"}
            </p>
          </div>
        </div>

        <ComponentCard
          title="İcazələr"
          desc={
            me.is_super_admin
              ? "Super admin bütün əməliyyatları icra edə bilər"
              : "Rolunuzun verdiyi icazələr"
          }
        >
          {me.is_super_admin ? (
            <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 dark:border-brand-500/20 dark:bg-brand-500/10">
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                Bütün icazələr
              </p>
              <p className="mt-1 text-xs text-brand-500/80 dark:text-brand-400/70">
                Super admin ayrıca icazə siyahısı saxlamır — bütün əməliyyatlar açıqdır.
              </p>
            </div>
          ) : permissionGroups.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Heç bir icazə təyin edilməyib. Giriş lazımdırsa, super adminlə əlaqə saxlayın.
            </p>
          ) : (
            <div className="space-y-5">
              {permissionGroups.map((group) => (
                <div key={group.domain}>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {group.label_az}
                    </h4>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400">
                      {group.keys.length}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.keys.map((key) => (
                      <span
                        key={key}
                        className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-600 dark:border-gray-800 dark:bg-white/5 dark:text-gray-300"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ComponentCard>

        <ComponentCard
          title="Şifrəni dəyiş"
          desc="Şifrə dəyişdikdən sonra digər cihazlardakı sessiyalar bağlanır"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField
              id="current_password"
              label="Cari şifrə"
              placeholder="Cari şifrənizi daxil edin"
              value={form.current_password}
              error={errors.current_password}
              disabled={saving}
              onChange={setField("current_password")}
            />
            <PasswordField
              id="new_password"
              label="Yeni şifrə"
              placeholder={`Ən azı ${PASSWORD_MIN_LENGTH} simvol`}
              value={form.new_password}
              error={errors.new_password}
              disabled={saving}
              onChange={setField("new_password")}
            />
            <PasswordField
              id="confirm_password"
              label="Yeni şifrənin təkrarı"
              placeholder="Yeni şifrəni yenidən daxil edin"
              value={form.confirm_password}
              error={errors.confirm_password}
              disabled={saving}
              onChange={setField("confirm_password")}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Dəyişdirilir..." : "Şifrəni dəyiş"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
