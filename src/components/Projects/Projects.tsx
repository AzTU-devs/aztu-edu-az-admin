import Swal from "sweetalert2";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Link } from "react-router";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import { Pagination, Stack, CircularProgress } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { deleteProject, getProjects, Project, reorderProject } from "../../services/project/projectService";

function SortableItem({ id, children }: { id: string; children: (args: { attributes: any; listeners: any }) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners })}
    </div>
  );
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export default function Projects() {
  const lang = "az";
  const [end, setEnd] = useState(4);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [totalProjects, setTotalProjects] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((item) => item.project_id === active.id);
    const newIndex = projects.findIndex((item) => item.project_id === over.id);

    const newProjects = arrayMove(projects, oldIndex, newIndex)
      .map((p, idx) => ({ ...p, display_order: idx + 1 }));
    setProjects(newProjects);

    const result = await reorderProject({
      project_id: active.id,
      new_order: newIndex + 1,
    });

    if (result === "SUCCESS") {
      Swal.fire({
        icon: 'success',
        title: 'Sıra uğurla dəyişdirildi',
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Sıra dəyişdirilə bilmədi',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  // Manual order change handler
  const handleChangeOrder = async (projectId: string, currentOrder: number) => {
    const swalResult = await (Swal.mixin({}) as any).fire({
      title: 'Yeni sıra nömrəsini daxil edin',
      input: 'text',
      inputLabel: 'Yeni sıra',
      inputValue: currentOrder.toString(),
      showCancelButton: true,
      inputAttributes: { inputMode: 'numeric', pattern: '[0-9]*', min: 1, max: totalProjects, step: 1 },
    });

    const newOrder = swalResult.value ? Number(swalResult.value) : null;

    if (!newOrder) return;

    const result = await reorderProject({
      project_id: projectId,
      new_order: Number(newOrder),
    });

    if (result === 'SUCCESS') {
      Swal.fire({
        icon: 'success',
        title: 'Sıra uğurla dəyişdirildi',
        showConfirmButton: false,
        timer: 1500,
      });
      // Refresh current page
      getProjects(start, end, lang).then(res => {
        if (res && typeof res === 'object' && 'projects' in res) {
          setProjects(res.projects);
          setTotalProjects(res.total || res.projects.length);
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Xəta baş verdi',
        text: 'Sıra dəyişdirilə bilmədi',
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProjects(start, end, lang)
      .then((res) => {
        if (res && typeof res === "object" && "projects" in res) {
          setProjects(res.projects);
          setTotalProjects(res.total || res.projects.length);
        } else if (res === "NO CONTENT") {
          setProjects([]);
          setTotalProjects(0);
        } else {
          setError("Layihələr yüklənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
          setProjects([]);
          setTotalProjects(0);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [start, end, lang]);

  const handleDeleteProject = async (projectId: string) => {
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
    if (confirmResult.isConfirmed) {
      setDeletingId(projectId);
      try {
        const result = await deleteProject(projectId);

        if (result === "SUCCESS") {
          Swal.fire({
            icon: "success",
            title: "Uğurla silindi",
            showConfirmButton: false,
            timer: 1500,
          });
          setProjects((prevProjects) => prevProjects.filter(p => p.project_id !== projectId));
          setDeletingId(null);
        } else if (result === "NOT FOUND") {
          Swal.fire({
            icon: "error",
            title: "Xəta",
            text: "Layihə tapılmadı",
            showConfirmButton: false,
            timer: 1500,
          });
          setDeletingId(null);
        } else {
          Swal.fire({
            icon: "error",
            title: "Gözlənilməz xəta",
            text: "Zəhmət olmasa biraz sonra yenidən cəhd edin",
            showConfirmButton: false,
            timer: 1500,
          });
          setDeletingId(null);
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Gözlənilməz xəta",
          text: "Zəhmət olmasa biraz sonra yenidən cəhd edin",
          showConfirmButton: false,
          timer: 1500,
        });
        setDeletingId(null);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        {/* Table header */}
        <div className="flex items-center px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <div style={{ width: "5%" }}></div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "calc(75% / 4)" }}>Sıra</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "calc(75% / 4)" }}>Layihə adı</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "calc(75% / 4)" }}>Məzmun</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "calc(75% / 4)" }}>Tarix</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "20%" }}>Əməliyyatlar</p>
        </div>

        {loading ? (
          <div>
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 animate-pulse">
                <div className="h-4 w-4 bg-gray-100 dark:bg-gray-800 rounded mr-3"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full mr-3" style={{ width: "calc(75% / 4 - 12px)" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full mr-3" style={{ width: "calc(75% / 4 - 12px)" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full mr-3" style={{ width: "calc(75% / 4 - 12px)" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full mr-3" style={{ width: "calc(75% / 4 - 12px)" }}></div>
                <div className="flex justify-end gap-1.5" style={{ width: "20%" }}>
                  <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-7 w-14 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
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
        ) : projects.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={projects.map((p) => p.project_id)} strategy={verticalListSortingStrategy}>
              {projects.map((project) => (
                <SortableItem key={project.project_id} id={project.project_id}>
                  {({ attributes, listeners }) => (
                    <div className="flex items-center px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-150">
                      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-1" style={{ width: "5%" }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="4" cy="3" r="1.5" fill="#9CA3AF" /><circle cx="4" cy="8" r="1.5" fill="#9CA3AF" /><circle cx="4" cy="13" r="1.5" fill="#9CA3AF" />
                          <circle cx="10" cy="3" r="1.5" fill="#9CA3AF" /><circle cx="10" cy="8" r="1.5" fill="#9CA3AF" /><circle cx="10" cy="13" r="1.5" fill="#9CA3AF" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400" style={{ width: "calc(75% / 4)" }}>{project.display_order}</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200" style={{ width: "calc(75% / 4)" }}>{truncate(project.title, 25)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400" style={{ width: "calc(75% / 4)" }}>{truncate(project.desc, 25)}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500" style={{ width: "calc(75% / 4)" }}>{new Date(project.created_at).toLocaleDateString("az-AZ")}</p>
                      <div className="flex justify-end items-center gap-1" style={{ width: "20%" }}>
                        <Link to={`/projects/${project.project_id}`}>
                          <button className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Bax"><VisibilityIcon sx={{ fontSize: 18 }} /></button>
                        </Link>
                        <button type="button" className="px-2.5 py-1 text-[11px] font-semibold rounded-lg text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30 transition-colors" onClick={() => handleChangeOrder(project.project_id, project.display_order)}>Sıra</button>
                        <button type="button" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => handleDeleteProject(project.project_id)} disabled={deletingId === project.project_id} title="Sil">
                          {deletingId === project.project_id ? <CircularProgress size={16} sx={{ color: "currentColor" }} /> : <DeleteIcon sx={{ fontSize: 18 }} />}
                        </button>
                      </div>
                    </div>
                  )}
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Layihə yoxdur</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hələ heç bir layihə əlavə edilməyib</p>
          </div>
        )}
      </div>

      {projects.length > 0 && (
        <Stack spacing={2} alignItems="center" justifyContent="center">
          <Pagination count={Math.ceil(totalProjects / 4)} page={Math.ceil(end / 4)} onChange={(_, value) => { setStart((value - 1) * 4); setEnd(value * 4); }} color="primary"
            sx={{ "& .MuiPaginationItem-root": { borderRadius: "10px", fontSize: "13px", fontWeight: 500, color: "text.primary", backgroundColor: (theme) => theme.palette.mode === "dark" ? "#111827" : "#fff", border: (theme) => theme.palette.mode === "dark" ? "1px solid #1f2937" : "1px solid #f3f4f6", "&:hover": { backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1f2937" : "#f9fafb" } }, "& .Mui-selected": { backgroundColor: "#465fff !important", color: "#fff !important", borderColor: "#465fff !important", "&:hover": { backgroundColor: "#3641f5 !important" } } }}
          />
        </Stack>
      )}
    </div>
  )
}
