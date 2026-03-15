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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Collaboration,
  deleteCollaboration,
  getCollaborations,
  reorderCollaboration,
} from "../../services/collaboration/collaborationService";

const BASE_URL = "https://api-aztu.karamshukurlu.site";

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (args: { attributes: any; listeners: any }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners })}
    </div>
  );
}

function truncate(text: string, maxLength: number) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

const PAGE_SIZE = 10;

export default function Collaborations() {
  const lang = "az";
  const [end, setEnd] = useState(PAGE_SIZE);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [total, setTotal] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor));

  const fetchCollaborations = (s: number, e: number) => {
    setLoading(true);
    setError(null);
    getCollaborations(s, e, lang)
      .then((res) => {
        if (res && typeof res === "object" && "collaborations" in res) {
          setCollaborations(res.collaborations);
          setTotal(res.total);
        } else if (res === "NO CONTENT") {
          setCollaborations([]);
          setTotal(0);
        } else {
          setError("Əməkdaşlıqlar yüklənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
          setCollaborations([]);
          setTotal(0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCollaborations(start, end);
  }, [start, end]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = collaborations.findIndex((c) => c.collaboration_id.toString() === active.id);
    const newIndex = collaborations.findIndex((c) => c.collaboration_id.toString() === over.id);

    const updated = arrayMove(collaborations, oldIndex, newIndex).map(
      (c, idx) => ({ ...c, display_order: idx + 1 })
    );
    setCollaborations(updated);

    const result = await reorderCollaboration({
      collaboration_id: Number(active.id),
      new_order: newIndex + 1,
    });

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Sıra uğurla dəyişdirildi", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Sıra dəyişdirilə bilmədi", showConfirmButton: false, timer: 1500 });
      fetchCollaborations(start, end);
    }
  };

  const handleChangeOrder = async (collaborationId: number, currentOrder: number) => {
    const swalResult = await (Swal.mixin({}) as any).fire({
      title: "Yeni sıra nömrəsini daxil edin",
      input: "text",
      inputLabel: "Yeni sıra",
      inputValue: currentOrder.toString(),
      showCancelButton: true,
      inputAttributes: { inputMode: "numeric", pattern: "[0-9]*", min: 1, max: total, step: 1 },
    });

    const newOrder = swalResult.value ? Number(swalResult.value) : null;
    if (!newOrder) return;

    const result = await reorderCollaboration({ collaboration_id: collaborationId, new_order: newOrder });

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Sıra uğurla dəyişdirildi", showConfirmButton: false, timer: 1500 });
      fetchCollaborations(start, end);
    } else {
      Swal.fire({ icon: "error", title: "Xəta baş verdi", text: "Sıra dəyişdirilə bilmədi" });
    }
  };

  const handleDelete = async (collaborationId: number) => {
    const confirmResult = await Swal.fire({
      title: "Əməkdaşlığı silmək istədiyinizə əminsiniz?",
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

    setDeletingId(collaborationId);
    const result = await deleteCollaboration(collaborationId);
    setDeletingId(null);

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1500 });
      setCollaborations((prev) => prev.filter((c) => c.collaboration_id !== collaborationId));
      setTotal((prev) => prev - 1);
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Əməkdaşlıq tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Gözlənilməz xəta", text: "Zəhmət olmasa biraz sonra yenidən cəhd edin", showConfirmButton: false, timer: 1500 });
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "5%" }}>#</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "7%" }}>Sıra</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "8%" }}>Logo</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "30%" }}>Ad</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "32%" }}>Veb sayt</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "18%" }}>Əməliyyatlar</p>
        </div>

        {loading ? (
          <div>
            {[...Array(PAGE_SIZE)].map((_, idx) => (
              <div key={idx} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 animate-pulse">
                <div className="h-4 w-4 bg-gray-100 dark:bg-gray-800 rounded mr-2" style={{ width: "4%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-1" style={{ width: "6%" }}></div>
                <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-lg ml-2" style={{ width: "7%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "28%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "30%" }}></div>
                <div className="flex justify-end gap-1.5 ml-3" style={{ width: "17%" }}>
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
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : collaborations.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={collaborations.map((c) => c.collaboration_id.toString())} strategy={verticalListSortingStrategy}>
              {collaborations.map((collab) => (
                <SortableItem key={collab.collaboration_id} id={collab.collaboration_id.toString()}>
                  {({ attributes, listeners }) => (
                    <div className="flex items-center px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-150">
                      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" style={{ width: "5%" }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="4" cy="3" r="1.5" fill="#9CA3AF" /><circle cx="4" cy="8" r="1.5" fill="#9CA3AF" /><circle cx="4" cy="13" r="1.5" fill="#9CA3AF" />
                          <circle cx="10" cy="3" r="1.5" fill="#9CA3AF" /><circle cx="10" cy="8" r="1.5" fill="#9CA3AF" /><circle cx="10" cy="13" r="1.5" fill="#9CA3AF" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400" style={{ width: "7%" }}>{collab.display_order}</p>
                      <div style={{ width: "8%" }}>
                        <img
                          src={`${BASE_URL}/${collab.logo}`}
                          alt={collab.name}
                          className="h-8 w-8 object-contain rounded-md border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200" style={{ width: "30%" }}>{truncate(collab.name, 40)}</p>
                      <p className="text-xs text-blue-500 dark:text-blue-400 truncate" style={{ width: "32%" }}>
                        {collab.website_url ? truncate(collab.website_url, 45) : <span className="text-gray-400 dark:text-gray-600 italic">—</span>}
                      </p>
                      <div className="flex justify-end items-center gap-1" style={{ width: "18%" }}>
                        <Link to={`/collaborations/${collab.collaboration_id}`}>
                          <button className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Düzəliş et">
                            <EditIcon sx={{ fontSize: 18 }} />
                          </button>
                        </Link>
                        <button
                          type="button"
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30 transition-colors"
                          onClick={() => handleChangeOrder(collab.collaboration_id, collab.display_order)}
                        >
                          Sıra
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => handleDelete(collab.collaboration_id)}
                          disabled={deletingId === collab.collaboration_id}
                          title="Sil"
                        >
                          {deletingId === collab.collaboration_id ? (
                            <CircularProgress size={16} sx={{ color: "currentColor" }} />
                          ) : (
                            <DeleteIcon sx={{ fontSize: 18 }} />
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
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Əməkdaşlıq yoxdur</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hələ heç bir əməkdaşlıq əlavə edilməyib</p>
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
