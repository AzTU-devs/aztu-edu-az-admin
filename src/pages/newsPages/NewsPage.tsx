import News from "../../components/news/News";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function NewsPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Layihələr" />
            <div className="space-y-6">
                <ComponentCard title="Layihələr">
                    <News />
                </ComponentCard>
            </div>
        </>
    );
}
