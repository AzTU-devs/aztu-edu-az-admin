import PageMeta from "../../components/common/PageMeta";
import NewsCategories from "../../components/NewsCategories/NewsCategories";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function NewsCategoriesPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Xəbər kateqoriyaları" />
            <div className="space-y-6">
                <ComponentCard title="Xəbər kateqoriyaları">
                    <NewsCategories />
                </ComponentCard>
            </div>
        </>
    );
}
