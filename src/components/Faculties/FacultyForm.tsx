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

const blankWorkingHour: WorkingHour = { day: "", time_range: "" };
const blankScientificEvent: ScientificEvent = { event_title: "", event_description: "" };
const blankEducation: EducationItem = { degree: "", university: "", start_year: "", end_year: "" };
const blankDirector: DirectorPayload = {
  first_name: "",
  last_name: "",
  father_name: "",
  scientific_degree: "",
  scientific_title: "",
  email: "",
  phone: "",
  room_number: "",
  profile_image: "",
  working_hours: [],
  scientific_events: [],
  educations: [],
};

const blankFacultyPayload: CreateFacultyPayload = {
  az: { faculty_name: "", about_text: "" },
  en: { faculty_name: "", about_text: "" },
  director: null,
  laboratories: [],
  research_works: [],
  partner_companies: [],
  objectives: [],
  duties: [],
  projects: [],
  deputy_deans: [],
  scientific_council: [],
  workers: [],
};

const normalizeFacultyPayload = (value: any): CreateFacultyPayload => {
  if (!value) return blankFacultyPayload;

  return {
    az: {
      faculty_name: value.az?.faculty_name ?? "",
      about_text: value.az?.about_text ?? "",
    },
    en: {
      faculty_name: value.en?.faculty_name ?? "",
      about_text: value.en?.about_text ?? "",
    },
    director: value.director === null ? null : {
      first_name: value.director?.first_name ?? "",
      last_name: value.director?.last_name ?? "",
      father_name: value.director?.father_name ?? "",
      scientific_degree: value.director?.scientific_degree ?? "",
      scientific_title: value.director?.scientific_title ?? "",
      email: value.director?.email ?? "",
      phone: value.director?.phone ?? "",
      room_number: value.director?.room_number ?? "",
      profile_image: value.director?.profile_image ?? "",
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

  const changeField = (section: "az" | "en", field: keyof CreateFacultyPayload["az"] | keyof CreateFacultyPayload["en"], value: string) => {
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

  const updateListItem = <K extends keyof CreateFacultyPayload>(section: K, index: number, field: string, value: string) => {
    setPayload((prev) => {
      const list = Array.isArray(prev[section]) ? [...(prev[section] as any[])] : [];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [section]: list };
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

  const renderSimpleArraySection = (title: string, section: keyof CreateFacultyPayload, fields: string[]) => {
    const list = Array.isArray(payload[section]) ? (payload[section] as any[]) : [];
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Bir və ya bir neçə maddə əlavə edin.</p>
          </div>
          <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addListItem(section, fields.reduce((acc, field) => ({ ...acc, [field]: "" }), {}))}>
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
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={`${section}-${idx}-${field}`} className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{field.replace(/_/g, " ")}</Label>
                    <Input
                      value={item[field] ?? ""}
                      onChange={(e) => updateListItem(section, idx, field, e.target.value)}
                      placeholder={field.replace(/_/g, " ")}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    if (!payload.az.faculty_name.trim() || !payload.en.faculty_name.trim()) {
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
            <Input placeholder="Fakültə adını daxil edin" value={payload.az.faculty_name} onChange={(e) => changeField("az", "faculty_name", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Haqqında mətn</Label>
            <TextArea rows={4} placeholder="Fakültə haqqında mətn" value={payload.az.about_text ?? ""} onChange={(value) => changeField("az", "about_text", value)} />
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
            <Input placeholder="Enter faculty name" value={payload.en.faculty_name} onChange={(e) => changeField("en", "faculty_name", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">About text</Label>
            <TextArea rows={4} placeholder="Text about faculty" value={payload.en.about_text ?? ""} onChange={(value) => changeField("en", "about_text", value)} />
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
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi dərəcə</Label>
                <Input placeholder="PhD" value={payload.director?.scientific_degree ?? ""} onChange={(e) => changeDirectorField("scientific_degree", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi titul</Label>
                <Input placeholder="Professor" value={payload.director?.scientific_title ?? ""} onChange={(e) => changeDirectorField("scientific_title", e.target.value)} />
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
              <div className="lg:col-span-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Profile image</Label>
                <Input placeholder="/uploads/directors/ayaz.jpg" value={payload.director?.profile_image ?? ""} onChange={(e) => changeDirectorField("profile_image", e.target.value)} />
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
                  <div key={`working-hour-${idx}`} className="grid gap-4 md:grid-cols-2 mb-3 items-end">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Gün</Label>
                      <Input placeholder="Monday" value={item.day} onChange={(e) => updateDirectorArrayItem("working_hours", idx, "day", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Saat aralığı</Label>
                      <Input placeholder="13:00-15:00" value={item.time_range} onChange={(e) => updateDirectorArrayItem("working_hours", idx, "time_range", e.target.value)} />
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
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Tədbir adı</Label>
                        <Input placeholder="Conference 2026" value={item.event_title} onChange={(e) => updateDirectorArrayItem("scientific_events", idx, "event_title", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Təsvirdə</Label>
                        <TextArea rows={3} placeholder="National research conference" value={item.event_description} onChange={(value) => updateDirectorArrayItem("scientific_events", idx, "event_description", value)} />
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
                  <div key={`education-${idx}`} className="grid gap-4 md:grid-cols-4 mb-4 items-end">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Diplom</Label>
                      <Input value={item.degree} onChange={(e) => updateDirectorArrayItem("educations", idx, "degree", e.target.value)} placeholder="Bachelor" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Universitet</Label>
                      <Input value={item.university} onChange={(e) => updateDirectorArrayItem("educations", idx, "university", e.target.value)} placeholder="Baku State University" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Başlama ili</Label>
                      <Input value={item.start_year} onChange={(e) => updateDirectorArrayItem("educations", idx, "start_year", e.target.value)} placeholder="2000" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bitmə ili</Label>
                      <Input value={item.end_year} onChange={(e) => updateDirectorArrayItem("educations", idx, "end_year", e.target.value)} placeholder="2004" />
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

      {renderSimpleArraySection("Deputy Deans", "deputy_deans", [
        "first_name",
        "last_name",
        "father_name",
        "scientific_name",
        "scientific_degree",
        "email",
        "phone",
        "duty",
        "profile_image",
      ])}

      {renderSimpleArraySection("Scientific Council", "scientific_council", [
        "first_name",
        "last_name",
        "father_name",
        "duty",
      ])}

      {renderSimpleArraySection("Workers", "workers", [
        "first_name",
        "last_name",
        "father_name",
        "duty",
        "scientific_name",
        "scientific_degree",
        "email",
      ])}

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
