import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import {
  CreateFacultyPayload,
  DirectorPayload,
  TranslatedTextItem,
  WorkingHour,
  ScientificEvent,
  EducationItem,
} from "../../services/faculty/facultyService";

interface FacultyFormProps {
  initialValue?: CreateFacultyPayload | null;
  onSubmit: (payload: CreateFacultyPayload) => Promise<string>;
  submitLabel: string;
}

const blankTranslatedItem: TranslatedTextItem = {
  az: { title: "", description: "" },
  en: { title: "", description: "" },
};

const blankWorkingHour: WorkingHour = { az: { day: "" }, en: { day: "" }, time_range: "" };
const blankScientificEvent: ScientificEvent = { az: { event_title: "", event_description: "" }, en: { event_title: "", event_description: "" } };
const blankEducation: EducationItem = { az: { degree: "", university: "" }, en: { degree: "", university: "" }, start_year: "", end_year: "" };
const blankDirector: DirectorPayload = {
  first_name: "",
  last_name: "",
  father_name: "",
  az: { scientific_degree: "", scientific_title: "", bio: "" },
  en: { scientific_degree: "", scientific_title: "", bio: "" },
  email: "",
  phone: "",
  room_number: "",
  working_hours: [],
  scientific_events: [],
  educations: [],
};

const blankFacultyPayload: CreateFacultyPayload = {
  az: { title: "", html_content: "" },
  en: { title: "", html_content: "" },
  director: null,
  laboratories: [],
  research_works: [],
  partner_companies: [],
  objectives: [],
  duties: [],
  projects: [],
  directions_of_action: [],
  deputy_deans: [],
  scientific_council: [],
  workers: [],
};

const normalizeFacultyPayload = (value: any): CreateFacultyPayload => {
  if (!value) return blankFacultyPayload;

  return {
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
      },
      en: {
        scientific_degree: value.director?.en?.scientific_degree ?? "",
        scientific_title: value.director?.en?.scientific_title ?? "",
        bio: value.director?.en?.bio ?? "",
      },
      email: value.director?.email ?? "",
      phone: value.director?.phone ?? "",
      room_number: value.director?.room_number ?? "",
      working_hours: Array.isArray(value.director?.working_hours) ? value.director.working_hours : [],
      scientific_events: Array.isArray(value.director?.scientific_events) ? value.director.scientific_events : [],
      educations: Array.isArray(value.director?.educations) ? value.director.educations : [],
    },
    laboratories: Array.isArray(value.laboratories) ? value.laboratories : [],
    research_works: Array.isArray(value.research_works) ? value.research_works : [],
    partner_companies: Array.isArray(value.partner_companies) ? value.partner_companies : [],
    objectives: Array.isArray(value.objectives) ? value.objectives : [],
    duties: Array.isArray(value.duties) ? value.duties : [],
    projects: Array.isArray(value.projects) ? value.projects : [],
    directions_of_action: Array.isArray(value.directions_of_action) ? value.directions_of_action : [],
    deputy_deans: Array.isArray(value.deputy_deans) ? value.deputy_deans : [],
    scientific_council: Array.isArray(value.scientific_council) ? value.scientific_council : [],
    workers: Array.isArray(value.workers) ? value.workers : [],
  };
};

