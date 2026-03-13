import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Swal from "sweetalert2";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { CircularProgress } from "@mui/material";
import { getCafedraDetails, updateCafedra, Cafedra } from "../../services/cafedra/cafedraService";

export default function CafedraDetails() {
    const { cafedra_code } = useParams();
    const navigate = useNavigate();

    const [cafedra, setCafedra] = useState<Cafedra | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [azName, setAzName] = useState("");
    const [enName, setEnName] = useState("");

    useEffect(() => {
        if (!cafedra_code) return;
        setLoading(true);
        getCafedraDetails(cafedra_code, "az").then((res) => {
            if (res && typeof res === "object" && "cafedra_code" in res) {
                setCafedra(res as Cafedra);
                setAzName((res as Cafedra).cafedra_name);
            } else if (res === "NOT FOUND") {
                setError("Kafedra tapılmadı");
            } else {
                setError("Kafedra yüklənərkən xəta baş verdi");
            }
        }).finally(() => setLoading(false));
    }, [cafedra_code]);

    const handleSave = async () => {
        if (!cafedra_code) return;
        setSaving(true);

        const result = await updateCafedra({
            cafedra_code,
            az_name: azName || undefined,
            en_name: enName || undefined,
        });

        setSaving(false);

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Kafedra uğurla yeniləndi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => navigate("/cafedras"));
        } else if (result === "NOT FOUND") {
            Swal.fire({ icon: "error", title: "Xəta", text: "Kafedra tapılmadı", timer: 2000, showConfirmButton: false });
        } else {
            Swal.fire({ icon: "error", title: "Xəta", text: "Kafedra yenilənərkən xəta baş verdi", timer: 2000, showConfirmButton: false });
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
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kafedra kodu</p>
                    <p className="font-mono font-bold text-blue-500">{cafedra?.cafedra_code}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fakültə kodu</p>
                    <p className="font-mono font-bold text-gray-600 dark:text-gray-300">{cafedra?.faculty_code}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- AZ --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Kafedra adı</Label>
                    <Input placeholder="Kafedra adı" value={azName} onChange={(e) => setAzName(e.target.value)} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- EN --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Department name</Label>
                    <Input placeholder="Department name" value={enName} onChange={(e) => setEnName(e.target.value)} />
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
