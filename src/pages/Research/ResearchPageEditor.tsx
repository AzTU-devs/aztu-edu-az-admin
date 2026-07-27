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
  type ResearchPageDetail,
} from "../../services/research/researchPageService";

/**
 * Edits one screen of the Tədqiqat section.
 *
 * The whole page is one form with one Save button, matching how it saves on the
 * server. Everything the website draws by itself — the breadcrumb, the eyebrow,
 * the "Strateji baxış" heading, the card icons and numbering, the counter strip
 * and the SEO tags — is deliberately absent here.
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

interface LinkForm {
  url: string;
  label: Bilingual;
}

interface PageForm {
  title: Bilingual;
  description: Bilingual;
  vision_html: Bilingual;
  links_title: Bilingual;
  priorities: PriorityForm[];
  links: LinkForm[];
}

const str = (value: string | null | undefined) => value ?? "";

const toForm = (page: ResearchPageDetail): PageForm => ({
  title: { az: str(page.az?.title), en: str(page.en?.title) },
  description: { az: str(page.az?.description), en: str(page.en?.description) },
  vision_html: { az: str(page.az?.vision_html), en: str(page.en?.vision_html) },
  links_title: { az: str(page.az?.links_title), en: str(page.en?.links_title) },
  priorities: page.priorities.map((priority) => ({
    title: { az: str(priority.az?.title), en: str(priority.en?.title) },
    description: {
      az: str(priority.az?.description),
      en: str(priority.en?.description),
    },
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
    field: "title" | "description" | "vision_html" | "links_title",
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
          vision_html: form.vision_html.az,
          links_title: form.links_title.az,
        },
        en: {
          title: form.title.en,
          description: form.description.en,
          vision_html: form.vision_html.en,
          links_title: form.links_title.en,
        },
        // A card with no heading in either language was never filled in.
        priorities: form.priorities
          .filter((priority) => priority.title.az.trim() || priority.title.en.trim())
          .map((priority) => ({
            az: { title: priority.title.az, description: priority.description.az },
            en: { title: priority.title.en, description: priority.description.en },
          })),
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
              faylını icra edin.
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
            disabled={saving}
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
          title="Strateji baxış"
          desc="Başlığın altındakı giriş mətni. Bölmənin adı saytda sabitdir — yalnız mətn buradan idarə olunur."
        >
          <RichTextField
            label="Mətn"
            value={form.vision_html[lang]}
            onChange={(next) => setField("vision_html", next)}
            remountKey={`${formKey}-vision-${lang}`}
          />
        </ComponentCard>

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
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Yadda saxla
          </Button>
        </div>
      </div>
    </>
  );
}
