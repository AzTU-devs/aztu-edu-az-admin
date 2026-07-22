import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import Swal from "sweetalert2";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { AboutField, LanguageTabs } from "../../components/About/AboutFields";
import AboutSectionCard from "../../components/About/AboutSectionCard";
import useGoBack from "../../hooks/useGoBack";
import {
  getAboutPage,
  publishAboutPage,
  reorderAboutSections,
  updateAboutPage,
  uploadAboutPageFile,
  uploadAboutPageImage,
  type AboutPageDetail,
} from "../../services/about/aboutService";

/**
 * Edits one About screen: its page-level copy, then each of its blocks.
 *
 * Blocks are collapsed by default — the longer pages carry twenty of them — and
 * drag-sortable, because the order here is the order the website renders.
 */

interface PageForm {
  slug_az: string;
  slug_en: string;
  hero_video_url: string;
  website_url: string;
  video_url: string;
  az: TranslationForm;
  en: TranslationForm;
}

interface TranslationForm {
  eyebrow: string;
  title: string;
  subtitle: string;
  breadcrumb: string;
  intro: string;
  meta_title: string;
  meta_description: string;
}

const str = (value: string | null | undefined) => value ?? "";

const toForm = (page: AboutPageDetail): PageForm => ({
  slug_az: str(page.slug_az),
  slug_en: str(page.slug_en),
  hero_video_url: str(page.hero_video_url),
  website_url: str(page.website_url),
  video_url: str(page.video_url),
  az: {
    eyebrow: str(page.az?.eyebrow),
    title: str(page.az?.title),
    subtitle: str(page.az?.subtitle),
    breadcrumb: str(page.az?.breadcrumb),
    intro: str(page.az?.intro),
    meta_title: str(page.az?.meta_title),
    meta_description: str(page.az?.meta_description),
  },
  en: {
    eyebrow: str(page.en?.eyebrow),
    title: str(page.en?.title),
    subtitle: str(page.en?.subtitle),
    breadcrumb: str(page.en?.breadcrumb),
    intro: str(page.en?.intro),
    meta_title: str(page.en?.meta_title),
    meta_description: str(page.en?.meta_description),
  },
});

