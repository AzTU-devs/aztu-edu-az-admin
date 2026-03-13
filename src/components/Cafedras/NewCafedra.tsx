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
        getFaculties(0, 100, "az").then((res) => {
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
        <div className="p-5 space-y-6">
            <div className="mb-[10px]">
                <Label className="text-[17px]">Fakültə</Label>
                <select
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onClick={handleSubmit}
                disabled={loading || !isFormValid}
            >
                {loading ? "Yadda saxlanılır" : "Yadda saxla"}
            </Button>
        </div>
    );
}
