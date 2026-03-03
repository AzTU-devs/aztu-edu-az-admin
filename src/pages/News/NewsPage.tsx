import PageMeta from "../../components/common/PageMeta";
import NewsList from "../../components/News/News";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link } from "react-router";

export default function NewsPage() {
    return (
        <>
            <PageMeta
                title="Azərbaycan Texniki Universitet veb səhifəsi idarəetmə paneli"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Xəbərlər" />
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Link
                        to="/news/new"
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        + Yeni xəbər
                    </Link>
                </div>
                <ComponentCard title="Xəbərlər">
                    <NewsList />
                </ComponentCard>
            </div>
        </>
    );
}
