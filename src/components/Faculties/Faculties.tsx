import Swal from "sweetalert2";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Pagination, Stack, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Faculty, deleteFaculty, getFaculties } from "../../services/faculty/facultyService";

const PAGE_SIZE = 10;

export default function Faculties() {
  const [end, setEnd] = useState(PAGE_SIZE);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchFaculties = (s: number, e: number) => {
    setLoading(true);
    setError(null);
    getFaculties(s, e)
      .then((res) => {
        if (res && typeof res === "object" && "faculties" in res) {
          setFaculties(res.faculties);
          setTotal(res.total);
        } else if (res === "NO CONTENT") {
          setFaculties([]);
          setTotal(0);
        } else {
          setError("Fakültələr yüklənərkən xəta baş verdi.");
          setFaculties([]);
          setTotal(0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaculties(start, end);
  }, [start, end]);

  const handleDelete = async (facultyCode: string) => {
    const confirmResult = await Swal.fire({
      title: "Fakültəni silmək istədiyinizə əminsiniz?",
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

    setDeletingCode(facultyCode);
    const result = await deleteFaculty(facultyCode);
    setDeletingCode(null);

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1500 });
      setFaculties((prev) => prev.filter((f) => f.faculty_code !== facultyCode));
      setTotal((prev) => prev - 1);
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Fakültə tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Gözlənilməz xəta", text: "Zəhmət olmasa biraz sonra yenidən cəhd edin", showConfirmButton: false, timer: 1500 });
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "25%" }}>Kod</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "55%" }}>Fakültə adı</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "20%" }}>Əməliyyatlar</p>
        </div>

        {loading ? (
          <div>
            {[...Array(PAGE_SIZE)].map((_, idx) => (
              <div key={idx} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 animate-pulse">
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-lg" style={{ width: "23%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-4" style={{ width: "53%" }}></div>
                <div className="flex justify-end gap-1.5 ml-4" style={{ width: "18%" }}>
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
        ) : faculties.length > 0 ? (
          faculties.map((faculty) => (
            <div key={faculty.faculty_code} className="flex items-center px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-150">
              <div style={{ width: "25%" }}>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-mono text-xs font-semibold">
                  {faculty.faculty_code}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200" style={{ width: "55%" }}>{faculty.faculty_name}</p>
              <div className="flex justify-end items-center gap-1" style={{ width: "20%" }}>
                <Link to={`/faculties/${faculty.faculty_code}`}>
                  <button className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Düzəliş et"><EditIcon sx={{ fontSize: 18 }} /></button>
                </Link>
                <button type="button" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => handleDelete(faculty.faculty_code)} disabled={deletingCode === faculty.faculty_code} title="Sil">
                  {deletingCode === faculty.faculty_code ? <CircularProgress size={16} sx={{ color: "currentColor" }} /> : <DeleteIcon sx={{ fontSize: 18 }} />}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fakültə yoxdur</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hələ heç bir fakültə əlavə edilməyib</p>
          </div>
        )}
      </div>

      {total > PAGE_SIZE && (
        <Stack spacing={2} alignItems="center" justifyContent="center">
          <Pagination count={Math.ceil(total / PAGE_SIZE)} page={Math.ceil(end / PAGE_SIZE)} onChange={(_, value) => { setStart((value - 1) * PAGE_SIZE); setEnd(value * PAGE_SIZE); }} color="primary"
            sx={{ "& .MuiPaginationItem-root": { borderRadius: "10px", fontSize: "13px", fontWeight: 500, color: "text.primary", backgroundColor: (theme) => theme.palette.mode === "dark" ? "#111827" : "#fff", border: (theme) => theme.palette.mode === "dark" ? "1px solid #1f2937" : "1px solid #f3f4f6", "&:hover": { backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1f2937" : "#f9fafb" } }, "& .Mui-selected": { backgroundColor: "#465fff !important", color: "#fff !important", borderColor: "#465fff !important", "&:hover": { backgroundColor: "#3641f5 !important" } } }}
          />
        </Stack>
      )}
    </div>
  );
}
