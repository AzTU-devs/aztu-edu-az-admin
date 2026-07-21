import Swal from "sweetalert2";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Pagination, Stack, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  ProjectListItem,
  deleteProject,
  getProjects,
} from "../../services/researchProject/researchProjectService";

const PAGE_SIZE = 10;

export default function ResearchProjects() {
  const [end, setEnd] = useState(PAGE_SIZE);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProjects(start, end)
      .then((res) => {
        if (res && typeof res === "object" && "projects" in res) {
          setProjects(res.projects);
          setTotal(res.total);
        } else if (res === "NO CONTENT") {
          setProjects([]);
          setTotal(0);
        } else {
          setError("Layihələr yüklənərkən xəta baş verdi.");
          setProjects([]);
          setTotal(0);
        }
      })
      .finally(() => setLoading(false));
  }, [start, end]);

  const handleDelete = async (projectCode: string) => {
    const confirmResult = await Swal.fire({
      title: "Layihəni silmək istədiyinizə əminsiniz?",
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

    setDeletingCode(projectCode);
    const result = await deleteProject(projectCode);
    setDeletingCode(null);

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1500 });
      setProjects((prev) => prev.filter((p) => p.project_code !== projectCode));
      setTotal((prev) => prev - 1);
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Layihə tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Gözlənilməz xəta", text: "Zəhmət olmasa biraz sonra yenidən cəhd edin", showConfirmButton: false, timer: 1500 });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          to="/research-projects/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Yeni Layihə
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "40%" }}>Layihənin adı</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "20%" }}>Rəhbər</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "14%" }}>Müddət</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "14%" }}>Məbləğ</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "12%" }}>Əməliyyatlar</p>
        </div>

        {loading ? (
          <div>
            {[...Array(PAGE_SIZE)].map((_, idx) => (
              <div key={idx} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 animate-pulse">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full" style={{ width: "38%" }} />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-4" style={{ width: "18%" }} />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-4" style={{ width: "12%" }} />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-4" style={{ width: "12%" }} />
                <div className="flex justify-end gap-1.5 ml-4" style={{ width: "10%" }}>
                  <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 rounded-lg" />
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
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.project_code} className="flex items-center px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-150">
              <div className="min-w-0 pr-4" style={{ width: "40%" }}>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-2">
                  {project.name || <span className="text-gray-400 italic">Adsız</span>}
                </p>
                {project.members.length > 0 && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {project.members.length} üzv
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate pr-4" style={{ width: "20%" }}>
                {project.leader_name || "—"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate pr-4" style={{ width: "14%" }}>
                {project.duration || "—"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate pr-4" style={{ width: "14%" }}>
                {project.budget || "—"}
              </p>
              <div className="flex justify-end items-center gap-1" style={{ width: "12%" }}>
                <Link to={`/research-projects/${project.project_code}`}>
                  <button className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Düzəliş et">
                    <EditIcon sx={{ fontSize: 18 }} />
                  </button>
                </Link>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  onClick={() => handleDelete(project.project_code)}
                  disabled={deletingCode === project.project_code}
                  title="Sil"
                >
                  {deletingCode === project.project_code ? (
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
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Layihə yoxdur</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hələ heç bir tədqiqat layihəsi əlavə edilməyib</p>
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
                backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#111827" : "#fff"),
                border: (theme) => (theme.palette.mode === "dark" ? "1px solid #1f2937" : "1px solid #f3f4f6"),
                "&:hover": {
                  backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1f2937" : "#f9fafb"),
                },
              },
              "& .Mui-selected": {
                backgroundColor: "#465fff !important",
                color: "#fff !important",
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
