import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";

import Button from "../ui/button/Button";
import Checkbox from "../form/input/Checkbox";
import EntityManager, { type CreateResult, type MutateResult } from "../common/subentity/EntityManager";
import { AboutField, LanguageTabs } from "./AboutFields";
import AboutItemForm, {
  emptyItemValue,
  itemToFormValue,
  type AboutItemFormValue,
} from "./AboutItemForm";
import AboutPeopleCards from "./AboutPeopleCards";
import AboutTableEditor from "./AboutTableEditor";
import AboutGalleryEditor from "./AboutGalleryEditor";
import AboutDocumentsEditor from "./AboutDocumentsEditor";
import {
  linesToText,
  metaFor,
  textToLines,
  type SectionFieldSpec,
  type SectionTypeMeta,
} from "./sectionTypes";
import {
  createAboutItem,
  deleteAboutItem,
  reorderAboutItems,
  updateAboutItem,
  updateAboutSection,
  uploadAboutItemFile,
  uploadAboutItemImage,
  type AboutItem,
  type AboutSection,
  type Lang,
} from "../../services/about/aboutService";

/**
 * One block of an About page: its own headings, plus the rows underneath it.
 *
 * The block's `section_type` decides both which section-level fields show and
 * what a row looks like, so this component never hard-codes a page's shape.
 */

interface SectionFormValue {
  row: Record<string, string>;
  az: Record<string, string>;
  en: Record<string, string>;
}

const readSectionField = (
  section: AboutSection,
  spec: SectionFieldSpec,
  lang?: "az" | "en"
): string => {
  const source =
    spec.scope === "row"
      ? (section as unknown as Record<string, unknown>)
      : ((section[lang!] ?? {}) as unknown as Record<string, unknown>);
  const raw = source?.[spec.key];
  if (spec.kind === "lines") return linesToText(raw);
  return raw == null ? "" : String(raw);
};

const toSectionForm = (section: AboutSection, meta: SectionTypeMeta): SectionFormValue => {
  const value: SectionFormValue = { row: {}, az: {}, en: {} };
  meta.sectionFields.forEach((spec) => {
    if (spec.scope === "row") {
      value.row[spec.key] = readSectionField(section, spec);
    } else {
      value.az[spec.key] = readSectionField(section, spec, "az");
      value.en[spec.key] = readSectionField(section, spec, "en");
    }
  });
  return value;
};

/** Row label in the list — the first field that actually carries text. */
const itemPrimary = (item: AboutItem): string =>
  item.az?.title ||
  item.en?.title ||
  item.az?.label ||
  item.en?.label ||
  item.value ||
  item.year ||
  item.az?.caption ||
  (Array.isArray(item.az?.extra) ? String((item.az.extra as unknown[])[0] ?? "") : "") ||
  "(başlıqsız)";

const itemSecondary = (item: AboutItem): string =>
  item.az?.description || item.az?.value_text || item.link_url || item.item_key || "";

/** Block types that bring their own editor instead of the generic row list. */
const HAS_CUSTOM_EDITOR = new Set(["table", "gallery", "documents"]);

interface AboutSectionCardProps {
  /** Needed to build links into this page's person detail screens. */
  pageKey: string;
  section: AboutSection;
  onChanged: () => void;
}

