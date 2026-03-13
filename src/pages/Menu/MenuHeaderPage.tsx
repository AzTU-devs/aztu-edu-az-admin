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
        <ComponentCard title="Header Naviqasiya — Bölmələr, Elementlər, Alt-Elementlər">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Header naviqasiyası 3 səviyyəli iyerarxiyadır: <strong>Bölmə → Element → Alt-Element</strong>.
            Bölmə yaradın, sonra bölmə daxilindəki elementləri, element daxilindəki alt-elementləri idarə edin.
          </p>
          <HeaderManager />
        </ComponentCard>
      </div>
    </>
  );
}
