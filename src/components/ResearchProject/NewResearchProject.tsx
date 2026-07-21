import ResearchProjectForm from "./ResearchProjectForm";
import { createProject } from "../../services/researchProject/researchProjectService";

export default function NewResearchProject() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Yeni Tədqiqat Layihəsi</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Yeni tədqiqat layihəsinin məlumatlarını əlavə edin
        </p>
      </div>
      <ResearchProjectForm onSubmit={createProject} submitLabel="Layihəni Yarat" />
    </div>
  );
}
