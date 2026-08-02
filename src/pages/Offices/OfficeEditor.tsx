import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import Swal from "sweetalert2";

import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import RichTextField from "../../components/Cafedras/form/fields/RichTextField";
import { getImageUrl } from "../../util/imageUrl";
import {
  deleteOffice,
  getOffice,
  publishOffice,
  updateOffice,
  uploadOfficeImage,
  type OfficeDetail,
} from "../../services/office/officeService";

type Lang = "az" | "en";
interface Bilingual {
  az: string;
  en: string;
}

interface FunctionForm {
  title: Bilingual;
  description: Bilingual;
}
interface EducationForm {
  start_year: string;
  end_year: string;
  degree: Bilingual;
  university: Bilingual;
}
interface StaffForm {
  phone: string;
  phone_code: string;
  email: string;
  image_url: string;
  name: Bilingual;
  surname: Bilingual;
  duty: Bilingual;
}

interface OfficeForm {
  // Language-neutral contact facts.
  director_phone: string;
  director_phone_code: string;
  director_email: string;
  director_image_url: string;
  contact_phone: string;
  contact_phone_code: string;
  contact_email: string;
  // Bilingual text.
  name: Bilingual;
  short_description: Bilingual;
  about_title: Bilingual;
  about_text: Bilingual;
  goal_title: Bilingual;
  goals: Bilingual; // one goal per line
  functions_title: Bilingual;
  director_title: Bilingual;
  director_name: Bilingual;
  director_surname: Bilingual;
  director_position: Bilingual;
  director_bio: Bilingual;
  director_room: Bilingual;
  director_work_hours: Bilingual;
  staff_title: Bilingual;
  contact_room: Bilingual;
  contact_work_hours: Bilingual;
  functions: FunctionForm[];
  educations: EducationForm[];
  staff: StaffForm[];
}

const str = (v: string | null | undefined) => v ?? "";
const bi = (a: string | null | undefined, b: string | null | undefined): Bilingual => ({
  az: str(a),
  en: str(b),
});
const linesOf = (values: string[] | null | undefined) => (values ?? []).join("\n");
const toLines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

const emptyFunction = (): FunctionForm => ({ title: { az: "", en: "" }, description: { az: "", en: "" } });
const emptyEducation = (): EducationForm => ({
  start_year: "",
  end_year: "",
  degree: { az: "", en: "" },
  university: { az: "", en: "" },
});
const emptyStaff = (): StaffForm => ({
  phone: "",
  phone_code: "",
  email: "",
  image_url: "",
  name: { az: "", en: "" },
  surname: { az: "", en: "" },
  duty: { az: "", en: "" },
});

const toForm = (o: OfficeDetail): OfficeForm => ({
  director_phone: str(o.director_phone),
  director_phone_code: str(o.director_phone_code),
  director_email: str(o.director_email),
  director_image_url: str(o.director_image_url),
  contact_phone: str(o.contact_phone),
  contact_phone_code: str(o.contact_phone_code),
  contact_email: str(o.contact_email),
  name: bi(o.az?.name, o.en?.name),
  short_description: bi(o.az?.short_description, o.en?.short_description),
  about_title: bi(o.az?.about_title, o.en?.about_title),
  about_text: bi(o.az?.about_text, o.en?.about_text),
  goal_title: bi(o.az?.goal_title, o.en?.goal_title),
  goals: { az: linesOf(o.az?.goals), en: linesOf(o.en?.goals) },
  functions_title: bi(o.az?.functions_title, o.en?.functions_title),
  director_title: bi(o.az?.director_title, o.en?.director_title),
  director_name: bi(o.az?.director_name, o.en?.director_name),
  director_surname: bi(o.az?.director_surname, o.en?.director_surname),
  director_position: bi(o.az?.director_position, o.en?.director_position),
  director_bio: bi(o.az?.director_bio, o.en?.director_bio),
  director_room: bi(o.az?.director_room, o.en?.director_room),
  director_work_hours: bi(o.az?.director_work_hours, o.en?.director_work_hours),
  staff_title: bi(o.az?.staff_title, o.en?.staff_title),
  contact_room: bi(o.az?.contact_room, o.en?.contact_room),
  contact_work_hours: bi(o.az?.contact_work_hours, o.en?.contact_work_hours),
  functions: o.functions.map((f) => ({
    title: bi(f.az?.title, f.en?.title),
    description: bi(f.az?.description, f.en?.description),
  })),
  educations: o.educations.map((e) => ({
    start_year: str(e.start_year),
    end_year: str(e.end_year),
    degree: bi(e.az?.degree, e.en?.degree),
    university: bi(e.az?.university, e.en?.university),
  })),
  staff: o.staff.map((s) => ({
    phone: str(s.phone),
    phone_code: str(s.phone_code),
    email: str(s.email),
    image_url: str(s.image_url),
    name: bi(s.az?.name, s.en?.name),
    surname: bi(s.az?.surname, s.en?.surname),
    duty: bi(s.az?.duty, s.en?.duty),
  })),
});

