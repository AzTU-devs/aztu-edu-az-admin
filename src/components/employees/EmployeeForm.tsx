import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Editor from "../editor/Editor";
import {
    CreateEmployeePayload,
    Course,
    Education,
    Employee,
    EmployeeContact,
    EmployeeResearch,
    MultiLang,
    OfficeHour,
    createEmployee,
    updateEmployee,
} from "../../services/employee/employeeService";
import { getFaculties, Faculty } from "../../services/faculty/facultyService";
import { getCafedras, Cafedra } from "../../services/cafedra/cafedraService";

// ─── Constants ───────────────────────────────────────────────────────────────

const ACADEMIC_DEGREES = ["—", "Fəlsəfə doktoru (PhD)", "Elmlər doktoru", "Elmlər namizədi", "Magistr", "Bakalavr"];
const ACADEMIC_TITLES = ["—", "Professor", "Dosent", "Böyük müəllim", "Müəllim", "Assistent", "Baş elmi işçi", "Elmi işçi"];
const DAYS = ["Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə", "Bazar"];
const EDUCATION_LEVELS = ["Bakalavr", "Magistr", "Doktorantura", "Digər"];
const BASE_URL = "https://api-aztu.karamshukurlu.site";

const TABS = [
    { id: "basic",        label: "Əsas məlumat",    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: "biography",    label: "Bioqrafiya",       icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "contact",      label: "Əlaqə",            icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { id: "office_hours", label: "Qəbul saatları",   icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "education",    label: "Təhsil",            icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
    { id: "courses",      label: "Fənlər",            icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { id: "research",     label: "Tədqiqat",          icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
};

const hasOverlap = (hours: OfficeHour[]) => {
    const byDay: Record<string, { start: number; end: number }[]> = {};
    for (const h of hours) {
        if (!h.day || !h.start_time || !h.end_time) continue;
        if (!byDay[h.day]) byDay[h.day] = [];
        const start = timeToMinutes(h.start_time);
        const end = timeToMinutes(h.end_time);
        for (const ex of byDay[h.day]) {
            if (start < ex.end && end > ex.start) return true;
        }
        byDay[h.day].push({ start, end });
    }
    return false;
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const toMultiLang = (v: string | MultiLang | undefined): MultiLang => {
    if (!v) return { az: "", en: "" };
    if (typeof v === "string") return { az: v, en: v };
    return v;
};

// ─── LangToggle ──────────────────────────────────────────────────────────────

const LangToggle = ({ lang, setLang }: { lang: "az" | "en"; setLang: (l: "az" | "en") => void }) => (
    <div className="flex items-center gap-1 ml-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
        {(["az", "en"] as const).map((l) => (
            <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    lang === l
                        ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
                {l.toUpperCase()}
            </button>
        ))}
    </div>
);

// ─── Props ───────────────────────────────────────────────────────────────────

interface EmployeeFormProps {
    mode: "create" | "edit";
    initialData?: Employee;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EmployeeForm({ mode, initialData }: EmployeeFormProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>("basic");
    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState<"az" | "en">("az");
    const [backendErrors, setBackendErrors] = useState<Record<string, string[]>>({});

    // ── Basic Info ──
    const [firstName, setFirstName] = useState<MultiLang>(toMultiLang(initialData?.first_name));
    const [lastName, setLastName] = useState<MultiLang>(toMultiLang(initialData?.last_name));
    const [academicDegree, setAcademicDegree] = useState(initialData?.academic_degree ?? "");
    const [academicTitle, setAcademicTitle] = useState(initialData?.academic_title ?? "");
    const [position, setPosition] = useState<MultiLang>(toMultiLang(initialData?.position));
    const [facultyCode, setFacultyCode] = useState(initialData?.faculty_code ?? "");
    const [cafedraCode, setCafedraCode] = useState(initialData?.cafedra_code ?? "");

    // ── Profile image ──
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
        initialData?.profile_image ? `${BASE_URL}/${initialData.profile_image}` : null
    );
    const imageInputRef = useRef<HTMLInputElement>(null);

    // ── Biography ──
    const [biography, setBiography] = useState<MultiLang>(toMultiLang(initialData?.biography));

    // ── Contact ──
    const [contact, setContact] = useState<EmployeeContact>(
        initialData?.contact ?? { building: "", floor: "", room: "", email: "", phone: "" }
    );

    // ── Office Hours ──
    const [officeHours, setOfficeHours] = useState<OfficeHour[]>(
        initialData?.office_hours ?? []
    );

    // ── Education ──
    const [educationList, setEducationList] = useState<Education[]>(
        initialData?.education?.map((e) => ({
            ...e,
            institution: toMultiLang(e.institution as any),
            specialization: toMultiLang(e.specialization as any),
        })) ?? []
    );

    // ── Courses ──
    const [courseList, setCourseList] = useState<Course[]>(
        initialData?.courses?.map((c) => ({
            ...c,
            course_name: toMultiLang(c.course_name as any),
        })) ?? []
    );

    // ── Research ──
    const [research, setResearch] = useState<EmployeeResearch>(
        initialData?.research ?? {}
    );

    // ── Faculties & Cafedras ──
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [cafedras, setCafedras] = useState<Cafedra[]>([]);

    useEffect(() => {
        getFaculties(0, 200, "az").then((res) => {
            if (res && typeof res === "object" && "faculties" in res) {
                setFaculties(res.faculties);
            }
        });
    }, []);

    useEffect(() => {
        if (!facultyCode) return;
        getCafedras(0, 200, "az", facultyCode).then((res) => {
            if (res && typeof res === "object" && "cafedras" in res) {
                setCafedras(res.cafedras);
            } else {
                setCafedras([]);
            }
        });
    }, [facultyCode]);

    // ─── Derived ──────────────────────────────────────────────────────────────
    const fullName = [firstName[lang].trim(), lastName[lang].trim()].filter(Boolean).join(" ");

    // ─── Backend error helper ─────────────────────────────────────────────────
    const fieldError = (key: string): string | undefined => backendErrors[key]?.[0];

    // ─── Validation ───────────────────────────────────────────────────────────
    const errors: string[] = [];

    if (!firstName.az.trim()) errors.push("Ad (AZ) tələb olunur");
    if (!firstName.en.trim()) errors.push("Ad (EN) tələb olunur");
    if (!lastName.az.trim())  errors.push("Soyad (AZ) tələb olunur");
    if (!lastName.en.trim())  errors.push("Soyad (EN) tələb olunur");

    if (mode === "create" && !profileImageFile) errors.push("Profil şəkli tələb olunur");

    if (!facultyCode) errors.push("Fakültə tələb olunur");

    if (!biography.az.trim()) errors.push("Bioqrafiya (AZ) tələb olunur");
    if (!biography.en.trim()) errors.push("Bioqrafiya (EN) tələb olunur");

    if (!contact.building?.trim()) errors.push("Bina tələb olunur");
    if (!contact.floor?.trim())    errors.push("Mərtəbə tələb olunur");
    if (!contact.room?.trim())     errors.push("Otaq tələb olunur");
    if (!contact.email?.trim())    errors.push("E-poçt tələb olunur");
    if (!contact.phone?.trim())    errors.push("Telefon tələb olunur");

    if (contact.email && !isValidEmail(contact.email)) errors.push("E-poçt formatı düzgün deyil");

    if (officeHours.length === 0) errors.push("Ən azı 1 qəbul saatı tələb olunur");
    for (const h of officeHours) {
        if (h.start_time && h.end_time && timeToMinutes(h.start_time) >= timeToMinutes(h.end_time)) {
            errors.push("Qəbul saatı: başlama vaxtı bitmə vaxtından əvvəl olmalıdır");
            break;
        }
    }
    if (hasOverlap(officeHours)) errors.push("Qəbul saatları üst-üstə düşür");

    if (educationList.length === 0) errors.push("Ən azı 1 təhsil məlumatı tələb olunur");

    const isValid = errors.length === 0;

    // ─── Image ────────────────────────────────────────────────────────────────
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProfileImageFile(file);
        setProfileImagePreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setProfileImageFile(null);
        setProfileImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    // ─── Office Hours ─────────────────────────────────────────────────────────
    const addOfficeHour = () => setOfficeHours([...officeHours, { day: "", start_time: "", end_time: "" }]);
    const removeOfficeHour = (i: number) => setOfficeHours(officeHours.filter((_, idx) => idx !== i));
    const updateOfficeHour = (i: number, field: keyof OfficeHour, value: string) =>
        setOfficeHours(officeHours.map((h, idx) => (idx === i ? { ...h, [field]: value } : h)));

    // ─── Education ────────────────────────────────────────────────────────────
    const addEducation = () => setEducationList([...educationList, {
        degree_level: "",
        institution: { az: "", en: "" },
        specialization: { az: "", en: "" },
        graduation_year: "",
    }]);
    const removeEducation = (i: number) => setEducationList(educationList.filter((_, idx) => idx !== i));
    const updateEducation = (i: number, field: keyof Education, value: string | MultiLang) =>
        setEducationList(educationList.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));

    // ─── Courses ──────────────────────────────────────────────────────────────
    const addCourse = () => setCourseList([...courseList, {
        course_name: { az: "", en: "" },
        education_level: "",
        publications: "",
    }]);
    const removeCourse = (i: number) => setCourseList(courseList.filter((_, idx) => idx !== i));
    const updateCourse = (i: number, field: keyof Course, value: string | MultiLang) =>
        setCourseList(courseList.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setBackendErrors({});

        if (!isValid) {
            Swal.fire({ icon: "warning", title: "Xəta", html: errors.map((e) => `<div>${e}</div>`).join(""), timer: 3000, showConfirmButton: false });
            return;
        }

        setLoading(true);

        const payload: CreateEmployeePayload = {
            first_name: firstName,
            last_name: lastName,
            academic_degree: academicDegree === "—" ? "" : academicDegree,
            academic_title: academicTitle === "—" ? "" : academicTitle,
            position,
            faculty_code: facultyCode,
            cafedra_code: cafedraCode,
            biography,
            profile_image: profileImageFile ?? undefined,
            contact: Object.values(contact).some(Boolean) ? contact : undefined,
            office_hours: officeHours.filter((h) => h.day && h.start_time && h.end_time),
            education: educationList.filter((e) => e.institution.az),
            courses: courseList.filter((c) => c.course_name.az),
            research: Object.values(research).some(Boolean) ? research : undefined,
        };

        const result = mode === "create"
            ? await createEmployee(payload)
            : await updateEmployee({ ...payload, employee_id: initialData!.id });

        setLoading(false);

        if (result.success) {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: mode === "create" ? "İşçi uğurla əlavə edildi!" : "İşçi uğurla yeniləndi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => navigate("/employees"));
        } else {
            if (result.errors && Object.keys(result.errors).length > 0) {
                setBackendErrors(result.errors);
                Swal.fire({
                    icon: "error",
                    title: "Xəta",
                    html: Object.values(result.errors).flat().map((e) => `<div>${e}</div>`).join(""),
                    timer: 4000,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({ icon: "error", title: "Xəta", text: "Əməliyyat zamanı xəta baş verdi", timer: 2000, showConfirmButton: false });
            }
        }
    };

    // ─── Styles ───────────────────────────────────────────────────────────────
    const sectionCard = "overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm";
    const sectionHeader = "flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50";
    const selectClass = "h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 text-sm text-gray-800 dark:text-white/90 px-3 focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 appearance-none";
    const selectErrorClass = "h-11 w-full rounded-lg border border-red-400 dark:border-red-500 bg-transparent dark:bg-gray-900 text-sm text-gray-800 dark:text-white/90 px-3 focus:outline-none focus:ring-3 focus:border-red-400 focus:ring-red-500/20 appearance-none";
    const textareaClass = "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 text-sm text-gray-800 dark:text-white/90 px-4 py-2.5 focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 resize-none placeholder:text-gray-400";
    const addBtnClass = "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors";
    const removeBtnClass = "p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors";

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="p-5 sm:p-6 space-y-5">
            {/* Tab Navigation */}
            <div className={sectionCard}>
                <div className="flex flex-wrap gap-1 p-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-brand-500 text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                            </svg>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab: Basic Info ── */}
            {activeTab === "basic" && (
                <div className="space-y-5">
                    {/* Profile Image */}
                    <div className={sectionCard}>
                        <div className={sectionHeader}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profil şəkli</span>
                            <span className={`ml-auto text-[11px] font-medium ${mode === "create" && !profileImageFile ? "text-red-500" : "text-gray-400"}`}>
                                {mode === "create" ? "Məcburi" : "İstəyə bağlı"}
                            </span>
                        </div>
                        <div className="p-5 flex items-center gap-5">
                            <div className="relative shrink-0">
                                {profileImagePreview ? (
                                    <img src={profileImagePreview} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 dark:border-gray-700 shadow-sm" />
                                ) : (
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${mode === "create" && !profileImageFile ? "bg-red-50 dark:bg-red-900/20 border-2 border-dashed border-red-300 dark:border-red-700" : "bg-gray-100 dark:bg-gray-800"}`}>
                                        <svg className={`w-8 h-8 ${mode === "create" && !profileImageFile ? "text-red-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                                {profileImagePreview && (
                                    <button type="button" onClick={removeImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <div>
                                <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} className="hidden" id="profile-image-input" />
                                <label htmlFor="profile-image-input" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors shadow-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Şəkil yüklə
                                </label>
                                <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, WebP — maks. 5 MB</p>
                                {mode === "create" && !profileImageFile && (
                                    <p className="text-xs text-red-500 mt-1">Profil şəkli tələb olunur</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Name fields */}
                    <div className={sectionCard}>
                        <div className={sectionHeader}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Şəxsi məlumat</span>
                            <span className="text-[11px] text-red-500 font-medium">Məcburi</span>
                            <LangToggle lang={lang} setLang={setLang} />
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                    Ad ({lang.toUpperCase()}) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder={lang === "az" ? "Adı daxil edin (AZ)" : "Enter first name (EN)"}
                                    value={firstName[lang]}
                                    onChange={(e) => setFirstName({ ...firstName, [lang]: e.target.value })}
                                    error={!firstName[lang].trim() || !!fieldError("first_name")}
                                    hint={fieldError("first_name")}
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                    Soyad ({lang.toUpperCase()}) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder={lang === "az" ? "Soyadı daxil edin (AZ)" : "Enter last name (EN)"}
                                    value={lastName[lang]}
                                    onChange={(e) => setLastName({ ...lastName, [lang]: e.target.value })}
                                    error={!lastName[lang].trim() || !!fieldError("last_name")}
                                    hint={fieldError("last_name")}
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Tam ad (avtomatik)</Label>
                                <Input value={fullName} readOnly disabled placeholder="Ad + Soyad" />
                            </div>
                        </div>
                    </div>

                    {/* Academic info */}
                    <div className={sectionCard}>
                        <div className={sectionHeader}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Akademik məlumat</span>
                            <LangToggle lang={lang} setLang={setLang} />
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi dərəcə</Label>
                                <select className={selectClass} value={academicDegree} onChange={(e) => setAcademicDegree(e.target.value)}>
                                    <option value="">Seçin...</option>
                                    {ACADEMIC_DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Elmi ad</Label>
                                <select className={selectClass} value={academicTitle} onChange={(e) => setAcademicTitle(e.target.value)}>
                                    <option value="">Seçin...</option>
                                    {ACADEMIC_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                    Vəzifə ({lang.toUpperCase()})
                                </Label>
                                <Input
                                    placeholder={lang === "az" ? "Vəzifəni daxil edin (AZ)" : "Enter position (EN)"}
                                    value={position[lang]}
                                    onChange={(e) => setPosition({ ...position, [lang]: e.target.value })}
                                    hint={fieldError("position")}
                                    error={!!fieldError("position")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Faculty & Cafedra */}
                    <div className={sectionCard}>
                        <div className={sectionHeader}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Fakültə və Kafedra</span>
                            <span className="ml-auto text-[11px] text-red-500 font-medium">Məcburi</span>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                    Fakültə <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    className={!facultyCode ? selectErrorClass : selectClass}
                                    value={facultyCode}
                                    onChange={(e) => { setFacultyCode(e.target.value); setCafedraCode(""); }}
                                >
                                    <option value="">Fakültə seçin...</option>
                                    {faculties.map((f) => <option key={f.faculty_code} value={f.faculty_code}>{f.faculty_name}</option>)}
                                </select>
                                {!facultyCode && <p className="mt-1 text-xs text-red-500">Fakültə tələb olunur</p>}
                            </div>
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Kafedra</Label>
                                <select className={selectClass} value={cafedraCode} onChange={(e) => setCafedraCode(e.target.value)} disabled={!facultyCode}>
                                    <option value="">Kafedra seçin...</option>
                                    {cafedras.map((c) => <option key={c.cafedra_code} value={c.cafedra_code}>{c.cafedra_name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tab: Biography ── */}
            {activeTab === "biography" && (
                <div className={sectionCard}>
                    <div className={sectionHeader}>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bioqrafiya</span>
                        <span className="text-[11px] text-red-500 font-medium">Məcburi</span>
                        <LangToggle lang={lang} setLang={setLang} />
                    </div>
                    <div className="p-5">
                        <Editor
                            key={`biography-${lang}`}
                            initialContent={biography[lang]}
                            onUpdate={(html) => setBiography({ ...biography, [lang]: html })}
                        />
                        {!biography[lang].trim() && (
                            <p className="mt-2 text-xs text-red-500">Bioqrafiya ({lang.toUpperCase()}) tələb olunur</p>
                        )}
                        {fieldError("biography") && (
                            <p className="mt-2 text-xs text-red-500">{fieldError("biography")}</p>
                        )}
                    </div>
                </div>
            )}

            {/* ── Tab: Contact ── */}
            {activeTab === "contact" && (
                <div className="space-y-5">
                    {/* Office location */}
                    <div className={sectionCard}>
                        <div className={sectionHeader}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ofis məlumatı</span>
                            <span className="ml-auto text-[11px] text-red-500 font-medium">Məcburi</span>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                    Bina <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Məs: A korpus"
                                    value={contact.building ?? ""}
                                    onChange={(e) => setContact({ ...contact, building: e.target.value })}
                                    error={!contact.building?.trim() || !!fieldError("contact.building")}
                                    hint={fieldError("contact.building") ?? (!contact.building?.trim() ? "Tələb olunur" : undefined)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                    Mərtəbə <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Məs: 3"
                                    value={contact.floor ?? ""}
                                    onChange={(e) => setContact({ ...contact, floor: e.target.value })}
                                    error={!contact.floor?.trim() || !!fieldError("contact.floor")}
                                    hint={fieldError("contact.floor") ?? (!contact.floor?.trim() ? "Tələb olunur" : undefined)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                    Otaq <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Məs: 312"
                                    value={contact.room ?? ""}
                                    onChange={(e) => setContact({ ...contact, room: e.target.value })}
                                    error={!contact.room?.trim() || !!fieldError("contact.room")}
                                    hint={fieldError("contact.room") ?? (!contact.room?.trim() ? "Tələb olunur" : undefined)}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Contact details */}
                    <div className={sectionCard}>
                        <div className={sectionHeader}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Əlaqə məlumatı</span>
                            <span className="ml-auto text-[11px] text-red-500 font-medium">Məcburi</span>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                    E-poçt <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="email"
                                    placeholder="example@aztu.edu.az"
                                    value={contact.email ?? ""}
                                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                    error={!contact.email?.trim() || !!(contact.email && !isValidEmail(contact.email)) || !!fieldError("contact.email")}
                                    hint={
                                        fieldError("contact.email") ??
                                        (contact.email && !isValidEmail(contact.email) ? "E-poçt formatı düzgün deyil" : undefined) ??
                                        (!contact.email?.trim() ? "Tələb olunur" : undefined)
                                    }
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                    Telefon <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder="+994 XX XXX XX XX"
                                    value={contact.phone ?? ""}
                                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                    error={!contact.phone?.trim() || !!fieldError("contact.phone")}
                                    hint={fieldError("contact.phone") ?? (!contact.phone?.trim() ? "Tələb olunur" : undefined)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tab: Office Hours ── */}
            {activeTab === "office_hours" && (
                <div className={sectionCard}>
                    <div className={sectionHeader}>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Qəbul saatları</span>
                        <span className="text-[11px] text-red-500 font-medium">Min 1</span>
                        <button type="button" onClick={addOfficeHour} className={`${addBtnClass} ml-auto`}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
                            Əlavə et
                        </button>
                    </div>
                    <div className="p-5 space-y-3">
                        {officeHours.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Qəbul saatı yoxdur</p>
                                <p className="text-xs text-red-500 mt-1">Ən azı 1 qəbul saatı tələb olunur</p>
                            </div>
                        ) : (
                            officeHours.map((h, i) => {
                                const timeError = h.start_time && h.end_time && timeToMinutes(h.start_time) >= timeToMinutes(h.end_time);
                                return (
                                    <div key={i} className="flex items-end gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                        <div className="flex-1 min-w-0">
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Gün</Label>
                                            <select className={selectClass} value={h.day} onChange={(e) => updateOfficeHour(i, "day", e.target.value)}>
                                                <option value="">Seçin...</option>
                                                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Başlama</Label>
                                            <Input type="time" value={h.start_time} onChange={(e) => updateOfficeHour(i, "start_time", e.target.value)} error={!!timeError} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bitmə</Label>
                                            <Input type="time" value={h.end_time} onChange={(e) => updateOfficeHour(i, "end_time", e.target.value)} error={!!timeError} hint={timeError ? "Bitmə > Başlama olmalıdır" : undefined} />
                                        </div>
                                        <button type="button" onClick={() => removeOfficeHour(i)} className={removeBtnClass}>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                );
                            })
                        )}
                        {hasOverlap(officeHours) && (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-xs font-medium text-red-600 dark:text-red-400">Eyni gündə qəbul saatları üst-üstə düşür</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Tab: Education ── */}
            {activeTab === "education" && (
                <div className={sectionCard}>
                    <div className={sectionHeader}>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Təhsil</span>
                        <span className="text-[11px] text-red-500 font-medium">Min 1</span>
                        <LangToggle lang={lang} setLang={setLang} />
                        <button type="button" onClick={addEducation} className={addBtnClass}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
                            Əlavə et
                        </button>
                    </div>
                    <div className="p-5 space-y-4">
                        {educationList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Təhsil məlumatı yoxdur</p>
                                <p className="text-xs text-red-500 mt-1">Ən azı 1 təhsil məlumatı tələb olunur</p>
                            </div>
                        ) : (
                            educationList.map((edu, i) => (
                                <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Təhsil #{i + 1}</span>
                                        <button type="button" onClick={() => removeEducation(i)} className={removeBtnClass}>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Dərəcə</Label>
                                            <select className={selectClass} value={edu.degree_level} onChange={(e) => updateEducation(i, "degree_level", e.target.value)}>
                                                <option value="">Seçin...</option>
                                                {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Bitirmə ili</Label>
                                            <Input type="number" placeholder="2010" min="1950" max="2099" value={edu.graduation_year} onChange={(e) => updateEducation(i, "graduation_year", e.target.value)} />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                                Müəssisə ({lang.toUpperCase()})
                                            </Label>
                                            <Input
                                                placeholder={lang === "az" ? "Universitetin adı (AZ)" : "University name (EN)"}
                                                value={edu.institution[lang]}
                                                onChange={(e) => updateEducation(i, "institution", { ...edu.institution, [lang]: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                                İxtisas ({lang.toUpperCase()})
                                            </Label>
                                            <Input
                                                placeholder={lang === "az" ? "İxtisasın adı (AZ)" : "Specialization (EN)"}
                                                value={edu.specialization[lang]}
                                                onChange={(e) => updateEducation(i, "specialization", { ...edu.specialization, [lang]: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ── Tab: Courses ── */}
            {activeTab === "courses" && (
                <div className={sectionCard}>
                    <div className={sectionHeader}>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tədris etdiyi fənlər</span>
                        <LangToggle lang={lang} setLang={setLang} />
                        <button type="button" onClick={addCourse} className={addBtnClass}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
                            Əlavə et
                        </button>
                    </div>
                    <div className="p-5 space-y-4">
                        {courseList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Fənn məlumatı yoxdur</p>
                            </div>
                        ) : (
                            courseList.map((course, i) => (
                                <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fənn #{i + 1}</span>
                                        <button type="button" onClick={() => removeCourse(i)} className={removeBtnClass}>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                                                Fənnin adı ({lang.toUpperCase()})
                                            </Label>
                                            <Input
                                                placeholder={lang === "az" ? "Fənnin adını daxil edin (AZ)" : "Enter course name (EN)"}
                                                value={course.course_name[lang]}
                                                onChange={(e) => updateCourse(i, "course_name", { ...course.course_name, [lang]: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Təhsil səviyyəsi</Label>
                                            <select className={selectClass} value={course.education_level} onChange={(e) => updateCourse(i, "education_level", e.target.value)}>
                                                <option value="">Seçin...</option>
                                                {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Nəşrlər (istəyə bağlı)</Label>
                                            <textarea
                                                className={`${textareaClass} h-20`}
                                                placeholder="Bu fənlə bağlı nəşrlər..."
                                                value={course.publications ?? ""}
                                                onChange={(e) => updateCourse(i, "publications", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ── Tab: Research & Links ── */}
            {activeTab === "research" && (
                <div className="space-y-5">
                    {/* Scientific interests */}
                    <div className={sectionCard}>
                        <div className={sectionHeader}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Elmi maraqlar</span>
                        </div>
                        <div className="p-5">
                            <textarea
                                className={`${textareaClass} h-28`}
                                placeholder="Elmi maraq sahələrini daxil edin..."
                                value={research.scientific_interests ?? ""}
                                onChange={(e) => setResearch({ ...research, scientific_interests: e.target.value })}
                            />
                        </div>
                    </div>
                    {/* Profile links */}
                    <div className={sectionCard}>
                        <div className={sectionHeader}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profil linklər</span>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                            {([
                                { key: "scopus_url", label: "Scopus", placeholder: "https://www.scopus.com/authid/..." },
                                { key: "google_scholar_url", label: "Google Scholar", placeholder: "https://scholar.google.com/citations?user=..." },
                                { key: "orcid", label: "ORCID", placeholder: "https://orcid.org/0000-0000-0000-0000" },
                                { key: "researchgate_url", label: "ResearchGate", placeholder: "https://www.researchgate.net/profile/..." },
                                { key: "academia_url", label: "Academia.edu", placeholder: "https://independent.academia.edu/..." },
                            ] as { key: keyof EmployeeResearch; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">{label}</Label>
                                    <Input
                                        placeholder={placeholder}
                                        value={(research[key] as string) ?? ""}
                                        onChange={(e) => setResearch({ ...research, [key]: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Submit ── */}
            <div className="flex items-center gap-3 pt-1">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !isValid}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                >
                    {loading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Saxlanılır...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {mode === "create" ? "Əlavə et" : "Yadda saxla"}
                        </>
                    )}
                </button>
                {!isValid && (
                    <div className="flex items-center gap-1.5 text-xs text-red-500">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors[0]}
                    </div>
                )}
            </div>
        </div>
    );
}
