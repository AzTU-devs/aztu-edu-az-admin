import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { CircularProgress } from "@mui/material";
import { getFacultyDetails, FacultyDetail } from "../../services/faculty/facultyService";
import Button from "../ui/button/Button";

export default function FacultyView() {
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
        console.error("FacultyView load error", err);
        setError("Fakültə yüklənərkən xəta baş verdi");
      })
      .finally(() => setLoading(false));
  }, [faculty_code]);

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

  const facultyData = faculty as FacultyDetail & { faculty_name?: string; about_text?: string };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Fakültə detalları</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kod: {faculty?.faculty_code}</p>
        </div>
        <Button className="w-full sm:w-auto" type="button" onClick={() => navigate("/faculties")}>Geri</Button>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">AZ adı</p>
            <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">{facultyData?.az?.faculty_name || facultyData?.faculty_name || "–"}</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{facultyData?.az?.about_text || facultyData?.about_text || "Məlumat yoxdur."}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">EN name</p>
            <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">{facultyData?.en?.faculty_name || facultyData?.faculty_name || "–"}</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{facultyData?.en?.about_text || facultyData?.about_text || "No description."}</p>
          </div>
        </div>

        {faculty?.director ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-950">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-100">Direktor</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 mt-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ad</p>
                <p className="text-sm text-gray-900 dark:text-white">{faculty.director.first_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Soyad</p>
                <p className="text-sm text-gray-900 dark:text-white">{faculty.director.last_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm text-gray-900 dark:text-white">{faculty.director.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Telefon</p>
                <p className="text-sm text-gray-900 dark:text-white">{faculty.director.phone}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">Direktor məlumatları mövcud deyil.</div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Laboratoriyalar</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{faculty?.laboratories?.length ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Tədqiqat işləri</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{faculty?.research_works?.length ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">Partnyor şirkətlər</p>
            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{faculty?.partner_companies?.length ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
