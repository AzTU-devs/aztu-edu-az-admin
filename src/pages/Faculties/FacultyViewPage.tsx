import PageMeta from "../../components/common/PageMeta";
import FacultyView from "../../components/Faculties/FacultyView";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link } from "react-router";

export default function FacultyViewPage() {
    return (
        <>
            <PageMeta
                title="Fakültə detalları | AzTU Admin"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Fakültə detalları" />
            <ComponentCard
                title="Fakültə detalları"
                desc="Fakültənin bütün əsas məlumatlarını buradan izləyə bilərsiniz"
                actions={
                    <Link
                        to="/faculties"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        Geri
                    </Link>
                }
            >
                <FacultyView />
            </ComponentCard>
        </>
    );
}
