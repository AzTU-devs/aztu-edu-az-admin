import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import DepartmentForm from "./DepartmentForm";
import SubEntityManager from "../common/subentity/SubEntityManager";
import { PersonFormValue } from "../common/subentity/PersonForm";
import type { DepartmentDetails, CreateDepartmentPayload } from "../../services/department/departmentService";
import {
  deleteDepartment,
  getDepartmentDetails,
  uploadDirectorImage,
  uploadWorkerImage,
  updateDepartment,
  createDepartmentWorker,
  updateDepartmentWorker,
  deleteDepartmentWorker,
} from "../../services/department/departmentService";

const personToForm = (w: any): PersonFormValue => ({
  first_name: w.first_name ?? "",
  last_name: w.last_name ?? "",
  father_name: w.father_name ?? "",
  email: w.email ?? "",
  phone: w.phone ?? "",
  az: {
    duty: w.az?.duty ?? "",
    scientific_name: w.az?.scientific_name ?? "",
    scientific_degree: w.az?.scientific_degree ?? "",
  },
  en: {
    duty: w.en?.duty ?? "",
    scientific_name: w.en?.scientific_name ?? "",
    scientific_degree: w.en?.scientific_degree ?? "",
  },
  profile_image: w.profile_image ?? "",
});

export default function DepartmentDetails() {
  const { department_code } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState<DepartmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDirector, setUploadingDirector] = useState(false);

  const loadDepartment = useCallback(async () => {
    if (!department_code) return;
    const res = await getDepartmentDetails(department_code, "az");
    if (res && typeof res === "object" && "department_code" in res) {
      setDepartment(res as DepartmentDetails);
    } else if (res === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Departament tapılmadı" });
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Departament yüklənərkən xəta baş verdi" });
    }
  }, [department_code]);

  useEffect(() => {
    setLoading(true);
    loadDepartment().finally(() => setLoading(false));
  }, [loadDepartment]);

  // NOTE: previously this saved workers through the bulk update and tried to attach new
  // worker images by reading result.data.workers — but the update endpoint returns only
  // { department_code, updated_at }, so those images were silently dropped and every save
  // recreated all workers. Workers are now managed incrementally below via SubEntityManager.
  const handleSave = async (
    payload: CreateDepartmentPayload,
    directorImage: File | null
  ) => {
    if (!department_code) return { status: "ERROR" };

    setSaving(true);
    const result = await updateDepartment(department_code, payload);

    if (result.status === "SUCCESS") {
      if (directorImage) {
        await uploadDirectorImage(department_code, directorImage);
      }
      Swal.fire({
        icon: "success",
        title: "Uğurlu",
        text: "Departament yeniləndi.",
        timer: 1600,
        showConfirmButton: false,
      });
      setLoading(true);
      await loadDepartment();
      setLoading(false);
    }

    setSaving(false);
    return result;
  };

  const handleDelete = async () => {
    if (!department_code) return;
    const confirmResult = await Swal.fire({
      title: "Departamenti silmək istədiyinizə əminsiniz?",
      text: "Bu əməliyyat geri alına bilməz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
      reverseButtons: true,
    });
    if (!confirmResult.isConfirmed) return;

    const result = await deleteDepartment(department_code);
    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1500 });
      navigate("/admin/departments");
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Departament tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Departament silinərkən xəta baş verdi", showConfirmButton: false, timer: 1500 });
    }
  };

  const handleDirectorImage = async (file: File) => {
    if (!department_code) return;
    setUploadingDirector(true);
    const result = await uploadDirectorImage(department_code, file);
    setUploadingDirector(false);

    if (result.status === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurlu", text: "Direktor şəkli yükləndi.", timer: 1500, showConfirmButton: false });
      await loadDepartment();
    } else {
      const message = result.status === "ERROR" && result.data?.message ? result.data.message : "Şəkil yüklənərkən xəta baş verdi.";
      Swal.fire({ icon: "error", title: "Xəta", text: message });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (!department) {
    return <div className="text-center text-red-500 py-10">Departament yüklənməyib.</div>;
  }

  const d = department as any;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Departament kodu</p>
          <p className="mt-2 font-mono font-bold text-blue-500">{department.department_code}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">İşçi sayı</p>
          <p className="mt-2 font-semibold text-gray-800 dark:text-gray-100">{(d.workers ?? []).length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Yaradılma tarixi</p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{new Date(department.created_at).toLocaleString("az-AZ")}</p>
        </div>
      </div>

      <DepartmentForm
        initialValue={{
          az: department.az,
          en: department.en,
          objectives: department.objectives,
          core_functions: department.core_functions,
          director: department.director,
          workers: [],
        }}
        submitLabel={saving ? "Yenilənir..." : "Yadda saxla"}
        isEdit
        onSubmit={handleSave}
      />

      {department.director ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">Direktor profil şəkli</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Direktor üçün ayrıca şəkil yükləyin.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                id="director-image-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDirectorImage(file);
                }}
              />
              <label htmlFor="director-image-upload" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-brand-500 text-white hover:bg-brand-600 cursor-pointer">
                {uploadingDirector ? "Yüklənir..." : "Şəkil yığ"}
              </label>
            </div>
          </div>
          {(department.director as any).profile_image ? (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Cari şəkil: {(department.director as any).profile_image}</p>
          ) : null}
        </div>
      ) : null}

      {department_code && (
        <SubEntityManager
          title="İşçilər"
          description="Departament işçilərini ayrıca əlavə edin, redaktə edin və silin."
          items={(d.workers ?? []) as any[]}
          getId={(w) => w.id}
          getName={(w) => `${w.first_name} ${w.last_name}`}
          getSubtitle={(w) => w.az?.duty ?? ""}
          getImage={(w) => w.profile_image}
          toFormValue={personToForm}
          onCreate={(v) => createDepartmentWorker(department_code, v)}
          onUpdate={(id, v) => updateDepartmentWorker(id, v)}
          onDelete={(id) => deleteDepartmentWorker(id)}
          onUploadImage={(id, file) => uploadWorkerImage(id, file)}
          onChanged={loadDepartment}
        />
      )}

      <div className="flex justify-between gap-3">
        <button
          type="button"
          className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 transition"
          onClick={handleDelete}
        >
          Departamenti sil
        </button>
      </div>
    </div>
  );
}
