import PageMeta from "../../components/common/PageMeta";
import NewsDetails from "../../components/news/NewsDetails";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function NewsDetailsPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Xəbər detalları" />
            <div className="space-y-6">
                <ComponentCard title="Xəbər detalları">
                    <NewsDetails />
                </ComponentCard>
            </div>
        </>
    );
}
