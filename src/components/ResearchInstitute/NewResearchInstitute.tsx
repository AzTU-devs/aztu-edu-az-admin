import ResearchInstituteForm from "./ResearchInstituteForm";
import { createInstitute } from "../../services/researchInstitute/researchInstituteService";

export default function NewResearchInstitute() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Yeni Tədqiqat İnstitutu</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Yeni tədqiqat institutu məlumatlarını əlavə edin</p>
      </div>
      <ResearchInstituteForm onSubmit={createInstitute} submitLabel="İnstitutu Yarat" />
    </div>
  );
}
