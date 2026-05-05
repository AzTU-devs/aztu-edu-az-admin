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
import VisibilityIcon from "@mui/icons-material/Visibility";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {
  activateAnnouncement,
  Announcement,
  deactivateAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  reorderAnnouncement,
} from "../../services/announcement/announcementService";

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
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

const PAGE_SIZE = 10;

export default function Announcements() {
  const lang = "az";
  const [end, setEnd] = useState(PAGE_SIZE);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [total, setTotal] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor));

  const fetchAnnouncements = (s: number, e: number) => {
    setLoading(true);
    setError(null);
    getAnnouncements(s, e, lang)
      .then((res) => {
        if (res && typeof res === "object" && "announcements" in res) {
          setAnnouncements(res.announcements);
          setTotal(res.total);
        } else if (res === "NO CONTENT") {
          setAnnouncements([]);
          setTotal(0);
        } else {
          setError("Elanlar yüklənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
          setAnnouncements([]);
          setTotal(0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements(start, end);
  }, [start, end]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = announcements.findIndex(
      (a) => a.announcement_id.toString() === active.id
    );
    const newIndex = announcements.findIndex(
      (a) => a.announcement_id.toString() === over.id
    );

    const updated = arrayMove(announcements, oldIndex, newIndex).map(
      (a, idx) => ({ ...a, display_order: idx + 1 })
    );
    setAnnouncements(updated);

    const result = await reorderAnnouncement({
      announcement_id: Number(active.id),
      new_order: start + newIndex + 1,
    });

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Sıra uğurla dəyişdirildi", showConfirmButton: false, timer: 1500 });
      fetchAnnouncements(start, end);
    } else {
      Swal.fire({ icon: "error", title: "Sıra dəyişdirilə bilmədi", showConfirmButton: false, timer: 1500 });
      fetchAnnouncements(start, end);
    }
  };

  const handleChangeOrder = async (announcementId: number, currentOrder: number) => {
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

    const result = await reorderAnnouncement({ announcement_id: announcementId, new_order: newOrder });

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Sıra uğurla dəyişdirildi", showConfirmButton: false, timer: 1500 });
      fetchAnnouncements(start, end);
    } else {
      Swal.fire({ icon: "error", title: "Xəta baş verdi", text: "Sıra dəyişdirilə bilmədi" });
    }
  };

  const handleToggleStatus = async (announcementId: number, isActive: boolean) => {
    setTogglingId(announcementId);
    const result = isActive ? await deactivateAnnouncement(announcementId) : await activateAnnouncement(announcementId);
    setTogglingId(null);

    if (result === "SUCCESS") {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.announcement_id === announcementId ? { ...a, is_active: !a.is_active } : a
        )
      );
    } else {
      Swal.fire({ icon: "error", title: "Status dəyişdirilə bilmədi", showConfirmButton: false, timer: 1500 });
    }
  };

  const handleDelete = async (announcementId: number) => {
    const confirmResult = await Swal.fire({
      title: "Elanı silmək istədiyinizə əminsiniz?",
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

    setDeletingId(announcementId);
    const result = await deleteAnnouncement(announcementId);
    setDeletingId(null);

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1500 });
      setAnnouncements((prev) => prev.filter((a) => a.announcement_id !== announcementId));
      setTotal((prev) => prev - 1);
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Elan tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Gözlənilməz xəta", text: "Zəhmət olmasa biraz sonra yenidən cəhd edin", showConfirmButton: false, timer: 1500 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        {/* Table header */}
        <div className="flex items-center px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "5%" }}>#</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "10%" }}>Sıra</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "40%" }}>Başlıq</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-center" style={{ width: "10%" }}>Status</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "15%" }}>Tarix</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "20%" }}>Əməliyyatlar</p>
        </div>

        {/* Table body */}
        {loading ? (
          <div>
            {[...Array(PAGE_SIZE)].map((_, idx) => (
              <div key={idx} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 animate-pulse">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full" style={{ width: "4%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "8%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "38%" }}></div>
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "8%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-3 ml-auto" style={{ width: "13%" }}></div>
                <div className="flex justify-end gap-1.5 ml-3" style={{ width: "19%" }}>
                  <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-7 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
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
        ) : announcements.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={announcements.map((a) => a.announcement_id.toString())}
              strategy={verticalListSortingStrategy}
            >
              {announcements.map((announcement) => (
                <SortableItem key={announcement.announcement_id} id={announcement.announcement_id.toString()}>
                  {({ attributes, listeners }) => (
                    <div className="flex items-center px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-150">
                      {/* Drag handle */}
                      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" style={{ width: "5%" }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="4" cy="3" r="1.5" fill="#9CA3AF" />
                          <circle cx="4" cy="8" r="1.5" fill="#9CA3AF" />
                          <circle cx="4" cy="13" r="1.5" fill="#9CA3AF" />
                          <circle cx="10" cy="3" r="1.5" fill="#9CA3AF" />
                          <circle cx="10" cy="8" r="1.5" fill="#9CA3AF" />
                          <circle cx="10" cy="13" r="1.5" fill="#9CA3AF" />
                        </svg>
                      </div>

                      {/* Order */}
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400" style={{ width: "10%" }}>
                        {announcement.display_order}
                      </p>

                      {/* Title */}
                      <p className="text-sm text-gray-700 dark:text-gray-200 font-medium" style={{ width: "40%" }}>
                        {truncate(announcement.title, 60)}
                      </p>

                      {/* Status badge */}
                      <div style={{ width: "10%", display: "flex", justifyContent: "center" }}>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          announcement.is_active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${announcement.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                          {announcement.is_active ? "Aktiv" : "Deaktiv"}
                        </span>
                      </div>

                      {/* Date */}
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-right" style={{ width: "15%" }}>
                        {new Date(announcement.created_at).toLocaleDateString("az-AZ")}
                      </p>

                      {/* Actions */}
                      <div className="flex justify-end items-center gap-1" style={{ width: "20%" }}>
                        <Link to={`/announcements/${announcement.announcement_id}`}>
                          <button className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Bax">
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          </button>
                        </Link>

                        <button
                          type="button"
                          className={`p-1.5 rounded-lg transition-colors ${
                            announcement.is_active
                              ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                          onClick={() => handleToggleStatus(announcement.announcement_id, announcement.is_active)}
                          disabled={togglingId === announcement.announcement_id}
                          title={announcement.is_active ? "Deaktiv et" : "Aktiv et"}
                        >
                          {togglingId === announcement.announcement_id ? (
                            <CircularProgress size={16} sx={{ color: "currentColor" }} />
                          ) : announcement.is_active ? (
                            <ToggleOnIcon sx={{ fontSize: 22 }} />
                          ) : (
                            <ToggleOffIcon sx={{ fontSize: 22 }} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30 transition-colors"
                          onClick={() => handleChangeOrder(announcement.announcement_id, announcement.display_order)}
                        >
                          Sıra
                        </button>

                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => handleDelete(announcement.announcement_id)}
                          disabled={deletingId === announcement.announcement_id}
                          title="Sil"
                        >
                          {deletingId === announcement.announcement_id ? (
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
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Elan yoxdur</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hələ heç bir elan əlavə edilməyib</p>
          </div>
        )}
      </div>

      {/* Pagination */}
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
                "&:hover": { backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1f2937" : "#f9fafb" },
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
