import PageMeta from "../../components/common/PageMeta";
import FacultyDetails from "../../components/Faculties/FacultyDetails";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function FacultyDetailsPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Fakültə redaktəsi" />
            <div className="space-y-6">
                <ComponentCard title="Fakültə redaktəsi">
                    <FacultyDetails />
                </ComponentCard>
            </div>
        </>
    );
}
