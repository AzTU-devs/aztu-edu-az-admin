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
  getAboutPage,
  publishAboutPage,
  updateAboutPage,
  uploadAboutDocument,
  uploadAboutImage,
  type AboutPageDetail,
} from "../../services/about/aboutService";
import { getImageUrl } from "../../util/imageUrl";

/**
 * Edits one About screen.
 *
 * The whole page is one form with one Save button, matching how it saves on the
 * server. Everything the website hard-codes — the hero video, the card icons,
 * the SEO tags — is deliberately absent here.
 */

type Lang = "az" | "en";

interface Bilingual {
  az: string;
  en: string;
}

interface BlockForm {
  block_key: string;
  title: Bilingual;
  body: Bilingual;
}

interface LinkForm {
  url: string;
  label: Bilingual;
}

interface PillarForm {
  title: Bilingual;
  description: Bilingual;
  /** Edited one per line; stored as an array. */
  tags: Bilingual;
}

interface ListForm {
  list_key: string;
  style: string;
  title: Bilingual;
  /** Edited one per line; stored as an array. */
  items: Bilingual;
}

interface MilestoneForm {
  year: string;
  title: Bilingual;
  description: Bilingual;
}

interface PageForm {
  title: Bilingual;
  description: Bilingual;
  links_title: Bilingual;
  document_label: Bilingual;
  pillars_title: Bilingual;
  document_url: string;
  // Rector page.
  degree: Bilingual;
  position: Bilingual;
  message: Bilingual;
  about: Bilingual;
  experience: string;
  email: string;
  image_url: string;
  /** The gallery strip — ordered image paths/URLs. */
  images: string[];
  pillars: PillarForm[];
  lists: ListForm[];
  blocks: BlockForm[];
  links: LinkForm[];
  milestones: MilestoneForm[];
}

const str = (value: string | null | undefined) => value ?? "";
/** JSONB string arrays are edited as one-per-line text. */
const linesOf = (values: string[] | null | undefined) => (values ?? []).join("\n");
const toLines = (text: string) =>
  text.split("\n").map((line) => line.trim()).filter(Boolean);

const toForm = (page: AboutPageDetail): PageForm => ({
  title: { az: str(page.az?.title), en: str(page.en?.title) },
  description: { az: str(page.az?.description), en: str(page.en?.description) },
  links_title: { az: str(page.az?.links_title), en: str(page.en?.links_title) },
  document_label: {
    az: str(page.az?.document_label),
    en: str(page.en?.document_label),
  },
  pillars_title: { az: str(page.az?.pillars_title), en: str(page.en?.pillars_title) },
  document_url: str(page.document_url),
  degree: { az: str(page.az?.degree), en: str(page.en?.degree) },
  position: { az: str(page.az?.position), en: str(page.en?.position) },
  message: { az: str(page.az?.message), en: str(page.en?.message) },
  about: { az: str(page.az?.about), en: str(page.en?.about) },
  experience: str(page.experience),
  email: str(page.email),
  image_url: str(page.image_url),
  images: page.images.map((image) => str(image.image_url)).filter(Boolean),
  pillars: page.pillars.map((pillar) => ({
    title: { az: str(pillar.az?.title), en: str(pillar.en?.title) },
    description: { az: str(pillar.az?.description), en: str(pillar.en?.description) },
    tags: { az: linesOf(pillar.az?.tags), en: linesOf(pillar.en?.tags) },
  })),
  lists: page.lists.map((entry) => ({
    list_key: entry.list_key,
    style: entry.style,
    title: { az: str(entry.az?.title), en: str(entry.en?.title) },
    items: { az: linesOf(entry.az?.items), en: linesOf(entry.en?.items) },
  })),
  blocks: page.blocks.map((block) => ({
    block_key: block.block_key,
    title: { az: str(block.az?.title), en: str(block.en?.title) },
    body: { az: str(block.az?.body), en: str(block.en?.body) },
  })),
  links: page.links.map((link) => ({
    url: str(link.url),
    label: { az: str(link.az?.label), en: str(link.en?.label) },
  })),
  milestones: page.milestones.map((milestone) => ({
    year: str(milestone.year),
    title: { az: str(milestone.az?.title), en: str(milestone.en?.title) },
    description: {
      az: str(milestone.az?.description),
      en: str(milestone.en?.description),
    },
  })),
});

