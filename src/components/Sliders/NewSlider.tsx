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
        <div className="p-5 space-y-6">
            <Label className="text-[17px]">Slayder şəkli</Label>
            <DropzoneComponent onFileSelect={setSelectedFile} />

            <div className="mb-[10px]">
                <Label className="text-[17px]">URL</Label>
                <Input placeholder="https://aztu.edu.az/..." value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- AZ --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Təsvir</Label>
                    <Input placeholder="Təsvir" value={descAz} onChange={(e) => setDescAz(e.target.value)} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- EN --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Description</Label>
                    <Input placeholder="Description" value={descEn} onChange={(e) => setDescEn(e.target.value)} />
                </div>
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
