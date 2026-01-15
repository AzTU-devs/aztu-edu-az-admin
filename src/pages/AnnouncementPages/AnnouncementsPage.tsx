import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Announcements from "../../components/announcements/Announcements";

export default function AnnouncementsPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Elanlar" />
            <div className="space-y-6">
                <ComponentCard title="Elanlar">
                    <Announcements />
                </ComponentCard>
            </div>
        </>
    );
}
