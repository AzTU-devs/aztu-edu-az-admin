import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import QuickManager from "../../components/Menu/QuickManager";

export default function MenuQuickPage() {
  return (
    <>
      <PageMeta title="Sürətli Menyu | AzTU Admin" description="Sürətli menyunu idarə edin" />
      <PageBreadcrumb pageTitle="Sürətli Menyu" />
      <div className="space-y-6">
        <ComponentCard title="Sürətli Menyu — Sol Keçidlər & Bölmələr">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Sürətli menyu <strong>Sol Keçidlər</strong> (direktlinklər) və <strong>Sağ Panel Bölmələri</strong> (tab-lar) bölmələrindən ibarətdir.
          </p>
          <QuickManager />
        </ComponentCard>
      </div>
    </>
  );
}
