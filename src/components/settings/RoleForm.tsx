import Label from "../form/Label";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";

export interface RoleFormValues {
  code: string;
  name_az: string;
  name_en: string;
  description: string;
}

interface RoleFormProps {
  values: RoleFormValues;
  onChange: (values: RoleFormValues) => void;
  /** `code` is the programmatic identity the backend matches on — never editable after creation. */
  codeLocked?: boolean;
  isSystem?: boolean;
  disabled?: boolean;
  errors?: Partial<Record<keyof RoleFormValues, string>>;
}

export default function RoleForm({
  values,
  onChange,
  codeLocked = false,
  isSystem = false,
  disabled = false,
  errors = {},
}: RoleFormProps) {
  const set = (field: keyof RoleFormValues) => (value: string) =>
    onChange({ ...values, [field]: value });

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <Label htmlFor="role-name-az">
          Ad (AZ) <span className="text-error-500">*</span>
        </Label>
        <Input
          id="role-name-az"
          value={values.name_az}
          disabled={disabled}
          error={Boolean(errors.name_az)}
          hint={errors.name_az}
          placeholder="Məzmun redaktoru"
          onChange={(event) => set("name_az")(event.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="role-name-en">
          Ad (EN) <span className="text-error-500">*</span>
        </Label>
        <Input
          id="role-name-en"
          value={values.name_en}
          disabled={disabled}
          error={Boolean(errors.name_en)}
          hint={errors.name_en}
          placeholder="Content editor"
          onChange={(event) => set("name_en")(event.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="role-code">
          Kod <span className="text-error-500">*</span>
        </Label>
        <Input
          id="role-code"
          value={values.code}
          disabled={disabled || codeLocked}
          error={Boolean(errors.code)}
          hint={
            errors.code ??
            (codeLocked
              ? "Kod sistem daxilində istifadə olunur və dəyişdirilə bilməz."
              : "Yalnız kiçik hərflər və alt xətt: content_editor")
          }
          placeholder="content_editor"
          onChange={(event) =>
            set("code")(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))
          }
        />
      </div>

      <div className="flex items-end">
        {isSystem && (
          <div className="mb-1 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Sistem rolu</p>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              Bu rol silinə bilməz, lakin adı və icazələri dəyişdirilə bilər.
            </p>
          </div>
        )}
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="role-description">Təsvir</Label>
        <TextArea
          rows={3}
          value={values.description}
          disabled={disabled}
          placeholder="Bu rolun nə üçün nəzərdə tutulduğunu qısaca yazın"
          onChange={set("description")}
        />
      </div>
    </div>
  );
}
