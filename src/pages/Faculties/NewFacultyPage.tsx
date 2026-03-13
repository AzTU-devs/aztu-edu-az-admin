import PageMeta from "../../components/common/PageMeta";
import NewFaculty from "../../components/Faculties/NewFaculty";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function NewFacultyPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Yeni fakültə" />
            <div className="space-y-6">
                <ComponentCard title="Yeni fakültə">
                    <NewFaculty />
                </ComponentCard>
            </div>
        </>
    );
}
