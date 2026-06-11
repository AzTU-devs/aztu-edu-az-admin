import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Editor from "../editor/Editor";
import {
  CreateDepartmentPayload,
  DepartmentWorker,
  DirectorPayload,
  EducationItem,
  WorkingHour,
  ValidationErrors,
} from "../../services/department/departmentService";

interface DepartmentFormProps {
  initialValue?: CreateDepartmentPayload | null;
  onSubmit: (
    payload: CreateDepartmentPayload,
    directorImage: File | null,
    workerImages: (File | null)[]
  ) => Promise<{ status: string; errors?: ValidationErrors; data?: unknown }>;
  submitLabel: string;
  /** On the edit page workers are managed incrementally via a SubEntityManager panel,
   *  so the big form hides the workers section and omits it from the payload to avoid
   *  the destructive bulk replace. */
  isEdit?: boolean;
}

const blankTranslatedSection = {
  department_name: "",
  about_html: "",
};

const blankHtmlItem = {
  az: { html_content: "" },
  en: { html_content: "" },
};

const blankWorkingHour: WorkingHour = {
  time_range: "",
  az: { day: "" },
  en: { day: "" },
};

const blankEducation: EducationItem = {
  start_year: "",
  end_year: "",
  az: { degree: "", university: "" },
  en: { degree: "", university: "" },
};

const blankDirector: DirectorPayload = {
  first_name: "",
  last_name: "",
  father_name: "",
  email: "",
  phone: "",
  room_number: "",
  az: {
    scientific_degree: "",
    scientific_title: "",
    bio: "",
  },
  en: {
    scientific_degree: "",
    scientific_title: "",
    bio: "",
  },
  working_hours: [],
  educations: [],
};

const blankWorker: CreateDepartmentPayload["workers"][0] = {
  first_name: "",
  last_name: "",
  father_name: "",
  email: "",
  phone: "",
  az: {
    duty: "",
    scientific_degree: "",
    scientific_name: "",
  },
  en: {
    duty: "",
    scientific_degree: "",
    scientific_name: "",
  },
};

const blankPayload: CreateDepartmentPayload = {
  az: { ...blankTranslatedSection },
  en: { ...blankTranslatedSection },
  objectives: [],
  core_functions: [],
  director: null,
  workers: [],
};

const normalizePayload = (value: CreateDepartmentPayload | null | undefined): CreateDepartmentPayload => {
  if (!value) return blankPayload;

  return {
    az: {
      department_name: value.az?.department_name ?? "",
      about_html: value.az?.about_html ?? "",
    },
    en: {
      department_name: value.en?.department_name ?? "",
      about_html: value.en?.about_html ?? "",
    },
    objectives: (Array.isArray(value.objectives) ? value.objectives : []).map((item: any) => ({
      az: { html_content: item.az?.html_content ?? "" },
      en: { html_content: item.en?.html_content ?? "" },
    })),
    core_functions: (Array.isArray(value.core_functions) ? value.core_functions : []).map((item: any) => ({
      az: { html_content: item.az?.html_content ?? "" },
      en: { html_content: item.en?.html_content ?? "" },
    })),
    director: value.director
      ? {
          first_name: value.director.first_name ?? "",
          last_name: value.director.last_name ?? "",
          father_name: value.director.father_name ?? "",
          email: value.director.email ?? "",
          phone: value.director.phone ?? "",
          room_number: value.director.room_number ?? "",
          profile_image: value.director.profile_image ?? "",
          az: {
            scientific_degree: value.director.az?.scientific_degree ?? "",
            scientific_title: value.director.az?.scientific_title ?? "",
            bio: value.director.az?.bio ?? "",
          },
          en: {
            scientific_degree: value.director.en?.scientific_degree ?? "",
            scientific_title: value.director.en?.scientific_title ?? "",
            bio: value.director.en?.bio ?? "",
          },
          working_hours: (Array.isArray(value.director.working_hours) ? value.director.working_hours : []).map((wh: any) => ({
            time_range: wh.time_range ?? "",
            az: { day: wh.az?.day ?? "" },
            en: { day: wh.en?.day ?? "" },
          })),
          educations: (Array.isArray(value.director.educations) ? value.director.educations : []).map((ed: any) => ({
            start_year: ed.start_year ?? "",
            end_year: ed.end_year ?? "",
            az: { degree: ed.az?.degree ?? "", university: ed.az?.university ?? "" },
            en: { degree: ed.en?.degree ?? "", university: ed.en?.university ?? "" },
          })),
        }
      : null,
    workers: (Array.isArray(value.workers) ? value.workers : []).map((w: any) => ({
      first_name: w.first_name ?? "",
      last_name: w.last_name ?? "",
      father_name: w.father_name ?? "",
      email: w.email ?? "",
      phone: w.phone ?? "",
      profile_image: w.profile_image ?? "",
      az: {
        duty: w.az?.duty ?? "",
        scientific_degree: w.az?.scientific_degree ?? "",
        scientific_name: w.az?.scientific_name ?? "",
      },
      en: {
        duty: w.en?.duty ?? "",
        scientific_degree: w.en?.scientific_degree ?? "",
        scientific_name: w.en?.scientific_name ?? "",
      },
    })),
  };
};

