import { useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";
import RichTextField from "../Cafedras/form/fields/RichTextField";
import { getImageUrl } from "../../util/imageUrl";
import type { FieldKind } from "./sectionTypes";

/**
 * One field of an About block, rendered from its spec.
 *
 * Translated fields ("tr" scope) appear twice — once per language — behind the
 * language tabs below; language-neutral fields appear once. Uploads are the
 * exception to "save then upload": the row has to exist before a file can be
 * attached to it, so the picker hands the chosen `File` back to the caller,
 * which uploads it after the create/update succeeds.
 */

export interface FieldProps {
  kind: FieldKind;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
  /** Bumped when the value is replaced from outside, to re-seed the editor. */
  remountKey?: string | number;
  /** Upload fields hand the picked file up rather than writing to `value`. */
  onFileSelect?: (file: File | null) => void;
  selectedFileName?: string;
  /** Already-stored path, previewed next to the picker. */
  currentPath?: string | null;
}

export function AboutField({
  kind,
  label,
  value,
  onChange,
  placeholder,
  hint,
  remountKey,
  onFileSelect,
  selectedFileName,
  currentPath,
}: FieldProps) {
  if (kind === "rich") {
    return (
      <RichTextField label={label} value={value} onChange={onChange} remountKey={remountKey} />
    );
  }

  if (kind === "image" || kind === "file") {
    const isImage = kind === "image";
    return (
      <div>
        <Label>{label}</Label>
        <div className="flex items-center gap-3">
          {isImage && currentPath ? (
            <img
              src={getImageUrl(currentPath)}
              alt=""
              className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
            />
          ) : null}
          <input
            type="file"
            accept={isImage ? "image/*" : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"}
            onChange={(event) => onFileSelect?.(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
          />
        </div>
        {selectedFileName ? (
          <p className="mt-1 text-xs text-brand-600 dark:text-brand-400">
            Seçildi: {selectedFileName} — yadda saxladıqdan sonra yüklənəcək.
          </p>
        ) : currentPath && !isImage ? (
          <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{currentPath}</p>
        ) : null}
        {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
      </div>
    );
  }

  if (kind === "textarea" || kind === "lines") {
    return (
      <div>
        <Label>{label}</Label>
        <TextArea
          value={value}
          onChange={onChange}
          rows={kind === "lines" ? 5 : 3}
          placeholder={placeholder}
        />
        {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
      </div>
    );
  }

  return (
    <div>
      <Label>{label}</Label>
      <Input
        type={kind === "email" ? "email" : "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}

/**
 * AZ/EN switch for the translated half of a form.
 *
 * Both languages stay mounted-by-state rather than unmounted, so switching tabs
 * never drops what was typed in the other language before saving.
 */
export function LanguageTabs({
  children,
}: {
  children: (lang: "az" | "en") => React.ReactNode;
}) {
  const [lang, setLang] = useState<"az" | "en">("az");

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
        {(["az", "en"] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              lang === code
                ? "bg-brand-500 text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {code === "az" ? "Azərbaycanca" : "English"}
          </button>
        ))}
      </div>
      {children(lang)}
    </div>
  );
}
