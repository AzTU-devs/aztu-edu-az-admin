import FacultyForm from "./FacultyForm";
import { createFaculty, CreateFacultyPayload } from "../../services/faculty/facultyService";

export default function NewFaculty() {
    const handleSubmit = async (payload: CreateFacultyPayload) => {
        return await createFaculty(payload);
    };

    return <FacultyForm submitLabel="Yadda saxla" onSubmit={handleSubmit} />;
}
