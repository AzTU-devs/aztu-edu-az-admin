import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import NewsCategory from "../../components/newsCategory/NewsCategory";

export default function NewsCategoryPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Xeber kateqoriyalari" />
            <div className="space-y-6">
                <ComponentCard title="Xeber kateqoriyalari">
                    <NewsCategory />
                </ComponentCard>
            </div>
        </>
    );
}
