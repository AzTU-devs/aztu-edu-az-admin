import PageMeta from "../../components/common/PageMeta";
import Sliders from "../../components/Sliders/Sliders";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function SlidersPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Slayderlər" />
            <div className="space-y-6">
                <ComponentCard title="Slayderlər">
                    <Sliders />
                </ComponentCard>
            </div>
        </>
    );
}
