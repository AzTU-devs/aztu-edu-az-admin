import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import DepartmentForm from "./DepartmentForm";
import {
  createDepartment,
  CreateDepartmentPayload,
  uploadDirectorImage,
  uploadWorkerImage,
} from "../../services/department/departmentService";

export default function NewDepartment() {
  const navigate = useNavigate();

  const handleSave = async (
    payload: CreateDepartmentPayload,
    directorImage: File | null,
    workerImages: (File | null)[]
  ) => {
    const result = await createDepartment(payload);

    if (result.status === "SUCCESS") {
      const { department_code, workers } = result.data || {};

      // Handle Director Image Upload
      if (department_code && directorImage) {
        await uploadDirectorImage(department_code, directorImage);
      }

      // Handle Worker Images Upload
      if (workers && Array.isArray(workers)) {
        // Map over workerImages and upload if present
        // We assume the order of workers in response matches the order in payload
        for (let i = 0; i < workerImages.length; i++) {
          const file = workerImages[i];
          const workerId = workers[i]?.worker_id;
          if (file && workerId) {
            await uploadWorkerImage(workerId, file);
          }
        }
      }

      Swal.fire({
        icon: "success",
        title: "Uğurlu",
        text: "Departament uğurla yaradıldı!",
        timer: 1800,
        showConfirmButton: false,
      });

      if (department_code) {
        navigate(`/admin/departments/${department_code}/edit`);
      } else {
        navigate("/admin/departments");
      }
    }

    return result;
  };

  return <DepartmentForm onSubmit={handleSave} submitLabel="Yadda saxla" />;
}
