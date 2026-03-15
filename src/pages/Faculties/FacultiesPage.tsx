import PageMeta from "../../components/common/PageMeta";
import Faculties from "../../components/Faculties/Faculties";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link } from "react-router";

export default function FacultiesPage() {
    return (
        <>
            <PageMeta
                title="Fakültələr | AzTU Admin"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Fakültələr" />
            <ComponentCard
                title="Fakültələr"
                desc="Universitеtin bütün fakültələrinin siyahısı"
                actions={
                    <Link
                        to="/faculties/new"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors shadow-sm"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                        Yeni fakültə
                    </Link>
                }
            >
                <Faculties />
            </ComponentCard>
        </>
    );
}
