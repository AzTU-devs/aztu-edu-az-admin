import PageMeta from "../../components/common/PageMeta";
import AnnouncementDetails from "../../components/Announcements/AnnouncementDetails";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function AnnouncementDetailsPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Elan detalları" />
            <div className="space-y-6">
                <ComponentCard title="Elan detalları">
                    <AnnouncementDetails />
                </ComponentCard>
            </div>
        </>
    );
}
