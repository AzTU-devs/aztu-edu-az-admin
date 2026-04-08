import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import {
  CreateCafedraPayload,
  DirectorPayload,
  TranslatedTextItem,
  WorkingHour,
  EducationItem,
  CafedraDetail,
  uploadCafedraDirectorImage,
  uploadCafedraWorkerImage,
} from "../../services/cafedra/cafedraService";
import { getFaculties, Faculty } from "../../services/faculty/facultyService";

interface CafedraFormProps {
  initialValue?: CafedraDetail | null;
  onSubmit: (payload: CreateCafedraPayload) => Promise<{ status: string; cafedra?: CafedraDetail }>;
  submitLabel: string;
}

const blankTranslatedItem: TranslatedTextItem = {
  az: { title: "", description: "" },
  en: { title: "", description: "" },
};

const blankWorkingHour: WorkingHour = { az: { day: "" }, en: { day: "" }, time_range: "" };
const blankEducation: EducationItem = { az: { degree: "", university: "" }, en: { degree: "", university: "" }, start_year: "", end_year: "" };
const blankDirector: DirectorPayload = {
  first_name: "",
  last_name: "",
  father_name: "",
  az: { scientific_degree: "", scientific_title: "", bio: "", scientific_research_fields: [] },
  en: { scientific_degree: "", scientific_title: "", bio: "", scientific_research_fields: [] },
  email: "",
  phone: "",
  room_number: "",
  working_hours: [],
  educations: [],
};

const blankCafedraPayload: CreateCafedraPayload = {
  faculty_code: "",
  az: { title: "", html_content: "" },
  en: { title: "", html_content: "" },
  director: null,
  workers: [],
  directions_of_action: [],
  bachelor_programs_count: 0,
  master_programs_count: 0,
  phd_programs_count: 0,
  international_collaborations_count: 0,
  laboratories_count: 0,
  projects_patents_count: 0,
  industrial_collaborations_count: 0,
  sdgs: [],
};

const normalizeCafedraPayload = (value: any): CreateCafedraPayload => {
  if (!value) return blankCafedraPayload;

  return {
    faculty_code: value.faculty_code ?? "",
    az: {
      title: value.az?.title ?? "",
      html_content: value.az?.html_content ?? "",
    },
    en: {
      title: value.en?.title ?? "",
      html_content: value.en?.html_content ?? "",
    },
    director: value.director === null ? null : {
      first_name: value.director?.first_name ?? "",
      last_name: value.director?.last_name ?? "",
      father_name: value.director?.father_name ?? "",
      az: {
        scientific_degree: value.director?.az?.scientific_degree ?? "",
        scientific_title: value.director?.az?.scientific_title ?? "",
        bio: value.director?.az?.bio ?? "",
        scientific_research_fields: Array.isArray(value.director?.az?.scientific_research_fields) ? value.director.az.scientific_research_fields : [],
      },
      en: {
        scientific_degree: value.director?.en?.scientific_degree ?? "",
        scientific_title: value.director?.en?.scientific_title ?? "",
        bio: value.director?.en?.bio ?? "",
        scientific_research_fields: Array.isArray(value.director?.en?.scientific_research_fields) ? value.director.en.scientific_research_fields : [],
      },
      email: value.director?.email ?? "",
      phone: value.director?.phone ?? "",
      room_number: value.director?.room_number ?? "",
      working_hours: Array.isArray(value.director?.working_hours) ? value.director.working_hours : [],
      educations: Array.isArray(value.director?.educations) ? value.director.educations : [],
    },
    workers: Array.isArray(value.workers) ? value.workers : [],
    directions_of_action: Array.isArray(value.directions_of_action) ? value.directions_of_action : [],
    bachelor_programs_count: value.bachelor_programs_count ?? 0,
    master_programs_count: value.master_programs_count ?? 0,
    phd_programs_count: value.phd_programs_count ?? 0,
    international_collaborations_count: value.international_collaborations_count ?? 0,
    laboratories_count: value.laboratories_count ?? 0,
    projects_patents_count: value.projects_patents_count ?? 0,
    industrial_collaborations_count: value.industrial_collaborations_count ?? 0,
    sdgs: Array.isArray(value.sdgs) ? value.sdgs : [],
  };
};

