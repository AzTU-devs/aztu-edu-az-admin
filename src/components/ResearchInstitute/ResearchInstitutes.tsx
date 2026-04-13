import Swal from "sweetalert2";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Pagination, Stack, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { InstituteListItem, deleteInstitute, getInstitutes } from "../../services/researchInstitute/researchInstituteService";

const PAGE_SIZE = 10;

export default function ResearchInstitutes() {
  const [end, setEnd] = useState(PAGE_SIZE);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [institutes, setInstitutes] = useState<InstituteListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchInstitutes = (s: number, e: number) => {
    setLoading(true);
    setError(null);
    getInstitutes(s, e)
      .then((res) => {
        if (res && typeof res === "object" && "institutes" in res) {
          setInstitutes(res.institutes);
          setTotal(res.total);
        } else if (res === "NO CONTENT") {
          setInstitutes([]);
          setTotal(0);
        } else {
          setError("İnstitutlar yüklənərkən xəta baş verdi.");
          setInstitutes([]);
          setTotal(0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInstitutes(start, end);
  }, [start, end]);

  const handleDelete = async (instituteCode: string) => {
    const confirmResult = await Swal.fire({
      title: "İnstitutu silmək istədiyinizə əminsiniz?",
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

    setDeletingCode(instituteCode);
    const result = await deleteInstitute(instituteCode);
    setDeletingCode(null);

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1500 });
      setInstitutes((prev) => prev.filter((i) => i.institute_code !== instituteCode));
      setTotal((prev) => prev - 1);
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "İnstitut tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Gözlənilməz xəta", text: "Zəhmət olmasa biraz sonra yenidən cəhd edin", showConfirmButton: false, timer: 1500 });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to="/research-institutes/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Yeni İnstitut
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "20%" }}>Kod</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "45%" }}>İnstitut adı</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "15%" }}>Heyət sayı</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "20%" }}>Əməliyyatlar</p>
        </div>

        {loading ? (
          <div>
            {[...Array(PAGE_SIZE)].map((_, idx) => (
              <div key={idx} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 animate-pulse">
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-lg" style={{ width: "18%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-4" style={{ width: "43%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-4" style={{ width: "13%" }}></div>
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
        ) : Array.isArray(institutes) && institutes.length > 0 ? (
          institutes.map((institute) => (
            <div key={institute.institute_code} className="flex items-center px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-150">
              <div style={{ width: "20%" }}>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-mono text-xs font-semibold">
                  {institute.institute_code}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200" style={{ width: "45%" }}>{institute.name}</p>
              <div style={{ width: "15%" }}>
                <span className="text-sm text-gray-500 dark:text-gray-400">{institute.staff_count ?? 0}</span>
              </div>
              <div className="flex justify-end items-center gap-1" style={{ width: "20%" }}>
                <Link to={`/research-institutes/${institute.institute_code}`}>
                  <button className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Düzəliş et"><EditIcon sx={{ fontSize: 18 }} /></button>
                </Link>
                <button type="button" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => handleDelete(institute.institute_code)} disabled={deletingCode === institute.institute_code} title="Sil">
                  {deletingCode === institute.institute_code ? <CircularProgress size={16} sx={{ color: "currentColor" }} /> : <DeleteIcon sx={{ fontSize: 18 }} />}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">İnstitut yoxdur</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hələ heç bir tədqiqat institutu əlavə edilməyib</p>
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