const LANGS: { code: Lang; label: string }[] = [
  { code: "az", label: "Azərbaycanca" },
  { code: "en", label: "English" },
];

// Bilingual scalar tr fields edited with a plain Input.
type BiField =
  | "name"
  | "about_title"
  | "goal_title"
  | "functions_title"
  | "director_title"
  | "director_name"
  | "director_surname"
  | "director_position"
  | "director_room"
  | "director_work_hours"
  | "staff_title"
  | "contact_room"
  | "contact_work_hours";
type RichField = "short_description" | "about_text" | "director_bio";
type NeutralField =
  | "director_phone"
  | "director_phone_code"
  | "director_email"
  | "director_image_url"
  | "contact_phone"
  | "contact_phone_code"
  | "contact_email";

export default function OfficeEditor() {
  const { office_id: officeId = "" } = useParams();
  const navigate = useNavigate();

  const [office, setOffice] = useState<OfficeDetail | null>(null);
  const [form, setForm] = useState<OfficeForm | null>(null);
  const [lang, setLang] = useState<Lang>("az");
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getOffice(officeId);
    if (result === "ERROR" || result === "NOT FOUND") {
      setMissing(result === "NOT FOUND");
      setOffice(null);
      setForm(null);
    } else {
      setMissing(false);
      setOffice(result);
      setForm(toForm(result));
      setFormKey((k) => k + 1);
    }
    setLoading(false);
  }, [officeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setBi = (field: BiField | RichField, value: string) =>
    setForm((prev) => (prev ? { ...prev, [field]: { ...prev[field], [lang]: value } } : prev));

  const setNeutral = (field: NeutralField, value: string) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const setGoals = (value: string) =>
    setForm((prev) => (prev ? { ...prev, goals: { ...prev.goals, [lang]: value } } : prev));

  // ── Core functions ──────────────────────────────────────────────────────
  const setFunction = (i: number, field: "title" | "description", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            functions: prev.functions.map((f, idx) =>
              idx === i ? { ...f, [field]: { ...f[field], [lang]: value } } : f
            ),
          }
        : prev
    );
  const addFunction = () =>
    setForm((prev) => (prev ? { ...prev, functions: [...prev.functions, emptyFunction()] } : prev));
  const removeFunction = (i: number) =>
    setForm((prev) => (prev ? { ...prev, functions: prev.functions.filter((_, idx) => idx !== i) } : prev));
  const moveFunction = (i: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const t = i + delta;
      if (t < 0 || t >= prev.functions.length) return prev;
      const functions = [...prev.functions];
      [functions[i], functions[t]] = [functions[t], functions[i]];
      return { ...prev, functions };
    });

  // ── Director education ──────────────────────────────────────────────────
  const setEducationYear = (i: number, field: "start_year" | "end_year", value: string) =>
    setForm((prev) =>
      prev
        ? { ...prev, educations: prev.educations.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)) }
        : prev
    );
  const setEducationTr = (i: number, field: "degree" | "university", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            educations: prev.educations.map((e, idx) =>
              idx === i ? { ...e, [field]: { ...e[field], [lang]: value } } : e
            ),
          }
        : prev
    );
  const addEducation = () =>
    setForm((prev) => (prev ? { ...prev, educations: [...prev.educations, emptyEducation()] } : prev));
  const removeEducation = (i: number) =>
    setForm((prev) => (prev ? { ...prev, educations: prev.educations.filter((_, idx) => idx !== i) } : prev));
  const moveEducation = (i: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const t = i + delta;
      if (t < 0 || t >= prev.educations.length) return prev;
      const educations = [...prev.educations];
      [educations[i], educations[t]] = [educations[t], educations[i]];
      return { ...prev, educations };
    });

  // ── Staff ───────────────────────────────────────────────────────────────
  const setStaffField = (i: number, field: "phone" | "phone_code" | "email" | "image_url", value: string) =>
    setForm((prev) =>
      prev ? { ...prev, staff: prev.staff.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)) } : prev
    );
  const setStaffTr = (i: number, field: "name" | "surname" | "duty", value: string) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            staff: prev.staff.map((s, idx) =>
              idx === i ? { ...s, [field]: { ...s[field], [lang]: value } } : s
            ),
          }
        : prev
    );
  const addStaff = () => setForm((prev) => (prev ? { ...prev, staff: [...prev.staff, emptyStaff()] } : prev));
  const removeStaff = (i: number) =>
    setForm((prev) => (prev ? { ...prev, staff: prev.staff.filter((_, idx) => idx !== i) } : prev));
  const moveStaff = (i: number, delta: number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const t = i + delta;
      if (t < 0 || t >= prev.staff.length) return prev;
      const staff = [...prev.staff];
      [staff[i], staff[t]] = [staff[t], staff[i]];
      return { ...prev, staff };
    });

  const handleImageUpload = async (file: File | null, onDone: (path: string) => void) => {
    if (!file) return;
    setSaving(true);
    try {
      const result = await uploadOfficeImage(officeId, file);
      if (result.status !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Şəkil yüklənmədi." });
        return;
      }
      onDone(result.path);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const result = await updateOffice(officeId, {
        director_phone: form.director_phone,
        director_phone_code: form.director_phone_code,
        director_email: form.director_email,
        director_image_url: form.director_image_url,
        contact_phone: form.contact_phone,
        contact_phone_code: form.contact_phone_code,
        contact_email: form.contact_email,
        az: {
          name: form.name.az,
          short_description: form.short_description.az,
          about_title: form.about_title.az,
          about_text: form.about_text.az,
          goal_title: form.goal_title.az,
          goals: toLines(form.goals.az),
          functions_title: form.functions_title.az,
          director_title: form.director_title.az,
          director_name: form.director_name.az,
          director_surname: form.director_surname.az,
          director_position: form.director_position.az,
          director_bio: form.director_bio.az,
          director_room: form.director_room.az,
          director_work_hours: form.director_work_hours.az,
          staff_title: form.staff_title.az,
          contact_room: form.contact_room.az,
          contact_work_hours: form.contact_work_hours.az,
        },
        en: {
          name: form.name.en,
          short_description: form.short_description.en,
          about_title: form.about_title.en,
          about_text: form.about_text.en,
          goal_title: form.goal_title.en,
          goals: toLines(form.goals.en),
          functions_title: form.functions_title.en,
          director_title: form.director_title.en,
          director_name: form.director_name.en,
          director_surname: form.director_surname.en,
          director_position: form.director_position.en,
          director_bio: form.director_bio.en,
          director_room: form.director_room.en,
          director_work_hours: form.director_work_hours.en,
          staff_title: form.staff_title.en,
          contact_room: form.contact_room.en,
          contact_work_hours: form.contact_work_hours.en,
        },
        functions: form.functions
          .filter((f) => f.title.az.trim() || f.title.en.trim() || f.description.az.trim() || f.description.en.trim())
          .map((f) => ({
            az: { title: f.title.az, description: f.description.az },
            en: { title: f.title.en, description: f.description.en },
          })),
        educations: form.educations
          .filter(
            (e) =>
              e.degree.az.trim() || e.degree.en.trim() || e.university.az.trim() || e.university.en.trim() || e.start_year.trim()
          )
          .map((e) => ({
            start_year: e.start_year,
            end_year: e.end_year,
            az: { degree: e.degree.az, university: e.university.az },
            en: { degree: e.degree.en, university: e.university.en },
          })),
        staff: form.staff
          .filter((s) => s.name.az.trim() || s.name.en.trim() || s.surname.az.trim() || s.surname.en.trim() || s.image_url.trim())
          .map((s) => ({
            phone: s.phone,
            phone_code: s.phone_code,
            email: s.email,
            image_url: s.image_url,
            az: { name: s.name.az, surname: s.surname.az, duty: s.duty.az },
            en: { name: s.name.en, surname: s.surname.en, duty: s.duty.en },
          })),
      });
      if (result !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Dəyişikliklər saxlanmadı." });
        return;
      }
      Swal.fire({ icon: "success", title: "Yadda saxlanıldı", showConfirmButton: false, timer: 1200 });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!office) return;
    const next = !office.is_active;
    if (!next) {
      const confirm = await Swal.fire({
        title: "Dərcdən çıxarmaq?",
        text: "Ofis saytda görünməyəcək.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Bəli",
        cancelButtonText: "İmtina",
        reverseButtons: true,
      });
      if (!confirm.isConfirmed) return;
    }
    const result = await publishOffice(officeId, next);
    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Əməliyyat alınmadı." });
      return;
    }
    await load();
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: "Ofis/mərkəzi silmək?",
      text: "Bu ofis birdəfəlik silinəcək.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;
    const result = await deleteOffice(officeId);
    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Silinmədi." });
      return;
    }
    navigate("/offices");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (!office || !form) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="font-medium text-gray-700 dark:text-gray-200">
          {missing ? "Ofis tapılmadı." : "Ofis yüklənə bilmədi."}
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Button size="sm" variant="outline" onClick={() => void load()}>
            Yenidən cəhd et
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/offices")}>
            Siyahıya qayıt
          </Button>
        </div>
      </div>
    );
  }

  const title = form.name.az || form.name.en || `#${office.id}`;
  const textareaCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  return (
    <>
      <PageMeta title={`${title} | AzTU Admin`} description="Ofis və Mərkəzlər" />
      <PageBreadcrumb pageTitle={title} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              office.is_active
                ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {office.is_active ? "Dərc olunub" : "Qaralama"}
          </span>
          <span className="text-xs text-gray-400">/{lang === "az" ? office.slug_az : office.slug_en}</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void handleDelete()} className="text-sm text-red-500 hover:text-red-600">
            Sil
          </button>
          <Button size="sm" variant="outline" onClick={handlePublish}>
            {office.is_active ? "Dərcdən çıxar" : "Dərc et"}
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

      <div className="mb-6 inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            onClick={() => {
              setLang(code);
              setFormKey((k) => k + 1);
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              lang === code ? "bg-brand-500 text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* HERO */}
        <ComponentCard title="Başlıq bölməsi" desc="Ofisin adı və qısa təsviri.">
          <div className="space-y-4">
            <div>
              <Label>Ad</Label>
              <Input value={form.name[lang]} onChange={(e) => setBi("name", e.target.value)} placeholder="Beynəlxalq Əlaqələr Şöbəsi" />
            </div>
            <RichTextField
              label="Qısa təsvir"
              value={form.short_description[lang]}
              onChange={(next) => setBi("short_description", next)}
              remountKey={`${formKey}-shortdesc-${lang}`}
            />
          </div>
        </ComponentCard>

        {/* ABOUT */}
        <ComponentCard title="Haqqında" desc="Başlıq və mətn.">
          <div className="space-y-4">
            <div>
              <Label>Başlıq</Label>
              <Input value={form.about_title[lang]} onChange={(e) => setBi("about_title", e.target.value)} placeholder="Şöbə haqqında" />
            </div>
            <RichTextField
              label="Mətn"
              value={form.about_text[lang]}
              onChange={(next) => setBi("about_text", next)}
              remountKey={`${formKey}-about-${lang}`}
            />
          </div>
        </ComponentCard>

        {/* GOALS */}
        <ComponentCard title="Məqsədlər" desc="Başlıq və məqsədlərin siyahısı.">
          <div className="space-y-4">
            <div>
              <Label>Başlıq</Label>
              <Input value={form.goal_title[lang]} onChange={(e) => setBi("goal_title", e.target.value)} placeholder="Məqsədlər" />
            </div>
            <div>
              <Label>Məqsədlər</Label>
              <textarea
                value={form.goals[lang]}
                onChange={(e) => setGoals(e.target.value)}
                rows={5}
                placeholder={"Beynəlxalq əməkdaşlığı inkişaf etdirmək\nMübadilə proqramlarını təşkil etmək"}
                className={textareaCls}
              />
              <p className="mt-1 text-xs text-gray-400">Hər sətirdə bir məqsəd.</p>
            </div>
          </div>
        </ComponentCard>

        {/* CORE FUNCTIONS */}
        <ComponentCard title="Əsas funksiyalar" desc="Başlıq və funksiya kartları (başlıq + təsvir).">
          <div className="space-y-4">
            <div>
              <Label>Bölmənin başlığı</Label>
              <Input value={form.functions_title[lang]} onChange={(e) => setBi("functions_title", e.target.value)} placeholder="Əsas funksiyalar" />
            </div>
            {form.functions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Hələ funksiya əlavə edilməyib.</p>
            ) : (
              <div className="space-y-4">
                {form.functions.map((fn, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">#{i + 1}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveFunction(i, -1)} disabled={i === 0} className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↑</button>
                        <button type="button" onClick={() => moveFunction(i, 1)} disabled={i === form.functions.length - 1} className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↓</button>
                        <button type="button" onClick={() => removeFunction(i)} className="ml-2 text-xs text-red-500 hover:text-red-600">Sil</button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <Label>Başlıq</Label>
                      <Input value={fn.title[lang]} onChange={(e) => setFunction(i, "title", e.target.value)} placeholder="Tələbə mübadiləsi" />
                    </div>
                    <RichTextField
                      label="Təsvir"
                      value={fn.description[lang]}
                      onChange={(next) => setFunction(i, "description", next)}
                      remountKey={`${formKey}-fn-${i}-${lang}`}
                    />
                  </div>
                ))}
              </div>
            )}
            <Button size="sm" variant="outline" onClick={addFunction}>+ Funksiya əlavə et</Button>
          </div>
        </ComponentCard>

        {/* DIRECTOR */}
        <ComponentCard title="Şöbə müdiri" desc="Müdirin məlumatları, təhsili və əlaqə vasitələri.">
          <div className="space-y-4">
            <div>
              <Label>Bölmənin başlığı (məs. “Şöbə müdiri”)</Label>
              <Input value={form.director_title[lang]} onChange={(e) => setBi("director_title", e.target.value)} placeholder="Şöbə müdiri" />
            </div>

            <div className="flex items-center gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                {form.director_image_url ? (
                  <img src={getImageUrl(form.director_image_url)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">Şəkil yoxdur</div>
                )}
              </div>
              <div className="flex-1">
                <Label>Şəkil</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleImageUpload(e.target.files?.[0] ?? null, (p) => setNeutral("director_image_url", p))}
                  className="block w-full text-xs text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-brand-50 file:px-2 file:py-1 file:text-xs file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                />
                <Input value={form.director_image_url} onChange={(e) => setNeutral("director_image_url", e.target.value)} placeholder="və ya keçid yapışdırın" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label>Ad</Label>
                <Input value={form.director_name[lang]} onChange={(e) => setBi("director_name", e.target.value)} placeholder="Elçin" />
              </div>
              <div>
                <Label>Soyad</Label>
                <Input value={form.director_surname[lang]} onChange={(e) => setBi("director_surname", e.target.value)} placeholder="Məmmədov" />
              </div>
            </div>
            <div>
              <Label>Vəzifə / elmi ad</Label>
              <Input value={form.director_position[lang]} onChange={(e) => setBi("director_position", e.target.value)} placeholder="Professor" />
            </div>
            <RichTextField
              label="Bioqrafiya"
              value={form.director_bio[lang]}
              onChange={(next) => setBi("director_bio", next)}
              remountKey={`${formKey}-dirbio-${lang}`}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label>Telefon</Label>
                <Input value={form.director_phone} onChange={(e) => setNeutral("director_phone", e.target.value)} placeholder="+994 12 538 00 00" />
              </div>
              <div>
                <Label>Daxili kod</Label>
                <Input value={form.director_phone_code} onChange={(e) => setNeutral("director_phone_code", e.target.value)} placeholder="1204" />
              </div>
              <div>
                <Label>E-poçt</Label>
                <Input value={form.director_email} onChange={(e) => setNeutral("director_email", e.target.value)} placeholder="ad@aztu.edu.az" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label>Otaq nömrəsi</Label>
                <Input value={form.director_room[lang]} onChange={(e) => setBi("director_room", e.target.value)} placeholder="204" />
              </div>
              <div>
                <Label>İş günləri və saatları</Label>
                <Input value={form.director_work_hours[lang]} onChange={(e) => setBi("director_work_hours", e.target.value)} placeholder="B.e–C 09:00–18:00" />
              </div>
            </div>

            <div>
              <Label>Təhsil (PhD-dən bakalavra doğru sıralayın)</Label>
              {form.educations.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Hələ təhsil əlavə edilməyib.</p>
              ) : (
                <div className="space-y-3">
                  {form.educations.map((edu, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">#{i + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveEducation(i, -1)} disabled={i === 0} className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↑</button>
                          <button type="button" onClick={() => moveEducation(i, 1)} disabled={i === form.educations.length - 1} className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↓</button>
                          <button type="button" onClick={() => removeEducation(i)} className="ml-2 text-xs text-red-500 hover:text-red-600">Sil</button>
                        </div>
                      </div>
                      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label>Dərəcə</Label>
                          <Input value={edu.degree[lang]} onChange={(e) => setEducationTr(i, "degree", e.target.value)} placeholder="Fəlsəfə doktoru" />
                        </div>
                        <div>
                          <Label>Universitet</Label>
                          <Input value={edu.university[lang]} onChange={(e) => setEducationTr(i, "university", e.target.value)} placeholder="AzTU" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label>Başlanğıc ili</Label>
                          <Input value={edu.start_year} onChange={(e) => setEducationYear(i, "start_year", e.target.value)} placeholder="2010" />
                        </div>
                        <div>
                          <Label>Bitmə ili (davam edirsə boş buraxın)</Label>
                          <Input value={edu.end_year} onChange={(e) => setEducationYear(i, "end_year", e.target.value)} placeholder="2014" />
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">İllər bütün dillərdə eyni göstərilir.</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={addEducation}>+ Təhsil əlavə et</Button>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* STAFF */}
        <ComponentCard title="Əməkdaşlar" desc="Başlıq və əməkdaş kartları.">
          <div className="space-y-4">
            <div>
              <Label>Bölmənin başlığı</Label>
              <Input value={form.staff_title[lang]} onChange={(e) => setBi("staff_title", e.target.value)} placeholder="Əməkdaşlar" />
            </div>
            {form.staff.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Hələ əməkdaş əlavə edilməyib.</p>
            ) : (
              <div className="space-y-4">
                {form.staff.map((s, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">#{i + 1}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveStaff(i, -1)} disabled={i === 0} className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↑</button>
                        <button type="button" onClick={() => moveStaff(i, 1)} disabled={i === form.staff.length - 1} className="px-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200">↓</button>
                        <button type="button" onClick={() => removeStaff(i)} className="ml-2 text-xs text-red-500 hover:text-red-600">Sil</button>
                      </div>
                    </div>
                    <div className="mb-3 flex items-center gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                        {s.image_url ? (
                          <img src={getImageUrl(s.image_url)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">Şəkil</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Label>Şəkil</Label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => void handleImageUpload(e.target.files?.[0] ?? null, (p) => setStaffField(i, "image_url", p))}
                          className="block w-full text-xs text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-brand-50 file:px-2 file:py-1 file:text-xs file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
                        />
                        <Input value={s.image_url} onChange={(e) => setStaffField(i, "image_url", e.target.value)} placeholder="və ya keçid yapışdırın" />
                      </div>
                    </div>
                    <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <Label>Ad</Label>
                        <Input value={s.name[lang]} onChange={(e) => setStaffTr(i, "name", e.target.value)} placeholder="Aysel" />
                      </div>
                      <div>
                        <Label>Soyad</Label>
                        <Input value={s.surname[lang]} onChange={(e) => setStaffTr(i, "surname", e.target.value)} placeholder="Quliyeva" />
                      </div>
                      <div>
                        <Label>Vəzifə</Label>
                        <Input value={s.duty[lang]} onChange={(e) => setStaffTr(i, "duty", e.target.value)} placeholder="Baş mütəxəssis" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <Label>Telefon</Label>
                        <Input value={s.phone} onChange={(e) => setStaffField(i, "phone", e.target.value)} placeholder="+994 12 538 00 01" />
                      </div>
                      <div>
                        <Label>Daxili kod</Label>
                        <Input value={s.phone_code} onChange={(e) => setStaffField(i, "phone_code", e.target.value)} placeholder="1205" />
                      </div>
                      <div>
                        <Label>E-poçt</Label>
                        <Input value={s.email} onChange={(e) => setStaffField(i, "email", e.target.value)} placeholder="ad@aztu.edu.az" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button size="sm" variant="outline" onClick={addStaff}>+ Əməkdaş əlavə et</Button>
          </div>
        </ComponentCard>

        {/* CONTACT */}
        <ComponentCard title="Əlaqə" desc="Ofisin əlaqə məlumatları.">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label>Otaq</Label>
                <Input value={form.contact_room[lang]} onChange={(e) => setBi("contact_room", e.target.value)} placeholder="204" />
              </div>
              <div>
                <Label>İş günləri və saatları</Label>
                <Input value={form.contact_work_hours[lang]} onChange={(e) => setBi("contact_work_hours", e.target.value)} placeholder="B.e–C 09:00–18:00" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label>Telefon</Label>
                <Input value={form.contact_phone} onChange={(e) => setNeutral("contact_phone", e.target.value)} placeholder="+994 12 538 11 22" />
              </div>
              <div>
                <Label>Daxili kod</Label>
                <Input value={form.contact_phone_code} onChange={(e) => setNeutral("contact_phone_code", e.target.value)} placeholder="1300" />
              </div>
              <div>
                <Label>E-poçt</Label>
                <Input value={form.contact_email} onChange={(e) => setNeutral("contact_email", e.target.value)} placeholder="office@aztu.edu.az" />
              </div>
            </div>
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
