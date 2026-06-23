import Swal from "sweetalert2";
import Label from "../form/Label";
import Editor from "../editor/Editor";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../util/apiClient";
import {
    getNewsDetails,
    NewsDetail,
    NewsGalleryImage,
    updateNews,
} from "../../services/news/newsService";
import { getNewsCategories, NewsCategory } from "../../services/newsCategory/newsCategoryService";
import { getFaculties } from "../../services/faculty/facultyService";
import { getCafedras } from "../../services/cafedra/cafedraService";

const SDG_NUMBERS = Array.from({ length: 17 }, (_, i) => i + 1);
interface SimpleOpt { code: string; label: string; }

function resolveImageUrl(path?: string | null): string {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export default function NewsDetails() {
    const lang = "az";
    const navigate = useNavigate();
    const { news_id } = useParams<{ news_id: string }>();

    const [news, setNews] = useState<NewsDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const [categoryId, setCategoryId] = useState<string>("");
    const [isActive, setIsActive] = useState<boolean>(true);
    const [titleAz, setTitleAz] = useState("");
    const [contentAz, setContentAz] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [contentEn, setContentEn] = useState("");

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const [gallery, setGallery] = useState<NewsGalleryImage[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
    const [newGalleryImages, setNewGalleryImages] = useState<File[]>([]);

    const [categories, setCategories] = useState<NewsCategory[]>([]);
    const [faculties, setFaculties] = useState<SimpleOpt[]>([]);
    const [cafedras, setCafedras] = useState<SimpleOpt[]>([]);
    const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);
    const [facultyCode, setFacultyCode] = useState<string>("");
    const [cafedraCode, setCafedraCode] = useState<string>("");
    const [showInAllNews, setShowInAllNews] = useState<boolean>(true);
    const [createdAt, setCreatedAt] = useState<string>("");
    const [displayOrder, setDisplayOrder] = useState<string>("");

    useEffect(() => {
        getNewsCategories("az").then((res) => Array.isArray(res) && setCategories(res));
        getFaculties(0, 200).then((res: any) => {
            if (res && Array.isArray(res.faculties)) {
                setFaculties(res.faculties.map((f: any) => ({
                    code: f.faculty_code,
                    label: f.title || f.faculty_code,
                })));
            }
        });
        getCafedras(0, 500).then((res: any) => {
            if (res && Array.isArray(res.cafedras)) {
                setCafedras(res.cafedras.map((c: any) => ({
                    code: c.cafedra_code,
                    label: c.cafedra_name || c.cafedra_code,
                })));
            }
        });
    }, []);

    const toggleSdg = (n: number) => {
        setSelectedSdgs((prev) =>
            prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)
        );
    };

    useEffect(() => {
        if (!news_id) return;
        setLoading(true);
        setNotFound(false);
        getNewsDetails(news_id, lang).then((res) => {
            if (res === "NOT FOUND") {
                setNotFound(true);
            } else if (typeof res === "object") {
                const n = res as NewsDetail;
                setNews(n);
                setCategoryId(String(n.category_id ?? ""));
                setIsActive(Boolean(n.is_active));
                setTitleAz(n.az_title ?? n.title ?? "");
                setContentAz(n.az_html_content ?? n.html_content ?? "");
                setTitleEn(n.en_title ?? "");
                setContentEn(n.en_html_content ?? "");
                setGallery(n.gallery_images ?? []);
                setCoverPreview(n.cover_image ? resolveImageUrl(n.cover_image) : null);
                setSelectedSdgs(Array.isArray(n.sdg_numbers) ? n.sdg_numbers : []);
                setFacultyCode(n.faculty_code ?? "");
                setCafedraCode(n.cafedra_code ?? "");
                setShowInAllNews(n.show_in_all_news !== false);
                setCreatedAt(n.created_at ? n.created_at.slice(0, 10) : "");
                setDisplayOrder(n.display_order != null ? String(n.display_order) : "");
            }
        }).finally(() => setLoading(false));
    }, [news_id]);

    const handleCoverChange = (file: File | null) => {
        setCoverImage(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setCoverPreview(url);
        } else if (news?.cover_image) {
            setCoverPreview(resolveImageUrl(news.cover_image));
        }
    };

    const handleRemoveGalleryImage = (imageId: number) => {
        setRemovedImageIds((prev) => [...prev, imageId]);
        setGallery((prev) => prev.filter((g) => g.image_id !== imageId));
    };

    const handleMoveGallery = (index: number, direction: -1 | 1) => {
        const next = [...gallery];
        const target = index + direction;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        setGallery(next.map((g, i) => ({ ...g, display_order: i + 1 })));
    };

    const handleSave = async () => {
        if (!news_id) return;
        setSaving(true);

        const galleryOrder = gallery.map((g, idx) => ({
            image_id: g.image_id,
            display_order: idx + 1,
        }));

        const originalFaculty = news?.faculty_code ?? "";
        const originalCafedra = news?.cafedra_code ?? "";

        const result = await updateNews(Number(news_id), {
            az_title: titleAz,
            en_title: titleEn,
            az_html_content: contentAz,
            en_html_content: contentEn,
            category_id: categoryId ? Number(categoryId) : undefined,
            is_active: isActive,
            cover_image: coverImage || undefined,
            new_gallery_images: newGalleryImages.length > 0 ? newGalleryImages : undefined,
            removed_image_ids: removedImageIds.length > 0 ? removedImageIds : undefined,
            gallery_order: galleryOrder.length > 0 ? galleryOrder : undefined,
            sdg_numbers: selectedSdgs,
            faculty_code: facultyCode || undefined,
            cafedra_code: cafedraCode || undefined,
            clear_faculty: !facultyCode && !!originalFaculty,
            clear_cafedra: !cafedraCode && !!originalCafedra,
            show_in_all_news: showInAllNews,
            created_at: createdAt || undefined,
            display_order: displayOrder ? Number(displayOrder) : undefined,
        });

        setSaving(false);

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Xəbər uğurla yeniləndi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => navigate("/news"));
        } else if (result === "NOT FOUND") {
            Swal.fire({ icon: "error", title: "Xəta", text: "Xəbər tapılmadı", timer: 2000, showConfirmButton: false });
        } else {
            Swal.fire({ icon: "error", title: "Xəta", text: "Xəbər yenilənərkən xəta baş verdi", timer: 2000, showConfirmButton: false });
        }
    };

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-5">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Xəbər tapılmadı</p>
                <p className="text-xs text-gray-400 mt-1">Bu ID-yə uyğun xəbər mövcud deyil</p>
            </div>
        );
    }

    return (
        <div className="p-5 sm:p-6 space-y-5">
            {/* Meta info */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Meta məlumatlar</span>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Xəbər ID</Label>
                        <Input value={news?.news_id ? String(news.news_id) : ""} readOnly />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Kateqoriya</Label>
                        <select
                            className="block w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            disabled={loading}
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
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Fakültə (opsional)</Label>
                        <select
                            className="block w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
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
                            className="block w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                            value={cafedraCode}
                            onChange={(e) => setCafedraCode(e.target.value)}
                        >
                            <option value="">— Seçilməyib —</option>
                            {cafedras.map((c) => (
                                <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Tarix</Label>
                        <Input type="date" value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Sıra nömrəsi</Label>
                        <Input type="number" min="1" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
                        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Siyahıdakı mövqeyi təyin edir.</p>
                    </div>
                    <div className="md:col-span-3">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">SDG nömrələri (opsional)</Label>
                        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-17 gap-2">
                            {SDG_NUMBERS.map((n) => {
                                const active = selectedSdgs.includes(n);
                                return (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => toggleSdg(n)}
                                        className={`rounded-lg px-2 py-1.5 text-sm font-bold border transition-all ${
                                            active
                                                ? "bg-brand-500 text-white border-brand-600 shadow"
                                                : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        {n}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedSdgs.length > 0 && (
                            <p className="mt-2 text-xs text-gray-500">Seçilmiş: {selectedSdgs.join(", ")}</p>
                        )}
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Status</Label>
                        <div className="flex items-center gap-3 mt-2">
                            <label className="inline-flex items-center gap-2 text-sm">
                                <input type="radio" checked={isActive} onChange={() => setIsActive(true)} /> Aktiv
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm">
                                <input type="radio" checked={!isActive} onChange={() => setIsActive(false)} /> Deaktiv
                            </label>
                        </div>
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
                </div>
            </div>

            {/* Cover image */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Kapaq şəkli</span>
                </div>
                <div className="p-5 space-y-3">
                    {coverPreview && (
                        <img src={coverPreview} alt="cover" className="max-h-56 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-900/20 dark:file:text-brand-400 hover:file:bg-brand-100 cursor-pointer"
                    />
                </div>
            </div>

            {/* Gallery */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Qalereya şəkilləri</span>
                </div>
                <div className="p-5 space-y-4">
                    {gallery.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {gallery.map((g, idx) => (
                                <div key={g.image_id} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <img src={resolveImageUrl(g.image)} alt="" className="w-full h-32 object-cover" />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[11px] flex items-center justify-between px-2 py-1">
                                        <span>#{idx + 1}</span>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => handleMoveGallery(idx, -1)} className="px-1.5 py-0.5 bg-white/20 rounded">↑</button>
                                            <button type="button" onClick={() => handleMoveGallery(idx, 1)} className="px-1.5 py-0.5 bg-white/20 rounded">↓</button>
                                            <button type="button" onClick={() => handleRemoveGalleryImage(g.image_id)} className="px-1.5 py-0.5 bg-red-500/80 rounded">×</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic">Qalereya şəkli yoxdur</p>
                    )}

                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Yeni şəkillər əlavə et</Label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setNewGalleryImages(e.target.files ? Array.from(e.target.files) : [])}
                            className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 dark:file:bg-gray-800 dark:file:text-gray-300 hover:file:bg-gray-100 cursor-pointer"
                        />
                        {newGalleryImages.length > 0 && (
                            <p className="text-[11px] text-gray-500 mt-1">{newGalleryImages.length} fayl seçildi</p>
                        )}
                    </div>
                </div>
            </div>

            {/* AZ */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide">AZ</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Azərbaycan dili</span>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Başlıq</Label>
                        <Input placeholder="Başlıq" value={titleAz} onChange={(e) => setTitleAz(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Məzmun</Label>
                        {!loading && (
                            <Editor initialContent={contentAz} onUpdate={(html: string) => setContentAz(html)} />
                        )}
                    </div>
                </div>
            </div>

            {/* EN */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide">EN</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">English</span>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Title</Label>
                        <Input placeholder="Title" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Content</Label>
                        {!loading && (
                            <Editor initialContent={contentEn} onUpdate={(html: string) => setContentEn(html)} />
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
                <Button
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                    onClick={handleSave}
                    disabled={loading || saving}
                >
                    {saving ? "Yadda saxlanılır..." : "Yadda saxla"}
                </Button>
            </div>
        </div>
    );
}
