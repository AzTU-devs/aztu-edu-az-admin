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
        <div className="p-5 space-y-6">
            <Label className="text-[17px]">
                Layihə şəkli
            </Label>
            <DropzoneComponent onFileSelect={setSelectedFile} />
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- AZ --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">
                        Başlıq
                    </Label>
                    <Input placeholder="Başlıq" value={titleAz} onChange={(e) => setTitleAz(e.target.value)} />
                </div>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">
                        Təsvir
                    </Label>
                    <Input placeholder="Təsvir" value={descAz} onChange={(e) => setDescAz(e.target.value)} />
                </div>
                <Editor onUpdate={(html: string) => setContentAZ(html)} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- EN --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">
                        Başlıq
                    </Label>
                    <Input placeholder="Başlıq" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
                </div>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">
                        Təsvir
                    </Label>
                    <Input placeholder="Təsvir" value={descEn} onChange={(e) => setDescEn(e.target.value)} />
                </div>
                <Editor onUpdate={(html: string) => setContentEN(html)} />
            </div>

            <Button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={handleSubmit}
                disabled={loading || !isFormValid}
            >
                {loading ? "Yadda saxlanılır" : "Yadda saxla"}
            </Button>
        </div>
    );
}