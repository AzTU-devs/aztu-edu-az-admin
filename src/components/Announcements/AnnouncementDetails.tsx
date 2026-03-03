import Label from "../form/Label";
import Editor from "../editor/Editor";
import Input from "../form/input/InputField";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    AnnouncementDetail,
    getAnnouncementDetails,
} from "../../services/announcement/announcementService";

export default function AnnouncementDetails() {
    const lang = "az";
    const { announcement_id } = useParams<{ announcement_id: string }>();
    const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        setLoading(true);
        setNotFound(false);
        getAnnouncementDetails(announcement_id ?? "", lang)
            .then((res) => {
                if (typeof res === "object") {
                    setAnnouncement(res as AnnouncementDetail);
                } else if (res === "NOT FOUND") {
                    setNotFound(true);
                    setAnnouncement(null);
                } else {
                    setAnnouncement(null);
                }
            })
            .finally(() => setLoading(false));
    }, [announcement_id]);

    if (notFound) {
        return (
            <div className="p-5 text-center text-red-500 dark:text-red-400 text-lg">
                Elan tapılmadı
            </div>
        );
    }

    return (
        <div className="p-5 space-y-6">
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
            {(loading || announcement?.image) && (
                <div>
                    <Label className="text-[17px]">Şəkil</Label>
                    {loading ? (
                        <div className="h-48 w-72 bg-gray-300 dark:bg-gray-600 animate-pulse rounded-[10px]"></div>
                    ) : (
                        <img
                            src={`http://127.0.0.1:8000/${announcement?.image}`}
                            alt="Elan şəkli"
                            className="w-72 h-48 object-cover border border-gray-200 dark:border-gray-700 rounded-[10px]"
                            draggable={false}
                        />
                    )}
                </div>
            )}

            {/* AZ content */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- AZ --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Başlıq</Label>
                    {loading ? (
                        <div className="h-8 w-full bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                    ) : (
                        <Input placeholder="Başlıq" value={announcement?.title || ""} readOnly />
                    )}
                </div>
                {loading ? (
                    <div className="h-24 w-full bg-gray-300 dark:bg-gray-600 animate-pulse rounded"></div>
                ) : announcement?.html_content ? (
                    <Editor readOnlyContent={announcement.html_content} />
                ) : null}
            </div>
        </div>
    );
}