export default function CafedraForm({ initialValue = null, onSubmit, submitLabel }: CafedraFormProps) {
  const navigate = useNavigate();
  const [payload, setPayload] = useState<CreateCafedraPayload>(normalizeCafedraPayload(initialValue));
  const [useDirector, setUseDirector] = useState<boolean>(Boolean(initialValue?.director));
  const [saving, setSaving] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  const [directorImage, setDirectorImage] = useState<File | null>(null);
  const [workerImages, setWorkerImages] = useState<{ [index: number]: File }>({});

  useEffect(() => {
    setPayload(normalizeCafedraPayload(initialValue));
    setUseDirector(Boolean(initialValue?.director));
  }, [initialValue]);

  useEffect(() => {
    getFaculties(0, 100).then((res) => {
      if (res && typeof res === "object" && "faculties" in res) {
        setFaculties(res.faculties);
      }
    });
  }, []);

  const changeField = (section: "az" | "en", field: "title" | "html_content", value: string) => {
    setPayload((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const changeStatField = (field: keyof CreateCafedraPayload, value: number) => {
    setPayload((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSDG = (sdg: number) => {
    setPayload((prev) => {
      const current = prev.sdgs ?? [];
      if (current.includes(sdg)) {
        return { ...prev, sdgs: current.filter((s) => s !== sdg) };
      }
      return { ...prev, sdgs: [...current, sdg].sort((a, b) => a - b) };
    });
  };

  const updateDirectorResearchFields = (lang: "az" | "en", value: string) => {
    const fields = value.split(",").map((f) => f.trim()).filter((f) => f !== "");
    setPayload((prev) => {
      const director = prev.director ?? { ...blankDirector };
      return {
        ...prev,
        director: {
          ...director,
          [lang]: {
            ...director[lang],
            scientific_research_fields: fields,
          },
        },
      };
    });
  };

  const changeDirectorField = (field: keyof DirectorPayload, value: string) => {
    setPayload((prev) => ({
      ...prev,
      director: prev.director
        ? { ...prev.director, [field]: value }
        : { ...blankDirector, [field]: value },
    }));
  };

  const changeDirectorLanguageField = (lang: "az" | "en", field: keyof DirectorPayload["az"] | keyof DirectorPayload["en"], value: string) => {
    setPayload((prev) => ({
      ...prev,
      director: prev.director
        ? {
            ...prev.director,
            [lang]: {
              ...prev.director[lang],
              [field]: value,
            },
          }
        : {
            ...blankDirector,
            [lang]: {
              ...blankDirector[lang],
              [field]: value,
            },
          },
    }));
  };

  const updateDirectorArrayItem = <K extends keyof DirectorPayload>(arrayName: K, index: number, field: string, value: string) => {
    setPayload((prev) => {
      if (!prev.director) return prev;
      const array = [...(prev.director[arrayName] as any)];
      array[index] = { ...array[index], [field]: value };
      return {
        ...prev,
        director: {
          ...prev.director,
          [arrayName]: array,
        } as DirectorPayload,
      };
    });
  };

  const updateDirectorLanguageArrayItem = <K extends keyof DirectorPayload>(arrayName: K, index: number, lang: "az" | "en", field: string, value: string) => {
    setPayload((prev) => {
      if (!prev.director) return prev;
      const array = [...(prev.director[arrayName] as any)];
      array[index] = {
        ...array[index],
        [lang]: {
          ...array[index][lang],
          [field]: value,
        },
      };
      return {
        ...prev,
        director: {
          ...prev.director,
          [arrayName]: array,
        } as DirectorPayload,
      };
    });
  };

  const addDirectorArrayItem = (arrayName: keyof DirectorPayload, item: any) => {
    setPayload((prev) => {
      const director = prev.director ?? { ...blankDirector };
      return {
        ...prev,
        director: {
          ...director,
          [arrayName]: [...(director[arrayName] as any), item],
        } as DirectorPayload,
      };
    });
  };

  const removeDirectorArrayItem = (arrayName: keyof DirectorPayload, index: number) => {
    setPayload((prev) => {
      if (!prev.director) return prev;
      const array = [...(prev.director[arrayName] as any)];
      array.splice(index, 1);
      return {
        ...prev,
        director: {
          ...prev.director,
          [arrayName]: array,
        } as DirectorPayload,
      };
    });
  };

  const updateWorker = (index: number, field: string, value: string) => {
    setPayload((prev) => {
      const list = [...prev.workers];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, workers: list };
    });
  };

  const updateWorkerLanguageField = (index: number, lang: "az" | "en", field: string, value: string) => {
    setPayload((prev) => {
      const list = [...prev.workers];
      list[index] = {
        ...list[index],
        [lang]: {
          ...list[index][lang],
          [field]: value,
        },
      };
      return { ...prev, workers: list };
    });
  };

  const addListItem = <K extends keyof CreateCafedraPayload>(section: K, item: any) => {
    setPayload((prev) => {
      const current = Array.isArray(prev[section]) ? [...(prev[section] as any[])] : [];
      return {
        ...prev,
        [section]: [...current, item],
      };
    });
  };

  const removeListItem = <K extends keyof CreateCafedraPayload>(section: K, index: number) => {
    setPayload((prev) => {
      const list = Array.isArray(prev[section]) ? [...(prev[section] as any[])] : [];
      list.splice(index, 1);
      return { ...prev, [section]: list };
    });
  };

  const updateTranslatedListItem = (section: keyof CreateCafedraPayload, index: number, lang: "az" | "en", field: string, value: string) => {
    setPayload((prev) => {
      const list = Array.isArray(prev[section]) ? [...(prev[section] as any[])] : [];
      list[index] = {
        ...list[index],
        [lang]: {
          ...list[index][lang],
          [field]: value,
        },
      };
      return { ...prev, [section]: list };
    });
  };

  const renderTranslatedArraySection = (title: string, section: keyof CreateCafedraPayload) => {
    const list = Array.isArray(payload[section]) ? (payload[section] as TranslatedTextItem[]) : [];
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hər iki dildə başlıq və izahat əlavə edin.</p>
          </div>
          <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addListItem(section, blankTranslatedItem)}>
            Yeni əlavə et
          </Button>
        </div>
        <div className="p-5 space-y-4">
          {list.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Heç bir maddə yoxdur.</p>}
          {list.map((item, idx) => (
            <div key={`${section}-${idx}`} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title} #{idx + 1}</p>
                <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeListItem(section, idx)}>
                  Sil
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ başlıq</Label>
                  <Input value={item.az.title} onChange={(e) => updateTranslatedListItem(section, idx, "az", "title", e.target.value)} placeholder="Başlıq" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ izahat</Label>
                  <TextArea rows={3} value={item.az.description} onChange={(value) => updateTranslatedListItem(section, idx, "az", "description", value)} placeholder="Açıqlama" />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN title</Label>
                  <Input value={item.en.title} onChange={(e) => updateTranslatedListItem(section, idx, "en", "title", e.target.value)} placeholder="Title" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN description</Label>
                  <TextArea rows={3} value={item.en.description} onChange={(value) => updateTranslatedListItem(section, idx, "en", "description", value)} placeholder="Description" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    if (!payload.faculty_code) {
      Swal.fire({ icon: "warning", title: "Xahiş olunur", text: "Fakültə seçilməlidir." });
      return;
    }
    if (!payload.az.title.trim() || !payload.en.title.trim()) {
      Swal.fire({ icon: "warning", title: "Xahiş olunur", text: "Kafedra adı hər iki dildə tələb olunur." });
      return;
    }

    setSaving(true);

    const payloadToSend: CreateCafedraPayload = {
      ...payload,
      director: useDirector ? payload.director ?? blankDirector : null,
    };

    const result = await onSubmit(payloadToSend);

    if (result.status === "SUCCESS" && result.cafedra) {
      const cafedraCode = result.cafedra.cafedra_code;

      if (directorImage) {
        await uploadCafedraDirectorImage(cafedraCode, directorImage);
      }

      for (const indexStr in workerImages) {
        const index = parseInt(indexStr);
        const worker = result.cafedra.workers[index];
        if (worker && worker.id) {
          await uploadCafedraWorkerImage(worker.id, workerImages[index]);
        }
      }

      Swal.fire({
        icon: "success",
        title: "Uğurlu",
        text: "Məlumatlar uğurla yadda saxlanıldı!",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => navigate("/cafedras"));
    } else if (result.status === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Kafedra tapılmadı" });
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Kafedra qeyd edərkən səhv baş verdi." });
    }
    setSaving(false);
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      {/* Faculty Selection */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Fakültə seçimi</span>
        </div>
        <div className="p-5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Fakültə</Label>
          <select
            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-colors"
            value={payload.faculty_code}
            onChange={(e) => setPayload(prev => ({ ...prev, faculty_code: e.target.value }))}
          >
            <option value="">-- Fakültə seçin --</option>
            {faculties.map((f) => (
              <option key={f.faculty_code} value={f.faculty_code}>
                {f.title} ({f.faculty_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide">AZ</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Azərbaycan dili</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Kafedra adı</Label>
            <Input placeholder="Kafedra adını daxil edin" value={payload.az.title} onChange={(e) => changeField("az", "title", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">HTML mətn</Label>
            <TextArea rows={4} placeholder="Kafedra haqqında HTML mətn" value={payload.az.html_content ?? ""} onChange={(value) => changeField("az", "html_content", value)} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide">EN</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">English</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Cafedra name</Label>
            <Input placeholder="Enter cafedra name" value={payload.en.title} onChange={(e) => changeField("en", "title", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">HTML content</Label>
            <TextArea rows={4} placeholder="HTML text about cafedra" value={payload.en.html_content ?? ""} onChange={(value) => changeField("en", "html_content", value)} />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <p className="font-semibold text-gray-800 dark:text-gray-100">Statistikalar</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Kafedranın əsas göstəriciləri.</p>
        </div>
        <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bakalavr proqramları</Label>
            <Input type="number" value={payload.bachelor_programs_count} onChange={(e) => changeStatField("bachelor_programs_count", parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Magistr proqramları</Label>
            <Input type="number" value={payload.master_programs_count} onChange={(e) => changeStatField("master_programs_count", parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">PhD proqramları</Label>
            <Input type="number" value={payload.phd_programs_count} onChange={(e) => changeStatField("phd_programs_count", parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Beynəlxalq əməkdaşlıqlar</Label>
            <Input type="number" value={payload.international_collaborations_count} onChange={(e) => changeStatField("international_collaborations_count", parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Laboratoriyalar</Label>
            <Input type="number" value={payload.laboratories_count} onChange={(e) => changeStatField("laboratories_count", parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Layihələr/Patentlər</Label>
            <Input type="number" value={payload.projects_patents_count} onChange={(e) => changeStatField("projects_patents_count", parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Sənaye əməkdaşlıqları</Label>
            <Input type="number" value={payload.industrial_collaborations_count} onChange={(e) => changeStatField("industrial_collaborations_count", parseInt(e.target.value) || 0)} />
          </div>
        </div>
      </div>

      {/* SDGs */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <p className="font-semibold text-gray-800 dark:text-gray-100">SDG (Dayanıqlı İnkişaf Məqsədləri)</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Kafedranın töhfə verdiyi məqsədləri seçin (1-17).</p>
        </div>
        <div className="p-5 flex flex-wrap gap-3">
          {Array.from({ length: 17 }, (_, i) => i + 1).map((num) => (
            <label key={`sdg-${num}`} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${payload.sdgs.includes(num) ? "bg-brand-50 border-brand-500 text-brand-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              <input type="checkbox" className="hidden" checked={payload.sdgs.includes(num)} onChange={() => toggleSDG(num)} />
              <span className="text-sm font-medium">SDG {num}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Director */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Müdir (Director)</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kafedra müdiri məlumatları.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={useDirector} onChange={(e) => setUseDirector(e.target.checked)} className="form-checkbox h-4 w-4 text-brand-600 rounded border-gray-300 dark:border-gray-700" />
            Aktivdir
          </label>
        </div>
        {useDirector ? (
          <div className="p-5 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Şəkil</Label>
                <input type="file" onChange={(e) => setDirectorImage(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {payload.director?.profile_image && !directorImage && (
                  <div className="mt-2">
                    <img src={payload.director.profile_image} alt="Director" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ad</Label>
                <Input placeholder="Ad" value={payload.director?.first_name ?? ""} onChange={(e) => changeDirectorField("first_name", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Soyad</Label>
                <Input placeholder="Soyad" value={payload.director?.last_name ?? ""} onChange={(e) => changeDirectorField("last_name", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ata adı</Label>
                <Input placeholder="Ata adı" value={payload.director?.father_name ?? ""} onChange={(e) => changeDirectorField("father_name", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Email</Label>
                <Input placeholder="Email" value={payload.director?.email ?? ""} onChange={(e) => changeDirectorField("email", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Telefon</Label>
                <Input placeholder="Telefon" value={payload.director?.phone ?? ""} onChange={(e) => changeDirectorField("phone", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ofis nömrəsi</Label>
                <Input placeholder="B-101" value={payload.director?.room_number ?? ""} onChange={(e) => changeDirectorField("room_number", e.target.value)} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-4">
              <p className="font-semibold text-gray-800 dark:text-gray-100">Azərbaycan dili</p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi dərəcə</Label>
                  <Input placeholder="Texnika elmləri doktoru" value={payload.director?.az.scientific_degree ?? ""} onChange={(e) => changeDirectorLanguageField("az", "scientific_degree", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi titul</Label>
                  <Input placeholder="Professor" value={payload.director?.az.scientific_title ?? ""} onChange={(e) => changeDirectorLanguageField("az", "scientific_title", e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi tədqiqat sahələri (vergüllə ayırın)</Label>
                <Input placeholder="Süni intellekt, Maşın öyrənməsi" value={payload.director?.az.scientific_research_fields.join(", ") ?? ""} onChange={(e) => updateDirectorResearchFields("az", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bioqrafiya</Label>
                <TextArea rows={4} placeholder="Müdir haqqında mətn" value={payload.director?.az.bio ?? ""} onChange={(value) => changeDirectorLanguageField("az", "bio", value)} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-4">
              <p className="font-semibold text-gray-800 dark:text-gray-100">English</p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Scientific degree</Label>
                  <Input placeholder="Doctor of Technical Sciences" value={payload.director?.en.scientific_degree ?? ""} onChange={(e) => changeDirectorLanguageField("en", "scientific_degree", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Scientific title</Label>
                  <Input placeholder="Professor" value={payload.director?.en.scientific_title ?? ""} onChange={(e) => changeDirectorLanguageField("en", "scientific_title", e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Scientific research fields (separate with comma)</Label>
                <Input placeholder="Artificial Intelligence, Machine Learning" value={payload.director?.en.scientific_research_fields.join(", ") ?? ""} onChange={(e) => updateDirectorResearchFields("en", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Biography</Label>
                <TextArea rows={4} placeholder="Text about director" value={payload.director?.en.bio ?? ""} onChange={(value) => changeDirectorLanguageField("en", "bio", value)} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-gray-700 dark:text-gray-200">İş saatları</p>
                  <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addDirectorArrayItem("working_hours", blankWorkingHour)}>
                    Yeni əlavə et
                  </Button>
                </div>
                {(payload.director?.working_hours ?? []).map((item, idx) => (
                  <div key={`working-hour-${idx}`} className="grid gap-4 md:grid-cols-3 mb-3 items-end">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Gün (AZ)</Label>
                      <Input placeholder="Bazar ertəsi" value={item.az.day} onChange={(e) => updateDirectorLanguageArrayItem("working_hours", idx, "az", "day", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Day (EN)</Label>
                      <Input placeholder="Monday" value={item.en.day} onChange={(e) => updateDirectorLanguageArrayItem("working_hours", idx, "en", "day", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Saat aralığı</Label>
                      <Input placeholder="09:00-17:00" value={item.time_range} onChange={(e) => updateDirectorArrayItem("working_hours", idx, "time_range", e.target.value)} />
                    </div>
                    <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeDirectorArrayItem("working_hours", idx)}>
                      Sil
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Təhsillər</p>
                  <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addDirectorArrayItem("educations", blankEducation)}>
                    Yeni əlavə et
                  </Button>
                </div>
                {(payload.director?.educations ?? []).map((item, idx) => (
                  <div key={`education-${idx}`} className="space-y-3 mb-4 rounded-2xl border border-gray-100 dark:border-gray-800 p-3">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Diplom (AZ)</Label>
                        <Input placeholder="Bakalavr" value={item.az.degree} onChange={(e) => updateDirectorLanguageArrayItem("educations", idx, "az", "degree", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Degree (EN)</Label>
                        <Input placeholder="Bachelor" value={item.en.degree} onChange={(e) => updateDirectorLanguageArrayItem("educations", idx, "en", "degree", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Universitet (AZ)</Label>
                        <Input placeholder="AZTU" value={item.az.university} onChange={(e) => updateDirectorLanguageArrayItem("educations", idx, "az", "university", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">University (EN)</Label>
                        <Input placeholder="AZTU" value={item.en.university} onChange={(e) => updateDirectorLanguageArrayItem("educations", idx, "en", "university", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Başlama ili</Label>
                        <Input type="text" value={item.start_year} onChange={(e) => updateDirectorArrayItem("educations", idx, "start_year", e.target.value)} placeholder="2000" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bitmə ili</Label>
                        <Input type="text" value={item.end_year} onChange={(e) => updateDirectorArrayItem("educations", idx, "end_year", e.target.value)} placeholder="2004" />
                      </div>
                    </div>
                    <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeDirectorArrayItem("educations", idx)}>
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 text-sm text-gray-500 dark:text-gray-400">Direktor məlumatları əlavə edilməyib.</div>
        )}
      </div>

      {renderTranslatedArraySection("Eyni vaxtında Tədbirləri", "directions_of_action")}

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">İşçilər</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kafedra işçisi məlumatları əlavə edin.</p>
          </div>
          <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addListItem("workers", {
            first_name: "",
            last_name: "",
            father_name: "",
            email: "",
            phone: "",
            az: { duty: "", scientific_name: "", scientific_degree: "" },
            en: { duty: "", scientific_name: "", scientific_degree: "" },
          })}>
            Yeni əlavə et
          </Button>
        </div>
        <div className="p-5 space-y-4">
          {payload.workers.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Heç bir maddə yoxdur.</p>}
          {payload.workers.map((item, idx) => (
            <div key={`worker-${idx}`} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">İşçi #{idx + 1}</p>
                <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeListItem("workers", idx)}>
                  Sil
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-1">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Şəkil</Label>
                  <input type="file" onChange={(e) => setWorkerImages(prev => ({ ...prev, [idx]: e.target.files?.[0] as File }))} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {item.profile_image && !workerImages[idx] && (
                    <div className="mt-2">
                      <img src={item.profile_image} alt="Worker" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ad</Label>
                  <Input value={item.first_name} onChange={(e) => updateWorker(idx, "first_name", e.target.value)} placeholder="Ad" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Soyad</Label>
                  <Input value={item.last_name} onChange={(e) => updateWorker(idx, "last_name", e.target.value)} placeholder="Soyad" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ata adı</Label>
                  <Input value={item.father_name} onChange={(e) => updateWorker(idx, "father_name", e.target.value)} placeholder="Ata adı" />
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Email</Label>
                  <Input value={item.email} onChange={(e) => updateWorker(idx, "email", e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Telefon</Label>
                  <Input value={item.phone} onChange={(e) => updateWorker(idx, "phone", e.target.value)} placeholder="+994501234567" />
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ - Vəzifə</Label>
                  <Input value={item.az.duty} onChange={(e) => updateWorkerLanguageField(idx, "az", "duty", e.target.value)} placeholder="Müəllim" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ - Elmi ad</Label>
                  <Input value={item.az.scientific_name} onChange={(e) => updateWorkerLanguageField(idx, "az", "scientific_name", e.target.value)} placeholder="Dosent" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ - Elmi dərəcə</Label>
                  <Input value={item.az.scientific_degree} onChange={(e) => updateWorkerLanguageField(idx, "az", "scientific_degree", e.target.value)} placeholder="Fəlsəfə doktoru" />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN - Duty</Label>
                  <Input value={item.en.duty} onChange={(e) => updateWorkerLanguageField(idx, "en", "duty", e.target.value)} placeholder="Lecturer" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN - Scientific name</Label>
                  <Input value={item.en.scientific_name} onChange={(e) => updateWorkerLanguageField(idx, "en", "scientific_name", e.target.value)} placeholder="Associate Professor" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN - Scientific degree</Label>
                  <Input value={item.en.scientific_degree} onChange={(e) => updateWorkerLanguageField(idx, "en", "scientific_degree", e.target.value)} placeholder="PhD" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
          onClick={handleSave}
          disabled={saving}
          type="button"
        >
          {saving ? "Yadda saxlanılır..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
