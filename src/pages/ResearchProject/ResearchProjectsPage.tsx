import ResearchProjects from "../../components/ResearchProject/ResearchProjects";

export default function ResearchProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tədqiqat Layihələri</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tədqiqat layihələrinin siyahısı və idarə edilməsi
        </p>
      </div>
      <ResearchProjects />
    </div>
  );
}
