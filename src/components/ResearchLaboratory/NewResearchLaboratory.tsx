import ResearchLaboratoryForm from "./ResearchLaboratoryForm";

export default function NewResearchLaboratory() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Yeni Tədqiqat Laboratoriyası</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Yeni laboratoriya məlumatlarını əlavə edin</p>
      </div>
      <ResearchLaboratoryForm submitLabel="Laboratoriyanı Yarat" />
    </div>
  );
}
