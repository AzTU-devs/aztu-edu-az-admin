import { createProject, CreateProjectPayload } from "../../services/project/projectService";
import { useState } from "react";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Editor from "../editor/Editor";
import Input from "../form/input/InputField";
import DropzoneComponent from "../form/form-elements/DropZone";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";

export default function NewProject() {
    const navigate = useNavigate();
    const [descAz, setDescAz] = useState("");
    const [descEn, setDescEn] = useState("");
    const [titleAz, setTitleAz] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [loading, setLoading] = useState(false);
    const [contentEN, setContentEN] = useState("");
    const [contentAZ, setContentAZ] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const isFormValid = titleAz.trim() !== "" && titleEn.trim() !== "" && descAz.trim() !== "" && descEn.trim() !== "" && selectedFile !== null;

    const handleSubmit = async () => {
      if (!selectedFile) return;

      setLoading(true);
      const payload: CreateProjectPayload = {
        bg_image: selectedFile,
        az: {
          title: titleAz,
          desc: descAz,
          content_html: contentAZ,
        },
        en: {
          title: titleEn,
          desc: descEn,
          content_html: contentEN,
        },
      };

      const result = await createProject(payload);
      setLoading(false);

      if (result === "SUCCESS") {
        Swal.fire({
          icon: "success",
          title: "Uğurlu",
          text: "Layihə uğurla əlavə edildi!",
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
            setTitleAz("");
            setTitleEn("");
            setDescAz("");
            setDescEn("");
            setContentAZ("");
            setContentEN("");
            setSelectedFile(null);
            navigate("/projects");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Xəta",
          text: "Layihə əlavə edərkən xəta baş verdi",
          timer: 2000,
          showConfirmButton: false
        });
      }
    };

    return (
        <div className="p-5 sm:p-6 space-y-5">
            {/* Image upload */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Layihə şəkli</span>
                </div>
                <div className="p-5">
                    <DropzoneComponent onFileSelect={setSelectedFile} />
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
                        <Input placeholder="Layihənin başlığını daxil edin" value={titleAz} onChange={(e) => setTitleAz(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Təsvir</Label>
                        <Input placeholder="Qısa təsvir" value={descAz} onChange={(e) => setDescAz(e.target.value)} />
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
                        <Input placeholder="Enter project title" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Description</Label>
                        <Input placeholder="Short description" value={descEn} onChange={(e) => setDescEn(e.target.value)} />
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