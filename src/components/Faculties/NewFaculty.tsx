import { useState } from "react";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";
import { createFaculty } from "../../services/faculty/facultyService";

export default function NewFaculty() {
    const navigate = useNavigate();
    const [azName, setAzName] = useState("");
    const [enName, setEnName] = useState("");
    const [loading, setLoading] = useState(false);

    const isFormValid = azName.trim() !== "" && enName.trim() !== "";

    const handleSubmit = async () => {
        setLoading(true);
        const result = await createFaculty({ az_name: azName, en_name: enName });
        setLoading(false);

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Fakültə uğurla əlavə edildi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => navigate("/faculties"));
        } else {
            Swal.fire({
                icon: "error",
                title: "Xəta",
                text: "Fakültə əlavə edərkən xəta baş verdi",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    return (
        <div className="p-5 sm:p-6 space-y-5">
            {/* AZ section */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide">AZ</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Azərbaycan dili</span>
                </div>
                <div className="p-5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Fakültə adı</Label>
                    <Input placeholder="Fakültə adını daxil edin" value={azName} onChange={(e) => setAzName(e.target.value)} />
                </div>
            </div>

            {/* EN section */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide">EN</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">English</span>
                </div>
                <div className="p-5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Faculty name</Label>
                    <Input placeholder="Enter faculty name" value={enName} onChange={(e) => setEnName(e.target.value)} />
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
