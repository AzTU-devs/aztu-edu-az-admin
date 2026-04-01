import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import FacultyForm from "./FacultyForm";
import { createFaculty, CreateFacultyPayload } from "../../services/faculty/facultyService";

export default function NewFaculty() {
    const navigate = useNavigate();

    const handleSubmit = async (payload: CreateFacultyPayload) => {
        const result = await createFaculty(payload);

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

        return result;
    };

    return <FacultyForm submitLabel="Yadda saxla" onSubmit={handleSubmit} />;
}