/** Azerbaijani first — this dashboard is Azerbaijani. */
const LANGS: { code: Lang; label: string }[] = [
  { code: "az", label: "Azərbaycanca" },
  { code: "en", label: "English" },
];

export default function AboutPageEditor() {
  const { page_key: pageKey = "vision-mission-goal" } = useParams();

  const [page, setPage] = useState<AboutPageDetail | null>(null);
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
    const result = await getAboutPage(pageKey);

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
    field:
      | "title"
      | "description"
      | "links_title"
      | "degree"
      | "position"
      | "message"
      | "about",
    value: string
  ) =>
    setForm((prev) => (prev ? { ...prev, [field]: { ...prev[field], [lang]: value } } : prev));

  // Language-neutral single-value fields (experience, email, portrait).
  const setPlain = (field: "experience" | "email" | "image_url", value: string) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const removeGalleryImage = (index: number) =>
    setForm((prev) =>
      prev ? { ...prev, images: prev.images.filter((_, i) => i !== index) } : prev
    );

  const moveGalleryImage = (index: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const target = index + delta;
      if (target < 0 || target >= prev.images.length) return prev;
      const images = [...prev.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { ...prev, images };
    });

  const setBlock = (index: number, field: "title" | "body", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            blocks: prev.blocks.map((block, i) =>
              i === index ? { ...block, [field]: { ...block[field], [lang]: value } } : block
            ),
          }
        : prev
    );

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

  const setMilestone = (
    index: number,
    field: "year" | "title" | "description",
    value: string
  ) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            milestones: prev.milestones.map((milestone, i) =>
              i !== index
                ? milestone
                : field === "year"
                ? { ...milestone, year: value }
                : { ...milestone, [field]: { ...milestone[field], [lang]: value } }
            ),
          }
        : prev
    );

  const addMilestone = () =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            milestones: [
              ...prev.milestones,
              { year: "", title: { az: "", en: "" }, description: { az: "", en: "" } },
            ],
          }
        : prev
    );

  const removeMilestone = (index: number) =>
    setForm((prev) =>
      prev
        ? { ...prev, milestones: prev.milestones.filter((_, i) => i !== index) }
        : prev
    );

  const setPillar = (
    index: number,
    field: "title" | "description" | "tags",
    value: string
  ) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            pillars: prev.pillars.map((pillar, i) =>
              i === index
                ? { ...pillar, [field]: { ...pillar[field], [lang]: value } }
                : pillar
            ),
          }
        : prev
    );

  const addPillar = () =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            pillars: [
              ...prev.pillars,
              {
                title: { az: "", en: "" },
                description: { az: "", en: "" },
                tags: { az: "", en: "" },
              },
            ],
          }
        : prev
    );

  const removePillar = (index: number) =>
    setForm((prev) =>
      prev ? { ...prev, pillars: prev.pillars.filter((_, i) => i !== index) } : prev
    );

  const movePillar = (index: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const target = index + delta;
      if (target < 0 || target >= prev.pillars.length) return prev;
      const pillars = [...prev.pillars];
      [pillars[index], pillars[target]] = [pillars[target], pillars[index]];
      return { ...prev, pillars };
    });

  const setList = (index: number, field: "title" | "items", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            lists: prev.lists.map((entry, i) =>
              i === index ? { ...entry, [field]: { ...entry[field], [lang]: value } } : entry
            ),
          }
        : prev
    );

  const handleDocumentUpload = async (file: File | null) => {
    if (!file) return;
    setSaving(true);
    try {
      const result = await uploadAboutDocument(pageKey, file);
      if (result !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Sənəd yüklənmədi." });
        return;
      }
      Swal.fire({ icon: "success", title: "Sənəd yükləndi", showConfirmButton: false, timer: 1200 });
      await load();
    } finally {
      setSaving(false);
    }
  };

  // The upload endpoint only stores the file and returns its path; the path is
  // held in form state and persisted by the next Save (the portrait or the
  // gallery strip), so an unsaved upload never leaves a dangling row.
  const handlePortraitUpload = async (file: File | null) => {
    if (!file) return;
    setSaving(true);
    try {
      const result = await uploadAboutImage(pageKey, file);
      if (result.status !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Şəkil yüklənmədi." });
        return;
      }
      setPlain("image_url", result.path);
    } finally {
      setSaving(false);
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setSaving(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadAboutImage(pageKey, file);
        if (result.status === "SUCCESS") uploaded.push(result.path);
      }
      if (uploaded.length === 0) {
        Swal.fire({ icon: "error", title: "Xəta", text: "Şəkillər yüklənmədi." });
        return;
      }
      setForm((prev) => (prev ? { ...prev, images: [...prev.images, ...uploaded] } : prev));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const result = await updateAboutPage(pageKey, {
        document_url: form.document_url,
        experience: form.experience,
        email: form.email,
        image_url: form.image_url,
        az: {
          title: form.title.az,
          description: form.description.az,
          links_title: form.links_title.az,
          document_label: form.document_label.az,
          pillars_title: form.pillars_title.az,
          degree: form.degree.az,
          position: form.position.az,
          message: form.message.az,
          about: form.about.az,
        },
        en: {
          title: form.title.en,
          description: form.description.en,
          links_title: form.links_title.en,
          document_label: form.document_label.en,
          pillars_title: form.pillars_title.en,
          degree: form.degree.en,
          position: form.position.en,
          message: form.message.en,
          about: form.about.en,
        },
        // A blank image row was never filled in and should not reach the site.
        images: form.images
          .map((url) => url.trim())
          .filter(Boolean)
          .map((url) => ({ image_url: url })),
        // A card with no heading in either language was never filled in.
        pillars: form.pillars
          .filter((pillar) => pillar.title.az.trim() || pillar.title.en.trim())
          .map((pillar) => ({
            az: {
              title: pillar.title.az,
              description: pillar.description.az,
              tags: toLines(pillar.tags.az),
            },
            en: {
              title: pillar.title.en,
              description: pillar.description.en,
              tags: toLines(pillar.tags.en),
            },
          })),
        lists: form.lists.map((entry) => ({
          list_key: entry.list_key,
          style: entry.style,
          az: { title: entry.title.az, items: toLines(entry.items.az) },
          en: { title: entry.title.en, items: toLines(entry.items.en) },
        })),
        blocks: form.blocks.map((block) => ({
          block_key: block.block_key,
          az: { title: block.title.az, body: block.body.az },
          en: { title: block.title.en, body: block.body.en },
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
        // A milestone with no year and no text is an empty row the editor
        // added and never filled in; it should not reach the website.
        milestones: form.milestones
          .filter(
            (milestone) =>
              milestone.year.trim() ||
              milestone.title.az.trim() ||
              milestone.title.en.trim()
          )
          .map((milestone) => ({
            year: milestone.year,
            az: { title: milestone.title.az, description: milestone.description.az },
            en: { title: milestone.title.en, description: milestone.description.en },
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

    const result = await publishAboutPage(pageKey, next);
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
                migrations_about.sql
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
  // The About pages are not all the same shape; the page says which form it is.
  const isTimeline = page.template === "timeline";
  const isStrategicPlan = page.template === "strategic_plan";
  const isRector = page.template === "rector";
  // The rector page's single 'offices' list is edited as one textarea per
  // language, so it is pulled out of the generic `lists` machinery here.
  const officesIndex = form.lists.findIndex((entry) => entry.list_key === "offices");

  return (
    <>
      <PageMeta title={`${title} | AzTU Admin`} description="Haqqımızda səhifəsi" />
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
          desc={
            isRector
              ? "Səhifənin yuxarısındakı bölmə. Şəkil və başlıqların dizaynı saytda sabitdir."
              : "Səhifənin yuxarısındakı video bölməsində göstərilir. Video saytda sabitdir."
          }
        >
          <div className="space-y-4">
            <div>
              <Label>{isRector ? "Ad və Soyad" : "Başlıq"}</Label>
              <Input
                value={form.title[lang]}
                onChange={(event) => setField("title", event.target.value)}
                placeholder={isRector ? "Vilayət Vəliyev" : "Vizyon, Missiya və Məqsəd"}
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

        {isRector && (
          <ComponentCard
            title="Rektor məlumatları"
            desc="Başlıq bölməsindəki kartlarda göstərilir. Etiketlər (Doktorluq, Elmi ad, Təcrübə) saytda sabitdir."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Elmi dərəcə</Label>
                  <Input
                    value={form.degree[lang]}
                    onChange={(event) => setField("degree", event.target.value)}
                    placeholder="Texniki elmlər"
                  />
                </div>
                <div>
                  <Label>Elmi ad</Label>
                  <Input
                    value={form.position[lang]}
                    onChange={(event) => setField("position", event.target.value)}
                    placeholder="Professor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Təcrübə</Label>
                  <Input
                    value={form.experience}
                    onChange={(event) => setPlain("experience", event.target.value)}
                    placeholder="30+ Years"
                  />
                  <p className="mt-1 text-xs text-gray-400">Bütün dillərdə eyni göstərilir.</p>
                </div>
                <div>
                  <Label>E-poçt</Label>
                  <Input
                    value={form.email}
                    onChange={(event) => setPlain("email", event.target.value)}
                    placeholder="rector@aztu.edu.az"
                  />
                </div>
              </div>

              <div>
                <Label>Rektorun şəkli</Label>
                <div className="flex flex-wrap items-center gap-4">
                  {form.image_url ? (
                    <img
                      src={getImageUrl(form.image_url)}
                      alt="Rektor"
                      className="h-28 w-28 rounded-xl border border-gray-200 object-cover dark:border-gray-700"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-gray-300 text-xs text-gray-400 dark:border-gray-700">
                      Şəkil yoxdur
                    </div>
                  )}
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => void handlePortraitUpload(event.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                    />
                    {form.image_url ? (
                      <button
                        type="button"
                        onClick={() => setPlain("image_url", "")}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Şəkli sil
                      </button>
                    ) : null}
                    <p className="text-xs text-gray-400">
                      Yüklədikdən sonra dəyişikliyi saxlamaq üçün “Yadda saxla”ya basın.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ComponentCard>
        )}

        {isRector && (
          <ComponentCard
            title="Rektorun müraciəti"
            desc="Redaktorda sətirlər arasına boşluq (sətir hündürlüyü) əlavə edə bilərsiniz."
          >
            <RichTextField
              label="Mətn"
              value={form.message[lang]}
              onChange={(next) => setField("message", next)}
              remountKey={`${formKey}-message-${lang}`}
            />
          </ComponentCard>
        )}

        {isRector && (
          <ComponentCard title="Rektor haqqında" desc="Tərcümeyi-hal mətni.">
            <RichTextField
              label="Mətn"
              value={form.about[lang]}
              onChange={(next) => setField("about", next)}
              remountKey={`${formKey}-about-${lang}`}
            />
          </ComponentCard>
        )}

        {isRector && officesIndex !== -1 && (
          <ComponentCard
            title="Rektora tabe olan bölmələr"
            desc="Hər sətirdə bir bölmə. Sayı məhdud deyil."
          >
            <div>
              <Label>Bölmələr</Label>
              <textarea
                value={form.lists[officesIndex].items[lang]}
                onChange={(event) => setList(officesIndex, "items", event.target.value)}
                rows={8}
                placeholder={"Rektor Aparatı\nElm və İnnovasiyalar üzrə Departament"}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              <p className="mt-1 text-xs text-gray-400">Hər sətirdə bir bölmə.</p>
            </div>
          </ComponentCard>
        )}

        {isRector && (
          <ComponentCard title="Qalereya" desc="Rektorun şəkilləri. Sayı məhdud deyil.">
            <div className="space-y-4">
              {form.images.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ şəkil əlavə edilməyib.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {form.images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`Qalereya ${index + 1}`}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/50 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(index, -1)}
                            disabled={index === 0}
                            title="Sola"
                            className="px-1 text-white disabled:opacity-30"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(index, 1)}
                            disabled={index === form.images.length - 1}
                            title="Sağa"
                            className="px-1 text-white disabled:opacity-30"
                          >
                            →
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="text-xs font-medium text-red-300 hover:text-red-200"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label>Şəkil əlavə et</Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => void handleGalleryUpload(event.target.files)}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Bir neçə şəkil seçə bilərsiniz. Dəyişikliyi saxlamaq üçün “Yadda saxla”ya basın.
                </p>
              </div>
            </div>
          </ComponentCard>
        )}

        {isStrategicPlan && (
          <ComponentCard
            title="Sənəd"
            desc="Başlığın altındakı yükləmə düyməsi. Fayl yükləyin və ya hazır keçid yapışdırın — hər ikisi işləyir."
          >
            <div className="space-y-4">
              <div>
                <Label>Düymənin mətni</Label>
                <Input
                  value={form.document_label[lang]}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            document_label: {
                              ...prev.document_label,
                              [lang]: event.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  placeholder="Sənədi yüklə"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Fayl yüklə</Label>
                  <input
                    type="file"
                    onChange={(event) => void handleDocumentUpload(event.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Yükləndikdə aşağıdakı ünvan avtomatik yenilənir.
                  </p>
                </div>
                <div>
                  <Label>və ya keçid</Label>
                  <Input
                    value={form.document_url}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev ? { ...prev, document_url: event.target.value } : prev
                      )
                    }
                    placeholder="https://…"
                  />
                </div>
              </div>
            </div>
          </ComponentCard>
        )}

        {isStrategicPlan && (
          <ComponentCard
            title="Strateji Sütunlar"
            desc="Nömrələnmiş kartlar. Sayı məhdud deyil; nömrə və ikon saytda sabitdir."
          >
            <div className="space-y-4">
              <div>
                <Label>Bölmənin başlığı</Label>
                <Input
                  value={form.pillars_title[lang]}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            pillars_title: { ...prev.pillars_title, [lang]: event.target.value },
                          }
                        : prev
                    )
                  }
                  placeholder="Strateji Sütunlar"
                />
              </div>

              {form.pillars.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ sütun əlavə edilməyib.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.pillars.map((pillar, index) => (
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
                            onClick={() => movePillar(index, -1)}
                            disabled={index === 0}
                            title="Yuxarı"
                            className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => movePillar(index, 1)}
                            disabled={index === form.pillars.length - 1}
                            title="Aşağı"
                            className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removePillar(index)}
                            className="ml-2 text-xs text-red-500 hover:text-red-600"
                          >
                            Sil
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <Label>Başlıq</Label>
                        <Input
                          value={pillar.title[lang]}
                          onChange={(event) => setPillar(index, "title", event.target.value)}
                          placeholder="Təhsildə Mükəmməllik"
                        />
                      </div>

                      <div className="mb-3">
                        <RichTextField
                          label="Qısa təsvir"
                          value={pillar.description[lang]}
                          onChange={(next) => setPillar(index, "description", next)}
                          remountKey={`${formKey}-pillar-${index}-${lang}`}
                        />
                      </div>

                      <div>
                        <Label>Etiketlər</Label>
                        <textarea
                          value={pillar.tags[lang]}
                          onChange={(event) => setPillar(index, "tags", event.target.value)}
                          rows={3}
                          placeholder={"Modernləşdirilmiş kurikulum\nBeynəlxalq akkreditasiya"}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        />
                        <p className="mt-1 text-xs text-gray-400">Hər sətirdə bir etiket.</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button size="sm" variant="outline" onClick={addPillar}>
                + Sütun əlavə et
              </Button>
            </div>
          </ComponentCard>
        )}

        {isStrategicPlan &&
          form.lists.map((entry, index) => (
            <ComponentCard
              key={entry.list_key}
              title={entry.title[lang] || entry.list_key}
              desc={
                entry.style === "number"
                  ? "Saytda nömrələnmiş siyahı kimi göstərilir."
                  : "Saytda markerli siyahı kimi göstərilir."
              }
            >
              <div className="space-y-4">
                <div>
                  <Label>Bölmənin başlığı</Label>
                  <Input
                    value={entry.title[lang]}
                    onChange={(event) => setList(index, "title", event.target.value)}
                  />
                </div>
                <div>
                  <Label>Bəndlər</Label>
                  <textarea
                    value={entry.items[lang]}
                    onChange={(event) => setList(index, "items", event.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                  <p className="mt-1 text-xs text-gray-400">Hər sətirdə bir bənd.</p>
                </div>
              </div>
            </ComponentCard>
          ))}

        {isTimeline ? (
          <ComponentCard
            title="Tarixçə"
            desc="İllər saytda yenidən köhnəyə doğru sıralanır — burada sıralamaq lazım deyil."
          >
            <div className="space-y-4">
              {form.milestones.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hələ il əlavə edilməyib.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <div className="w-40">
                          <Label>İl</Label>
                          <Input
                            value={milestone.year}
                            onChange={(event) =>
                              setMilestone(index, "year", event.target.value)
                            }
                            placeholder="1950"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="mt-5 text-xs text-red-500 hover:text-red-600"
                        >
                          Sil
                        </button>
                      </div>

                      <div className="mb-3">
                        <Label>Başlıq</Label>
                        <Input
                          value={milestone.title[lang]}
                          onChange={(event) =>
                            setMilestone(index, "title", event.target.value)
                          }
                        />
                      </div>

                      <RichTextField
                        label="Təsvir"
                        value={milestone.description[lang]}
                        onChange={(next) => setMilestone(index, "description", next)}
                        remountKey={`${formKey}-ms-${index}-${lang}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button size="sm" variant="outline" onClick={addMilestone}>
                + İl əlavə et
              </Button>
            </div>
          </ComponentCard>
        ) : null}

        {!isTimeline && !isStrategicPlan && !isRector && form.blocks.map((block, index) => (
          <ComponentCard
            key={block.block_key}
            title={block.title[lang] || block.block_key}
            desc="Kartın ikonu saytda sabitdir."
          >
            <div className="space-y-4">
              <div>
                <Label>Başlıq</Label>
                <Input
                  value={block.title[lang]}
                  onChange={(event) => setBlock(index, "title", event.target.value)}
                />
              </div>
              <RichTextField
                label="Mətn"
                value={block.body[lang]}
                onChange={(next) => setBlock(index, "body", next)}
                remountKey={`${formKey}-${block.block_key}-${lang}`}
              />
            </div>
          </ComponentCard>
        ))}

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
              <p className="text-sm text-gray-500 dark:text-gray-400">Hələ düymə əlavə edilməyib.</p>
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
                          placeholder="Strateji Plan"
                        />
                      </div>
                      <div>
                        <Label>Ünvan</Label>
                        <Input
                          value={link.url}
                          onChange={(event) => setLink(index, "url", event.target.value)}
                          placeholder="/haqqimizda/vizyon-ve-missiya/strateji-plan"
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
