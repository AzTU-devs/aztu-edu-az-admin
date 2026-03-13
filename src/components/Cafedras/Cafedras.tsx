import Swal from "sweetalert2";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Pagination, Stack, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Cafedra, deleteCafedra, getCafedras } from "../../services/cafedra/cafedraService";

const PAGE_SIZE = 10;

export default function Cafedras() {
  const lang = "az";
  const [end, setEnd] = useState(PAGE_SIZE);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cafedras, setCafedras] = useState<Cafedra[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchCafedras = (s: number, e: number) => {
    setLoading(true);
    setError(null);
    getCafedras(s, e, lang)
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
    fetchCafedras(start, end);
  }, [start, end]);

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
      Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1500 });
      setCafedras((prev) => prev.filter((c) => c.cafedra_code !== cafedraCode));
      setTotal((prev) => prev - 1);
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Kafedra tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Gözlənilməz xəta", text: "Zəhmət olmasa biraz sonra yenidən cəhd edin", showConfirmButton: false, timer: 1500 });
    }
  };

  return (
    <div className="bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="border border-gray-200 dark:border-gray-700 flex items-center px-[10px] py-[15px] rounded-[10px] mb-[10px] bg-gray-100 dark:bg-gray-800">
        <p style={{ width: "22%" }}>Kod</p>
        <p style={{ width: "18%" }}>Fakültə</p>
        <p style={{ width: "40%" }}>Kafedra adı</p>
        <p style={{ width: "20%", textAlign: "right" }}>Əməliyyatlar</p>
      </div>

      {loading ? (
        <>
          {[...Array(PAGE_SIZE)].map((_, idx) => (
            <div key={idx} className="flex items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[20px] mb-[10px] bg-white dark:bg-gray-800 animate-pulse">
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "22%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 ml-2" style={{ width: "17%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 ml-2" style={{ width: "38%" }}></div>
              <div className="flex justify-end gap-2 ml-2" style={{ width: "18%" }}>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-10"></div>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-10"></div>
              </div>
            </div>
          ))}
        </>
      ) : error ? (
        <div className="text-center text-red-500 dark:text-red-400 py-10">{error}</div>
      ) : cafedras.length > 0 ? (
        cafedras.map((cafedra) => (
          <div
            key={cafedra.cafedra_code}
            className="flex items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[15px] mb-[10px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <p className="font-mono text-[13px] text-blue-500 dark:text-blue-400 font-semibold" style={{ width: "22%" }}>
              {cafedra.cafedra_code}
            </p>
            <p className="font-mono text-[13px] text-gray-500 dark:text-gray-400" style={{ width: "18%" }}>
              {cafedra.faculty_code}
            </p>
            <p className="text-[15px] text-gray-800 dark:text-gray-200" style={{ width: "40%" }}>
              {cafedra.cafedra_name}
            </p>
            <div className="flex justify-end items-center gap-2" style={{ width: "20%" }}>
              <Link to={`/cafedras/${cafedra.cafedra_code}`}>
                <div className="bg-yellow-400 p-[8px] rounded-[5px]">
                  <EditIcon sx={{ color: "white", fontSize: "22px" }} />
                </div>
              </Link>
              <button
                type="button"
                className="bg-red-500 p-[8px] rounded-[5px] flex justify-center items-center"
                onClick={() => handleDelete(cafedra.cafedra_code)}
                disabled={deletingCode === cafedra.cafedra_code}
              >
                {deletingCode === cafedra.cafedra_code ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  <DeleteIcon sx={{ color: "white", fontSize: "22px" }} />
                )}
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">Kafedra yoxdur</div>
      )}

      {total > PAGE_SIZE && (
        <Stack spacing={2} alignItems="center" justifyContent="center" mt={4}>
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
                borderRadius: "6px",
                color: "text.primary",
                backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1E1E1E" : "#fff",
                border: (theme) => theme.palette.mode === "dark" ? "1px solid #333" : "1px solid #ddd",
                "&:hover": { backgroundColor: (theme) => theme.palette.mode === "dark" ? "#2c2c2c" : "#f0f0f0" },
              },
              "& .Mui-selected": {
                backgroundColor: "#1976d2",
                color: "#fff",
                "&:hover": { backgroundColor: "#1565c0" },
              },
            }}
          />
        </Stack>
      )}
    </div>
  );
}