export default function FacultyForm({ initialValue = null, onSubmit, submitLabel }: FacultyFormProps) {
  const [payload, setPayload] = useState<CreateFacultyPayload>(normalizeFacultyPayload(initialValue));
  const [useDirector, setUseDirector] = useState<boolean>(Boolean(initialValue?.director));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPayload(initialValue ?? blankFacultyPayload);
    setUseDirector(Boolean(initialValue?.director));
  }, [initialValue]);

  const changeField = (section: "az" | "en", field: "title" | "html_content", value: string) => {
    setPayload((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
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

  const updateDeputyDean = (index: number, field: string, value: string) => {
    setPayload((prev) => {
      const list = [...prev.deputy_deans];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, deputy_deans: list };
    });
  };

  const updateDeputyDeanLanguageField = (index: number, lang: "az" | "en", field: string, value: string) => {
    setPayload((prev) => {
      const list = [...prev.deputy_deans];
      list[index] = {
        ...list[index],
        [lang]: {
          ...list[index][lang],
          [field]: value,
        },
      };
      return { ...prev, deputy_deans: list };
    });
  };

  const updateScientificCouncilMember = (index: number, field: string, value: string) => {
    setPayload((prev) => {
      const list = [...prev.scientific_council];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, scientific_council: list };
    });
  };

  const updateScientificCouncilLanguageField = (index: number, lang: "az" | "en", field: string, value: string) => {
    setPayload((prev) => {
      const list = [...prev.scientific_council];
      list[index] = {
        ...list[index],
        [lang]: {
          ...list[index][lang],
          [field]: value,
        },
      };
      return { ...prev, scientific_council: list };
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

  const updateTranslatedListItem = (section: keyof CreateFacultyPayload, index: number, lang: "az" | "en", field: string, value: string) => {
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

  const addListItem = <K extends keyof CreateFacultyPayload>(section: K, item: any) => {
    setPayload((prev) => {
      const current = Array.isArray(prev[section]) ? [...(prev[section] as any[])] : [];
      return {
        ...prev,
        [section]: [...current, item],
      };
    });
  };

  const removeListItem = <K extends keyof CreateFacultyPayload>(section: K, index: number) => {
    setPayload((prev) => {
      const list = Array.isArray(prev[section]) ? [...(prev[section] as any[])] : [];
      list.splice(index, 1);
      return { ...prev, [section]: list };
    });
  };

  const renderTranslatedArraySection = (title: string, section: keyof CreateFacultyPayload) => {
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
    if (!payload.az.title.trim() || !payload.en.title.trim()) {
      Swal.fire({ icon: "warning", title: "Xahiş olunur", text: "Fakültə adı hər iki dildə tələb olunur." });
      return;
    }

    setSaving(true);

    const payloadToSend: CreateFacultyPayload = {
      ...payload,
      director: useDirector ? payload.director ?? blankDirector : null,
    };

    const result = await onSubmit(payloadToSend);
    setSaving(false);

    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Fakültə qeyd edərkən səhv baş verdi." });
    }
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide">AZ</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Azərbaycan dili</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Fakültə adı</Label>
            <Input placeholder="Fakültə adını daxil edin" value={payload.az.title} onChange={(e) => changeField("az", "title", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">HTML mətn</Label>
            <TextArea rows={4} placeholder="Fakültə haqqında HTML mətn" value={payload.az.html_content ?? ""} onChange={(value) => changeField("az", "html_content", value)} />
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
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Faculty name</Label>
            <Input placeholder="Enter faculty name" value={payload.en.title} onChange={(e) => changeField("en", "title", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">HTML content</Label>
            <TextArea rows={4} placeholder="HTML text about faculty" value={payload.en.html_content ?? ""} onChange={(value) => changeField("en", "html_content", value)} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Director</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Direktor məlumatları və əlaqəli sahələr.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={useDirector} onChange={(e) => setUseDirector(e.target.checked)} className="form-checkbox h-4 w-4 text-brand-600 rounded border-gray-300 dark:border-gray-700" />
            Aktivdir
          </label>
        </div>
        {useDirector ? (
          <div className="p-5 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
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
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bioqrafiya</Label>
                <TextArea rows={4} placeholder="Direktor haqqında mətn" value={payload.director?.az.bio ?? ""} onChange={(value) => changeDirectorLanguageField("az", "bio", value)} />
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
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Elmi tədbirlər</p>
                  <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addDirectorArrayItem("scientific_events", blankScientificEvent)}>
                    Yeni əlavə et
                  </Button>
                </div>
                {(payload.director?.scientific_events ?? []).map((item, idx) => (
                  <div key={`scientific-event-${idx}`} className="space-y-3 mb-4 rounded-2xl border border-gray-100 dark:border-gray-800 p-3">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Tədbir adı (AZ)</Label>
                        <Input placeholder="Konfrans" value={item.az.event_title} onChange={(e) => updateDirectorLanguageArrayItem("scientific_events", idx, "az", "event_title", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Event title (EN)</Label>
                        <Input placeholder="Conference" value={item.en.event_title} onChange={(e) => updateDirectorLanguageArrayItem("scientific_events", idx, "en", "event_title", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Təsvir (AZ)</Label>
                        <TextArea rows={2} placeholder="Tədbir haqqında..." value={item.az.event_description} onChange={(value) => updateDirectorLanguageArrayItem("scientific_events", idx, "az", "event_description", value)} />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Description (EN)</Label>
                        <TextArea rows={2} placeholder="About event..." value={item.en.event_description} onChange={(value) => updateDirectorLanguageArrayItem("scientific_events", idx, "en", "event_description", value)} />
                      </div>
                    </div>
                    <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeDirectorArrayItem("scientific_events", idx)}>
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

      {renderTranslatedArraySection("Laboratoriyalar", "laboratories")}
      {renderTranslatedArraySection("Tədqiqat işləri", "research_works")}
      {renderTranslatedArraySection("Tərəfdaş şirkətlər", "partner_companies")}
      {renderTranslatedArraySection("Məqsədlər", "objectives")}
      {renderTranslatedArraySection("Vəzifələr", "duties")}
      {renderTranslatedArraySection("Layihələr", "projects")}
      {renderTranslatedArraySection("Eyni vaxtında Tədbirləri", "directions_of_action")}

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Dekan Müavinləri</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dekan müavini məlumatları əlavə edin.</p>
          </div>
          <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addListItem("deputy_deans", {
            first_name: "",
            last_name: "",
            father_name: "",
            email: "",
            phone: "",
            az: { scientific_name: "", scientific_degree: "", duty: "" },
            en: { scientific_name: "", scientific_degree: "", duty: "" },
          })}>
            Yeni əlavə et
          </Button>
        </div>
        <div className="p-5 space-y-4">
          {payload.deputy_deans.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Heç bir maddə yoxdur.</p>}
          {payload.deputy_deans.map((item, idx) => (
            <div key={`deputy-${idx}`} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Dekan Müavini #{idx + 1}</p>
                <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeListItem("deputy_deans", idx)}>
                  Sil
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ad</Label>
                  <Input value={item.first_name} onChange={(e) => updateDeputyDean(idx, "first_name", e.target.value)} placeholder="Ad" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Soyad</Label>
                  <Input value={item.last_name} onChange={(e) => updateDeputyDean(idx, "last_name", e.target.value)} placeholder="Soyad" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ata adı</Label>
                  <Input value={item.father_name} onChange={(e) => updateDeputyDean(idx, "father_name", e.target.value)} placeholder="Ata adı" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Email</Label>
                  <Input value={item.email} onChange={(e) => updateDeputyDean(idx, "email", e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Telefon</Label>
                  <Input value={item.phone} onChange={(e) => updateDeputyDean(idx, "phone", e.target.value)} placeholder="+994501234567" />
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ - Elmi ad</Label>
                  <Input value={item.az.scientific_name} onChange={(e) => updateDeputyDeanLanguageField(idx, "az", "scientific_name", e.target.value)} placeholder="Dosent" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ - Elmi dərəcə</Label>
                  <Input value={item.az.scientific_degree} onChange={(e) => updateDeputyDeanLanguageField(idx, "az", "scientific_degree", e.target.value)} placeholder="Fəlsəfə doktoru" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">AZ - Vəzifə</Label>
                  <Input value={item.az.duty} onChange={(e) => updateDeputyDeanLanguageField(idx, "az", "duty", e.target.value)} placeholder="Tədris işləri müavini" />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN - Scientific name</Label>
                  <Input value={item.en.scientific_name} onChange={(e) => updateDeputyDeanLanguageField(idx, "en", "scientific_name", e.target.value)} placeholder="Associate Professor" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN - Scientific degree</Label>
                  <Input value={item.en.scientific_degree} onChange={(e) => updateDeputyDeanLanguageField(idx, "en", "scientific_degree", e.target.value)} placeholder="PhD" />
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">EN - Duty</Label>
                  <Input value={item.en.duty} onChange={(e) => updateDeputyDeanLanguageField(idx, "en", "duty", e.target.value)} placeholder="Vice Dean for Academic Affairs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Elmi Şura Üzvləri</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Elmi şura üzvü məlumatları əlavə edin.</p>
          </div>
          <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addListItem("scientific_council", {
            first_name: "",
            last_name: "",
            father_name: "",
            az: { duty: "" },
            en: { duty: "" },
          })}>
            Yeni əlavə et
          </Button>
        </div>
        <div className="p-5 space-y-4">
          {payload.scientific_council.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Heç bir maddə yoxdur.</p>}
          {payload.scientific_council.map((item, idx) => (
            <div key={`council-${idx}`} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Şura Üzvü #{idx + 1}</p>
                <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeListItem("scientific_council", idx)}>
                  Sil
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ad</Label>
                  <Input value={item.first_name} onChange={(e) => updateScientificCouncilMember(idx, "first_name", e.target.value)} placeholder="Ad" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Soyad</Label>
                  <Input value={item.last_name} onChange={(e) => updateScientificCouncilMember(idx, "last_name", e.target.value)} placeholder="Soyad" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ata adı</Label>
                  <Input value={item.father_name} onChange={(e) => updateScientificCouncilMember(idx, "father_name", e.target.value)} placeholder="Ata adı" />
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">AZ - Vəzifə</Label>
                  <Input value={item.az.duty} onChange={(e) => updateScientificCouncilLanguageField(idx, "az", "duty", e.target.value)} placeholder="Elmi katib" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">EN - Duty</Label>
                  <Input value={item.en.duty} onChange={(e) => updateScientificCouncilLanguageField(idx, "en", "duty", e.target.value)} placeholder="Scientific Secretary" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">İşçilər</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fakültə işçisi məlumatları əlavə edin.</p>
          </div>
          <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addListItem("workers", {
            first_name: "",
            last_name: "",
            father_name: "",
            email: "",
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
