import PageMeta from "../../components/common/PageMeta";
import NewSlider from "../../components/Sliders/NewSlider";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function NewSliderPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Yeni slayder" />
            <div className="space-y-6">
                <ComponentCard title="Yeni slayder">
                    <NewSlider />
                </ComponentCard>
            </div>
        </>
    );
}
