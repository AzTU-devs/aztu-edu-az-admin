import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import ResearchInstituteForm from "./ResearchInstituteForm";
import { ResearchInstituteDetail, getInstituteDetails, updateInstitute } from "../../services/researchInstitute/researchInstituteService";

export default function ResearchInstituteDetails() {
  const { institute_code } = useParams<{ institute_code: string }>();
  const [loading, setLoading] = useState(true);
  const [institute, setInstitute] = useState<ResearchInstituteDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (institute_code) {
      setLoading(true);
      getInstituteDetails(institute_code)
        .then((res) => {
          if (res === "ERROR") setError("İnstitut məlumatları yüklənərkən xəta baş verdi");
          else if (res === "NOT FOUND") setError("İnstitut tapılmadı");
          else setInstitute(res);
        })
        .finally(() => setLoading(false));
    }
  }, [institute_code]);

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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">İnstitut Redaktəsi</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">"{institute?.az.name}" məlumatlarını yeniləyin</p>
      </div>
      <ResearchInstituteForm 
        initialValue={institute} 
        onSubmit={(payload) => updateInstitute(institute_code!, payload)} 
        submitLabel="Dəyişiklikləri Yadda Saxla" 
      />
    </div>
  );
}
