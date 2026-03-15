import PageMeta from "../../components/common/PageMeta";
import NewsCategories from "../../components/NewsCategories/NewsCategories";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function NewsCategoriesPage() {
    return (
        <>
            <PageMeta
                title="Xəbər kateqoriyaları | AzTU Admin"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Xəbər kateqoriyaları" />
            <ComponentCard
                title="Xəbər kateqoriyaları"
                desc="Xəbərləri qruplaşdırmaq üçün istifadə olunan kateqoriyalar"
            >
                <NewsCategories />
            </ComponentCard>
        </>
    );
}
