import PageMeta from "../../components/common/PageMeta";
import CafedraView from "../../components/Cafedras/CafedraView";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link } from "react-router";

export default function CafedraViewPage() {
    return (
        <>
            <PageMeta
                title="Kafedra Detalları | AzTU Admin"
                description="Kafedra məlumatlarına baxış"
            />
            <PageBreadcrumb pageTitle="Kafedra Detalları" />
            <ComponentCard
                title="Kafedra Məlumatları"
                desc="Kafedra haqqında bütün detallara buradan baxa bilərsiniz."
                actions={
                    <Link
                        to="/cafedras"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-brand-600 transition-all dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        Geri
                    </Link>
                }
            >
                <CafedraView />
            </ComponentCard>
        </>
    );
}
