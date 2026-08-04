import { useCallback, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import Swal from "sweetalert2";

import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import {
  getHomePage,
  publishHomePage,
  updateHomePage,
  type HomePageDetail,
} from "../../services/home/homeService";

/**
 * Edits the home page's two metric groups — the hero badges and the
 * "Rəqəmlərlə Universitetimiz" counters. One Save button PUTs both lists;
 * publishing toggles visibility on its own call, matching the About editor.
 */

type Lang = "az" | "en";

interface Bilingual {
  az: string;
  en: string;
}

/** One metric row in the form. `value`/`suffix` are language-neutral. */
interface MetricRow {
  value: string;
  suffix: string;
  label: Bilingual;
  sublabel: Bilingual;
}

interface PageForm {
  heroMetrics: MetricRow[];
  numberMetrics: MetricRow[];
}

type Group = "heroMetrics" | "numberMetrics";

const LANGS: { code: Lang; label: string }[] = [
  { code: "az", label: "Azərbaycanca" },
  { code: "en", label: "English" },
];

const emptyMetric = (): MetricRow => ({
  value: "",
  suffix: "",
  label: { az: "", en: "" },
  sublabel: { az: "", en: "" },
});

const toRow = (metric: HomePageDetail["hero_metrics"][number]): MetricRow => ({
  value: metric.value ?? "",
  suffix: metric.suffix ?? "",
  label: { az: metric.az?.label ?? "", en: metric.en?.label ?? "" },
  sublabel: { az: metric.az?.sublabel ?? "", en: metric.en?.sublabel ?? "" },
});

const toForm = (page: HomePageDetail): PageForm => ({
  heroMetrics: (page.hero_metrics ?? []).map(toRow),
  numberMetrics: (page.number_metrics ?? []).map(toRow),
});

export default function HomePageEditor() {
  const [page, setPage] = useState<HomePageDetail | null>(null);
  const [form, setForm] = useState<PageForm | null>(null);
  const [lang, setLang] = useState<Lang>("az");
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getHomePage();

    if (result === "ERROR" || result === "NOT FOUND") {
      setMissing(result === "NOT FOUND");
      setPage(null);
      setForm(null);
    } else {
      setMissing(false);
      setPage(result);
      setForm(toForm(result));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // ── Row mutations ──
  const setRowPlain = (group: Group, index: number, field: "value" | "suffix", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            [group]: prev[group].map((row, i) =>
              i === index ? { ...row, [field]: value } : row
            ),
          }
        : prev
    );

  const setRowBilingual = (
    group: Group,
    index: number,
    field: "label" | "sublabel",
    value: string
  ) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            [group]: prev[group].map((row, i) =>
              i === index ? { ...row, [field]: { ...row[field], [lang]: value } } : row
            ),
          }
        : prev
    );

  const addRow = (group: Group) =>
    setForm((prev) => (prev ? { ...prev, [group]: [...prev[group], emptyMetric()] } : prev));

  const removeRow = (group: Group, index: number) =>
    setForm((prev) =>
      prev ? { ...prev, [group]: prev[group].filter((_, i) => i !== index) } : prev
    );

  const moveRow = (group: Group, index: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const next = index + delta;
      const list = prev[group];
      if (next < 0 || next >= list.length) return prev;
      const copy = [...list];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return { ...prev, [group]: copy };
    });

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const result = await updateHomePage({
        hero_metrics: form.heroMetrics.map((row) => ({
          value: row.value,
          suffix: row.suffix,
          az: { label: row.label.az, sublabel: null },
          en: { label: row.label.en, sublabel: null },
        })),
        number_metrics: form.numberMetrics.map((row) => ({
          value: row.value,
          suffix: row.suffix,
          az: { label: row.label.az, sublabel: row.sublabel.az },
          en: { label: row.label.en, sublabel: row.sublabel.en },
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

    const result = await publishHomePage(next);
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
          {missing
            ? "Verilənlər bazasında home səhifəsinin miqrasiyasını icra edin."
            : "Zəhmət olmasa bir az sonra yenidən cəhd edin."}
        </p>
      </div>
    );
  }

  const renderRows = (group: Group, withSublabel: boolean) => {
    const rows = form[group];
    return (
      <div className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Hələ metrika əlavə edilməyib.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((row, index) => (
              <div key={index} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">#{index + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveRow(group, index, -1)}
                      disabled={index === 0}
                      className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRow(group, index, 1)}
                      disabled={index === rows.length - 1}
                      className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(group, index)}
                      className="ml-2 text-xs text-red-500 hover:text-red-600"
                    >
                      Sil
                    </button>
                  </div>
                </div>
                <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Rəqəm</Label>
                    <Input
                      value={row.value}
                      onChange={(e) => setRowPlain(group, index, "value", e.target.value)}
                      placeholder="801"
                    />
                    <p className="mt-1 text-xs text-gray-400">Bütün dillərdə eyni.</p>
                  </div>
                  <div>
                    <Label>Şəkilçi</Label>
                    <Input
                      value={row.suffix}
                      onChange={(e) => setRowPlain(group, index, "suffix", e.target.value)}
                      placeholder="+"
                    />
                    <p className="mt-1 text-xs text-gray-400">Bütün dillərdə eyni.</p>
                  </div>
                </div>
                <div className={withSublabel ? "mb-3" : ""}>
                  <Label>Başlıq</Label>
                  <Input
                    value={row.label[lang]}
                    onChange={(e) => setRowBilingual(group, index, "label", e.target.value)}
                    placeholder={lang === "az" ? "QS Reytinqi" : "QS Ranking"}
                  />
                </div>
                {withSublabel && (
                  <div>
                    <Label>Alt başlıq</Label>
                    <Input
                      value={row.sublabel[lang]}
                      onChange={(e) => setRowBilingual(group, index, "sublabel", e.target.value)}
                      placeholder={lang === "az" ? "Akademik bölmələr" : "Academic divisions"}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <Button size="sm" variant="outline" onClick={() => addRow(group)}>
          + Metrika əlavə et
        </Button>
      </div>
    );
  };

  return (
    <>
      <PageMeta title="Ana səhifə | AzTU Admin" description="Ana səhifə metrikaları" />
      <PageBreadcrumb pageTitle="Ana səhifə" />

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

      {/* One language at a time — the neutral value/suffix stay shared. */}
      <div className="mb-6 inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
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
          title="Hero metrikaları"
          desc="Səhifənin yuxarısındakı reytinq nişanları. Rəqəm və şəkilçi bütün dillərdə eynidir."
        >
          {renderRows("heroMetrics", false)}
        </ComponentCard>

        <ComponentCard
          title="Rəqəmlərlə Universitetimiz"
          desc="Statistika sayğacları. Hər sətir üçün rəqəm, başlıq və alt başlıq."
        >
          {renderRows("numberMetrics", true)}
        </ComponentCard>
      </div>
    </>
  );
}
