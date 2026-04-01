import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import FacultyForm from "./FacultyForm";
import { getFacultyDetails, updateFaculty, FacultyDetail, CreateFacultyPayload } from "../../services/faculty/facultyService";

export default function FacultyDetails() {
    const { faculty_code } = useParams();
    const navigate = useNavigate();

    const [faculty, setFaculty] = useState<FacultyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
if (!faculty_code) {
        setError("Fakültə kodu müəyyən edilmədi");
        setLoading(false);
        return;
    }

    setLoading(true);
    getFacultyDetails(faculty_code)
        .then((res) => {
            if (res && typeof res === "object" && "faculty_code" in res) {
                setFaculty(res as FacultyDetail);
            } else if (res === "NOT FOUND") {
                setError("Fakültə tapılmadı");
            } else {
                setError("Fakültə yüklənərkən xəta baş verdi");
            }
        })
        .catch((err) => {
            console.error("FacultyDetails load error", err);
            setError("Fakültə yüklənərkən xəta baş verdi");
            })
            .finally(() => setLoading(false));
    }, [faculty_code]);

    const handleSubmit = async (payload: CreateFacultyPayload) => {
        if (!faculty_code) {
            return "ERROR";
        }

        const result = await updateFaculty({ faculty_code, ...payload });

        if (result === "SUCCESS") {
            Swal.fire({
                icon: "success",
                title: "Uğurlu",
                text: "Fakültə uğurla yeniləndi!",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => navigate("/faculties"));
        } else if (result === "NOT FOUND") {
            Swal.fire({ icon: "error", title: "Xəta", text: "Fakültə tapılmadı", timer: 2000, showConfirmButton: false });
        } else {
            Swal.fire({ icon: "error", title: "Xəta", text: "Fakültə yenilənərkən xəta baş verdi", timer: 2000, showConfirmButton: false });
        }

        return result;
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

    return <FacultyForm initialValue={faculty} submitLabel="Yenilə" onSubmit={handleSubmit} />;
}
