import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import ResearchLaboratoryForm from "./ResearchLaboratoryForm";
import { Laboratory, getLaboratoryDetails } from "../../services/cafedra/cafedraService";

export default function ResearchLaboratoryDetails() {
  const { laboratory_id } = useParams<{ laboratory_id: string }>();
  const [loading, setLoading] = useState(true);
  const [lab, setLab] = useState<Laboratory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(laboratory_id);
    if (!laboratory_id || Number.isNaN(id)) {
      setError("Laboratoriya tapılmadı");
      setLoading(false);
      return;
    }
    setLoading(true);
    getLaboratoryDetails(id)
      .then((res) => {
        if (res === "ERROR") setError("Laboratoriya məlumatları yüklənərkən xəta baş verdi");
        else if (res === "NOT FOUND") setError("Laboratoriya tapılmadı");
        else setLab(res);
      })
      .finally(() => setLoading(false));
  }, [laboratory_id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-red-600 dark:text-red-400 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Laboratoriya Redaktəsi</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">"{lab?.az.title || lab?.en.title}" məlumatlarını yeniləyin</p>
      </div>
      <ResearchLaboratoryForm initialValue={lab} submitLabel="Dəyişiklikləri Yadda Saxla" />
    </div>
  );
}
