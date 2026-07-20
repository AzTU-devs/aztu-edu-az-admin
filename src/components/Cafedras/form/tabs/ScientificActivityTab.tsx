import { ReactNode, useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import TextArea from "../../../form/input/TextArea";
import Button from "../../../ui/button/Button";
import EntityManager from "../../../common/subentity/EntityManager";
import ImageField from "../fields/ImageField";
import LangPair from "../fields/LangPair";
import RichTextField from "../fields/RichTextField";
import { getImageUrl } from "../../../../util/imageUrl";
import {
  IntroKey,
  PartnerRowValue,
  ProjectRowValue,
  PublicationIndex,
  PublicationQuartile,
  PublicationRowValue,
  RichTextRowValue,
  ScientificIntrosValue,
} from "../../../../types/scientificActivity";
import {
  ScientificActivityBilingual,
  createPartnerCompany,
  createProject,
  createPublication,
  createResearchArea,
  deletePartnerCompany,
  deleteProject,
  deletePublication,
  deleteResearchArea,
  emptyScientificIntros,
  getScientificActivityBilingual,
  reorderPublications,
  updatePartnerCompany,
  updateProject,
  updatePublication,
  updateResearchArea,
  updateScientificIntros,
  uploadPartnerCompanyLogo,
} from "../../../../services/cafedra/scientificActivityService";
import {
  emptyText,
  fieldLabel,
  sectionCard,
  sectionDesc,
  sectionHeaderBetween,
  sectionTitle,
  selectClass,
} from "../formStyles";

const INTRO_FIELDS: { key: IntroKey; label: string }[] = [
  { key: "research_areas_intro", label: "Elmi-tədqiqat istiqamətləri" },
  { key: "projects_grants_intro", label: "Layihələr və qrantlar" },
  { key: "publications_intro", label: "Elmi nəşrlər" },
  { key: "industry_cooperation_intro", label: "Sənaye ilə əməkdaşlıq" },
  { key: "international_cooperation_intro", label: "Beynəlxalq əməkdaşlıq" },
];

const INDEX_OPTIONS: PublicationIndex[] = ["Scopus", "Web of Science", "Scopus / Web of Science"];
const QUARTILE_OPTIONS: PublicationQuartile[] = ["Q1", "Q2", "Q3", "Q4"];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR + 1 - 2015 + 1 }, (_, i) => CURRENT_YEAR + 1 - i);

const uid = () => crypto.randomUUID();

/**
 * Copying a URL that was displayed wrapped across lines carries the wrap points
 * in as whitespace, which silently saves a dead link. No valid URL contains any.
 */
const cleanUrl = (value: string) => value.replace(/\s+/g, "");

// ─── Collapsible panel ───────────────────────────────────────────────────────

function Panel({
  title,
  description,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={sectionCard}>
      <button type="button" onClick={() => setOpen((o) => !o)} className={`${sectionHeaderBetween} w-full text-left`}>
        <div className="flex items-center gap-3">
          <svg
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <div>
            <p className={sectionTitle}>{title}</p>
            {description ? <p className={sectionDesc}>{description}</p> : null}
          </div>
        </div>
        {typeof count === "number" ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {count}
          </span>
        ) : null}
      </button>
      {open ? <div className="p-5">{children}</div> : null}
    </div>
  );
}

// ─── Intros ──────────────────────────────────────────────────────────────────

function IntrosPanel({
  cafedraCode,
  intros,
  dataKey,
  onSaved,
}: {
  cafedraCode: string;
  intros: ScientificIntrosValue;
  dataKey: number;
  onSaved: () => void;
}) {
  const [value, setValue] = useState<ScientificIntrosValue>(intros);
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(intros), [intros]);

  const set = (lang: "az" | "en", key: IntroKey, html: string) =>
    setValue((prev) => ({ ...prev, [lang]: { ...prev[lang], [key]: html } }));

  const save = async () => {
    setSaving(true);
    const res = await updateScientificIntros(cafedraCode, { az: value.az, en: value.en });
    setSaving(false);
    if (res === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurlu", showConfirmButton: false, timer: 1400 });
      onSaved();
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Giriş mətnləri yadda saxlanmadı." });
    }
  };

  return (
    <div className="space-y-6">
      {INTRO_FIELDS.map((field) => (
        <div key={field.key} className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{field.label}</p>
          <LangPair
            az={
              <RichTextField
                value={value.az[field.key] ?? ""}
                remountKey={`${field.key}-az-${dataKey}`}
                onChange={(html) => set("az", field.key, html)}
              />
            }
            en={
              <RichTextField
                value={value.en[field.key] ?? ""}
                remountKey={`${field.key}-en-${dataKey}`}
                onChange={(html) => set("en", field.key, html)}
              />
            }
          />
        </div>
      ))}
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}>
          Yadda saxla
        </Button>
      </div>
    </div>
  );
}

