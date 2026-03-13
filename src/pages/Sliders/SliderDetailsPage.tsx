import PageMeta from "../../components/common/PageMeta";
import SliderDetails from "../../components/Sliders/SliderDetails";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function SliderDetailsPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Slayder redaktəsi" />
            <div className="space-y-6">
                <ComponentCard title="Slayder redaktəsi">
                    <SliderDetails />
                </ComponentCard>
            </div>
        </>
    );
}
