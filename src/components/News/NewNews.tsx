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
        <div className="p-5 space-y-6">
            <div className="mb-[10px]">
                <Label className="text-[17px]">Kateqoriya ID</Label>
                <Input
                    type="number"
                    placeholder="Kateqoriya ID"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                />
            </div>

            <div className="mb-[10px]">
                <Label className="text-[17px]">Kapaq şəkli *</Label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            <div className="mb-[10px]">
                <Label className="text-[17px]">Qalereya şəkilləri</Label>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setGalleryImages(e.target.files ? Array.from(e.target.files) : [])}
                    className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {/* AZ section */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- AZ --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Başlıq</Label>
                    <Input
                        placeholder="Başlıq"
                        value={titleAz}
                        onChange={(e) => setTitleAz(e.target.value)}
                    />
                </div>
                <Editor onUpdate={(html: string) => setContentAZ(html)} />
            </div>

            {/* EN section */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- EN --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Başlıq</Label>
                    <Input
                        placeholder="Başlıq"
                        value={titleEn}
                        onChange={(e) => setTitleEn(e.target.value)}
                    />
                </div>
                <Editor onUpdate={(html: string) => setContentEN(html)} />
            </div>

            <Button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={handleSubmit}
                disabled={loading || !isFormValid}
            >
                {loading ? "Yadda saxlanılır..." : "Yadda saxla"}
            </Button>
        </div>
    );
}
