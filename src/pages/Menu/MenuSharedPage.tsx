import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import SharedManager from "../../components/Menu/SharedManager";

export default function MenuSharedPage() {
  return (
    <>
      <PageMeta title="Paylaşılan Resurslar | AzTU Admin" description="Social linklər və əlaqə məlumatını idarə edin" />
      <PageBreadcrumb pageTitle="Paylaşılan Resurslar" />
      <div className="space-y-6">
        <ComponentCard title="Paylaşılan — Social Linklər & Əlaqə Məlumatı">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Social linklər və əlaqə məlumatı həm <strong>Footer</strong>, həm də <strong>Sürətli Menyu</strong> tərəfindən istifadə edilir.
          </p>
          <SharedManager />
        </ComponentCard>
      </div>
    </>
  );
}
