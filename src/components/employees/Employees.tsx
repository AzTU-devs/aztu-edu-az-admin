import Swal from "sweetalert2";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Pagination, Stack, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Employee, deleteEmployee, getEmployees } from "../../services/employee/employeeService";

const BASE_URL = "https://api-aztu.karamshukurlu.site";
const PAGE_SIZE = 10;

export default function Employees() {
    const [end, setEnd] = useState(PAGE_SIZE);
    const [start, setStart] = useState(0);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [total, setTotal] = useState(0);

    const fetchEmployees = (s: number, e: number) => {
        setLoading(true);
        setError(null);
        getEmployees(s, e)
            .then((res) => {
                if (res && typeof res === "object" && "employees" in res) {
                    setEmployees(res.employees);
                    setTotal(res.total);
                } else if (res === "NO CONTENT") {
                    setEmployees([]);
                    setTotal(0);
                } else {
                    setError("İşçilər yüklənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
                    setEmployees([]);
                    setTotal(0);
                }
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchEmployees(start, end);
    }, [start, end]);

    const handleDelete = async (employeeId: number) => {
        const confirmResult = await Swal.fire({
            title: "İşçini silmək istədiyinizə əminsiniz?",
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

        setDeletingId(employeeId);
        const result = await deleteEmployee(employeeId);
        setDeletingId(null);

        if (result === "SUCCESS") {
            Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1500 });
            setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
            setTotal((prev) => prev - 1);
        } else if (result === "NOT FOUND") {
            Swal.fire({ icon: "error", title: "Xəta", text: "İşçi tapılmadı", showConfirmButton: false, timer: 1500 });
        } else {
            Swal.fire({ icon: "error", title: "Gözlənilməz xəta", text: "Zəhmət olmasa biraz sonra yenidən cəhd edin", showConfirmButton: false, timer: 1500 });
        }
    };

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                {/* Header row */}
                <div className="flex items-center px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "5%" }}>#</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "8%" }}>Şəkil</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "22%" }}>Ad Soyad</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "18%" }}>Elmi dərəcə / Ad</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "22%" }}>Vəzifə</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "12%" }}>Kod</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "13%" }}>Əməliyyatlar</p>
                </div>

                {loading ? (
                    <div>
                        {[...Array(PAGE_SIZE)].map((_, idx) => (
                            <div key={idx} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 animate-pulse">
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full" style={{ width: "4%" }}></div>
                                <div className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "7%" }}></div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "20%" }}></div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "16%" }}></div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "20%" }}></div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "10%" }}></div>
                                <div className="flex justify-end gap-1.5 ml-3" style={{ width: "12%" }}>
                                    <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                                    <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-11 h-11 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                    </div>
                ) : employees.length > 0 ? (
                    employees.map((emp, idx) => (
                        <div key={emp.id} className="flex items-center px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-150">
                            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium" style={{ width: "5%" }}>{start + idx + 1}</p>
                            <div style={{ width: "8%" }}>
                                {emp.profile_image ? (
                                    <img
                                        src={`${BASE_URL}/${emp.profile_image}`}
                                        alt={emp.full_name}
                                        className="h-9 w-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                    />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                                        <span className="text-brand-600 dark:text-brand-400 text-sm font-bold">
                                            {emp.first_name?.[0]}{emp.last_name?.[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div style={{ width: "22%" }}>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{emp.full_name}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{emp.employee_code}</p>
                            </div>
                            <div style={{ width: "18%" }}>
                                {emp.academic_degree && (
                                    <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 mb-1">
                                        {emp.academic_degree}
                                    </span>
                                )}
                                {emp.academic_title && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{emp.academic_title}</p>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate" style={{ width: "22%" }}>{emp.position || <span className="text-gray-300 dark:text-gray-600 italic">—</span>}</p>
                            <p className="text-xs font-mono text-gray-400 dark:text-gray-500" style={{ width: "12%" }}>{emp.employee_code}</p>
                            <div className="flex justify-end items-center gap-1" style={{ width: "13%" }}>
                                <Link to={`/employees/${emp.id}`}>
                                    <button className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Düzəliş et">
                                        <EditIcon sx={{ fontSize: 18 }} />
                                    </button>
                                </Link>
                                <button
                                    type="button"
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    onClick={() => handleDelete(emp.id)}
                                    disabled={deletingId === emp.id}
                                    title="Sil"
                                >
                                    {deletingId === emp.id ? (
                                        <CircularProgress size={16} sx={{ color: "currentColor" }} />
                                    ) : (
                                        <DeleteIcon sx={{ fontSize: 18 }} />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">İşçi yoxdur</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hələ heç bir işçi əlavə edilməyib</p>
                    </div>
                )}
            </div>

            {total > PAGE_SIZE && (
                <Stack spacing={2} alignItems="center" justifyContent="center">
                    <Pagination
                        count={Math.ceil(total / PAGE_SIZE)}
                        page={Math.ceil(end / PAGE_SIZE)}
                        onChange={(_, value) => { setStart((value - 1) * PAGE_SIZE); setEnd(value * PAGE_SIZE); }}
                        color="primary"
                        sx={{
                            "& .MuiPaginationItem-root": {
                                borderRadius: "10px", fontSize: "13px", fontWeight: 500,
                                color: "text.primary",
                                backgroundColor: (theme) => theme.palette.mode === "dark" ? "#111827" : "#fff",
                                border: (theme) => theme.palette.mode === "dark" ? "1px solid #1f2937" : "1px solid #f3f4f6",
                                "&:hover": { backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1f2937" : "#f9fafb" },
                            },
                            "& .Mui-selected": {
                                backgroundColor: "#465fff !important", color: "#fff !important",
                                borderColor: "#465fff !important",
                                "&:hover": { backgroundColor: "#3641f5 !important" },
                            },
                        }}
                    />
                </Stack>
            )}
        </div>
    );
}
