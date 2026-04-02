import PageMeta from "../../components/common/PageMeta";
import DepartmentDetails from "../../components/Departments/DepartmentDetails";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function DepartmentDetailsPage() {
  return (
    <>
      <PageMeta title="Departament redaktəsi | AzTU Admin" description="aztu.edu.az üçün idarəetmə paneli" />
      <PageBreadcrumb pageTitle="Departament redaktəsi" />
      <div className="space-y-6">
        <ComponentCard title="Departament redaktəsi">
          <DepartmentDetails />
        </ComponentCard>
      </div>
    </>
  );
}