export default function DepartmentForm({ initialValue = null, onSubmit, submitLabel, isEdit = false }: DepartmentFormProps) {
  const [payload, setPayload] = useState<CreateDepartmentPayload>(normalizePayload(initialValue));
  const [useDirector, setUseDirector] = useState<boolean>(Boolean(initialValue?.director));
  const [directorImage, setDirectorImage] = useState<File | null>(null);
  const [workerImages, setWorkerImages] = useState<(File | null)[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPayload(normalizePayload(initialValue));
    setUseDirector(Boolean(initialValue?.director));
    setWorkerImages(initialValue?.workers?.map(() => null) ?? []);
  }, [initialValue]);

  const changeField = (
    section: "az" | "en",
    field: "department_name" | "about_html",
    value: string
  ) => {
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

  const handleDirectorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDirectorImage(file);
    }
  };

  const changeDirectorTranslated = (lang: "az" | "en", field: keyof DirectorPayload["az"], value: string) => {
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

  const updateTranslatedListItem = (
    section: "objectives" | "core_functions",
    index: number,
    lang: "az" | "en",
    value: string
  ) => {
    setPayload((prev) => {
      const list = [...prev[section]];
      list[index] = {
        ...list[index],
        [lang]: {
          ...list[index][lang],
          html_content: value,
        },
      };
      return { ...prev, [section]: list };
    });
  };

  const addTranslatedItem = (section: "objectives" | "core_functions") => {
    setPayload((prev) => ({
      ...prev,
      [section]: [...prev[section], { ...blankHtmlItem }],
    }));
  };

  const removeTranslatedItem = (section: "objectives" | "core_functions", index: number) => {
    setPayload((prev) => {
      const list = [...prev[section]];
      list.splice(index, 1);
      return { ...prev, [section]: list };
    });
  };

  const updateDirectorArrayItem = (
    arrayName: "working_hours" | "educations",
    index: number,
    field: string,
    value: string
  ) => {
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

  const updateDirectorTranslatedArrayItem = (
    arrayName: "working_hours" | "educations",
    index: number,
    lang: "az" | "en",
    field: string,
    value: string
  ) => {
    setPayload((prev) => {
      if (!prev.director) return prev;
      const array = [...prev.director[arrayName]];
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

  const addDirectorArrayItem = (arrayName: "working_hours" | "educations") => {
    setPayload((prev) => {
      const director = prev.director ?? { ...blankDirector };
      const initialItem = arrayName === "working_hours" ? blankWorkingHour : blankEducation;
      return {
        ...prev,
        director: {
          ...director,
          [arrayName]: [...director[arrayName], initialItem],
        } as DirectorPayload,
      };
    });
  };

  const removeDirectorArrayItem = (arrayName: "working_hours" | "educations", index: number) => {
    setPayload((prev) => {
      if (!prev.director) return prev;
      const array = [...prev.director[arrayName]];
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

  const updateWorkerField = (
    index: number,
    field: keyof CreateDepartmentPayload["workers"][0],
    value: string
  ) => {
    setPayload((prev) => {
      const workers = [...prev.workers];
      workers[index] = {
        ...workers[index],
        [field]: value,
      } as CreateDepartmentPayload["workers"][0];
      return { ...prev, workers };
    });
  };

  const handleWorkerImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWorkerImages((prev) => {
        const next = [...prev];
        next[index] = file;
        return next;
      });
    }
  };

  const updateWorkerTranslatedField = (
    index: number,
    lang: "az" | "en",
    field: keyof DepartmentWorker["az"],
    value: string
  ) => {
    setPayload((prev) => {
      const workers = [...prev.workers];
      workers[index] = {
        ...workers[index],
        [lang]: {
          ...workers[index][lang],
          [field]: value,
        },
      } as CreateDepartmentPayload["workers"][0];
      return { ...prev, workers };
    });
  };

  const addWorker = () => {
    setPayload((prev) => ({
      ...prev,
      workers: [...prev.workers, { ...blankWorker }],
    }));
    setWorkerImages((prev) => [...prev, null]);
  };

  const removeWorker = (index: number) => {
    setPayload((prev) => {
      const workers = [...prev.workers];
      workers.splice(index, 1);
      return { ...prev, workers };
    });
    setWorkerImages((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!payload.az.department_name.trim() || !payload.en.department_name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Xahiş olunur",
        text: "Hər iki dildə departament adı daxil edilməlidir.",
      });
      return;
    }

    const submitPayload: any = {
      ...payload,
      director: useDirector ? payload.director ?? blankDirector : null,
    };

    // On the edit page workers are managed incrementally via the SubEntityManager
    // panel, so never send them through the bulk update (it would delete & recreate
    // every worker, orphaning IDs and uploaded images).
    if (isEdit) {
      delete submitPayload.workers;
    }

    setSaving(true);
    const result = await onSubmit(submitPayload, directorImage, isEdit ? [] : workerImages);
    setSaving(false);

    if (result.status === "SUCCESS") {
      return;
    }

    if (result.status === "VALIDATION") {
      const firstError = result.errors ? Object.values(result.errors)[0]?.[0] ?? "Xəta baş verdi." : "Xəta baş verdi.";
      Swal.fire({ icon: "error", title: "Doğrulama xətası", text: firstError });
      return;
    }

    Swal.fire({ icon: "error", title: "Xəta", text: "Departament saxlanarkən xəta baş verdi." });
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide">AZ</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Azərbaycan</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Departament adı</Label>
            <Input
              placeholder="Departament adı"
              value={payload.az.department_name}
              onChange={(e) => changeField("az", "department_name", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Haqqında HTML</Label>
            <Editor
              initialContent={payload.az.about_html || "<p></p>"}
              onUpdate={(html) => changeField("az", "about_html", html)}
            />
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
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Department name</Label>
            <Input
              placeholder="Department name"
              value={payload.en.department_name}
              onChange={(e) => changeField("en", "department_name", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">About HTML</Label>
            <Editor
              key={`en-html-${payload.en.about_html}`}
              initialContent={payload.en.about_html || "<p></p>"}
              onUpdate={(html) => changeField("en", "about_html", html)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Məqsədlər</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hər iki dildə departament məqsədlərini əlavə edin.</p>
          </div>
          <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addTranslatedItem("objectives")}>Yeni əlavə et</Button>
        </div>
        <div className="p-5 space-y-4">
          {payload.objectives.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Hələ məqsəd əlavə edilməyib.</p>
          ) : (
            payload.objectives.map((item, index) => (
              <div key={`objective-${index}`} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Məqsəd #{index + 1}</p>
                  <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeTranslatedItem("objectives", index)}>Sil</button>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">AZ HTML</Label>
                    <Editor
                      initialContent={item.az.html_content || ""}
                      onUpdate={(html) => updateTranslatedListItem("objectives", index, "az", html)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">EN HTML</Label>
                    <Editor
                      initialContent={item.en.html_content || ""}
                      onUpdate={(html) => updateTranslatedListItem("objectives", index, "en", html)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Əsas funksiyalar</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">H hər iki dildə əsas funksiyaları əlavə edin.</p>
          </div>
          <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addTranslatedItem("core_functions")}>Yeni əlavə et</Button>
        </div>
        <div className="p-5 space-y-4">
          {payload.core_functions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Hələ əsas funksiya əlavə edilməyib.</p>
          ) : (
            payload.core_functions.map((item, index) => (
              <div key={`core-${index}`} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Funksiya #{index + 1}</p>
                  <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeTranslatedItem("core_functions", index)}>Sil</button>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">AZ HTML</Label>
                    <Editor
                      initialContent={item.az.html_content || ""}
                      onUpdate={(html) => updateTranslatedListItem("core_functions", index, "az", html)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">EN HTML</Label>
                    <Editor
                      initialContent={item.en.html_content || ""}
                      onUpdate={(html) => updateTranslatedListItem("core_functions", index, "en", html)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Direktor</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Direktor bölməsini əlavə edin və ya çıxarın.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={useDirector}
              onChange={(e) => setUseDirector(e.target.checked)}
              className="form-checkbox h-4 w-4 text-brand-600 rounded border-gray-300 dark:border-gray-700"
            />
            Aktivdir
          </label>
        </div>
        {useDirector ? (
          <div className="p-5 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ad</Label>
                <Input
                  placeholder="Ad"
                  value={payload.director?.first_name ?? ""}
                  onChange={(e) => changeDirectorField("first_name", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Soyad</Label>
                <Input
                  placeholder="Soyad"
                  value={payload.director?.last_name ?? ""}
                  onChange={(e) => changeDirectorField("last_name", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ata adı</Label>
                <Input
                  placeholder="Ata adı"
                  value={payload.director?.father_name ?? ""}
                  onChange={(e) => changeDirectorField("father_name", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ofis nömrəsi</Label>
                <Input
                  placeholder="1-202"
                  value={payload.director?.room_number ?? ""}
                  onChange={(e) => changeDirectorField("room_number", e.target.value)}
                />
              </div>
              <div className="lg:col-span-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Profil şəkli</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDirectorImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                />
                {directorImage && <p className="mt-1 text-xs text-green-600">Seçildi: {directorImage.name}</p>}
                {payload.director?.profile_image && !directorImage && (
                  <p className="mt-1 text-xs text-gray-500">Cari şəkil: {payload.director.profile_image}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi dərəcə (AZ)</Label>
                <Input
                  placeholder="f.e.d."
                  value={payload.director?.az.scientific_degree ?? ""}
                  onChange={(e) => changeDirectorTranslated("az", "scientific_degree", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi titul (AZ)</Label>
                <Input
                  placeholder="dosent"
                  value={payload.director?.az.scientific_title ?? ""}
                  onChange={(e) => changeDirectorTranslated("az", "scientific_title", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi dərəcə (EN)</Label>
                <Input
                  placeholder="PhD"
                  value={payload.director?.en.scientific_degree ?? ""}
                  onChange={(e) => changeDirectorTranslated("en", "scientific_degree", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi titul (EN)</Label>
                <Input
                  placeholder="Associate Professor"
                  value={payload.director?.en.scientific_title ?? ""}
                  onChange={(e) => changeDirectorTranslated("en", "scientific_title", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bio (AZ)</Label>
                <Editor
                  initialContent={payload.director?.az.bio ?? "<p></p>"}
                  onUpdate={(html) => changeDirectorTranslated("az", "bio", html)}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bio (EN)</Label>
                <Editor
                  initialContent={payload.director?.en.bio ?? "<p></p>"}
                  onUpdate={(html) => changeDirectorTranslated("en", "bio", html)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-gray-700 dark:text-gray-200">İş saatları</p>
                  <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addDirectorArrayItem("working_hours")}>Yeni əlavə et</Button>
                </div>
                {(payload.director?.working_hours ?? []).length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hələ iş saatları əlavə edilməyib.</p>
                ) : (
                  payload.director?.working_hours.map((item, index) => (
                    <div key={`working-${index}`} className="grid gap-4 lg:grid-cols-3 items-end">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Saat aralığı</Label>
                        <Input
                          placeholder="09:00-13:00"
                          value={item.time_range}
                          onChange={(e) => updateDirectorArrayItem("working_hours", index, "time_range", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Gün (AZ)</Label>
                        <Input
                          placeholder="Bazar ertəsi"
                          value={item.az.day}
                          onChange={(e) => updateDirectorTranslatedArrayItem("working_hours", index, "az", "day", e.target.value)}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Gün (EN)</Label>
                          <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeDirectorArrayItem("working_hours", index)}>Sil</button>
                        </div>
                        <Input
                          placeholder="Monday"
                          value={item.en.day}
                          onChange={(e) => updateDirectorTranslatedArrayItem("working_hours", index, "en", "day", e.target.value)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Təhsil</p>
                  <Button type="button" className="px-3 py-1.5 text-sm" onClick={() => addDirectorArrayItem("educations")}>Yeni əlavə et</Button>
                </div>
                {(payload.director?.educations ?? []).length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hələ təhsil məlumatı əlavə edilməyib.</p>
                ) : (
                  payload.director?.educations.map((item, index) => (
                    <div key={`edu-${index}`} className="grid gap-4 lg:grid-cols-3">
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Başlama ili</Label>
                        <Input
                          placeholder="2000"
                          value={item.start_year}
                          onChange={(e) => updateDirectorArrayItem("educations", index, "start_year", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bitmə ili</Label>
                        <Input
                          placeholder="2005"
                          value={item.end_year}
                          onChange={(e) => updateDirectorArrayItem("educations", index, "end_year", e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Dərəcə (AZ)</Label>
                            <Input
                              placeholder="Bakalavr"
                              value={item.az.degree}
                              onChange={(e) => updateDirectorTranslatedArrayItem("educations", index, "az", "degree", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Universitet (AZ)</Label>
                            <Input
                              placeholder="AzTU"
                              value={item.az.university}
                              onChange={(e) => updateDirectorTranslatedArrayItem("educations", index, "az", "university", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Degree (EN)</Label>
                            <Input
                              placeholder="Bachelor"
                              value={item.en.degree}
                              onChange={(e) => updateDirectorTranslatedArrayItem("educations", index, "en", "degree", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">University (EN)</Label>
                            <Input
                              placeholder="AzTU"
                              value={item.en.university}
                              onChange={(e) => updateDirectorTranslatedArrayItem("educations", index, "en", "university", e.target.value)}
                            />
                          </div>
                        </div>
                        <button type="button" className="self-end text-sm text-red-500 hover:underline" onClick={() => removeDirectorArrayItem("educations", index)}>
                          Sil
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 text-sm text-gray-500 dark:text-gray-400">Direktor əlavə etmək üçün aktiv edin.</div>
        )}
      </div>

      {!isEdit && (
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">İşçilər</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">İşçi kartları əlavə edin.</p>
          </div>
          <Button type="button" className="px-3 py-1.5 text-sm" onClick={addWorker}>Yeni əlavə et</Button>
        </div>
        <div className="p-5 space-y-4">
          {payload.workers.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Hələ işçi əlavə edilməyib.</p>
          ) : (
            payload.workers.map((worker, index) => (
              <div key={`worker-${index}`} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">İşçi #{index + 1}</p>
                  <button type="button" className="text-sm text-red-500 hover:underline" onClick={() => removeWorker(index)}>Sil</button>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ad</Label>
                    <Input value={worker.first_name} onChange={(e) => updateWorkerField(index, "first_name", e.target.value)} placeholder="Ad" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Soyad</Label>
                    <Input value={worker.last_name} onChange={(e) => updateWorkerField(index, "last_name", e.target.value)} placeholder="Soyad" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Ata adı</Label>
                    <Input value={worker.father_name ?? ""} onChange={(e) => updateWorkerField(index, "father_name", e.target.value)} placeholder="Ata adı" />
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Email</Label>
                    <Input type="email" value={worker.email ?? ""} onChange={(e) => updateWorkerField(index, "email", e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Telefon</Label>
                    <Input value={worker.phone ?? ""} onChange={(e) => updateWorkerField(index, "phone", e.target.value)} placeholder="+994501234567" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Vəzifə (AZ)</Label>
                    <Input value={worker.az.duty} onChange={(e) => updateWorkerTranslatedField(index, "az", "duty", e.target.value)} placeholder="Vəzifə" />
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi dərəcə (AZ)</Label>
                    <Input value={worker.az.scientific_degree ?? ""} onChange={(e) => updateWorkerTranslatedField(index, "az", "scientific_degree", e.target.value)} placeholder="PhD" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi ad (AZ)</Label>
                    <Input value={worker.az.scientific_name ?? ""} onChange={(e) => updateWorkerTranslatedField(index, "az", "scientific_name", e.target.value)} placeholder="Professor" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Duty (EN)</Label>
                    <Input value={worker.en.duty} onChange={(e) => updateWorkerTranslatedField(index, "en", "duty", e.target.value)} placeholder="Duty" />
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Scientific degree (EN)</Label>
                    <Input value={worker.en.scientific_degree ?? ""} onChange={(e) => updateWorkerTranslatedField(index, "en", "scientific_degree", e.target.value)} placeholder="PhD" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Scientific name (EN)</Label>
                    <Input value={worker.en.scientific_name ?? ""} onChange={(e) => updateWorkerTranslatedField(index, "en", "scientific_name", e.target.value)} placeholder="Professor" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Profil şəkli</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleWorkerImageChange(index, e)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                  />
                  {workerImages[index] && <p className="mt-1 text-xs text-green-600">Seçildi: {workerImages[index].name}</p>}
                  {worker.profile_image && !workerImages[index] && (
                    <p className="mt-1 text-xs text-gray-500">Cari şəkil: {worker.profile_image}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Saxlanır..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
