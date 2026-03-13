import PageMeta from "../../components/common/PageMeta";
import Cafedras from "../../components/Cafedras/Cafedras";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function CafedrasPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Kafedralar" />
            <div className="space-y-6">
                <ComponentCard title="Kafedralar">
                    <Cafedras />
                </ComponentCard>
            </div>
        </>
    );
}
