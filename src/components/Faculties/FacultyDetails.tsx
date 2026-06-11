import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import FacultyForm from "./FacultyForm";
import SubEntityManager from "../common/subentity/SubEntityManager";
import { PersonFormValue } from "../common/subentity/PersonForm";
import {
  getFacultyDetails,
  updateFaculty,
  uploadWorkerImage,
  uploadDeputyDeanImage,
  createFacultyWorker,
  updateFacultyWorker,
  deleteFacultyWorker,
  createDeputyDean,
  updateDeputyDean,
  deleteDeputyDean,
  createScientificCouncilMember,
  updateScientificCouncilMember,
  deleteScientificCouncilMember,
  FacultyDetail,
  CreateFacultyPayload,
} from "../../services/faculty/facultyService";

const personToForm = (p: any): PersonFormValue => ({
  first_name: p.first_name ?? "",
  last_name: p.last_name ?? "",
  father_name: p.father_name ?? "",
  email: p.email ?? "",
  phone: p.phone ?? "",
  az: {
    duty: p.az?.duty ?? "",
    scientific_name: p.az?.scientific_name ?? "",
    scientific_degree: p.az?.scientific_degree ?? "",
  },
  en: {
    duty: p.en?.duty ?? "",
    scientific_name: p.en?.scientific_name ?? "",
    scientific_degree: p.en?.scientific_degree ?? "",
  },
  profile_image: p.profile_image ?? "",
});

export default function FacultyDetails() {
  const { faculty_code } = useParams();

  const [faculty, setFaculty] = useState<FacultyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFaculty = useCallback(async () => {
    if (!faculty_code) {
      setError("Fakültə kodu müəyyən edilmədi");
      setLoading(false);
      return;
    }
    const res = await getFacultyDetails(faculty_code);
    if (res && typeof res === "object" && "faculty_code" in res) {
      setFaculty(res as FacultyDetail);
      setError(null);
    } else if (res === "NOT FOUND") {
      setError("Fakültə tapılmadı");
    } else {
      setError("Fakültə yüklənərkən xəta baş verdi");
    }
  }, [faculty_code]);

  useEffect(() => {
    setLoading(true);
    loadFaculty().finally(() => setLoading(false));
  }, [loadFaculty]);

  const handleSubmit = async (payload: CreateFacultyPayload) => {
    if (!faculty_code) return { status: "ERROR" };
    return await updateFaculty({ faculty_code, ...payload });
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
    <div className="space-y-6">
      <FacultyForm initialValue={faculty} submitLabel="Yenilə" isEdit onSubmit={handleSubmit} />

      {faculty_code && faculty && (
        <div className="space-y-6 p-5 sm:p-6 pt-0">
          <SubEntityManager
            title="İşçilər"
            description="Fakültə işçilərini ayrıca əlavə edin, redaktə edin və silin."
            items={(faculty.workers ?? []) as any[]}
            getId={(w) => w.id}
            getName={(w) => `${w.first_name} ${w.last_name}`}
            getSubtitle={(w) => w.az?.duty ?? ""}
            getImage={(w) => w.profile_image}
            toFormValue={personToForm}
            onCreate={(v) => createFacultyWorker(faculty_code, v)}
            onUpdate={(id, v) => updateFacultyWorker(id, v)}
            onDelete={(id) => deleteFacultyWorker(id)}
            onUploadImage={(id, file) => uploadWorkerImage(id, file)}
            onChanged={loadFaculty}
          />

          <SubEntityManager
            title="Dekan Müavinləri"
            description="Dekan müavinlərini ayrıca idarə edin."
            items={(faculty.deputy_deans ?? []) as any[]}
            getId={(d) => d.id}
            getName={(d) => `${d.first_name} ${d.last_name}`}
            getSubtitle={(d) => d.az?.duty ?? ""}
            getImage={(d) => d.profile_image}
            toFormValue={personToForm}
            onCreate={(v) => createDeputyDean(faculty_code, v)}
            onUpdate={(id, v) => updateDeputyDean(id, v)}
            onDelete={(id) => deleteDeputyDean(id)}
            onUploadImage={(id, file) => uploadDeputyDeanImage(id, file)}
            onChanged={loadFaculty}
          />

          <SubEntityManager
            title="Elmi Şura Üzvləri"
            description="Elmi şura üzvlərini ayrıca idarə edin."
            items={(faculty.scientific_council ?? []) as any[]}
            getId={(m) => m.id}
            getName={(m) => `${m.first_name} ${m.last_name}`}
            getSubtitle={(m) => m.az?.duty ?? ""}
            showImage={false}
            toFormValue={personToForm}
            onCreate={(v) => createScientificCouncilMember(faculty_code, v)}
            onUpdate={(id, v) => updateScientificCouncilMember(id, v)}
            onDelete={(id) => deleteScientificCouncilMember(id)}
            onChanged={loadFaculty}
          />
        </div>
      )}
    </div>
  );
}