function SortableSection({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="flex items-stretch gap-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Sıralamaq üçün sürükləyin"
        className="flex w-7 shrink-0 cursor-grab items-center justify-center rounded-lg text-gray-300 hover:text-gray-500 active:cursor-grabbing dark:text-gray-600 dark:hover:text-gray-400"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="7" cy="4" r="1.4" />
          <circle cx="13" cy="4" r="1.4" />
          <circle cx="7" cy="10" r="1.4" />
          <circle cx="13" cy="10" r="1.4" />
          <circle cx="7" cy="16" r="1.4" />
          <circle cx="13" cy="16" r="1.4" />
        </svg>
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default function AboutPageEditor() {
  const { page_key: pageKey = "" } = useParams();
  const goBack = useGoBack();

  const [page, setPage] = useState<AboutPageDetail | null>(null);
  const [form, setForm] = useState<PageForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  // `RichTextField` seeds once at mount; bump on every load so it re-reads.
  const [formKey, setFormKey] = useState(0);
  const [order, setOrder] = useState<number[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAboutPage(pageKey);
    if (result === "ERROR" || result === "NOT FOUND") {
      setPage(null);
      setForm(null);
    } else {
      setPage(result);
      setForm(toForm(result));
      setOrder(result.sections.map((section) => section.id));
      setFormKey((key) => key + 1);
    }
    setLoading(false);
  }, [pageKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const setTr = (lang: "az" | "en", key: keyof TranslationForm, next: string) =>
    setForm((prev) => (prev ? { ...prev, [lang]: { ...prev[lang], [key]: next } } : prev));

  const handleSave = async () => {
    if (!form || !page) return;
    setSaving(true);
    try {
      const result = await updateAboutPage(pageKey, form);
      if (result !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Səhifə yadda saxlanmadı." });
        return;
      }

      // Uploads are separate endpoints; report the first that fails rather than
      // claiming a clean save.
      const failures: string[] = [];
      if (heroFile && (await uploadAboutPageImage(pageKey, heroFile, "hero_image")) !== "SUCCESS") {
        failures.push(heroFile.name);
      }
      if (coverFile && (await uploadAboutPageImage(pageKey, coverFile, "cover_image")) !== "SUCCESS") {
        failures.push(coverFile.name);
      }
      if (pdfFile && (await uploadAboutPageFile(pageKey, pdfFile)) !== "SUCCESS") {
        failures.push(pdfFile.name);
      }

      setHeroFile(null);
      setCoverFile(null);
      setPdfFile(null);

      if (failures.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Səhifə saxlanıldı, lakin fayl yüklənmədi",
          text: failures.join(", "),
        });
      } else {
        Swal.fire({ icon: "success", title: "Yadda saxlanıldı", showConfirmButton: false, timer: 1200 });
      }
      void load();
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!page) return;
    const result = await publishAboutPage(pageKey, !page.is_active);
    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Vəziyyət dəyişdirilə bilmədi." });
      return;
    }
    void load();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = order.indexOf(active.id as number);
    const newIndex = order.indexOf(over.id as number);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);

    const result = await reorderAboutSections(pageKey, next);
    if (result !== "SUCCESS") {
      setOrder(page?.sections.map((section) => section.id) ?? []);
      Swal.fire({ icon: "error", title: "Xəta", text: "Sıralama yadda saxlanmadı." });
      return;
    }
    void load();
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
        <p className="text-gray-600 dark:text-gray-300">Səhifə tapılmadı.</p>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={goBack}>
            Geri
          </Button>
        </div>
      </div>
    );
  }

  const title = form.az.title || form.en.title || page.page_key;
  const sorted = [...page.sections].sort(
    (a, b) => order.indexOf(a.id) - order.indexOf(b.id)
  );

  return (
    <>
      <PageMeta title={`${title} | AzTU Admin`} description="Haqqımızda səhifəsinin redaktəsi" />
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
          <span className="text-xs text-gray-400">{page.page_key}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={goBack}>
            Geri
          </Button>
          <Button variant="outline" onClick={handlePublish}>
            {page.is_active ? "Dərcdən çıxar" : "Dərc et"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <ComponentCard
          title="Səhifə başlığı"
          desc="Səhifənin yuxarısında görünən mətnlər və axtarış sistemləri üçün məlumat."
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Slug (AZ)</Label>
                <Input
                  value={form.slug_az}
                  onChange={(event) =>
                    setForm((prev) => (prev ? { ...prev, slug_az: event.target.value } : prev))
                  }
                />
              </div>
              <div>
                <Label>Slug (EN)</Label>
                <Input
                  value={form.slug_en}
                  onChange={(event) =>
                    setForm((prev) => (prev ? { ...prev, slug_en: event.target.value } : prev))
                  }
                />
              </div>
              <div>
                <Label>Rəsmi sayt keçidi</Label>
                <Input
                  value={form.website_url}
                  onChange={(event) =>
                    setForm((prev) => (prev ? { ...prev, website_url: event.target.value } : prev))
                  }
                  placeholder="https://tau.edu.az/"
                />
              </div>
              <div>
                <Label>Video keçidi</Label>
                <Input
                  value={form.video_url}
                  onChange={(event) =>
                    setForm((prev) => (prev ? { ...prev, video_url: event.target.value } : prev))
                  }
                />
              </div>
              <div>
                <Label>Başlıq fonu üçün video keçidi</Label>
                <Input
                  value={form.hero_video_url}
                  onChange={(event) =>
                    setForm((prev) => (prev ? { ...prev, hero_video_url: event.target.value } : prev))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <AboutField
                kind="image"
                label="Başlıq şəkli"
                value=""
                onChange={() => {}}
                onFileSelect={setHeroFile}
                selectedFileName={heroFile?.name}
                currentPath={page.hero_image}
              />
              <AboutField
                kind="image"
                label="Örtük şəkli"
                value=""
                onChange={() => {}}
                onFileSelect={setCoverFile}
                selectedFileName={coverFile?.name}
                currentPath={page.cover_image}
              />
              <AboutField
                kind="file"
                label="Səhifənin PDF sənədi"
                value=""
                onChange={() => {}}
                onFileSelect={setPdfFile}
                selectedFileName={pdfFile?.name}
                currentPath={page.pdf_url}
                hint={page.pdf_filename ?? undefined}
              />
            </div>

            <LanguageTabs>
              {(lang) => (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Üst etiket</Label>
                      <Input
                        value={form[lang].eyebrow}
                        onChange={(event) => setTr(lang, "eyebrow", event.target.value)}
                        placeholder="Rəhbərlik və İdarəetmə"
                      />
                    </div>
                    <div>
                      <Label>Başlıq</Label>
                      <Input
                        value={form[lang].title}
                        onChange={(event) => setTr(lang, "title", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Naviqasiya adı</Label>
                      <Input
                        value={form[lang].breadcrumb}
                        onChange={(event) => setTr(lang, "breadcrumb", event.target.value)}
                      />
                    </div>
                    <div>
                      <Label>SEO başlığı</Label>
                      <Input
                        value={form[lang].meta_title}
                        onChange={(event) => setTr(lang, "meta_title", event.target.value)}
                      />
                    </div>
                  </div>

                  <AboutField
                    kind="textarea"
                    label="Alt başlıq"
                    value={form[lang].subtitle}
                    onChange={(next) => setTr(lang, "subtitle", next)}
                  />
                  <AboutField
                    kind="rich"
                    label="Giriş mətni"
                    value={form[lang].intro}
                    onChange={(next) => setTr(lang, "intro", next)}
                    remountKey={`${formKey}-${lang}`}
                  />
                  <AboutField
                    kind="textarea"
                    label="SEO təsviri"
                    value={form[lang].meta_description}
                    onChange={(next) => setTr(lang, "meta_description", next)}
                  />
                </div>
              )}
            </LanguageTabs>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
              >
                Səhifəni yadda saxla
              </Button>
            </div>
          </div>
        </ComponentCard>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Bölmələr ({sorted.length})
          </h2>

          {sorted.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              Bu səhifə üçün bölmə tapılmadı.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sorted.map((section) => section.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sorted.map((section) => (
                    <SortableSection key={section.id} id={section.id}>
                      <AboutSectionCard section={section} onChanged={() => void load()} />
                    </SortableSection>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </>
  );
}
