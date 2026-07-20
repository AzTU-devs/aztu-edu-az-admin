import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import ImageField from "../Cafedras/form/fields/ImageField";
import type { RoleListItem } from "../../types/rbac";
import { SUPER_ADMIN_CODE } from "../../types/rbac";

export interface AdminUserFormValues {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number | null;
  is_active: boolean;
  /** Already-saved path from the API — null until an image is uploaded. */
  profile_image: string | null;
  /** Picked but not yet uploaded; the editor sends it after the account is saved. */
  profile_image_files: File[];
}

interface AdminUserFormProps {
  values: AdminUserFormValues;
  onChange: (values: AdminUserFormValues) => void;
  roles: RoleListItem[];
  /** Editing an existing account — the password moves to its own reset action. */
  isEdit?: boolean;
  /**
   * The account being edited is the signed-in one. Invariant R5: an admin may not
   * change their own role or deactivate themselves, so those controls are locked
   * here rather than letting the server answer 409.
   */
  isSelf?: boolean;
  /** Invariant R4: the last active super admin may not be demoted or deactivated. */
  isLastSuperAdmin?: boolean;
  disabled?: boolean;
  errors?: Partial<Record<keyof AdminUserFormValues, string>>;
}

export default function AdminUserForm({
  values,
  onChange,
  roles,
  isEdit = false,
  isSelf = false,
  isLastSuperAdmin = false,
  disabled = false,
  errors = {},
}: AdminUserFormProps) {
  const roleLocked = disabled || isSelf || isLastSuperAdmin;
  const activeLocked = disabled || isSelf || isLastSuperAdmin;

  const set = <K extends keyof AdminUserFormValues>(
    field: K,
    value: AdminUserFormValues[K]
  ) => onChange({ ...values, [field]: value });

  const lockReason = isSelf
    ? "Öz rolunuzu və ya statusunuzu dəyişə bilməzsiniz — bu, özünüzü sistemdən kənarda qoymağın qarşısını alır."
    : isLastSuperAdmin
    ? "Bu, sistemdəki yeganə aktiv super admindir. Rolu və statusu dəyişdirilə bilməz."
    : null;

  return (
    <div className="space-y-5">
      {lockReason && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-500/30 dark:bg-warning-500/10">
          <WarningAmberIcon fontSize="small" className="mt-0.5 text-warning-500" />
          <p className="text-xs leading-relaxed text-warning-700 dark:text-orange-200/90">
            {lockReason}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="admin-username">
            İstifadəçi adı <span className="text-error-500">*</span>
          </Label>
          <Input
            id="admin-username"
            value={values.username}
            disabled={disabled}
            error={Boolean(errors.username)}
            hint={errors.username}
            placeholder="nigar"
            onChange={(event) => set("username", event.target.value.trim())}
          />
        </div>

        <div>
          <Label htmlFor="admin-first-name">Ad</Label>
          <Input
            id="admin-first-name"
            value={values.first_name}
            disabled={disabled}
            error={Boolean(errors.first_name)}
            hint={errors.first_name}
            placeholder="Nigar"
            onChange={(event) => set("first_name", event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="admin-last-name">Soyad</Label>
          <Input
            id="admin-last-name"
            value={values.last_name}
            disabled={disabled}
            error={Boolean(errors.last_name)}
            hint={errors.last_name}
            placeholder="Əliyeva"
            onChange={(event) => set("last_name", event.target.value)}
          />
        </div>

        {!isEdit && (
          <div>
            <Label htmlFor="admin-password">
              Şifrə <span className="text-error-500">*</span>
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={values.password}
              disabled={disabled}
              error={Boolean(errors.password)}
              hint={errors.password ?? "Ən azı 8 simvol"}
              placeholder="••••••••"
              onChange={(event) => set("password", event.target.value)}
            />
          </div>
        )}

        <div>
          <Label htmlFor="admin-role">
            Rol <span className="text-error-500">*</span>
          </Label>
          <select
            id="admin-role"
            disabled={roleLocked}
            value={values.role_id === null ? "" : String(values.role_id)}
            onChange={(event) =>
              set("role_id", event.target.value === "" ? null : Number(event.target.value))
            }
            className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 ${
              roleLocked ? "cursor-not-allowed bg-gray-100 opacity-60 dark:bg-gray-800" : ""
            }`}
          >
            <option value="" className="dark:bg-gray-900">
              Rol seçin
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id} className="dark:bg-gray-900">
                {role.name_az}
                {role.code === SUPER_ADMIN_CODE ? " (bütün icazələr)" : ""}
              </option>
            ))}
          </select>
          {errors.role_id && <p className="mt-1.5 text-xs text-error-500">{errors.role_id}</p>}
        </div>

        <div className="flex items-end pb-2.5">
          <Checkbox
            label="Aktiv hesab"
            checked={values.is_active}
            disabled={activeLocked}
            onChange={(checked) => set("is_active", checked)}
          />
        </div>

        <div className="sm:col-span-2">
          <ImageField
            label="Profil şəkli"
            imageUrl={values.profile_image}
            files={values.profile_image_files}
            onSelect={(files) => set("profile_image_files", files.slice(0, 1))}
            onRemovePending={() => set("profile_image_files", [])}
            disabled={disabled}
            hint="PNG, JPG, WEBP — istəyə bağlı"
          />
        </div>
      </div>
    </div>
  );
}
