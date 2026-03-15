import PageMeta from "../../components/common/PageMeta";
import Heroes from "../../components/Hero/Heroes";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function HeroPage() {
    return (
        <>
            <PageMeta
                title="Hero | AzTU Admin"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Hero" />
            <ComponentCard
                title="Hero videolar"
                desc="Saytın əsas səhifəsindəki hero bölməsinin videoları"
            >
                <Heroes />
            </ComponentCard>
        </>
    );
}
