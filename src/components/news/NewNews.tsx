import { useState } from "react";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Editor from "../editor/Editor";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";
import { createNews, CreateNewsPayload } from "../../services/news/newsService";

export default function NewNews() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [categoryId, setCategoryId] = useState("");
    const [titleAz, setTitleAz] = useState("");
    const [contentAZ, setContentAZ] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [contentEN, setContentEN] = useState("");
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);

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

    return (
        <div className="p-5 sm:p-6 space-y-5">
            {/* Meta info */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Meta məlumatlar</span>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Kateqoriya ID</Label>
                        <Input type="number" placeholder="Kateqoriya ID" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} />
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
