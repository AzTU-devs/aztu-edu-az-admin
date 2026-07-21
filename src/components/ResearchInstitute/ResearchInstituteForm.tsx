import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Editor from "../editor/Editor";
import { API_BASE_URL } from "../../util/apiClient";
import {
  InstituteTranslation,
  ResearchInstituteDetail,
  ResearchInstitutePayload,
  blankTranslation,
  uploadInstituteImage,
} from "../../services/researchInstitute/researchInstituteService";

type Lang = "az" | "en";

interface ResearchInstituteFormProps {
  initialValue?: ResearchInstituteDetail | null;
  onSubmit: (
    payload: ResearchInstitutePayload
  ) => Promise<{ status: string; instituteCode?: string }>;
  submitLabel: string;
}

/** Field labels per language tab, so the markup below stays declarative. */
const FIELDS: {
  key: keyof Omit<InstituteTranslation, "name">;
  az: string;
  en: string;
  optional?: boolean;
}[] = [
  { key: "about_html", az: "Haqqında", en: "About" },
  { key: "vision_html", az: "Vizyon", en: "Vision" },
  { key: "mission_html", az: "Missiya", en: "Mission" },
  { key: "goals_html", az: "Məqsədlər", en: "Objectives" },
  { key: "additional_info_html", az: "Əlavə məlumat", en: "Additional information", optional: true },
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
function LogoField({
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

  // Object URLs hold the blob alive until explicitly released.
  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [pendingUrl]);

  const previewUrl = pendingUrl ?? resolveImageUrl(currentImage);

  return (
    <div className="space-y-2">
      <Label>İnstitutun loqosu</Label>
      <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
        <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0 flex items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl} alt="Loqo" className="w-full h-full object-contain" />
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
            Yadda saxladıqdan sonra yüklənəcək (PNG, JPG, SVG)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResearchInstituteForm({
  initialValue,
  onSubmit,
  submitLabel,
}: ResearchInstituteFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>("az");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [websiteUrl, setWebsiteUrl] = useState(initialValue?.website_url ?? "");
  const [email, setEmail] = useState(initialValue?.email ?? "");
  const [az, setAz] = useState<InstituteTranslation>(initialValue?.az ?? blankTranslation());
  const [en, setEn] = useState<InstituteTranslation>(initialValue?.en ?? blankTranslation());

  const setTranslation = (lang: Lang, key: keyof InstituteTranslation, value: string) => {
    const apply = (prev: InstituteTranslation) => ({ ...prev, [key]: value });
    if (lang === "az") setAz(apply);
    else setEn(apply);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!az.name.trim() || !en.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Ad tələb olunur",
        text: "İnstitutun adı həm Azərbaycan, həm də İngilis dilində doldurulmalıdır.",
      });
      return;
    }

    setLoading(true);

    const result = await onSubmit({
      website_url: websiteUrl.trim() || null,
      email: email.trim() || null,
      az,
      en,
    });

    if (result.status !== "SUCCESS" || !result.instituteCode) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Xəta baş verdi",
        text: "Zəhmət olmasa biraz sonra yenidən cəhd edin",
      });
      return;
    }

    // The logo rides a separate multipart request keyed by the institute code,
    // which only exists once the record itself has been saved.
    if (logoFile) {
      const upload = await uploadInstituteImage(result.instituteCode, logoFile);
      if (upload.status !== "SUCCESS") {
        setLoading(false);
        Swal.fire({
          icon: "warning",
          title: "Məlumatlar saxlanıldı",
          text: "Ancaq loqo yüklənə bilmədi. Yenidən cəhd edin.",
        });
        navigate(`/research-institutes/${result.instituteCode}`);
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
    navigate("/research-institutes");
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
  const renderLangPanel = (lang: Lang, value: InstituteTranslation) => (
    <div className={activeLang === lang ? "space-y-5" : "hidden"}>
      <div>
        <Label>
          {lang === "az" ? "İnstitutun adı (AZ)" : "Institute name (EN)"}{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          value={value.name}
          onChange={(e) => setTranslation(lang, "name", e.target.value)}
          placeholder={lang === "az" ? "Biotibbi Mühəndislik İnstitutu" : "Institute of Biomedical Engineering"}
        />
      </div>

      {FIELDS.map((field) => (
        <div key={field.key}>
          <Label>
            {field[lang]}
            {field.optional && (
              <span className="ml-2 text-[11px] font-normal text-gray-400">
                ({lang === "az" ? "istəyə bağlı" : "optional"})
              </span>
            )}
          </Label>
          <Editor
            initialContent={value[field.key]}
            onUpdate={(html) => setTranslation(lang, field.key, html)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Logo + contact details */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
          Əsas məlumatlar
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LogoField
            currentImage={initialValue?.image}
            pendingFile={logoFile}
            onFileSelect={setLogoFile}
          />

          <div className="space-y-4">
            <div>
              <Label>
                Veb sayt
                <span className="ml-2 text-[11px] font-normal text-gray-400">(istəyə bağlı)</span>
              </Label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://institute.aztu.edu.az"
              />
            </div>
            <div>
              <Label>
                E-poçt
                <span className="ml-2 text-[11px] font-normal text-gray-400">(istəyə bağlı)</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="institute@aztu.edu.az"
              />
            </div>
            {initialValue && (
              <div>
                <Label>İnstitut kodu</Label>
                <Input value={initialValue.institute_code} disabled />
              </div>
            )}
          </div>
        </div>
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
          onClick={() => navigate("/research-institutes")}
          className="w-full md:w-auto px-12 h-11"
        >
          İmtina
        </Button>
      </div>
    </form>
  );
}
