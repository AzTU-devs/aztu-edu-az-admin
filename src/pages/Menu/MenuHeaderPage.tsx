import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import HeaderManager from "../../components/Menu/HeaderManager";

export default function MenuHeaderPage() {
  return (
    <>
      <PageMeta title="Header Menyu | AzTU Admin" description="Header naviqasiya menyusunu idarə edin" />
      <PageBreadcrumb pageTitle="Header Menyu" />
      <div className="space-y-6">
        <ComponentCard title="Header Naviqasiya — Başlıqlar, Elementlər, Alt-Elementlər">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Header naviqasiyası 3 səviyyəli iyerarxiyadır: <strong>Başlıq → Element → Alt-Element</strong>.
            Sətri açmaq üçün adına klikləyin, sıranı dəyişmək üçün sürükləyin, saytda göstərmək
            və ya gizlətmək üçün açarı çevirin.
          </p>
          <HeaderManager />
        </ComponentCard>
      </div>
    </>
  );
}
