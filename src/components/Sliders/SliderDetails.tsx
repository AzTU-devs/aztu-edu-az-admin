import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import DropzoneComponent from "../form/form-elements/DropZone";
import Button from "../ui/button/Button";
import { CircularProgress } from "@mui/material";
import { getSliderDetails, editSlider, Slider } from "../../services/slider/sliderService";

export default function SliderDetails() {
    const { slider_id } = useParams();
    const navigate = useNavigate();

    const [slider, setSlider] = useState<Slider | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [url, setUrl] = useState("");
    const [descAz, setDescAz] = useState("");
    const [descEn, setDescEn] = useState("");
    const [newImage, setNewImage] = useState<File | null>(null);

    useEffect(() => {
        if (!slider_id) return;
        setLoading(true);
        getSliderDetails(Number(slider_id), "az").then((res) => {
            if (res && typeof res === "object" && "slider_id" in res) {
                setSlider(res as Slider);
                setUrl((res as Slider).url);
                setDescAz((res as Slider).desc);
            } else if (res === "NOT FOUND") {
                setError("Slayder tapılmadı");
            } else {
                setError("Slayder yüklənərkən xəta baş verdi");
            }
        }).finally(() => setLoading(false));
    }, [slider_id]);

    const handleSave = async () => {
        if (!slider_id) return;
        setSaving(true);

        const result = await editSlider({
            slider_id: Number(slider_id),
            url,
            az_desc: descAz,
            en_desc: descEn || undefined,
            image: newImage || undefined,
        });

        setSaving(false);

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Slayder uğurla yeniləndi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => navigate("/sliders"));
        } else if (result === "NOT FOUND") {
            Swal.fire({ icon: "error", title: "Xəta", text: "Slayder tapılmadı", timer: 2000, showConfirmButton: false });
        } else {
            Swal.fire({ icon: "error", title: "Xəta", text: "Slayder yenilənərkən xəta baş verdi", timer: 2000, showConfirmButton: false });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    return (
        <div className="p-5 space-y-6">
            {slider?.image && (
                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Mövcud şəkil:</p>
                    <img
                        src={`http://127.0.0.1:8000/${slider.image}`}
                        alt="Slider"
                        className="max-h-48 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                    />
                </div>
            )}

            <Label className="text-[17px]">Yeni şəkil (dəyişmək istəyirsinizsə)</Label>
            <DropzoneComponent onFileSelect={setNewImage} />

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
                onClick={handleSave}
                disabled={saving}
            >
                {saving ? "Yadda saxlanılır" : "Yadda saxla"}
            </Button>
        </div>
    );
}
