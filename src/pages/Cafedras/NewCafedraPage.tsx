import PageMeta from "../../components/common/PageMeta";
import NewCafedra from "../../components/Cafedras/NewCafedra";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function NewCafedraPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Yeni kafedra" />
            <div className="space-y-6">
                <ComponentCard title="Yeni kafedra">
                    <NewCafedra />
                </ComponentCard>
            </div>
        </>
    );
}
