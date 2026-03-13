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
        <div className="p-5 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- AZ --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Fakültə adı</Label>
                    <Input placeholder="Fakültə adı" value={azName} onChange={(e) => setAzName(e.target.value)} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                <h2 className="text-[17px] mb-2 text-gray-400 dark:text-gray-300">-- EN --</h2>
                <div className="mb-[10px]">
                    <Label className="text-[17px]">Faculty name</Label>
                    <Input placeholder="Faculty name" value={enName} onChange={(e) => setEnName(e.target.value)} />
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
