import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import DepartmentForm from "./DepartmentForm";
import type { DepartmentDetails, CreateDepartmentPayload } from "../../services/department/departmentService";
import {
  deleteDepartment,
  getDepartmentDetails,
  uploadDirectorImage,
  uploadWorkerImage,
  updateDepartment,
} from "../../services/department/departmentService";

export default function DepartmentDetails() {
  const { department_code } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState<DepartmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDirector, setUploadingDirector] = useState(false);
  const [workerUploadMap, setWorkerUploadMap] = useState<Record<number, boolean>>({});
  const workerFileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!department_code) return;
    setLoading(true);
    getDepartmentDetails(department_code, "az")
      .then((res) => {
        if (res && typeof res === "object" && "department_code" in res) {
          setDepartment(res as DepartmentDetails);
        } else if (res === "NOT FOUND") {
          Swal.fire({ icon: "error", title: "Xəta", text: "Departament tapılmadı" });
        } else {
          Swal.fire({ icon: "error", title: "Xəta", text: "Departament yüklənərkən xəta baş verdi" });
        }
      })
      .finally(() => setLoading(false));
  }, [department_code]);

  const handleSave = async (
    payload: CreateDepartmentPayload,
    directorImage: File | null,
    workerImages: (File | null)[]
  ) => {
    if (!department_code) return { status: "ERROR" };

    setSaving(true);
    const result = await updateDepartment(department_code, payload);

    if (result.status === "SUCCESS") {
      const { workers } = result.data || {};

      // Handle Form-Selected Director Image
      if (directorImage) {
        await uploadDirectorImage(department_code, directorImage);
      }

      // Handle Form-Selected Worker Images
      if (workers && Array.isArray(workers)) {
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
        text: "Departament yeniləndi.",
        timer: 1600,
        showConfirmButton: false,
      });

      setLoading(true);
      const refreshed = await getDepartmentDetails(department_code, "az");
      if (refreshed && typeof refreshed === "object" && "department_code" in refreshed) {
        setDepartment(refreshed as DepartmentDetails);
      }
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

    if (result.status === "SUCCESS" && result.data?.profile_image && department) {
      Swal.fire({ icon: "success", title: "Uğurlu", text: "Direktor şəkli yükləndi.", timer: 1500, showConfirmButton: false });
      setDepartment({ ...department, director: department.director ? { ...department.director, profile_image: result.data.profile_image } : department.director });
    } else if (result.status === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurlu", text: "Direktor şəkli yükləndi.", timer: 1500, showConfirmButton: false });
    } else {
      const message = (result.status === "ERROR" && result.data?.message) ? result.data.message : "Şəkil yüklənərkən xəta baş verdi.";
      Swal.fire({ icon: "error", title: "Xəta", text: message });
    }
  };

  const triggerWorkerUpload = (workerId: number) => {
    workerFileRefs.current[workerId]?.click();
  };

  const handleWorkerImage = async (workerId: number, file: File) => {
    setWorkerUploadMap((prev) => ({ ...prev, [workerId]: true }));
    const result = await uploadWorkerImage(workerId, file);
    setWorkerUploadMap((prev) => ({ ...prev, [workerId]: false }));

    if (result.status === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurlu", text: "İşçi şəkli yükləndi.", timer: 1500, showConfirmButton: false });
      if (department) {
        setDepartment({
          ...department,
          workers: department.workers.map((worker) =>
            worker.worker_id === workerId
              ? { ...worker, profile_image: result.data?.profile_image ?? worker.profile_image }
              : worker
          ),
        });
      }
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Departament kodu</p>
          <p className="mt-2 font-mono font-bold text-blue-500">{department.department_code}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">İşçi sayı</p>
          <p className="mt-2 font-semibold text-gray-800 dark:text-gray-100">{department.worker_count}</p>
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
          workers: department.workers.map((worker) => ({
            first_name: worker.first_name,
            last_name: worker.last_name,
            father_name: worker.father_name ?? "",
            email: worker.email ?? "",
            phone: worker.phone ?? "",
            az: {
              duty: worker.az.duty,
              scientific_degree: worker.az.scientific_degree ?? "",
              scientific_name: worker.az.scientific_name ?? "",
            },
            en: {
              duty: worker.en.duty,
              scientific_degree: worker.en.scientific_degree ?? "",
              scientific_name: worker.en.scientific_name ?? "",
            },
            profile_image: worker.profile_image ?? "",
          }))
        }}
        submitLabel={saving ? "Yenilənir..." : "Yadda saxla"}
        onSubmit={handleSave}
      />

      {department.director ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">Direktor profil şəkli</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Dizayn üçün direktor üçün ayrıca şəkil yükləyin.</p>
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
          {department.director.profile_image ? (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Cari şəkil: {department.director.profile_image}</p>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">İşçi şəkilləri</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hər bir işçiyə ayrıca profil şəkli yükləyin.</p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            İşçilərə keç
          </button>
        </div>
        <div className="space-y-4">
          {department.workers.map((worker) => (
            <div key={worker.worker_id} className="grid gap-4 lg:grid-cols-3 items-center rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{worker.first_name} {worker.last_name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{worker.az.duty} / {worker.en.duty}</p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {worker.profile_image ? `Cari şəkil: ${worker.profile_image}` : "Şəkil yüklənməyib"}
              </div>
              <div className="flex items-center gap-2 justify-end">
                <input
                  id={`worker-image-upload-${worker.worker_id}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  ref={(el) => { workerFileRefs.current[worker.worker_id] = el; }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleWorkerImage(worker.worker_id, file);
                  }}
                />
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl bg-brand-500 text-white text-sm hover:bg-brand-600 transition"
                  onClick={() => triggerWorkerUpload(worker.worker_id)}
                  disabled={workerUploadMap[worker.worker_id]}
                >
                  {workerUploadMap[worker.worker_id] ? "Yüklənir..." : "Şəkil yüklə"}
                </button>
              </div>
            </div>
          ))}
          {department.workers.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Hələ heç bir işçi yoxdur.</p>}
        </div>
      </div>

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
