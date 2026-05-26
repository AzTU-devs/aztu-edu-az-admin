import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Editor from "../editor/Editor";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";
import { createNews, CreateNewsPayload } from "../../services/news/newsService";
import { getNewsCategories, NewsCategory } from "../../services/newsCategory/newsCategoryService";
import { getFaculties } from "../../services/faculty/facultyService";
import { getCafedras } from "../../services/cafedra/cafedraService";

const SDG_GOALS = [
    { n: 1, label: "No Poverty" },
    { n: 2, label: "Zero Hunger" },
    { n: 3, label: "Good Health and Well-being" },
    { n: 4, label: "Quality Education" },
    { n: 5, label: "Gender Equality" },
    { n: 6, label: "Clean Water and Sanitation" },
    { n: 7, label: "Affordable and Clean Energy" },
    { n: 8, label: "Decent Work and Economic Growth" },
    { n: 9, label: "Industry, Innovation and Infrastructure" },
    { n: 10, label: "Reduced Inequalities" },
    { n: 11, label: "Sustainable Cities and Communities" },
    { n: 12, label: "Responsible Consumption and Production" },
    { n: 13, label: "Climate Action" },
    { n: 14, label: "Life Below Water" },
    { n: 15, label: "Life on Land" },
    { n: 16, label: "Peace, Justice and Strong Institutions" },
    { n: 17, label: "Partnerships for the Goals" },
];

interface SimpleOpt { code: string; label: string; }

export default function NewNews() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState<NewsCategory[]>([]);
    const [faculties, setFaculties] = useState<SimpleOpt[]>([]);
    const [cafedras, setCafedras] = useState<SimpleOpt[]>([]);

    const [categoryId, setCategoryId] = useState("");
    const [titleAz, setTitleAz] = useState("");
    const [contentAZ, setContentAZ] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [contentEN, setContentEN] = useState("");
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [createdAt, setCreatedAt] = useState("");
    const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);
    const [facultyCode, setFacultyCode] = useState("");
    const [cafedraCode, setCafedraCode] = useState("");
    const [showInAllNews, setShowInAllNews] = useState(true);

    useEffect(() => {
        getNewsCategories("az").then((res) => {
            if (Array.isArray(res)) setCategories(res);
        });
        getFaculties(0, 200).then((res: any) => {
            if (res && Array.isArray(res.faculties)) {
                setFaculties(res.faculties.map((f: any) => ({
                    code: f.faculty_code,
                    label: f.title || f.az_title || f.name || f.faculty_code,
                })));
            }
        });
        getCafedras(0, 500).then((res: any) => {
            if (res && Array.isArray(res.cafedras)) {
                setCafedras(res.cafedras.map((c: any) => ({
                    code: c.cafedra_code,
                    label: c.cafedra_name || c.title || c.cafedra_code,
                })));
            }
        });
    }, []);

    const toggleSdg = (n: number) => {
        setSelectedSdgs((prev) =>
            prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)
        );
    };

    const isFormValid =
        categoryId.trim() !== "" &&
        titleAz.trim() !== "" &&
        titleEn.trim() !== "" &&
        coverImage !== null;

    const handleSubmit = async () => {
        if (!coverImage) return;
        setLoading(true);

        const payload: CreateNewsPayload = {
            category_id: Number(categoryId),
            az_title: titleAz,
            az_html_content: contentAZ,
            en_title: titleEn,
            en_html_content: contentEN,
            cover_image: coverImage,
            gallery_images: galleryImages.length > 0 ? galleryImages : undefined,
            created_at: createdAt ? createdAt : undefined,
            sdg_numbers: selectedSdgs.length > 0 ? selectedSdgs : undefined,
            faculty_code: facultyCode || undefined,
            cafedra_code: cafedraCode || undefined,
            show_in_all_news: showInAllNews,
        };

        const result = await createNews(payload);
        setLoading(false);

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Xəbər uğurla əlavə edildi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                navigate("/news");
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Xəta",
                text: "Xəbər əlavə edərkən xəta baş verdi",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    const selectClass = "block w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40";

    return (
        <div className="p-5 sm:p-6 space-y-5">
            {/* Meta info */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Meta məlumatlar</span>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Kateqoriya <span className="text-red-500">*</span></Label>
                        <select
                            className={selectClass}
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="">Kateqoriya seçin</option>
                            {categories.map((c) => (
                                <option key={c.category_id} value={c.category_id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Kapaq şəkli <span className="text-red-500">*</span></Label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
                            className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-900/20 dark:file:text-brand-400 hover:file:bg-brand-100 cursor-pointer"
                        />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Yaranma tarixi</Label>
                        <Input
                            type="date"
                            value={createdAt}
                            onChange={(e) => setCreatedAt(e.target.value)}
                        />
                        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Boş buraxılarsa, cari tarix istifadə olunacaq.</p>
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Fakültə (opsional)</Label>
                        <select
                            className={selectClass}
                            value={facultyCode}
                            onChange={(e) => setFacultyCode(e.target.value)}
                        >
                            <option value="">— Seçilməyib —</option>
                            {faculties.map((f) => (
                                <option key={f.code} value={f.code}>{f.label} ({f.code})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Kafedra (opsional)</Label>
                        <select
                            className={selectClass}
                            value={cafedraCode}
                            onChange={(e) => setCafedraCode(e.target.value)}
                        >
                            <option value="">— Seçilməyib —</option>
                            {cafedras.map((c) => (
                                <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={showInAllNews}
                                onChange={(e) => setShowInAllNews(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                            />
                            <span>
                                <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Bütün xəbərlər siyahısında görünsün
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Söndürülərsə, xəbər yalnız təyin olunmuş fakültə/kafedra səhifəsində göstəriləcək.
                                </span>
                            </span>
                        </label>
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Qalereya şəkilləri</Label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setGalleryImages(e.target.files ? Array.from(e.target.files) : [])}
                            className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 dark:file:bg-gray-800 dark:file:text-gray-300 hover:file:bg-gray-100 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* SDG Goals */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">SDG (Davamlı İnkişaf Məqsədləri) — opsional</span>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
                        {SDG_GOALS.map((g) => {
                            const active = selectedSdgs.includes(g.n);
                            return (
                                <button
                                    key={g.n}
                                    type="button"
                                    onClick={() => toggleSdg(g.n)}
                                    title={`${g.n}. ${g.label}`}
                                    className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 text-xs font-bold transition-all border ${
                                        active
                                            ? "bg-brand-500 text-white border-brand-600 shadow"
                                            : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <span className="text-base">{g.n}</span>
                                </button>
                            );
                        })}
                    </div>
                    {selectedSdgs.length > 0 && (
                        <p className="mt-3 text-xs text-gray-500">Seçilmiş: {selectedSdgs.join(", ")}</p>
                    )}
                </div>
            </div>

            {/* AZ section */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide">AZ</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Azərbaycan dili</span>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Başlıq</Label>
                        <Input placeholder="Xəbərin başlığını daxil edin" value={titleAz} onChange={(e) => setTitleAz(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Məzmun</Label>
                        <Editor onUpdate={(html: string) => setContentAZ(html)} />
                    </div>
                </div>
            </div>

            {/* EN section */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide">EN</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">English</span>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Title</Label>
                        <Input placeholder="Enter news title" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Content</Label>
                        <Editor onUpdate={(html: string) => setContentEN(html)} />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
                <Button
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={loading || !isFormValid}
                >
                    {loading ? "Yadda saxlanılır..." : "Yadda saxla"}
                </Button>
            </div>
        </div>
    );
}
