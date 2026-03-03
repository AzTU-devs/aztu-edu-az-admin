import PageMeta from "../../components/common/PageMeta";
import NewNews from "../../components/News/NewNews";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function NewNewsPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Yeni xəbər" />
            <div className="space-y-6">
                <ComponentCard title="Yeni xəbər">
                    <NewNews />
                </ComponentCard>
            </div>
        </>
    );
}
