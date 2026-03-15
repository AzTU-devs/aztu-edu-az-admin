import { useState } from "react";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import DropzoneComponent from "../form/form-elements/DropZone";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";
import { createSlider, CreateSliderPayload } from "../../services/slider/sliderService";

export default function NewSlider() {
    const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [descAz, setDescAz] = useState("");
    const [descEn, setDescEn] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const isFormValid = url.trim() !== "" && descAz.trim() !== "" && descEn.trim() !== "" && selectedFile !== null;

    const handleSubmit = async () => {
        if (!selectedFile) return;

        setLoading(true);
        const payload: CreateSliderPayload = {
            image: selectedFile,
            url,
            az: { desc: descAz },
            en: { desc: descEn },
        };

        const result = await createSlider(payload);
        setLoading(false);

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Slayder uğurla əlavə edildi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                navigate("/sliders");
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Xəta",
                text: "Slayder əlavə edərkən xəta baş verdi",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    return (
        <div className="p-5 sm:p-6 space-y-5">
            {/* Image upload */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Slayder şəkli</span>
                </div>
                <div className="p-5">
                    <DropzoneComponent onFileSelect={setSelectedFile} />
                </div>
            </div>

            {/* URL */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Link</span>
                </div>
                <div className="p-5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">URL</Label>
                    <Input placeholder="https://aztu.edu.az/..." value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
            </div>

            {/* AZ section */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide">AZ</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Azərbaycan dili</span>
                </div>
                <div className="p-5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Təsvir</Label>
                    <Input placeholder="Təsviri daxil edin" value={descAz} onChange={(e) => setDescAz(e.target.value)} />
                </div>
            </div>

            {/* EN section */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide">EN</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">English</span>
                </div>
                <div className="p-5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Description</Label>
                    <Input placeholder="Enter description" value={descEn} onChange={(e) => setDescEn(e.target.value)} />
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
