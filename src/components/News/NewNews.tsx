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
    const [descAz, setDescAz] = useState("");
    const [contentAZ, setContentAZ] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [descEn, setDescEn] = useState("");
    const [contentEN, setContentEN] = useState("");

    const isFormValid =
        categoryId.trim() !== "" &&
        titleAz.trim() !== "" &&
        descAz.trim() !== "" &&
        titleEn.trim() !== "" &&
        descEn.trim() !== "";

    const handleSubmit = async () => {
        setLoading(true);

        const payload: CreateNewsPayload = {
            cateogry_id: Number(categoryId),
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
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Təsvir</Label>
                    <Input
                        placeholder="Təsvir"
                        value={descAz}
                        onChange={(e) => setDescAz(e.target.value)}
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
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Təsvir</Label>
                    <Input
                        placeholder="Təsvir"
                        value={descEn}
                        onChange={(e) => setDescEn(e.target.value)}
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