// ─── Publications ────────────────────────────────────────────────────────────

const emptyPublication = (year: number | ""): PublicationRowValue => ({
  uid: uid(),
  index: "Scopus",
  quartile: "",
  year,
  date: "",
  url: "",
  az: { title: "", authors: "", journal: "", country: "" },
  en: { title: "", authors: "", journal: "", country: "" },
});

function PublicationForm({
  value,
  onChange,
  editorKey,
  no,
}: {
  value: PublicationRowValue;
  onChange: (next: PublicationRowValue) => void;
  editorKey: number;
  no: string;
}) {
  const setTr = (lang: "az" | "en", field: "title" | "authors" | "journal" | "country", v: string) =>
    onChange({ ...value, [lang]: { ...value[lang], [field]: v } });

  return (
    <div className="space-y-5">
      <div className="w-32">
        <Label className={fieldLabel}>№</Label>
        <Input value={no} disabled readOnly />
      </div>

      <LangPair
        az={
          <>
            <div>
              <Label className={fieldLabel}>Başlıq</Label>
              <TextArea rows={2} value={value.az.title} placeholder="Məqalənin adı" onChange={(v) => setTr("az", "title", v)} />
            </div>
            <div>
              <Label className={fieldLabel}>Müəlliflər</Label>
              <TextArea rows={2} value={value.az.authors} placeholder="Məmmədov A., Əliyev B." onChange={(v) => setTr("az", "authors", v)} />
            </div>
            <div>
              <Label className={fieldLabel}>Jurnal</Label>
              <Input value={value.az.journal} placeholder="Jurnalın adı" onChange={(e) => setTr("az", "journal", e.target.value)} />
            </div>
            <div>
              <Label className={fieldLabel}>Ölkə</Label>
              <Input value={value.az.country} placeholder="Kanada" onChange={(e) => setTr("az", "country", e.target.value)} />
            </div>
          </>
        }
        en={
          <>
            <div>
              <Label className={fieldLabel}>Title</Label>
              <TextArea rows={2} value={value.en.title} placeholder="Article title" onChange={(v) => setTr("en", "title", v)} />
            </div>
            <div>
              <Label className={fieldLabel}>Authors</Label>
              <TextArea rows={2} value={value.en.authors} placeholder="Mammadov A., Aliyev B." onChange={(v) => setTr("en", "authors", v)} />
            </div>
            <div>
              <Label className={fieldLabel}>Journal</Label>
              <Input value={value.en.journal} placeholder="Journal name" onChange={(e) => setTr("en", "journal", e.target.value)} />
            </div>
            <div>
              <Label className={fieldLabel}>Country</Label>
              <Input value={value.en.country} placeholder="Canada" onChange={(e) => setTr("en", "country", e.target.value)} />
            </div>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label className={fieldLabel}>İndeks</Label>
          <select className={selectClass} value={value.index} onChange={(e) => onChange({ ...value, index: e.target.value as PublicationIndex })}>
            {INDEX_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className={fieldLabel}>Kvartil</Label>
          <select className={selectClass} value={value.quartile} onChange={(e) => onChange({ ...value, quartile: e.target.value as PublicationQuartile | "" })}>
            <option value="">—</option>
            {QUARTILE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className={fieldLabel}>İl</Label>
          {/* Hand-rolled: the `Select` primitive keeps its own state and renders its
              placeholder as a *disabled* option, so the blank (= null) year could
              never be re-selected once a year was picked. */}
          <select
            key={`year-${editorKey}`}
            className={selectClass}
            value={value.year === "" ? "" : String(value.year)}
            onChange={(e) => onChange({ ...value, year: e.target.value === "" ? "" : Number(e.target.value) })}
          >
            <option value="">—</option>
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className={fieldLabel}>Tarix</Label>
          <Input value={value.date} placeholder="07.05.2026 və ya İyun 2025" onChange={(e) => onChange({ ...value, date: e.target.value })} />
        </div>
      </div>

      <div>
        <Label className={fieldLabel}>Keçid (URL)</Label>
        <Input value={value.url} placeholder="https://doi.org/…" onChange={(e) => onChange({ ...value, url: e.target.value })} />
      </div>
    </div>
  );
}

function PublicationsPanel({
  cafedraCode,
  publications,
  onChanged,
}: {
  cafedraCode: string;
  publications: PublicationRowValue[];
  onChanged: () => void;
}) {
  const [openYears, setOpenYears] = useState<Record<string, boolean>>({});

  const groups = new Map<number | "", PublicationRowValue[]>();
  for (const row of publications) {
    const key = row.year === "" || row.year === null ? "" : row.year;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  if (!groups.has(CURRENT_YEAR)) groups.set(CURRENT_YEAR, []);

  const years = [...groups.keys()].sort((a, b) => {
    if (a === "") return 1;
    if (b === "") return -1;
    return b - a;
  });

  const toPayload = (value: PublicationRowValue) => ({
    index: value.index,
    quartile: value.quartile,
    year: value.year,
    date: value.date,
    url: cleanUrl(value.url),
    az: value.az,
    en: value.en,
  });

  return (
    <div className="space-y-4">
      {years.map((year) => {
        const rows = groups.get(year)!;
        const label = year === "" ? "Digər" : String(year);
        const isOpen = openYears[label] ?? year === CURRENT_YEAR;
        return (
          <div key={label} className="rounded-2xl border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setOpenYears((prev) => ({ ...prev, [label]: !isOpen }))}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="flex items-center gap-3">
                <svg
                  className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-base font-semibold text-gray-800 dark:text-gray-100">{label}</span>
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {rows.length} nəşr
              </span>
            </button>
            {isOpen ? (
              <div className="border-t border-gray-100 px-2 pb-2 dark:border-gray-800">
                <EntityManager<PublicationRowValue, PublicationRowValue>
                  title={`Nəşrlər — ${label}`}
                  items={rows}
                  getId={(item) => item.id as number}
                  getPrimary={(item) => item.az.title || item.en.title || "Adsız nəşr"}
                  getSecondary={(item) =>
                    [item.az.journal, item.index, item.quartile, item.date].filter(Boolean).join(" · ")
                  }
                  toFormValue={(item) => ({ ...item })}
                  emptyValue={() => emptyPublication(year === "" ? "" : year)}
                  validate={(value) => (value.az.title.trim() === "" ? "AZ başlıq tələb olunur." : null)}
                  renderForm={(value, onChange, helpers) => (
                    <PublicationForm
                      value={value}
                      onChange={onChange}
                      editorKey={helpers.editorKey}
                      no={
                        value.id
                          ? String(rows.findIndex((r) => r.id === value.id) + 1)
                          : String(rows.length + 1)
                      }
                    />
                  )}
                  onCreate={(value) => createPublication(cafedraCode, toPayload(value))}
                  onUpdate={(id, value) => updatePublication(id, toPayload(value))}
                  onDelete={(id) => deletePublication(id)}
                  onReorder={(ids) => reorderPublications(cafedraCode, ids)}
                  onChanged={onChanged}
                  emptyText="Bu il üçün nəşr yoxdur."
                  modalClassName="max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto p-6 sm:p-8"
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

interface ScientificActivityTabProps {
  cafedraCode: string;
  onGoToLaboratories: () => void;
}

export default function ScientificActivityTab({ cafedraCode, onGoToLaboratories }: ScientificActivityTabProps) {
  const [data, setData] = useState<ScientificActivityBilingual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataKey, setDataKey] = useState(0);

  const load = useCallback(async () => {
    const res = await getScientificActivityBilingual(cafedraCode);
    if (res === "NOT FOUND") {
      setError("Elmi fəaliyyət məlumatları tapılmadı.");
      setData(null);
    } else if (res === "ERROR") {
      setError("Elmi fəaliyyət yüklənərkən xəta baş verdi.");
      setData(null);
    } else {
      setError(null);
      setData(res);
      setDataKey((k) => k + 1);
    }
  }, [cafedraCode]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="py-10 text-center text-red-500">{error}</div>;
  }

  const intros = data?.intros ?? emptyScientificIntros();

  return (
    <div className="space-y-5">
      <Panel
        title="Giriş mətnləri"
        description="Hər bölmənin başındakı izahat mətni. Bu panel ayrıca yadda saxlanılır."
        defaultOpen
      >
        <IntrosPanel cafedraCode={cafedraCode} intros={intros} dataKey={dataKey} onSaved={load} />
      </Panel>

      <Panel title="Elmi-tədqiqat istiqamətləri" count={data?.research_areas.length ?? 0}>
        <EntityManager<RichTextRowValue, RichTextRowValue>
          title="Elmi-tədqiqat istiqaməti"
          description="Hər istiqamətin başlığı və ətraflı izahı."
          items={data?.research_areas ?? []}
          getId={(item) => item.id as number}
          getPrimary={(item) => item.az.title || item.en.title || "Adsız istiqamət"}
          toFormValue={(item) => ({ ...item })}
          emptyValue={() => ({ uid: uid(), az: { title: "", html_content: "" }, en: { title: "", html_content: "" } })}
          validate={(value) => (value.az.title.trim() === "" ? "AZ başlıq tələb olunur." : null)}
          renderForm={(value, onChange, helpers) => (
            <LangPair
              az={
                <>
                  <div>
                    <Label className={fieldLabel}>Başlıq</Label>
                    <Input value={value.az.title} placeholder="Başlıq" onChange={(e) => onChange({ ...value, az: { ...value.az, title: e.target.value } })} />
                  </div>
                  <RichTextField
                    label="İzahat"
                    value={value.az.html_content}
                    remountKey={`az-${helpers.editorKey}`}
                    onChange={(html) => onChange({ ...value, az: { ...value.az, html_content: html } })}
                  />
                </>
              }
              en={
                <>
                  <div>
                    <Label className={fieldLabel}>Title</Label>
                    <Input value={value.en.title} placeholder="Title" onChange={(e) => onChange({ ...value, en: { ...value.en, title: e.target.value } })} />
                  </div>
                  <RichTextField
                    label="Description"
                    value={value.en.html_content}
                    remountKey={`en-${helpers.editorKey}`}
                    onChange={(html) => onChange({ ...value, en: { ...value.en, html_content: html } })}
                  />
                </>
              }
            />
          )}
          onCreate={(value) => createResearchArea(cafedraCode, { az: value.az, en: value.en })}
          onUpdate={(id, value) => updateResearchArea(id, { az: value.az, en: value.en })}
          onDelete={(id) => deleteResearchArea(id)}
          onChanged={load}
          modalClassName="max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto p-6 sm:p-8"
        />
      </Panel>

      <Panel title="Layihələr və qrantlar" count={data?.projects_grants.length ?? 0}>
        <EntityManager<ProjectRowValue, ProjectRowValue>
          title="Layihə"
          description="Layihə və qrantlar."
          items={data?.projects_grants ?? []}
          getId={(item) => item.id as number}
          getPrimary={(item) => item.az.title || item.en.title || "Adsız layihə"}
          getSecondary={(item) => item.url}
          toFormValue={(item) => ({ ...item })}
          emptyValue={() => ({ uid: uid(), url: "", az: { title: "", description: "" }, en: { title: "", description: "" } })}
          validate={(value) => (value.az.title.trim() === "" ? "AZ başlıq tələb olunur." : null)}
          renderForm={(value, onChange) => (
            <div className="space-y-5">
              <LangPair
                az={
                  <>
                    <div>
                      <Label className={fieldLabel}>Başlıq</Label>
                      <Input value={value.az.title} placeholder="Başlıq" onChange={(e) => onChange({ ...value, az: { ...value.az, title: e.target.value } })} />
                    </div>
                    <div>
                      <Label className={fieldLabel}>İzahat</Label>
                      <TextArea rows={4} value={value.az.description} placeholder="Açıqlama" onChange={(v) => onChange({ ...value, az: { ...value.az, description: v } })} />
                    </div>
                  </>
                }
                en={
                  <>
                    <div>
                      <Label className={fieldLabel}>Title</Label>
                      <Input value={value.en.title} placeholder="Title" onChange={(e) => onChange({ ...value, en: { ...value.en, title: e.target.value } })} />
                    </div>
                    <div>
                      <Label className={fieldLabel}>Description</Label>
                      <TextArea rows={4} value={value.en.description} placeholder="Description" onChange={(v) => onChange({ ...value, en: { ...value.en, description: v } })} />
                    </div>
                  </>
                }
              />
              <div>
                <Label className={fieldLabel}>Keçid (URL)</Label>
                <Input value={value.url} placeholder="https://…" onChange={(e) => onChange({ ...value, url: e.target.value })} />
              </div>
            </div>
          )}
          onCreate={(value) => createProject(cafedraCode, { url: cleanUrl(value.url), az: value.az, en: value.en })}
          onUpdate={(id, value) => updateProject(id, { url: cleanUrl(value.url), az: value.az, en: value.en })}
          onDelete={(id) => deleteProject(id)}
          onChanged={load}
        />
      </Panel>

      <Panel title="Laboratoriyalar" count={data?.laboratories.length ?? 0} description="Yalnız oxunur.">
        <div className="space-y-3">
          <p className={sectionDesc}>Laboratoriyalar “Laboratoriyalar” tabından idarə olunur.</p>
          {(data?.laboratories.length ?? 0) === 0 && <p className={emptyText}>Laboratoriya əlavə edilməyib.</p>}
          {(data?.laboratories ?? []).map((lab) => (
            <div key={lab.id} className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
              {lab.image_url ? (
                <img src={getImageUrl(lab.image_url)} alt="" className="h-11 w-11 rounded-lg border border-gray-200 object-cover dark:border-gray-700" />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-800">—</div>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-700 dark:text-gray-200">{lab.title || "Adsız laboratoriya"}</p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {[lab.room_number, lab.authorized_person].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={onGoToLaboratories}>
            Laboratoriyalar tabına keç
          </Button>
        </div>
      </Panel>

      <Panel title="Elmi nəşrlər" count={data?.publications.length ?? 0}>
        <PublicationsPanel cafedraCode={cafedraCode} publications={data?.publications ?? []} onChanged={load} />
      </Panel>

      <Panel title="Sənaye ilə əməkdaşlıq" count={data?.industry_cooperation.length ?? 0}>
        <EntityManager<PartnerRowValue, PartnerRowValue>
          title="Tərəfdaş şirkət"
          description="Logo, sayt və qısa təsvir."
          items={data?.industry_cooperation ?? []}
          getId={(item) => item.id as number}
          getPrimary={(item) => item.az.title || item.en.title || "Adsız şirkət"}
          getSecondary={(item) => item.website_url}
          getThumb={(item) => item.logo_url ?? undefined}
          showThumb
          toFormValue={(item) => ({ ...item })}
          emptyValue={() => ({ uid: uid(), website_url: "", logo_url: null, az: { title: "", description: "" }, en: { title: "", description: "" } })}
          validate={(value) => (value.az.title.trim() === "" ? "AZ başlıq tələb olunur." : null)}
          renderForm={(value, onChange, helpers) => (
            <div className="space-y-5">
              <ImageField
                label="Logo"
                imageUrl={value.logo_url}
                files={helpers.imageFile ? [helpers.imageFile] : []}
                onSelect={(files) => helpers.setImageFile(files[0] ?? null)}
                onRemovePending={() => helpers.setImageFile(null)}
              />
              <LangPair
                az={
                  <>
                    <div>
                      <Label className={fieldLabel}>Şirkət adı</Label>
                      <Input value={value.az.title} placeholder="Şirkət adı" onChange={(e) => onChange({ ...value, az: { ...value.az, title: e.target.value } })} />
                    </div>
                    <div>
                      <Label className={fieldLabel}>İzahat</Label>
                      <TextArea rows={4} value={value.az.description} placeholder="Əməkdaşlıq haqqında" onChange={(v) => onChange({ ...value, az: { ...value.az, description: v } })} />
                    </div>
                  </>
                }
                en={
                  <>
                    <div>
                      <Label className={fieldLabel}>Company name</Label>
                      <Input value={value.en.title} placeholder="Company name" onChange={(e) => onChange({ ...value, en: { ...value.en, title: e.target.value } })} />
                    </div>
                    <div>
                      <Label className={fieldLabel}>Description</Label>
                      <TextArea rows={4} value={value.en.description} placeholder="About the cooperation" onChange={(v) => onChange({ ...value, en: { ...value.en, description: v } })} />
                    </div>
                  </>
                }
              />
              <div>
                <Label className={fieldLabel}>Sayt (URL)</Label>
                <Input value={value.website_url} placeholder="https://…" onChange={(e) => onChange({ ...value, website_url: e.target.value })} />
              </div>
            </div>
          )}
          onCreate={(value) => createPartnerCompany(cafedraCode, { website_url: cleanUrl(value.website_url), az: value.az, en: value.en })}
          onUpdate={(id, value) => updatePartnerCompany(id, { website_url: cleanUrl(value.website_url), az: value.az, en: value.en })}
          onDelete={(id) => deletePartnerCompany(id)}
          onUploadImage={(id, file) => uploadPartnerCompanyLogo(id, file)}
          onChanged={load}
        />
      </Panel>

      <Panel title="Beynəlxalq əməkdaşlıq" description="Yalnız giriş mətni.">
        <p className={emptyText}>
          Bu bölmənin təkrarlanan maddələri yoxdur — mətni “Giriş mətnləri” panelindəki
          “Beynəlxalq əməkdaşlıq” sahəsindən redaktə edin.
        </p>
      </Panel>
    </div>
  );
}
