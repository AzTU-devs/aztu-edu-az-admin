import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { Pagination, Stack, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router";
import {
  DepartmentListItem,
  deleteDepartment,
  getDepartments,
} from "../../services/department/departmentService";

const PAGE_SIZE = 10;

export default function Departments() {
  const lang = "az";
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchDepartments = (startIndex: number, endIndex: number) => {
    setLoading(true);
    setError(null);
    getDepartments(startIndex, endIndex, lang)
      .then((res) => {
        if (res && typeof res === "object" && "departments" in res) {
          setDepartments(res.departments);
          setTotal(res.total);
        } else if (res === "NO CONTENT") {
          setDepartments([]);
          setTotal(0);
        } else {
          setError("Departamentlər yüklənərkən xəta baş verdi.");
          setDepartments([]);
          setTotal(0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartments(start, end);
  }, [start, end]);

  const handleDelete = async (departmentCode: string) => {
    const confirmResult = await Swal.fire({
      title: "Departamenti silmək istədiyinizə əminsiniz?",
      text: "Bu əməliyyat geri alına bilməz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    setDeletingCode(departmentCode);
    const result = await deleteDepartment(departmentCode);
    setDeletingCode(null);

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1500 });
      setDepartments((prev) => prev.filter((item) => item.department_code !== departmentCode));
      setTotal((prev) => Math.max(prev - 1, 0));
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Departament tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Departament silinərkən xəta baş verdi", showConfirmButton: false, timer: 1500 });
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "35%" }}>Ad</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "20%" }}>İşçi sayı</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "25%" }}>Yaradılma tarixi</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "20%" }}>Əməliyyatlar</p>
        </div>

        {loading ? (
          <div>
            {[...Array(PAGE_SIZE)].map((_, idx) => (
              <div key={idx} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 animate-pulse">
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-lg" style={{ width: "35%" }}></div>
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-lg ml-3" style={{ width: "20%" }}></div>
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-lg ml-3" style={{ width: "25%" }}></div>
                <div className="flex justify-end gap-1.5 ml-3" style={{ width: "20%" }}>
                  <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-11 h-11 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : departments.length > 0 ? (
          departments.map((department) => (
            <div key={department.department_code} className="flex items-center px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-150">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200" style={{ width: "35%" }}>{department.department_name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400" style={{ width: "20%" }}>{department.worker_count}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400" style={{ width: "25%" }}>{new Date(department.created_at).toLocaleDateString("az-AZ")}</p>
              <div className="flex justify-end items-center gap-1" style={{ width: "20%" }}>
                <Link to={`/admin/departments/${department.department_code}/edit`}>
                  <button className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Düzəliş et"><EditIcon sx={{ fontSize: 18 }} /></button>
                </Link>
                <button type="button" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => handleDelete(department.department_code)} disabled={deletingCode === department.department_code} title="Sil">
                  {deletingCode === department.department_code ? <CircularProgress size={16} sx={{ color: "currentColor" }} /> : <DeleteIcon sx={{ fontSize: 18 }} />}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Departament yoxdur</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hələ heç bir departament əlavə edilməyib</p>
          </div>
        )}
      </div>

      {total > PAGE_SIZE && (
        <Stack spacing={2} alignItems="center" justifyContent="center">
          <Pagination
            count={Math.ceil(total / PAGE_SIZE)}
            page={Math.ceil(end / PAGE_SIZE)}
            onChange={(_, value) => {
              setStart((value - 1) * PAGE_SIZE);
              setEnd(value * PAGE_SIZE);
            }}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 500,
                color: "text.primary",
                backgroundColor: (theme) => theme.palette.mode === "dark" ? "#111827" : "#fff",
                border: (theme) => theme.palette.mode === "dark" ? "1px solid #1f2937" : "1px solid #f3f4f6",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1f2937" : "#f9fafb",
                },
              },
              "& .Mui-selected": {
                backgroundColor: "#465fff !important",
                color: "#fff !important",
                borderColor: "#465fff !important",
                "&:hover": {
                  backgroundColor: "#3641f5 !important",
                },
              },
            }}
          />
        </Stack>
      )}
    </div>
  );
}
