import ResearchInstitutes from "../../components/ResearchInstitute/ResearchInstitutes";

export default function ResearchInstitutesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tədqiqat İnstitutları</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tədqiqat institutlarının siyahısı və idarə edilməsi</p>
      </div>
      <ResearchInstitutes />
    </div>
  );
}
