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

  const SwalWithInput = Swal.mixin({});

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
    <div className="bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="border border-gray-200 dark:border-gray-700 flex justify-between items-center px-[10px] py-[15px] rounded-[10px] mb-[10px] bg-gray-100 dark:bg-gray-800">
        <p style={{ width: "calc(100% / 5)" }}># Sıra</p>
        <p style={{ width: "calc(100% / 5)" }}>Layihə adı</p>
        <p style={{ width: "calc(100% / 5)" }}>Layihə məzmunu</p>
        <p style={{ width: "calc(100% / 5)", display: "flex", justifyContent: "end" }}>Əlavə edilmə tarixi</p>
        <p style={{ width: "calc(100% / 5)", display: "flex", justifyContent: "end" }}>Əməliyyatlar</p>
      </div>
      {loading ? (
        <>
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="flex justify-between items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[20px] mb-[10px] bg-white dark:bg-gray-800 animate-pulse">
              <div className="flex justify-between items-center w-[80%]">
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "calc(100% / 4)", marginRight: '10px' }}></div>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "calc(100% / 4)", marginRight: '10px' }}></div>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "calc(100% / 4)", marginRight: '10px' }}></div>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "calc(100% / 4)" }}></div>
              </div>
              <div className="flex justify-end items-center w-[20%] space-x-3">
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-10"></div>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-10"></div>
              </div>
            </div>
          ))}
        </>
      ) : error ? (
        <div className="text-center text-red-500 dark:text-red-400 py-10">{error}</div>
      ) : projects.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={projects.map((p) => p.project_id)} strategy={verticalListSortingStrategy}>
            {projects.map((project) => (
              <SortableItem key={project.project_id} id={project.project_id}>
                {({ attributes, listeners }) => (
                  <div className="flex justify-between items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[20px] mb-[10px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <div {...listeners} {...attributes} className="cursor-move mr-2 flex items-center">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="5" cy="4" r="2" fill="#6B7280" />
                        <circle cx="5" cy="10" r="2" fill="#6B7280" />
                        <circle cx="5" cy="16" r="2" fill="#6B7280" />
                        <circle cx="11" cy="4" r="2" fill="#6B7280" />
                        <circle cx="11" cy="10" r="2" fill="#6B7280" />
                        <circle cx="11" cy="16" r="2" fill="#6B7280" />
                      </svg>
                    </div>
                    <div className="flex justify-between items-center w-[80%]">
                      <p className="font-bold text-[18px] text-gray-600 dark:text-gray-100" style={{ width: "calc(100% / 4)" }}>{project.display_order}</p>
                      <p className="font-bold text-[18px] text-gray-600 dark:text-gray-100" style={{ width: "calc(100% / 4)" }}>{truncate(project.title, 30)}</p>
                      <p className="text-[18px] text-gray-800 dark:text-gray-200" style={{ width: "calc(100% / 4)" }}>{truncate(project.desc, 30)}</p>
                      <p className="text-[18px] text-gray-800 dark:text-gray-200 flex justify-end items-center" style={{ width: "calc(100% / 4)" }}>
                        {new Date(project.created_at).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div className="flex justify-end items-center w-[20%] space-x-2">
                      <Link
                        to={`/projects/${project.project_id}`}
                      >
                        <div className="bg-yellow-400 p-[10px] rounded-[5px]">
                          <VisibilityIcon sx={{ color: "white", fontSize: "25px" }} />
                        </div>
                      </Link>
                      <button
                        type="button"
                        className="bg-blue-500 p-[10px] rounded-[5px] flex justify-center items-center text-white"
                        onClick={() => handleChangeOrder(project.project_id, project.display_order)}
                      >
                        Sıra dəyiş
                      </button>
                      <button
                        type="button"
                        className="bg-red-500 p-[10px] rounded-[5px] flex justify-center items-center"
                        onClick={() => handleDeleteProject(project.project_id)}
                        disabled={deletingId === project.project_id}
                      >
                        {deletingId === project.project_id ? (
                          <CircularProgress size={24} sx={{ color: "white" }} />
                        ) : (
                          <DeleteIcon sx={{ color: "white", fontSize: "25px" }} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">Layihə yoxdur</div>
      )}
      {projects.length > 0 && (
        <Stack spacing={2} alignItems="center" justifyContent="center" mt={4}>
          <Pagination
            count={Math.ceil(totalProjects / 4)}
            page={Math.ceil(end / 4)}
            onChange={(_, value) => {
              const newStart = (value - 1) * 4;
              const newEnd = value * 4;
              setStart(newStart);
              setEnd(newEnd);
            }}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: "6px",
                color: "text.primary",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#1E1E1E" : "#fff",
                border: (theme) =>
                  theme.palette.mode === "dark"
                    ? "1px solid #333"
                    : "1px solid #ddd",
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "#2c2c2c" : "#f0f0f0",
                },
              },
              "& .Mui-selected": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#1976d2" : "#1976d2",
                color: "#fff",
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "#1565c0" : "#1565c0",
                },
              },
            }}
          />
        </Stack>
      )}
    </div>
  )
}
