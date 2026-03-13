import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import FooterManager from "../../components/Menu/FooterManager";

export default function MenuFooterPage() {
  return (
    <>
      <PageMeta title="Footer Menyu | AzTU Admin" description="Footer məzmununu idarə edin" />
      <PageBreadcrumb pageTitle="Footer Menyu" />
      <div className="space-y-6">
        <ComponentCard title="Footer — Sütunlar, Loqolar, Sürətli İkonlar">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Footer <strong>Sütunlar & Linklər</strong>, <strong>Partner Loqoları</strong> və <strong>Sürətli İkonlar</strong> bölmələrindən ibarətdir.
          </p>
          <FooterManager />
        </ComponentCard>
      </div>
    </>
  );
}
