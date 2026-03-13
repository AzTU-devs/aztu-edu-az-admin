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
  Announcement,
  deleteAnnouncement,
  getAnnouncements,
  reorderAnnouncement,
  toggleAnnouncementStatus,
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
      new_order: newIndex + 1,
    });

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Sıra uğurla dəyişdirildi", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Sıra dəyişdirilə bilmədi", showConfirmButton: false, timer: 1500 });
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

  const handleToggleStatus = async (announcementId: number) => {
    setTogglingId(announcementId);
    const result = await toggleAnnouncementStatus(announcementId);
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
    <div className="bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Header row */}
      <div className="border border-gray-200 dark:border-gray-700 flex items-center px-[10px] py-[15px] rounded-[10px] mb-[10px] bg-gray-100 dark:bg-gray-800">
        <p style={{ width: "5%" }}>#</p>
        <p style={{ width: "10%" }}>Sıra</p>
        <p style={{ width: "40%" }}>Başlıq</p>
        <p style={{ width: "10%", textAlign: "center" }}>Status</p>
        <p style={{ width: "15%", textAlign: "right" }}>Əlavə tarixi</p>
        <p style={{ width: "20%", textAlign: "right" }}>Əməliyyatlar</p>
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <>
          {[...Array(PAGE_SIZE)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[20px] mb-[10px] bg-white dark:bg-gray-800 animate-pulse"
            >
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "5%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 ml-2" style={{ width: "9%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 ml-2" style={{ width: "39%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 ml-2" style={{ width: "9%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 ml-2" style={{ width: "14%" }}></div>
              <div className="flex justify-end gap-2 ml-2" style={{ width: "19%" }}>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-10"></div>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-10"></div>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-16"></div>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-10"></div>
              </div>
            </div>
          ))}
        </>
      ) : error ? (
        <div className="text-center text-red-500 dark:text-red-400 py-10">{error}</div>
      ) : announcements.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={announcements.map((a) => a.announcement_id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {announcements.map((announcement) => (
              <SortableItem key={announcement.announcement_id} id={announcement.announcement_id.toString()}>
                {({ attributes, listeners }) => (
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[15px] mb-[10px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    {/* Drag handle */}
                    <div {...listeners} {...attributes} className="cursor-move flex items-center" style={{ width: "5%" }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="5" cy="4" r="2" fill="#6B7280" />
                        <circle cx="5" cy="10" r="2" fill="#6B7280" />
                        <circle cx="5" cy="16" r="2" fill="#6B7280" />
                        <circle cx="11" cy="4" r="2" fill="#6B7280" />
                        <circle cx="11" cy="10" r="2" fill="#6B7280" />
                        <circle cx="11" cy="16" r="2" fill="#6B7280" />
                      </svg>
                    </div>

                    {/* Order */}
                    <p className="font-bold text-[16px] text-gray-600 dark:text-gray-100" style={{ width: "10%" }}>
                      {announcement.display_order}
                    </p>

                    {/* Title */}
                    <p className="text-[15px] text-gray-800 dark:text-gray-200" style={{ width: "40%" }}>
                      {truncate(announcement.title, 60)}
                    </p>

                    {/* Status badge */}
                    <div style={{ width: "10%", display: "flex", justifyContent: "center" }}>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        announcement.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}>
                        {announcement.is_active ? "Aktiv" : "Deaktiv"}
                      </span>
                    </div>

                    {/* Date */}
                    <p className="text-[14px] text-gray-500 dark:text-gray-400" style={{ width: "15%", textAlign: "right" }}>
                      {new Date(announcement.created_at).toLocaleDateString("az-AZ")}
                    </p>

                    {/* Actions */}
                    <div className="flex justify-end items-center gap-2" style={{ width: "20%" }}>
                      <Link to={`/announcements/${announcement.announcement_id}`}>
                        <div className="bg-yellow-400 p-[8px] rounded-[5px]">
                          <VisibilityIcon sx={{ color: "white", fontSize: "22px" }} />
                        </div>
                      </Link>

                      <button
                        type="button"
                        className="bg-green-500 p-[8px] rounded-[5px] flex justify-center items-center"
                        onClick={() => handleToggleStatus(announcement.announcement_id)}
                        disabled={togglingId === announcement.announcement_id}
                        title={announcement.is_active ? "Deaktiv et" : "Aktiv et"}
                      >
                        {togglingId === announcement.announcement_id ? (
                          <CircularProgress size={22} sx={{ color: "white" }} />
                        ) : announcement.is_active ? (
                          <ToggleOnIcon sx={{ color: "white", fontSize: "22px" }} />
                        ) : (
                          <ToggleOffIcon sx={{ color: "white", fontSize: "22px" }} />
                        )}
                      </button>

                      <button
                        type="button"
                        className="bg-blue-500 px-[10px] py-[8px] rounded-[5px] flex justify-center items-center text-white text-sm"
                        onClick={() => handleChangeOrder(announcement.announcement_id, announcement.display_order)}
                      >
                        Sıra dəyiş
                      </button>

                      <button
                        type="button"
                        className="bg-red-500 p-[8px] rounded-[5px] flex justify-center items-center"
                        onClick={() => handleDelete(announcement.announcement_id)}
                        disabled={deletingId === announcement.announcement_id}
                      >
                        {deletingId === announcement.announcement_id ? (
                          <CircularProgress size={22} sx={{ color: "white" }} />
                        ) : (
                          <DeleteIcon sx={{ color: "white", fontSize: "22px" }} />
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
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">Elan yoxdur</div>
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
