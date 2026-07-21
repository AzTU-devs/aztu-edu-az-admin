import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Editor from "../editor/Editor";
import { API_BASE_URL } from "../../util/apiClient";
import {
  ProjectTranslation,
  ResearchProjectDetail,
  ResearchProjectPayload,
  blankTranslation,
  uploadProjectImage,
} from "../../services/researchProject/researchProjectService";

type Lang = "az" | "en";

interface ResearchProjectFormProps {
  initialValue?: ResearchProjectDetail | null;
  onSubmit: (
    payload: ResearchProjectPayload
  ) => Promise<{ status: string; projectCode?: string }>;
  submitLabel: string;
}

/** Short, single-line fields — the long ones get an editor instead. */
const TEXT_FIELDS: {
  key: keyof Omit<ProjectTranslation, "name" | "about_html" | "project_type">;
  az: string;
  en: string;
  placeholderAz: string;
}[] = [
  { key: "duration", az: "İcra müddəti", en: "Duration", placeholderAz: "iki il / 2022-2025" },
  { key: "leader_name", az: "Layihənin rəhbəri", en: "Project leader", placeholderAz: "Adı Soyadı Ata adı" },
  { key: "budget", az: "Ümumi məbləğ", en: "Total budget", placeholderAz: "250 min manat" },
];

const resolveImageUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = API_BASE_URL.replace(/\/$/, "");
  const clean = path.replace(/^\//, "");
  return clean.startsWith("static/") || clean.startsWith("media/")
    ? `${base}/${clean}`
    : `${base}/static/${clean}`;
};

/**
 * Declared at module scope on purpose: nesting it inside the form would give it
 * a new identity every render, remounting the file input and re-creating the
 * preview object URL on each keystroke elsewhere in the form.
 */