export default function AboutSectionCard({
  pageKey,
  section,
  onChanged,
}: AboutSectionCardProps) {
  const meta = metaFor(section.section_type);

  const [form, setForm] = useState<SectionFormValue>(() => toSectionForm(section, meta));
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // `RichTextField` seeds its content once at mount; bump this whenever a
  // refetch replaces the section so the editor re-reads the new value.
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    setForm(toSectionForm(section, meta));
    setFormKey((key) => key + 1);
  }, [section, meta]);

  const rowFields = meta.sectionFields.filter((spec) => spec.scope === "row");
  const trFields = meta.sectionFields.filter((spec) => spec.scope === "tr");

  const buildSectionPayload = () => {
    const payload: Record<string, unknown> = { az: {}, en: {} };
    meta.sectionFields.forEach((spec) => {
      if (spec.scope === "row") {
        payload[spec.key] = form.row[spec.key] ?? "";
        return;
      }
      const az = payload.az as Record<string, unknown>;
      const en = payload.en as Record<string, unknown>;
      if (spec.kind === "lines") {
        az[spec.key] = textToLines(form.az[spec.key] ?? "");
        en[spec.key] = textToLines(form.en[spec.key] ?? "");
      } else {
        az[spec.key] = form.az[spec.key] ?? "";
        en[spec.key] = form.en[spec.key] ?? "";
      }
    });
    return payload;
  };

  const handleSaveSection = async () => {
    setSaving(true);
    try {
      const result = await updateAboutSection(section.id, buildSectionPayload());
      if (result !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Bölmə yadda saxlanmadı." });
        return;
      }
      Swal.fire({ icon: "success", title: "Yadda saxlanıldı", showConfirmButton: false, timer: 1200 });
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (checked: boolean) => {
    const result = await updateAboutSection(section.id, { is_active: checked });
    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Bölmənin vəziyyəti dəyişmədi." });
      return;
    }
    onChanged();
  };

  // ── Item wiring ─────────────────────────────────────────────────────────────

  const buildItemPayload = (value: AboutItemFormValue) => {
    const payload: Record<string, unknown> = { az: {}, en: {} };
    meta.itemFields.forEach((spec) => {
      // Uploads land through their own endpoint once the row exists.
      if (spec.kind === "image" || spec.kind === "file") return;

      if (spec.scope === "row") {
        payload[spec.key] = value.row[spec.key] ?? "";
        return;
      }
      const az = payload.az as Record<string, unknown>;
      const en = payload.en as Record<string, unknown>;
      if (spec.kind === "lines") {
        az[spec.key] = textToLines(value.az[spec.key] ?? "");
        en[spec.key] = textToLines(value.en[spec.key] ?? "");
      } else {
        az[spec.key] = value.az[spec.key] ?? "";
        en[spec.key] = value.en[spec.key] ?? "";
      }
    });
    return payload;
  };

  /** Returns the first failure, or null when every attachment landed. */
  const uploadItemFiles = async (
    itemId: number,
    value: AboutItemFormValue
  ): Promise<string | null> => {
    for (const [key, file] of Object.entries(value.files)) {
      if (!file) continue;

      let result: MutateResult;
      if (key === "row:image_url") {
        result = await uploadAboutItemImage(itemId, file);
      } else if (key.startsWith("tr:")) {
        result = await uploadAboutItemFile(itemId, file, key.split(":")[2] as Lang);
      } else {
        result = await uploadAboutItemFile(itemId, file);
      }

      if (result !== "SUCCESS") return file.name;
    }
    return null;
  };

  const warnUpload = (failed: string | null) => {
    if (failed) {
      Swal.fire({
        icon: "warning",
        title: "Məlumat saxlanıldı, lakin fayl yüklənmədi",
        text: failed,
      });
    }
  };

  const handleCreateItem = async (value: AboutItemFormValue): Promise<CreateResult> => {
    const result = await createAboutItem(section.id, buildItemPayload(value));
    if (result.status !== "SUCCESS") return result;
    warnUpload(await uploadItemFiles(result.id, value));
    return result;
  };

  const handleUpdateItem = async (
    id: number,
    value: AboutItemFormValue
  ): Promise<MutateResult> => {
    const result = await updateAboutItem(id, buildItemPayload(value));
    if (result !== "SUCCESS") return result;
    warnUpload(await uploadItemFiles(id, value));
    return result;
  };

  const rowCount = meta.usesPeople ? section.people.length : section.items.length;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-800 dark:text-gray-100">
            {section.az?.title || section.en?.title || section.section_key}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {meta.label} · {section.section_key}
            {meta.itemless ? "" : ` · ${rowCount} qeyd`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Checkbox
            label="Aktiv"
            checked={section.is_active}
            onChange={handleToggleActive}
          />
          <Button size="sm" variant="outline" onClick={() => setExpanded((open) => !open)}>
            {expanded ? "Bağla" : "Aç"}
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="space-y-6 p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400">{meta.description}</p>

          {rowFields.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {rowFields.map((spec) => (
                <AboutField
                  key={spec.key}
                  kind={spec.kind}
                  label={spec.label}
                  hint={spec.hint}
                  placeholder={spec.placeholder}
                  value={form.row[spec.key] ?? ""}
                  onChange={(next) =>
                    setForm((prev) => ({ ...prev, row: { ...prev.row, [spec.key]: next } }))
                  }
                  remountKey={formKey}
                />
              ))}
            </div>
          ) : null}

          {trFields.length > 0 ? (
            <LanguageTabs>
              {(lang) => (
                <div className="space-y-4">
                  {trFields.map((spec) => (
                    <AboutField
                      key={`${spec.key}-${lang}`}
                      kind={spec.kind}
                      label={spec.label}
                      hint={spec.hint}
                      placeholder={spec.placeholder}
                      value={form[lang][spec.key] ?? ""}
                      onChange={(next) =>
                        setForm((prev) => ({
                          ...prev,
                          [lang]: { ...prev[lang], [spec.key]: next },
                        }))
                      }
                      remountKey={`${formKey}-${lang}`}
                    />
                  ))}
                </div>
              )}
            </LanguageTabs>
          ) : null}

          <div className="flex justify-end">
            <Button
              onClick={handleSaveSection}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              Bölməni yadda saxla
            </Button>
          </div>

          {meta.usesPeople ? (
            <AboutPeopleCards
              pageKey={pageKey}
              sectionId={section.id}
              people={section.people}
              onChanged={onChanged}
            />
          ) : null}

          {section.section_type === "table" ? (
            <AboutTableEditor section={section} onChanged={onChanged} />
          ) : null}

          {section.section_type === "gallery" ? (
            <AboutGalleryEditor section={section} onChanged={onChanged} />
          ) : null}

          {section.section_type === "documents" ? (
            <AboutDocumentsEditor section={section} onChanged={onChanged} />
          ) : null}

          {/*
            Everything else is a short list of small rows, which the generic
            row editor handles well; only the blocks above are big enough to
            justify a purpose-built screen.
          */}
          {!meta.usesPeople && !meta.itemless && !HAS_CUSTOM_EDITOR.has(section.section_type) ? (
            <EntityManager<AboutItem, AboutItemFormValue>
              title={meta.itemLabel}
              description="Sıralamaq üçün sətirləri sürükləyin."
              items={section.items}
              getId={(item) => item.id}
              getPrimary={itemPrimary}
              getSecondary={itemSecondary}
              getThumb={(item) => item.image_url ?? undefined}
              showThumb={meta.itemFields.some((spec) => spec.kind === "image")}
              toFormValue={(item) => itemToFormValue(item, meta)}
              emptyValue={emptyItemValue}
              renderForm={(value, onChange, helpers) => (
                <AboutItemForm
                  meta={meta}
                  value={value}
                  onChange={onChange}
                  remountKey={helpers.editorKey}
                />
              )}
              onCreate={handleCreateItem}
              onUpdate={handleUpdateItem}
              onDelete={deleteAboutItem}
              onReorder={(ids) => reorderAboutItems(section.id, ids)}
              onChanged={onChanged}
              addLabel={`+ ${meta.itemLabel} əlavə et`}
              emptyText="Hələ heç bir qeyd yoxdur."
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
