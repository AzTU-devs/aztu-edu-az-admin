import PageMeta from "../../components/common/PageMeta";
import HeroCertificates from "../../components/heroCertificates/HeroCertificates";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link } from "react-router";

export default function HeroCertificatesPage() {
    return (
        <>
            <PageMeta
                title="Ana səhifə sertifikatları | AzTU Admin"
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle="Ana səhifə sertifikatları" />
            <ComponentCard
                title="Ana səhifə sertifikatları"
                desc="Ana səhifənin yuxarı hissəsində göstərilən QS reytinq sertifikatları"
                actions={
                    <Link
                        to="/hero-certificates/new"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors shadow-sm"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Yeni sertifikat
                    </Link>
                }
            >
                <HeroCertificates />
            </ComponentCard>
        </>
    );
}
