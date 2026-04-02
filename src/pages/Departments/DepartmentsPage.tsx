import PageMeta from "../../components/common/PageMeta";
import Departments from "../../components/Departments/Departments";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Link } from "react-router";

export default function DepartmentsPage() {
  return (
    <>
      <PageMeta title="Departamentlər | AzTU Admin" description="aztu.edu.az üçün idarəetmə paneli" />
      <PageBreadcrumb pageTitle="Departamentlər" />
      <ComponentCard
        title="Departamentlər"
        desc="Universitetin departamentlərinin siyahısı"
        actions={
          <Link
            to="/admin/departments/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            Yeni departament
          </Link>
        }
      >
        <Departments />
      </ComponentCard>
    </>
  );
}
