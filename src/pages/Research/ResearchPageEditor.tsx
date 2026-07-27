import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import Swal from "sweetalert2";

import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import RichTextField from "../../components/Cafedras/form/fields/RichTextField";
import {
  getResearchPage,
  publishResearchPage,
  updateResearchPage,
  uploadResearchDocument,
  type ResearchPageDetail,
} from "../../services/research/researchPageService";

/**
 * Edits one screen of the Tədqiqat section.
 *
 * The whole page is one form with one Save button, matching how it saves on the
 * server. `template` says which shape the page is, exactly as the About editor
 * does — the sections below it are the union of every shape, each shown only
 * for the pages that have it.
 *
 * Everything the website draws by itself — the hero video, the breadcrumb, the
 * eyebrow, the "Strateji baxış" heading, the table headers, the card icons,
 * numbering and gradients, the counter strip, the document-viewer modal and the
 * SEO tags — is deliberately absent here.
 */

type Lang = "az" | "en";

interface Bilingual {
  az: string;
  en: string;
}

interface PriorityForm {
  title: Bilingual;
  description: Bilingual;
}

interface PatentForm {
  patent_number: string;
  document_url: string;
  name: Bilingual;
  authors: Bilingual;
}

interface PatentYearForm {
  year: string;
  patents: PatentForm[];
}

interface LinkForm {
  url: string;
  label: Bilingual;
}

interface PageForm {
  title: Bilingual;
  description: Bilingual;
  body_html: Bilingual;
  links_title: Bilingual;
  priorities: PriorityForm[];
  patent_years: PatentYearForm[];
  links: LinkForm[];
}

const str = (value: string | null | undefined) => value ?? "";

const toForm = (page: ResearchPageDetail): PageForm => ({
  title: { az: str(page.az?.title), en: str(page.en?.title) },
  description: { az: str(page.az?.description), en: str(page.en?.description) },
  body_html: { az: str(page.az?.body_html), en: str(page.en?.body_html) },
  links_title: { az: str(page.az?.links_title), en: str(page.en?.links_title) },
  priorities: page.priorities.map((priority) => ({
    title: { az: str(priority.az?.title), en: str(priority.en?.title) },
    description: {
      az: str(priority.az?.description),
      en: str(priority.en?.description),
    },
  })),
  patent_years: (page.patent_years ?? []).map((yearRow) => ({
    year: str(yearRow.year),
    patents: (yearRow.patents ?? []).map((patent) => ({
      patent_number: str(patent.patent_number),
      document_url: str(patent.document_url),
      name: { az: str(patent.az?.name), en: str(patent.en?.name) },
      authors: { az: str(patent.az?.authors), en: str(patent.en?.authors) },
    })),
  })),
  links: page.links.map((link) => ({
    url: str(link.url),
    label: { az: str(link.az?.label), en: str(link.en?.label) },
  })),
});

/** Azerbaijani first — this dashboard is Azerbaijani. */
const LANGS: { code: Lang; label: string }[] = [
  { code: "az", label: "Azərbaycanca" },
  { code: "en", label: "English" },
];

