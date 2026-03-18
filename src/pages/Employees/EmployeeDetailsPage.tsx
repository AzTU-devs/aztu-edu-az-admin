import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { CircularProgress } from "@mui/material";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import EmployeeForm from "../../components/employees/EmployeeForm";
import { Employee, getEmployeeDetails } from "../../services/employee/employeeService";

export default function EmployeeDetailsPage() {
    const { employee_id } = useParams<{ employee_id: string }>();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [status, setStatus] = useState<"loading" | "error" | "not_found" | "ok">("loading");

    useEffect(() => {
        if (!employee_id) { setStatus("not_found"); return; }
        getEmployeeDetails(Number(employee_id)).then((res) => {
            if (res === "NOT FOUND") { setStatus("not_found"); return; }
            if (res === "ERROR") { setStatus("error"); return; }
            setEmployee(res as Employee);
            setStatus("ok");
        });
    }, [employee_id]);

    const backAction = (
        <Link
            to="/employees"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Geri
        </Link>
    );

    return (
        <>
            <PageMeta
                title={employee ? `${employee.full_name} | AzTU Admin` : "İşçi | AzTU Admin"}
                description="aztu.edu.az üçün idarəetmə paneli"
            />
            <PageBreadcrumb pageTitle={employee?.full_name ?? "İşçi"} />
            <ComponentCard
                title={employee?.full_name ?? "İşçi məlumatları"}
                desc={employee?.position ? `${employee.academic_title ?? ""} · ${employee.position}`.replace(/^· /, "") : "İşçi məlumatlarını redaktə edin"}
                actions={backAction}
            >
                {status === "loading" ? (
                    <div className="flex items-center justify-center py-20">
                        <CircularProgress size={32} />
                    </div>
                ) : status === "not_found" ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">İşçi tapılmadı</p>
                    </div>
                ) : status === "error" ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <p className="text-sm font-medium text-red-500">Məlumatlar yüklənərkən xəta baş verdi</p>
                    </div>
                ) : (
                    <EmployeeForm mode="edit" initialData={employee!} />
                )}
            </ComponentCard>
        </>
    );
}
