import PageMeta from "../../components/common/PageMeta";
import Announcements from "../../components/announcements/Announcements";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link } from "react-router";

export default function AnnouncementsPage() {
    return (
        <>
            <PageMeta
                title="Elanlar | AzTU Admin"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Elanlar" />
            <ComponentCard
                title="Elanlar"
                desc="Saytda göstərilən bütün elanların siyahısı"
                actions={
                    <Link
                        to="/announcements/new"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors shadow-sm"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                        Yeni elan
                    </Link>
                }
            >
                <Announcements />
            </ComponentCard>
        </>
    );
}
