import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";
import { createCafedra } from "../../services/cafedra/cafedraService";
import { getFaculties, Faculty } from "../../services/faculty/facultyService";

export default function NewCafedra() {
    const navigate = useNavigate();
    const [azName, setAzName] = useState("");
    const [enName, setEnName] = useState("");
    const [facultyCode, setFacultyCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [faculties, setFaculties] = useState<Faculty[]>([]);

    useEffect(() => {
        getFaculties(0, 100).then((res) => {
            if (res && typeof res === "object" && "faculties" in res) {
                setFaculties(res.faculties);
            }
        });
    }, []);

    const isFormValid = azName.trim() !== "" && enName.trim() !== "" && facultyCode !== "";

    const handleSubmit = async () => {
        setLoading(true);
        const result = await createCafedra({ faculty_code: facultyCode, az_name: azName, en_name: enName });
        setLoading(false);

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Kafedra uğurla əlavə edildi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => navigate("/cafedras"));
        } else {
            Swal.fire({
                icon: "error",
                title: "Xəta",
                text: "Kafedra əlavə edərkən xəta baş verdi",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    return (
        <div className="p-5 sm:p-6 space-y-5">
            {/* Faculty select */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Fakültə seçimi</span>
                </div>
                <div className="p-5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Fakültə</Label>
                    <select
                        className="w-full h-11 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-colors"
                        value={facultyCode}
                        onChange={(e) => setFacultyCode(e.target.value)}
                    >
                        <option value="">-- Fakültə seçin --</option>
                        {faculties.map((f) => (
                            <option key={f.faculty_code} value={f.faculty_code}>
                                {f.faculty_name} ({f.faculty_code})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* AZ section */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wide">AZ</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Azərbaycan dili</span>
                </div>
                <div className="p-5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Kafedra adı</Label>
                    <Input placeholder="Kafedra adını daxil edin" value={azName} onChange={(e) => setAzName(e.target.value)} />
                </div>
            </div>

            {/* EN section */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide">EN</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">English</span>
                </div>
                <div className="p-5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Department name</Label>
                    <Input placeholder="Enter department name" value={enName} onChange={(e) => setEnName(e.target.value)} />
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
