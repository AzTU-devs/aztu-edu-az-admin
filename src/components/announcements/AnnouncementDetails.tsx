import Swal from "sweetalert2";
import Label from "../form/Label";
import Editor from "../editor/Editor";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import DropzoneComponent from "../form/form-elements/DropZone";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import {
    AnnouncementDetail,
    getAnnouncementDetails,
    updateAnnouncement,
} from "../../services/announcement/announcementService";

export default function AnnouncementDetails() {
    const { announcement_id } = useParams<{ announcement_id: string }>();
    const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [titleAz, setTitleAz] = useState("");
    const [contentAz, setContentAz] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [contentEn, setContentEn] = useState("");
    const [newImage, setNewImage] = useState<File | null>(null);

    const fetchBoth = async (id: string) => {
        const [az, en] = await Promise.all([
            getAnnouncementDetails(id, "az"),
            getAnnouncementDetails(id, "en"),
        ]);
        return { az, en };
    };

    const loadAnnouncement = async () => {
        if (!announcement_id) return;
        setLoading(true);
        setNotFound(false);
        const { az, en } = await fetchBoth(announcement_id);

        if (az === "NOT FOUND") {
            setNotFound(true);
            setAnnouncement(null);
            setLoading(false);
            return;
        }

        if (typeof az === "object") {
            setAnnouncement(az as AnnouncementDetail);
            setTitleAz(az.title || "");
            setContentAz(az.html_content || "");
        }
        if (typeof en === "object") {
            setTitleEn(en.title || "");
            setContentEn(en.html_content || "");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadAnnouncement();
    }, [announcement_id]);

    const handleSave = async () => {
        if (!announcement_id) return;
        setSaving(true);
        const result = await updateAnnouncement(Number(announcement_id), {
            image: newImage ?? undefined,
            az: { title: titleAz, html_content: contentAz },
            en: { title: titleEn, html_content: contentEn },
        });
        setSaving(false);

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Elan yeniləndi",
                timer: 1500,
                showConfirmButton: false,
            });
            setEditing(false);
            setNewImage(null);
            await loadAnnouncement();
        } else {
            Swal.fire({
                icon: "error",
                title: "Xəta",
                text: "Elan yenilənərkən xəta baş verdi",
                timer: 1500,
                showConfirmButton: false,
            });
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setNewImage(null);
        if (announcement) {
            setTitleAz(announcement.title || "");
            setContentAz(announcement.html_content || "");
        }
        // Re-fetch to restore EN as well
        if (announcement_id) loadAnnouncement();
    };

    if (notFound) {
        return (
            <div className="p-5 text-center text-red-500 dark:text-red-400 text-lg">
                Elan tapılmadı
            </div>
        );
    }

    return (
        <div className="p-5 space-y-6">
            {/* Top action bar */}
            <div className="flex justify-end">
                {!editing ? (
                    <Button
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                        onClick={() => setEditing(true)}
                    >
                        <EditIcon sx={{ fontSize: 16 }} /> Redaktə et
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl flex items-center gap-2"
                            onClick={handleCancel}
                        >
                            <CloseIcon sx={{ fontSize: 16 }} /> Ləğv et
                        </Button>
                        <Button
                            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Yadda saxlanılır..." : "Yadda saxla"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Meta info */}
            <div className="flex gap-6 flex-wrap">
                <div>
                    <Label className="text-[14px] text-gray-400">Elan ID</Label>
                    {loading ? (
                        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 animate-pulse rounded mt-1"></div>
                    ) : (
                        <p className="text-gray-700 dark:text-gray-200 font-mono">{announcement?.announcement_id}</p>
                    )}
                </div>
                <div>
                    <Label className="text-[14px] text-gray-400">Sıra</Label>
                    {loading ? (
                        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 animate-pulse rounded mt-1"></div>
                    ) : (
                        <p className="text-gray-700 dark:text-gray-200">{announcement?.display_order}</p>
                    )}
                </div>
                <div>
                    <Label className="text-[14px] text-gray-400">Status</Label>
                    {loading ? (
                        <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 animate-pulse rounded mt-1"></div>
                    ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            announcement?.is_active
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}>
                            {announcement?.is_active ? "Aktiv" : "Deaktiv"}
                        </span>
                    )}
                </div>
                <div>
                    <Label className="text-[14px] text-gray-400">Əlavə tarixi</Label>
                    {loading ? (
                        <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 animate-pulse rounded mt-1"></div>
                    ) : (
                        <p className="text-gray-700 dark:text-gray-200">
                            {announcement?.created_at
                                ? new Date(announcement.created_at).toLocaleString("az-AZ")
                                : "—"}
                        </p>
                    )}
                </div>
            </div>

            {/* Image */}
            <div>
                <Label className="text-[17px]">Şəkil</Label>
                {loading ? (
                    <div className="h-48 w-72 bg-gray-300 dark:bg-gray-600 animate-pulse rounded-[10px]"></div>
                ) : editing ? (
                    <div className="space-y-3">
                        {announcement?.image && (
                            <img
                                src={`http://127.0.0.1:8000/${announcement.image}`}
                                alt="Mövcud şəkil"
                                className="w-72 h-48 object-cover border border-gray-200 dark:border-gray-700 rounded-[10px]"
                                draggable={false}
                            />
                        )}
                        <DropzoneComponent onFileSelect={setNewImage} />
                        {newImage && (
                            <p className="text-xs text-gray-500">Yeni şəkil seçildi: {newImage.name}</p>
                        )}
                    </div>
                ) : announcement?.image ? (
                    <img
                        src={`http://127.0.0.1:8000/${announcement.image}`}
                        alt="Elan şəkli"
                        className="w-72 h-48 object-cover border border-gray-200 dark:border-gray-700 rounded-[10px]"
                        draggable={false}
                    />
                ) : (
                    <p className="text-sm text-gray-400">—</p>
                )}
            </div>

            {/* AZ content */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- AZ --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Başlıq</Label>
                    {loading ? (
                        <div className="h-8 w-full bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                    ) : (
                        <Input
                            placeholder="Başlıq"
                            value={titleAz}
                            onChange={(e) => setTitleAz(e.target.value)}
                            readOnly={!editing}
                        />
                    )}
                </div>
                {loading ? (
                    <div className="h-24 w-full bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                ) : editing ? (
                    <Editor initialContent={contentAz} onUpdate={(html) => setContentAz(html)} />
                ) : contentAz ? (
                    <Editor readOnlyContent={contentAz} />
                ) : null}
            </div>

            {/* EN content */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- EN --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Title</Label>
                    {loading ? (
                        <div className="h-8 w-full bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                    ) : (
                        <Input
                            placeholder="Title"
                            value={titleEn}
                            onChange={(e) => setTitleEn(e.target.value)}
                            readOnly={!editing}
                        />
                    )}
                </div>
                {loading ? (
                    <div className="h-24 w-full bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                ) : editing ? (
                    <Editor initialContent={contentEn} onUpdate={(html) => setContentEn(html)} />
                ) : contentEn ? (
                    <Editor readOnlyContent={contentEn} />
                ) : null}
            </div>
        </div>
    );
}
