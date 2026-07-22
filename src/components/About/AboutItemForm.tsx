import { AboutField, LanguageTabs } from "./AboutFields";
import { linesToText, type ItemFieldSpec, type SectionTypeMeta } from "./sectionTypes";
import type { AboutItem } from "../../services/about/aboutService";

/**
 * The row editor for every non-people block.
 *
 * It has no hard-coded fields of its own: it renders whatever the block's
 * `SectionTypeMeta` declares, which is how one component covers a timeline
 * milestone, a policy PDF and a ranking position without branching.
 */

export interface AboutItemFormValue {
  /** Language-neutral columns, keyed by column name. */
  row: Record<string, string>;
  az: Record<string, string>;
  en: Record<string, string>;
  /**
   * Files picked but not yet uploaded — a row has to exist before anything can
   * be attached to it. Keys: `row:<column>` and `tr:<column>:<lang>`.
   */
  files: Record<string, File | null>;
}

export const emptyItemValue = (): AboutItemFormValue => ({
  row: {},
  az: {},
  en: {},
  files: {},
});

const readTr = (item: AboutItem, lang: "az" | "en", spec: ItemFieldSpec): string => {
  const source = item[lang] as unknown as Record<string, unknown>;
  const raw = source?.[spec.key];
  if (spec.kind === "lines") return linesToText(raw);
  return raw == null ? "" : String(raw);
};

export const itemToFormValue = (item: AboutItem, meta: SectionTypeMeta): AboutItemFormValue => {
  const value = emptyItemValue();

  meta.itemFields.forEach((spec) => {
    if (spec.scope === "row") {
      const raw = (item as unknown as Record<string, unknown>)[spec.key];
      value.row[spec.key] = raw == null ? "" : String(raw);
    } else {
      value.az[spec.key] = readTr(item, "az", spec);
      value.en[spec.key] = readTr(item, "en", spec);
    }
  });

  return value;
};

interface AboutItemFormProps {
  meta: SectionTypeMeta;
  value: AboutItemFormValue;
  onChange: (next: AboutItemFormValue) => void;
  /** Bumped on modal open so the rich-text fields re-seed. */
  remountKey: number;
}

export default function AboutItemForm({
  meta,
  value,
  onChange,
  remountKey,
}: AboutItemFormProps) {
  const rowFields = meta.itemFields.filter((spec) => spec.scope === "row");
  const trFields = meta.itemFields.filter((spec) => spec.scope === "tr");

  const setRow = (key: string, next: string) =>
    onChange({ ...value, row: { ...value.row, [key]: next } });

  const setTr = (lang: "az" | "en", key: string, next: string) =>
    onChange({ ...value, [lang]: { ...value[lang], [key]: next } });

  const setFile = (key: string, file: File | null) =>
    onChange({ ...value, files: { ...value.files, [key]: file } });

  const renderRowField = (spec: ItemFieldSpec) => {
    const fileKey = `row:${spec.key}`;
    const isUpload = spec.kind === "image" || spec.kind === "file";
    return (
      <AboutField
        key={spec.key}
        kind={spec.kind}
        label={spec.label}
        hint={spec.hint}
        placeholder={spec.placeholder}
        value={value.row[spec.key] ?? ""}
        onChange={(next) => setRow(spec.key, next)}
        remountKey={remountKey}
        onFileSelect={isUpload ? (file) => setFile(fileKey, file) : undefined}
        selectedFileName={isUpload ? value.files[fileKey]?.name : undefined}
        // `itemToFormValue` copies the stored path into the same slot, so the
        // preview reads it straight off the value rather than the source row.
        currentPath={isUpload ? (value.row[spec.key] || null) : undefined}
      />
    );
  };

  const renderTrField = (spec: ItemFieldSpec, lang: "az" | "en") => {
    const fileKey = `tr:${spec.key}:${lang}`;
    const isUpload = spec.kind === "image" || spec.kind === "file";
    return (
      <AboutField
        key={`${spec.key}-${lang}`}
        kind={spec.kind}
        label={spec.label}
        hint={spec.hint}
        placeholder={spec.placeholder}
        value={value[lang][spec.key] ?? ""}
        onChange={(next) => setTr(lang, spec.key, next)}
        remountKey={`${remountKey}-${lang}`}
        onFileSelect={isUpload ? (file) => setFile(fileKey, file) : undefined}
        selectedFileName={isUpload ? value.files[fileKey]?.name : undefined}
        currentPath={isUpload ? (value[lang][spec.key] || null) : undefined}
      />
    );
  };

  return (
    <div className="space-y-6">
      {rowFields.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{rowFields.map(renderRowField)}</div>
      ) : null}

      {trFields.length > 0 ? (
        <LanguageTabs>
          {(lang) => (
            <div className="space-y-4">{trFields.map((spec) => renderTrField(spec, lang))}</div>
          )}
        </LanguageTabs>
      ) : null}
    </div>
  );
}
