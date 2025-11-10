import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ProjectDetails from "../../components/Projects/ProjectDetails";

export default function ProjectDetailsPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Layihə detalları" />
            <div className="space-y-6">
                <ComponentCard title="Layihə detalları">
                    <ProjectDetails />
                </ComponentCard>
            </div>
        </>
    );
}
