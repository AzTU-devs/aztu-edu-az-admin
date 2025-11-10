import PageMeta from "../../components/common/PageMeta";
import Projects from "../../components/Projects/Projects";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function ProjectsPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Layihələr" />
            <div className="space-y-6">
                <ComponentCard title="Layihələr">
                    <Projects />
                </ComponentCard>
            </div>
        </>
    );
}
