import PageMeta from "../../components/common/PageMeta";
import NewAnnouncement from "../../components/announcements/NewAnnouncement";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function NewAnnouncementPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Yeni elan" />
            <div className="space-y-6">
                <ComponentCard title="Yeni elan">
                    <NewAnnouncement />
                </ComponentCard>
            </div>
        </>
    );
}
