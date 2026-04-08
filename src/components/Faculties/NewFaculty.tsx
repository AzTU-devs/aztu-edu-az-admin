import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import FacultyForm from "./FacultyForm";
import { createFaculty, CreateFacultyPayload } from "../../services/faculty/facultyService";

export default function NewFaculty() {
    const navigate = useNavigate();

    const handleSubmit = async (payload: CreateFacultyPayload) => {
        return await createFaculty(payload);
    };

    return <FacultyForm submitLabel="Yadda saxla" onSubmit={handleSubmit} />;
}
