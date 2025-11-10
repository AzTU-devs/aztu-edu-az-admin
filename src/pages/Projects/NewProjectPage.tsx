import PageMeta from "../../components/common/PageMeta";
import NewProject from "../../components/Projects/NewProject";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function NewProjectPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Yeni layihə" />
            <div className="space-y-6">
                <ComponentCard title="Yeni layihə">
                    <NewProject />
                </ComponentCard>
            </div>
        </>
    );
}
