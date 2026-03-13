import PageMeta from "../../components/common/PageMeta";
import CafedraDetails from "../../components/Cafedras/CafedraDetails";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function CafedraDetailsPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Kafedra redaktəsi" />
            <div className="space-y-6">
                <ComponentCard title="Kafedra redaktəsi">
                    <CafedraDetails />
                </ComponentCard>
            </div>
        </>
    );
}
