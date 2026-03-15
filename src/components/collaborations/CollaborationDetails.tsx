import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import DropzoneComponent from "../form/form-elements/DropZone";
import Button from "../ui/button/Button";
import { CircularProgress } from "@mui/material";
import {
    getCollaborationDetails,
    updateCollaboration,
    Collaboration,
} from "../../services/collaboration/collaborationService";

const BASE_URL = "https://api-aztu.karamshukurlu.site";

export default function CollaborationDetails() {
    const { collaboration_id } = useParams();
    const navigate = useNavigate();

    const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [azName, setAzName] = useState("");
    const [enName, setEnName] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [newLogo, setNewLogo] = useState<File | null>(null);

    useEffect(() => {
        if (!collaboration_id) return;
        setLoading(true);
        getCollaborationDetails(Number(collaboration_id), "az").then((res) => {
            if (res && typeof res === "object" && "collaboration_id" in res) {
                const c = res as Collaboration;
                setCollaboration(c);
                setAzName(c.name);
                setEnName(c.name);
                setWebsiteUrl(c.website_url ?? "");
            } else if (res === "NOT FOUND") {
                setError("Əməkdaşlıq tapılmadı");
            } else {
                setError("Əməkdaşlıq yüklənərkən xəta baş verdi");
            }
        }).finally(() => setLoading(false));
    }, [collaboration_id]);

    const handleSave = async () => {
        if (!collaboration_id) return;
        setSaving(true);

        const result = await updateCollaboration({
            collaboration_id: Number(collaboration_id),
            az_name: azName,
            en_name: enName,
            logo: newLogo || undefined,
            website_url: websiteUrl.trim() || undefined,
        });

        setSaving(false);

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Əməkdaşlıq uğurla yeniləndi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => navigate("/collaborations"));
        } else if (result === "NOT FOUND") {
            Swal.fire({ icon: "error", title: "Xəta", text: "Əməkdaşlıq tapılmadı", timer: 2000, showConfirmButton: false });
        } else {
            Swal.fire({ icon: "error", title: "Xəta", text: "Əməkdaşlıq yenilənərkən xəta baş verdi", timer: 2000, showConfirmButton: false });
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
        <div className="p-5 sm:p-6 space-y-5">
            {/* Current logo */}
            {collaboration?.logo && (
                <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mövcud loqo</span>
                    </div>
                    <div className="p-5">
                        <img
                            src={`${BASE_URL}/${collaboration.logo}`}
                            alt={collaboration.name}
                            className="h-20 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2"
                        />
                    </div>
                </div>
            )}

            {/* New logo upload */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Yeni loqo</span>
                    <span className="ml-auto text-[11px] text-gray-400 font-medium">Dəyişmək istəyirsinizsə yükləyin</span>
                </div>
                <div className="p-5">
                    <DropzoneComponent onFileSelect={setNewLogo} />
                </div>
            </div>

            {/* Website URL */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Veb sayt</span>
                </div>
                <div className="p-5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">URL</Label>
                    <Input placeholder="https://..." value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
                </div>
            </div>

            {/* AZ section */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide">AZ</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Azərbaycan dili</span>
                </div>
                <div className="p-5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Universitetin adı</Label>
                    <Input placeholder="Universitetin adını daxil edin" value={azName} onChange={(e) => setAzName(e.target.value)} />
                </div>
            </div>

            {/* EN section */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide">EN</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">English</span>
                </div>
                <div className="p-5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">University name</Label>
                    <Input placeholder="Enter university name" value={enName} onChange={(e) => setEnName(e.target.value)} />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
                <Button
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                    onClick={handleSave}
                    disabled={saving || azName.trim() === "" || enName.trim() === ""}
                >
                    {saving ? "Yadda saxlanılır..." : "Yadda saxla"}
                </Button>
            </div>
        </div>
    );
}
