import Swal from "sweetalert2";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Pagination, Stack, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Cafedra, deleteCafedra, getCafedras } from "../../services/cafedra/cafedraService";
import { getFaculties, Faculty } from "../../services/faculty/facultyService";

const PAGE_SIZE = 10;

export default function Cafedras() {
  const [end, setEnd] = useState(PAGE_SIZE);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cafedras, setCafedras] = useState<Cafedra[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");

  useEffect(() => {
    getFaculties(0, 100).then((res) => {
      if (res && typeof res === "object" && "faculties" in res) {
        setFaculties(res.faculties);
      }
    });
  }, []);

  const fetchCafedras = (s: number, e: number, faculty_code?: string) => {
    setLoading(true);
    setError(null);
    getCafedras(s, e, faculty_code)
      .then((res) => {
        if (res && typeof res === "object" && "cafedras" in res) {
          setCafedras(res.cafedras);
          setTotal(res.total);
        } else if (res === "NO CONTENT") {
          setCafedras([]);
          setTotal(0);
        } else {
          setError("Kafedralar yüklənərkən xəta baş verdi.");
          setCafedras([]);
          setTotal(0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCafedras(start, end, selectedFaculty);
  }, [start, end, selectedFaculty]);

  const handleDelete = async (cafedraCode: string) => {
    const confirmResult = await Swal.fire({
      title: "Kafedranı silmək istədiyinizə əminsiniz?",
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

    setDeletingCode(cafedraCode);
    const result = await deleteCafedra(cafedraCode);
    setDeletingCode(null);

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurlu silindi", showConfirmButton: false, timer: 1500 });
      fetchCafedras(start, end, selectedFaculty);
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Kafedra tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Gözlənilməz xəta", text: "Zəhmət olmasa biraz sonra yenidən cəhd edin", showConfirmButton: false, timer: 1500 });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Fakültə filteri</label>
          <select
            className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            value={selectedFaculty}
            onChange={(e) => {
              setSelectedFaculty(e.target.value);
              setStart(0);
              setEnd(PAGE_SIZE);
            }}
          >
            <option value="">Hamısı</option>
            {faculties.map((f) => (
              <option key={f.faculty_code} value={f.faculty_code}>{f.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "20%" }}>Kafedra kodu</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "15%" }}>Fakültə</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "40%" }}>Kafedra adı</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "25%" }}>Əməliyyatlar</p>
        </div>

        {loading ? (
          <div>
            {[...Array(PAGE_SIZE)].map((_, idx) => (
              <div key={idx} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 animate-pulse">
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-lg" style={{ width: "20%" }}></div>
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-lg ml-3" style={{ width: "15%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "38%" }}></div>
                <div className="flex justify-end gap-1.5 ml-3" style={{ width: "22%" }}>
                  <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
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
        ) : cafedras.length > 0 ? (
          cafedras.map((cafedra) => (
            <div key={cafedra.cafedra_code} className="flex items-center px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-150">
              <div style={{ width: "20%" }}>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-mono text-xs font-semibold">
                  {cafedra.cafedra_code}
                </span>
              </div>
              <div style={{ width: "15%" }}>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-xs">
                  {cafedra.faculty_code}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200" style={{ width: "40%" }}>{cafedra.cafedra_name}</p>
              <div className="flex justify-end items-center gap-1" style={{ width: "25%" }}>
                <Link to={`/cafedras/${cafedra.cafedra_code}/view`}>
                  <button className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Bax"><RemoveRedEyeIcon sx={{ fontSize: 18 }} /></button>
                </Link>
                <Link to={`/cafedras/${cafedra.cafedra_code}`}>
                  <button className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Düzəliş et"><EditIcon sx={{ fontSize: 18 }} /></button>
                </Link>
                <button type="button" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => handleDelete(cafedra.cafedra_code)} disabled={deletingCode === cafedra.cafedra_code} title="Sil">
                  {deletingCode === cafedra.cafedra_code ? <CircularProgress size={16} sx={{ color: "currentColor" }} /> : <DeleteIcon sx={{ fontSize: 18 }} />}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kafedra yoxdur</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Seçilmiş filtrə uyğun kafedra tapılmadı</p>
          </div>
        )}
      </div>

      {total > PAGE_SIZE && (
        <Stack spacing={2} alignItems="center" justifyContent="center">
          <Pagination count={Math.ceil(total / PAGE_SIZE)} page={Math.ceil((start / PAGE_SIZE) + 1)} onChange={(_, value) => { setStart((value - 1) * PAGE_SIZE); setEnd(value * PAGE_SIZE); }} color="primary"
            sx={{ "& .MuiPaginationItem-root": { borderRadius: "10px", fontSize: "13px", fontWeight: 500, color: "text.primary", backgroundColor: (theme) => theme.palette.mode === "dark" ? "#111827" : "#fff", border: (theme) => theme.palette.mode === "dark" ? "1px solid #1f2937" : "1px solid #f3f4f6", "&:hover": { backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1f2937" : "#f9fafb" } }, "& .Mui-selected": { backgroundColor: "#465fff !important", color: "#fff !important", borderColor: "#465fff !important", "&:hover": { backgroundColor: "#3641f5 !important" } } }}
          />
        </Stack>
      )}
    </div>
  );
}