export default function ResearchPageEditor() {
  const { page_key: pageKey = "research-priorities" } = useParams();

  const [page, setPage] = useState<ResearchPageDetail | null>(null);
  const [form, setForm] = useState<PageForm | null>(null);
  const [lang, setLang] = useState<Lang>("az");
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  // "<yearIndex>-<patentIndex>" of the row whose upload is in flight, so only
  // that row's input is disabled rather than the whole table.
  const [uploading, setUploading] = useState<string | null>(null);

  // The research pages are not all the same shape; the page says which form it
  // is, exactly as the About editor does. Declared here rather than beside the
  // render because `handleSave` reads it too.
  const isPatents = page?.template === "patents";
  // `RichTextField` seeds its content once at mount, so every language switch
  // and refetch has to remount it or the editors keep showing the old text.
  const [formKey, setFormKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getResearchPage(pageKey);

    if (result === "ERROR" || result === "NOT FOUND") {
      setMissing(result === "NOT FOUND");
      setPage(null);
      setForm(null);
    } else {
      setMissing(false);
      setPage(result);
      setForm(toForm(result));
      setFormKey((key) => key + 1);
    }
    setLoading(false);
  }, [pageKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const setField = (
    field: "title" | "description" | "body_html" | "links_title",
    value: string
  ) =>
    setForm((prev) =>
      prev ? { ...prev, [field]: { ...prev[field], [lang]: value } } : prev
    );

  const setPriority = (index: number, field: "title" | "description", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            priorities: prev.priorities.map((priority, i) =>
              i === index
                ? { ...priority, [field]: { ...priority[field], [lang]: value } }
                : priority
            ),
          }
        : prev
    );

  const addPriority = () =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            priorities: [
              ...prev.priorities,
              { title: { az: "", en: "" }, description: { az: "", en: "" } },
            ],
          }
        : prev
    );

  const removePriority = (index: number) =>
    setForm((prev) =>
      prev
        ? { ...prev, priorities: prev.priorities.filter((_, i) => i !== index) }
        : prev
    );

  const movePriority = (index: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const target = index + delta;
      if (target < 0 || target >= prev.priorities.length) return prev;
      const priorities = [...prev.priorities];
      [priorities[index], priorities[target]] = [priorities[target], priorities[index]];
      return { ...prev, priorities };
    });

  /** Rewrites one year in place; every patent handler below goes through it. */
  const editYear = (
    yearIndex: number,
    change: (year: PatentYearForm) => PatentYearForm
  ) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            patent_years: prev.patent_years.map((yearRow, i) =>
              i === yearIndex ? change(yearRow) : yearRow
            ),
          }
        : prev
    );

  const setYear = (yearIndex: number, value: string) =>
    editYear(yearIndex, (yearRow) => ({ ...yearRow, year: value }));

  const addYear = () =>
    setForm((prev) =>
      prev
        ? { ...prev, patent_years: [...prev.patent_years, { year: "", patents: [] }] }
        : prev
    );

  const removeYear = (yearIndex: number) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            patent_years: prev.patent_years.filter((_, i) => i !== yearIndex),
          }
        : prev
    );

  /** `patent_number` and `document_url` are language-neutral; the rest are not. */
  const setPatent = (
    yearIndex: number,
    patentIndex: number,
    field: "patent_number" | "document_url" | "name" | "authors",
    value: string
  ) =>
    editYear(yearIndex, (yearRow) => ({
      ...yearRow,
      patents: yearRow.patents.map((patent, i) =>
        i !== patentIndex
          ? patent
          : field === "patent_number" || field === "document_url"
          ? { ...patent, [field]: value }
          : { ...patent, [field]: { ...patent[field], [lang]: value } }
      ),
    }));

  const addPatent = (yearIndex: number) =>
    editYear(yearIndex, (yearRow) => ({
      ...yearRow,
      patents: [
        ...yearRow.patents,
        {
          patent_number: "",
          document_url: "",
          name: { az: "", en: "" },
          authors: { az: "", en: "" },
        },
      ],
    }));

  const removePatent = (yearIndex: number, patentIndex: number) =>
    editYear(yearIndex, (yearRow) => ({
      ...yearRow,
      patents: yearRow.patents.filter((_, i) => i !== patentIndex),
    }));

  const movePatent = (yearIndex: number, patentIndex: number, delta: number) =>
    editYear(yearIndex, (yearRow) => {
      const target = patentIndex + delta;
      if (target < 0 || target >= yearRow.patents.length) return yearRow;
      const patents = [...yearRow.patents];
      [patents[patentIndex], patents[target]] = [patents[target], patents[patentIndex]];
      return { ...yearRow, patents };
    });

  /**
   * Uploads a certificate and drops the returned path into the row. The file is
   * stored immediately but the path is only persisted by the next Save, which
   * is why the upload cannot write to the patent row itself — that row is
   * replaced on every save.
   *
   * The row is addressed by position, and the await in the middle is exactly
   * where a position stops being trustworthy: deleting or moving a row while
   * the request is in flight would land the path on someone else's row. Rather
   * than give every row a client-side id, the buttons that could move it are
   * disabled for the duration — see `uploading` below.
   */
  const handlePatentUpload = async (
    yearIndex: number,
    patentIndex: number,
    file: File | null
  ) => {
    if (!file) return;
    setUploading(`${yearIndex}-${patentIndex}`);
    try {
      const path = await uploadResearchDocument(pageKey, file);
      if (!path) {
        Swal.fire({ icon: "error", title: "Xəta", text: "Sənəd yüklənmədi." });
        return;
      }
      setPatent(yearIndex, patentIndex, "document_url", path);
      Swal.fire({
        icon: "success",
        title: "Sənəd yükləndi",
        text: "Yadda saxladıqda qeyd olunacaq.",
        showConfirmButton: false,
        timer: 1600,
      });
    } finally {
      setUploading(null);
    }
  };

  const setLink = (index: number, field: "url" | "label", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            links: prev.links.map((link, i) =>
              i !== index
                ? link
                : field === "url"
                ? { ...link, url: value }
                : { ...link, label: { ...link.label, [lang]: value } }
            ),
          }
        : prev
    );

  const addLink = () =>
    setForm((prev) =>
      prev ? { ...prev, links: [...prev.links, { url: "", label: { az: "", en: "" } }] } : prev
    );

  const removeLink = (index: number) =>
    setForm((prev) =>
      prev ? { ...prev, links: prev.links.filter((_, i) => i !== index) } : prev
    );

  const moveLink = (index: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const target = index + delta;
      if (target < 0 || target >= prev.links.length) return prev;
      const links = [...prev.links];
      [links[index], links[target]] = [links[target], links[index]];
      return { ...prev, links };
    });

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const result = await updateResearchPage(pageKey, {
        az: {
          title: form.title.az,
          description: form.description.az,
          body_html: form.body_html.az,
          links_title: form.links_title.az,
        },
        en: {
          title: form.title.en,
          description: form.description.en,
          body_html: form.body_html.en,
          links_title: form.links_title.en,
        },
        // Each template sends the collections it owns and omits the rest. An
        // omitted key leaves those rows untouched on the server, so the patents
        // page can never blank out a priorities page's cards, or the reverse.
        ...(isPatents
          ? {
              // A patent row with no number and no name in either language is
              // an empty row the editor added and never filled in; a year left
              // with no label and no rows likewise. Neither reaches the site.
              patent_years: form.patent_years
                .map((yearRow) => ({
                  year: yearRow.year,
                  // Anything the editor actually put in the row keeps it: a
                  // certificate they uploaded or a link they pasted counts just
                  // as much as a number or a name. Dropping a row that holds an
                  // uploaded file would strand that file on disk and lose work
                  // the editor can see on screen.
                  patents: yearRow.patents.filter(
                    (patent) =>
                      patent.patent_number.trim() ||
                      patent.document_url.trim() ||
                      patent.name.az.trim() ||
                      patent.name.en.trim() ||
                      patent.authors.az.trim() ||
                      patent.authors.en.trim()
                  ),
                }))
                .filter((yearRow) => yearRow.year.trim() || yearRow.patents.length > 0)
                .map((yearRow) => ({
                  year: yearRow.year,
                  patents: yearRow.patents.map((patent) => ({
                    patent_number: patent.patent_number,
                    document_url: patent.document_url,
                    az: { name: patent.name.az, authors: patent.authors.az },
                    en: { name: patent.name.en, authors: patent.authors.en },
                  })),
                })),
            }
          : {
              // A card with no heading in either language was never filled in.
              priorities: form.priorities
                .filter(
                  (priority) => priority.title.az.trim() || priority.title.en.trim()
                )
                .map((priority) => ({
                  az: {
                    title: priority.title.az,
                    description: priority.description.az,
                  },
                  en: {
                    title: priority.title.en,
                    description: priority.description.en,
                  },
                })),
            }),
        // A button with neither a label nor a URL is an empty row the editor
        // added and never filled in; it should not reach the website.
        links: form.links
          .filter((link) => link.url.trim() || link.label.az.trim() || link.label.en.trim())
          .map((link) => ({
            url: link.url,
            az: { label: link.label.az },
            en: { label: link.label.en },
          })),
      });

      if (result !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Dəyişikliklər saxlanmadı." });
        return;
      }
      Swal.fire({
        icon: "success",
        title: "Yadda saxlanıldı",
        showConfirmButton: false,
        timer: 1200,
      });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!page) return;
    const next = !page.is_active;

    if (!next) {
      const confirm = await Swal.fire({
        title: "Səhifəni dərcdən çıxarmaq?",
        text: "Səhifə saytda görünməyəcək.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Bəli",
        cancelButtonText: "İmtina",
        reverseButtons: true,
      });
      if (!confirm.isConfirmed) return;
    }

    const result = await publishResearchPage(pageKey, next);
    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Əməliyyat alınmadı." });
      return;
    }
    await load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (!page || !form) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="font-medium text-gray-700 dark:text-gray-200">
          {missing ? "Səhifə tapılmadı." : "Səhifə yüklənə bilmədi."}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {missing ? (
            <>
              Verilənlər bazasında{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">
                migrations_research_priorities.sql
              </code>{" "}
              və{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">
                migrations_research_patents.sql
              </code>{" "}
              fayllarını bu ardıcıllıqla icra edin.
            </>
          ) : (
            "API cavab vermir. Backend-i yoxlayıb yenidən cəhd edin."
          )}
        </p>
        <div className="mt-4 flex justify-center">
          <Button size="sm" variant="outline" onClick={() => void load()}>
            Yenidən cəhd et
          </Button>
        </div>
      </div>
    );
  }

  const title = form.title.az || form.title.en || page.page_key;

  return (
    <>
      <PageMeta title={`${title} | AzTU Admin`} description="Tədqiqat səhifəsi" />
      <PageBreadcrumb pageTitle={title} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              page.is_active
                ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {page.is_active ? "Dərc olunub" : "Qaralama"}
          </span>
          <span className="text-xs text-gray-400">
            /{lang === "az" ? page.slug_az : page.slug_en}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={handlePublish}>
            {page.is_active ? "Dərcdən çıxar" : "Dərc et"}
          </Button>
          <Button
            onClick={handleSave}
            // Also blocked mid-upload: saving reloads the form from the server,
            // which re-sorts the years, and the in-flight upload is still
            // holding the positions the old list had.
            disabled={saving || uploading !== null}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Yadda saxla
          </Button>
        </div>
      </div>

      {/* One language at a time: the fields are long, and a side-by-side
          layout would halve the width of every editor. */}
      <div className="mb-6 inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            onClick={() => {
              setLang(code);
              setFormKey((key) => key + 1);
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              lang === code
                ? "bg-brand-500 text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <ComponentCard
          title="Başlıq bölməsi"
          desc="Səhifənin yuxarısındakı başlıq. Naviqasiya zolağı və üst yazı saytda sabitdir."
        >
          <div className="space-y-4">
            <div>
              <Label>Başlıq</Label>
              <Input
                value={form.title[lang]}
                onChange={(event) => setField("title", event.target.value)}
                placeholder="Prioritet Tədqiqat Sahələri"
              />
            </div>
            <RichTextField
              label="Qısa təsvir"
              value={form.description[lang]}
              onChange={(next) => setField("description", next)}
              remountKey={`${formKey}-desc-${lang}`}
            />
          </div>
        </ComponentCard>

        <ComponentCard
          title={isPatents ? "Ətraflı təsvir" : "Strateji baxış"}
          desc={
            isPatents
              ? "Cədvəllərin üstündəki giriş mətni."
              : "Başlığın altındakı giriş mətni. Bölmənin adı saytda sabitdir — yalnız mətn buradan idarə olunur."
          }
        >
          <RichTextField
            label="Mətn"
            value={form.body_html[lang]}
            onChange={(next) => setField("body_html", next)}
            remountKey={`${formKey}-body-${lang}`}
          />
        </ComponentCard>

        {isPatents && (
          <ComponentCard
            title="Patent cədvəlləri"
            desc="Hər il üçün ayrıca cədvəl. İllər saytda yenidən köhnəyə doğru sıralanır — burada sıralamaq lazım deyil. Sətir nömrəsi (№) sıraya görə avtomatik verilir."
          >
            <div className="space-y-6">
              {form.patent_years.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ il əlavə edilməyib.
                </p>
              ) : (
                form.patent_years.map((yearRow, yearIndex) => (
                  <div
                    key={yearIndex}
                    className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                      <div className="w-40">
                        <Label>İl</Label>
                        <Input
                          value={yearRow.year}
                          onChange={(event) => setYear(yearIndex, event.target.value)}
                          placeholder="2025"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {yearRow.patents.length} patent
                        </span>
                        <button
                          type="button"
                          onClick={() => removeYear(yearIndex)}
                          disabled={uploading !== null}
                          className="text-xs text-red-500 hover:text-red-600 disabled:opacity-30"
                        >
                          İli sil
                        </button>
                      </div>
                    </div>

                    {yearRow.patents.length === 0 ? (
                      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                        Bu ildə hələ patent yoxdur.
                      </p>
                    ) : (
                      <div className="mb-3 space-y-3">
                        {yearRow.patents.map((patent, patentIndex) => (
                          <div
                            key={patentIndex}
                            className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/30"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-400">
                                № {patentIndex + 1}
                              </span>
                              <div className="flex items-center gap-1">
                                {/* Disabled while any upload is in flight: the
                                    upload targets a row by position, and moving
                                    or deleting one would change what that
                                    position means before the path lands. */}
                                <button
                                  type="button"
                                  onClick={() => movePatent(yearIndex, patentIndex, -1)}
                                  disabled={patentIndex === 0 || uploading !== null}
                                  title="Yuxarı"
                                  className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => movePatent(yearIndex, patentIndex, 1)}
                                  disabled={
                                    patentIndex === yearRow.patents.length - 1 ||
                                    uploading !== null
                                  }
                                  title="Aşağı"
                                  className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removePatent(yearIndex, patentIndex)}
                                  disabled={uploading !== null}
                                  className="ml-2 text-xs text-red-500 hover:text-red-600 disabled:opacity-30"
                                >
                                  Sil
                                </button>
                              </div>
                            </div>

                            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <Label>Patent nömrəsi</Label>
                                <Input
                                  value={patent.patent_number}
                                  onChange={(event) =>
                                    setPatent(
                                      yearIndex,
                                      patentIndex,
                                      "patent_number",
                                      event.target.value
                                    )
                                  }
                                  placeholder="İ 2025 0065"
                                />
                                <p className="mt-1 text-xs text-gray-400">
                                  Hər iki dildə eyni göstərilir.
                                </p>
                              </div>
                              <div>
                                <Label>Adı</Label>
                                <Input
                                  value={patent.name[lang]}
                                  onChange={(event) =>
                                    setPatent(
                                      yearIndex,
                                      patentIndex,
                                      "name",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Müxtəlif yönlü daxili konik səthlərin emalı üçün alət"
                                />
                              </div>
                            </div>

                            <div className="mb-3">
                              <Label>Müəlliflər</Label>
                              <textarea
                                value={patent.authors[lang]}
                                onChange={(event) =>
                                  setPatent(
                                    yearIndex,
                                    patentIndex,
                                    "authors",
                                    event.target.value
                                  )
                                }
                                rows={2}
                                placeholder="Rəsulov Nəriman, Məmmədov Ərəstun, Abbasova İradə"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                              />
                              <p className="mt-1 text-xs text-gray-400">
                                Vergüllə ayrılmış tək sətir — saytda olduğu kimi göstərilir.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <Label>Sənəd (keçid)</Label>
                                <Input
                                  value={patent.document_url}
                                  onChange={(event) =>
                                    setPatent(
                                      yearIndex,
                                      patentIndex,
                                      "document_url",
                                      event.target.value
                                    )
                                  }
                                  placeholder="https://drive.google.com/file/d/…/view"
                                />
                              </div>
                              <div>
                                <Label>və ya fayl yüklə</Label>
                                <input
                                  type="file"
                                  // Every input, not just this row's: `uploading`
                                  // is one slot, so a second concurrent upload
                                  // would clear the first one's guard.
                                  disabled={uploading !== null}
                                  onChange={(event) => {
                                    void handlePatentUpload(
                                      yearIndex,
                                      patentIndex,
                                      event.target.files?.[0] ?? null
                                    );
                                    // Let the same file be picked again after a
                                    // failed upload.
                                    event.target.value = "";
                                  }}
                                  className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:text-brand-600 hover:file:bg-brand-100 disabled:opacity-50 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                                />
                                <p className="mt-1 text-xs text-gray-400">
                                  {uploading === `${yearIndex}-${patentIndex}`
                                    ? "Yüklənir…"
                                    : "Yükləndikdə yandakı keçid avtomatik dolur."}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addPatent(yearIndex)}
                    >
                      + Patent əlavə et
                    </Button>
                  </div>
                ))
              )}

              <Button size="sm" variant="outline" onClick={addYear}>
                + İl əlavə et
              </Button>
            </div>
          </ComponentCard>
        )}

        {!isPatents && (
        <ComponentCard
          title="Prioritet sahələr"
          desc="Kartlar. Sayı məhdud deyil; nömrə və ikon sıraya görə saytda təyin olunur."
        >
          <div className="space-y-4">
            {form.priorities.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hələ prioritet sahə əlavə edilməyib.
              </p>
            ) : (
              <div className="space-y-4">
                {form.priorities.map((priority, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => movePriority(index, -1)}
                          disabled={index === 0}
                          title="Yuxarı"
                          className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => movePriority(index, 1)}
                          disabled={index === form.priorities.length - 1}
                          title="Aşağı"
                          className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removePriority(index)}
                          className="ml-2 text-xs text-red-500 hover:text-red-600"
                        >
                          Sil
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <Label>Başlıq</Label>
                      <Input
                        value={priority.title[lang]}
                        onChange={(event) => setPriority(index, "title", event.target.value)}
                        placeholder="Data Analitikası, Süni İntellekt və Kibertəhlükəsizlik"
                      />
                    </div>

                    <RichTextField
                      label="Təsvir"
                      value={priority.description[lang]}
                      onChange={(next) => setPriority(index, "description", next)}
                      remountKey={`${formKey}-priority-${index}-${lang}`}
                    />
                  </div>
                ))}
              </div>
            )}

            <Button size="sm" variant="outline" onClick={addPriority}>
              + Prioritet sahə əlavə et
            </Button>
          </div>
        </ComponentCard>
        )}

        <ComponentCard
          title="Bölmədə daha çox"
          desc="Səhifənin altındakı düymələr. Sayı məhdud deyil."
        >
          <div className="space-y-4">
            <div>
              <Label>Bölmənin başlığı</Label>
              <Input
                value={form.links_title[lang]}
                onChange={(event) => setField("links_title", event.target.value)}
                placeholder="Bölmədə daha çox"
              />
            </div>

            {form.links.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hələ düymə əlavə edilməyib.
              </p>
            ) : (
              <div className="space-y-3">
                {form.links.map((link, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">#{index + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveLink(index, -1)}
                          disabled={index === 0}
                          title="Yuxarı"
                          className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(index, 1)}
                          disabled={index === form.links.length - 1}
                          title="Aşağı"
                          className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="ml-2 text-xs text-red-500 hover:text-red-600"
                        >
                          Sil
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Düymənin mətni</Label>
                        <Input
                          value={link.label[lang]}
                          onChange={(event) => setLink(index, "label", event.target.value)}
                          placeholder="Tədqiqat İnstitutları"
                        />
                      </div>
                      <div>
                        <Label>Ünvan</Label>
                        <Input
                          value={link.url}
                          onChange={(event) => setLink(index, "url", event.target.value)}
                          placeholder="/tedqiqat/tedqiqat-fealiyyeti/tedqiqat-institutlari"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button size="sm" variant="outline" onClick={addLink}>
              + Düymə əlavə et
            </Button>
          </div>
        </ComponentCard>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            // Also blocked mid-upload: saving reloads the form from the server,
            // which re-sorts the years, and the in-flight upload is still
            // holding the positions the old list had.
            disabled={saving || uploading !== null}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Yadda saxla
          </Button>
        </div>
      </div>
    </>
  );
}
