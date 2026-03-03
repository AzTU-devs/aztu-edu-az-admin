import { useState } from "react";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Editor from "../editor/Editor";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import DropzoneComponent from "../form/form-elements/DropZone";
import { useNavigate } from "react-router";
import {
    createAnnouncement,
    CreateAnnouncementPayload,
} from "../../services/announcement/announcementService";

export default function NewAnnouncement() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [titleAz, setTitleAz] = useState("");
    const [contentAZ, setContentAZ] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [contentEN, setContentEN] = useState("");

    const isFormValid =
        selectedFile !== null &&
        titleAz.trim() !== "" &&
        titleEn.trim() !== "";

    const handleSubmit = async () => {
        if (!selectedFile) return;

        setLoading(true);

        const payload: CreateAnnouncementPayload = {
            image: selectedFile,
            az: {
                title: titleAz,
                html_content: contentAZ,
            },
            en: {
                title: titleEn,
                html_content: contentEN,
            },
        };

        const result = await createAnnouncement(payload);
        setLoading(false);

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Elan uğurla əlavə edildi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => navigate("/announcements"));
        } else {
            Swal.fire({
                icon: "error",
                title: "Xəta",
                text: "Elan əlavə edərkən xəta baş verdi",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    return (
        <div className="p-5 space-y-6">
            <div>
                <Label className="text-[17px]">Şəkil</Label>
                <DropzoneComponent onFileSelect={setSelectedFile} />
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
