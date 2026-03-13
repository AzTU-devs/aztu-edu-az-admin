import PageMeta from "../../components/common/PageMeta";
import Heroes from "../../components/Hero/Heroes";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function HeroPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Hero" />
            <div className="space-y-6">
                <ComponentCard title="Hero">
                    <Heroes />
                </ComponentCard>
            </div>
        </>
    );
}
