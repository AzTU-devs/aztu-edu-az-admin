import PageMeta from "../../components/common/PageMeta";
import Faculties from "../../components/Faculties/Faculties";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function FacultiesPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Fakültələr" />
            <div className="space-y-6">
                <ComponentCard title="Fakültələr">
                    <Faculties />
                </ComponentCard>
            </div>
        </>
    );
}