function CoverField({
  currentImage,
  pendingFile,
  onFileSelect,
}: {
  currentImage?: string | null;
  pendingFile: File | null;
  onFileSelect: (file: File) => void;
}) {
  const pendingUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile]
  );

  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [pendingUrl]);

  const previewUrl = pendingUrl ?? resolveImageUrl(currentImage);

  return (
    <div className="space-y-2">
      <Label>
        Layihənin şəkli
        <span className="ml-2 text-[11px] font-normal text-gray-400">(istəyə bağlı)</span>
      </Label>
      <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
        <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0 flex items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl} alt="Şəkil" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div className="grow">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400 cursor-pointer"
          />
          <p className="mt-1.5 text-[11px] text-gray-400">
            Yadda saxladıqdan sonra yüklənəcək (PNG, JPG)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResearchProjectForm({
  initialValue,
  onSubmit,
  submitLabel,
}: ResearchProjectFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>("az");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [projectUrl, setProjectUrl] = useState(initialValue?.project_url ?? "");
  const [az, setAz] = useState<ProjectTranslation>(initialValue?.az ?? blankTranslation());
  const [en, setEn] = useState<ProjectTranslation>(initialValue?.en ?? blankTranslation());
  // Held as a plain string list; blank rows are dropped on submit so an editor
  // can add a slot and leave it empty without creating a nameless member.
  const [members, setMembers] = useState<string[]>(initialValue?.members ?? []);

  const setTranslation = (lang: Lang, key: keyof ProjectTranslation, value: string) => {
    const apply = (prev: ProjectTranslation) => ({ ...prev, [key]: value });
    if (lang === "az") setAz(apply);
    else setEn(apply);
  };

  const updateMember = (index: number, value: string) =>
    setMembers((prev) => prev.map((member, i) => (i === index ? value : member)));

  const removeMember = (index: number) =>
    setMembers((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!az.name.trim() || !en.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Ad tələb olunur",
        text: "Layihənin adı həm Azərbaycan, həm də İngilis dilində doldurulmalıdır.",
      });
      return;
    }

    setLoading(true);

    const result = await onSubmit({
      project_url: projectUrl.trim() || null,
      az,
      en,
      members: members
        .map((name) => name.trim())
        .filter(Boolean)
        .map((full_name) => ({ full_name })),
    });

    if (result.status !== "SUCCESS" || !result.projectCode) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Xəta baş verdi",
        text: "Zəhmət olmasa biraz sonra yenidən cəhd edin",
      });
      return;
    }

    // The cover rides a separate multipart request keyed by the project code,
    // which only exists once the record itself has been saved.
    if (coverFile) {
      const upload = await uploadProjectImage(result.projectCode, coverFile);
      if (upload.status !== "SUCCESS") {
        setLoading(false);
        Swal.fire({
          icon: "warning",
          title: "Məlumatlar saxlanıldı",
          text: "Ancaq şəkil yüklənə bilmədi. Yenidən cəhd edin.",
        });
        navigate(`/research-projects/${result.projectCode}`);
        return;
      }
    }

    setLoading(false);
    Swal.fire({
      icon: "success",
      title: "Uğurla yadda saxlanıldı",
      showConfirmButton: false,
      timer: 1500,
    });
    navigate("/research-projects");
  };

  const langTab = (lang: Lang, label: string) => (
    <button
      key={lang}
      type="button"
      onClick={() => setActiveLang(lang)}
      className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
        activeLang === lang
          ? "bg-brand-500 text-white shadow-sm"
          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      {label}
    </button>
  );

  /**
   * Both language panels stay mounted and one is hidden with CSS. The editor
   * seeds itself from `initialContent` at mount only, so unmounting the inactive
   * tab would blank it out the moment the user switched back.
   */
  const renderLangPanel = (lang: Lang, value: ProjectTranslation) => (
    <div className={activeLang === lang ? "space-y-5" : "hidden"}>
      <div>
        <Label>
          {lang === "az" ? "Layihənin adı (AZ)" : "Project name (EN)"}{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          value={value.name}
          onChange={(e) => setTranslation(lang, "name", e.target.value)}
          placeholder={lang === "az" ? "Layihənin tam adı" : "Full project name"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TEXT_FIELDS.map((field) => (
          <div key={field.key}>
            <Label>{field[lang]}</Label>
            <Input
              value={value[field.key]}
              onChange={(e) => setTranslation(lang, field.key, e.target.value)}
              placeholder={lang === "az" ? field.placeholderAz : ""}
            />
          </div>
        ))}
      </div>

      <div>
        <Label>
          {lang === "az" ? "Layihənin növü" : "Project type"}
          <span className="ml-2 text-[11px] font-normal text-gray-400">
            {lang === "az" ? "(qısa ad və ya təsvir)" : "(short label or description)"}
          </span>
        </Label>
        <textarea
          value={value.project_type}
          onChange={(e) => setTranslation(lang, "project_type", e.target.value)}
          rows={3}
          placeholder={lang === "az" ? "Elmi tədqiqat" : "Scientific research"}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:placeholder:text-white/30"
        />
      </div>

      <div>
        <Label>{lang === "az" ? "Haqqında" : "About"}</Label>
        <Editor
          initialContent={value.about_html}
          onUpdate={(html) => setTranslation(lang, "about_html", html)}
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Cover + external link */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
          Əsas məlumatlar
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CoverField
            currentImage={initialValue?.image}
            pendingFile={coverFile}
            onFileSelect={setCoverFile}
          />

          <div className="space-y-4">
            <div>
              <Label>
                Layihə linki
                <span className="ml-2 text-[11px] font-normal text-gray-400">(istəyə bağlı)</span>
              </Label>
              <Input
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://www.aef.gov.az/az/grant/view/57"
              />
            </div>
            {initialValue && (
              <div>
                <Label>Layihə kodu</Label>
                <Input value={initialValue.project_code} disabled />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team roster — one list, shared by both languages */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Layihənin komandası
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Üzvlərin adları hər iki dil üçün eyni siyahıdan götürülür
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setMembers((prev) => [...prev, ""])}
          >
            Üzv əlavə et
          </Button>
        </div>

        {members.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            Hələ üzv əlavə edilməyib
          </p>
        ) : (
          <div className="space-y-3">
            {members.map((member, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="w-7 h-7 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="grow">
                  <Input
                    value={member}
                    onChange={(e) => updateMember(index, e.target.value)}
                    placeholder="Adı Soyadı Ata adı"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="shrink-0 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Localised content */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Məzmun</h3>
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            {langTab("az", "Azərbaycan")}
            {langTab("en", "English")}
          </div>
        </div>

        {renderLangPanel("az", az)}
        {renderLangPanel("en", en)}
      </div>

      <div className="sticky bottom-4 z-10 flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg">
        <Button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-12 h-11 flex items-center justify-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Gözləyin...
            </span>
          ) : (
            submitLabel
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/research-projects")}
          className="w-full md:w-auto px-12 h-11"
        >
          İmtina
        </Button>
      </div>
    </form>
  );
}
