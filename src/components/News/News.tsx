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
  deleteNews,
  getNews,
  News,
  reorderNews,
  toggleNewsStatus,
} from "../../services/news/newsService";

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (args: { attributes: any; listeners: any }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
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

const PAGE_SIZE = 10;

export default function NewsList() {
  const lang = "az";
  const [end, setEnd] = useState(PAGE_SIZE);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newsList, setNewsList] = useState<News[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [totalNews, setTotalNews] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor));

  const fetchNews = (s: number, e: number) => {
    setLoading(true);
    setError(null);
    getNews(s, e, lang)
      .then((res) => {
        if (res && typeof res === "object" && "news" in res) {
          setNewsList(res.news);
          setTotalNews(res.total);
        } else if (res === "NO CONTENT") {
          setNewsList([]);
          setTotalNews(0);
        } else {
          setError("Xəbərlər yüklənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
          setNewsList([]);
          setTotalNews(0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews(start, end);
  }, [start, end]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = newsList.findIndex(
      (item) => item.news_id.toString() === active.id
    );
    const newIndex = newsList.findIndex(
      (item) => item.news_id.toString() === over.id
    );

    const updated = arrayMove(newsList, oldIndex, newIndex).map((n, idx) => ({
      ...n,
      display_order: idx + 1,
    }));
    setNewsList(updated);

    const result = await reorderNews({
      news_id: Number(active.id),
      new_order: newIndex + 1,
    });

    if (result === "SUCCESS") {
      Swal.fire({
        icon: "success",
        title: "Sıra uğurla dəyişdirildi",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Sıra dəyişdirilə bilmədi",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleChangeOrder = async (newsId: number, currentOrder: number) => {
    const swalResult = await (Swal.mixin({}) as any).fire({
      title: "Yeni sıra nömrəsini daxil edin",
      input: "text",
      inputLabel: "Yeni sıra",
      inputValue: currentOrder.toString(),
      showCancelButton: true,
      inputAttributes: {
        inputMode: "numeric",
        pattern: "[0-9]*",
        min: 1,
        max: totalNews,
        step: 1,
      },
    });

    const newOrder = swalResult.value ? Number(swalResult.value) : null;
    if (!newOrder) return;

    const result = await reorderNews({ news_id: newsId, new_order: newOrder });

    if (result === "SUCCESS") {
      Swal.fire({
        icon: "success",
        title: "Sıra uğurla dəyişdirildi",
        showConfirmButton: false,
        timer: 1500,
      });
      fetchNews(start, end);
    } else {
      Swal.fire({
        icon: "error",
        title: "Xəta baş verdi",
        text: "Sıra dəyişdirilə bilmədi",
      });
    }
  };

  const handleToggleStatus = async (newsId: number) => {
    setTogglingId(newsId);
    const result = await toggleNewsStatus(newsId);
    setTogglingId(null);

    if (result === "SUCCESS") {
      setNewsList((prev) =>
        prev.map((n) =>
          n.news_id === newsId ? { ...n, is_active: !n.is_active } : n
        )
      );
    } else {
      Swal.fire({
        icon: "error",
        title: "Status dəyişdirilə bilmədi",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleDeleteNews = async (newsId: number) => {
    const confirmResult = await Swal.fire({
      title: "Xəbəri silmək istədiyinizə əminsiniz?",
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

    setDeletingId(newsId);
    const result = await deleteNews(newsId);
    setDeletingId(null);

    if (result === "SUCCESS") {
      Swal.fire({
        icon: "success",
        title: "Uğurla silindi",
        showConfirmButton: false,
        timer: 1500,
      });
      setNewsList((prev) => prev.filter((n) => n.news_id !== newsId));
      setTotalNews((prev) => prev - 1);
    } else if (result === "NOT FOUND") {
      Swal.fire({
        icon: "error",
        title: "Xəta",
        text: "Xəbər tapılmadı",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Gözlənilməz xəta",
        text: "Zəhmət olmasa biraz sonra yenidən cəhd edin",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Header row */}
      <div className="border border-gray-200 dark:border-gray-700 flex justify-between items-center px-[10px] py-[15px] rounded-[10px] mb-[10px] bg-gray-100 dark:bg-gray-800">
        <p style={{ width: "5%" }}>#</p>
        <p style={{ width: "10%" }}>Sıra</p>
        <p style={{ width: "35%" }}>Başlıq</p>
        <p style={{ width: "10%", textAlign: "center" }}>Status</p>
        <p style={{ width: "15%", textAlign: "right" }}>Əlavə tarixi</p>
        <p style={{ width: "25%", textAlign: "right" }}>Əməliyyatlar</p>
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <>
          {[...Array(PAGE_SIZE)].map((_, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[20px] mb-[10px] bg-white dark:bg-gray-800 animate-pulse"
            >
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "5%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "9%", marginLeft: "1%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "34%", marginLeft: "1%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "9%", marginLeft: "1%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "14%", marginLeft: "1%" }}></div>
              <div className="flex justify-end gap-2" style={{ width: "24%", marginLeft: "1%" }}>
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
      ) : newsList.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={newsList.map((n) => n.news_id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {newsList.map((news) => (
              <SortableItem key={news.news_id} id={news.news_id.toString()}>
                {({ attributes, listeners }) => (
                  <div className="flex justify-between items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[15px] mb-[10px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    {/* Drag handle */}
                    <div
                      {...listeners}
                      {...attributes}
                      className="cursor-move flex items-center"
                      style={{ width: "5%" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="5" cy="4" r="2" fill="#6B7280" />
                        <circle cx="5" cy="10" r="2" fill="#6B7280" />
                        <circle cx="5" cy="16" r="2" fill="#6B7280" />
                        <circle cx="11" cy="4" r="2" fill="#6B7280" />
                        <circle cx="11" cy="10" r="2" fill="#6B7280" />
                        <circle cx="11" cy="16" r="2" fill="#6B7280" />
                      </svg>
                    </div>

                    {/* Order */}
                    <p
                      className="font-bold text-[16px] text-gray-600 dark:text-gray-100"
                      style={{ width: "10%" }}
                    >
                      {news.display_order}
                    </p>

                    {/* Title */}
                    <p
                      className="text-[15px] text-gray-800 dark:text-gray-200"
                      style={{ width: "35%" }}
                    >
                      {truncate(news.title, 60)}
                    </p>

                    {/* Status badge */}
                    <div style={{ width: "10%", display: "flex", justifyContent: "center" }}>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          news.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {news.is_active ? "Aktiv" : "Deaktiv"}
                      </span>
                    </div>

                    {/* Date */}
                    <p
                      className="text-[14px] text-gray-500 dark:text-gray-400"
                      style={{ width: "15%", textAlign: "right" }}
                    >
                      {new Date(news.created_at).toLocaleDateString("az-AZ")}
                    </p>

                    {/* Actions */}
                    <div
                      className="flex justify-end items-center gap-2"
                      style={{ width: "25%" }}
                    >
                      <Link to={`/news/${news.news_id}`}>
                        <div className="bg-yellow-400 p-[8px] rounded-[5px]">
                          <VisibilityIcon sx={{ color: "white", fontSize: "22px" }} />
                        </div>
                      </Link>

                      <button
                        type="button"
                        className="bg-green-500 p-[8px] rounded-[5px] flex justify-center items-center"
                        onClick={() => handleToggleStatus(news.news_id)}
                        disabled={togglingId === news.news_id}
                        title={news.is_active ? "Deaktiv et" : "Aktiv et"}
                      >
                        {togglingId === news.news_id ? (
                          <CircularProgress size={22} sx={{ color: "white" }} />
                        ) : news.is_active ? (
                          <ToggleOnIcon sx={{ color: "white", fontSize: "22px" }} />
                        ) : (
                          <ToggleOffIcon sx={{ color: "white", fontSize: "22px" }} />
                        )}
                      </button>

                      <button
                        type="button"
                        className="bg-blue-500 px-[10px] py-[8px] rounded-[5px] flex justify-center items-center text-white text-sm"
                        onClick={() => handleChangeOrder(news.news_id, news.display_order)}
                      >
                        Sıra dəyiş
                      </button>

                      <button
                        type="button"
                        className="bg-red-500 p-[8px] rounded-[5px] flex justify-center items-center"
                        onClick={() => handleDeleteNews(news.news_id)}
                        disabled={deletingId === news.news_id}
                      >
                        {deletingId === news.news_id ? (
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
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
          Xəbər yoxdur
        </div>
      )}

      {totalNews > PAGE_SIZE && (
        <Stack spacing={2} alignItems="center" justifyContent="center" mt={4}>
          <Pagination
            count={Math.ceil(totalNews / PAGE_SIZE)}
            page={Math.ceil(end / PAGE_SIZE)}
            onChange={(_, value) => {
              const newStart = (value - 1) * PAGE_SIZE;
              const newEnd = value * PAGE_SIZE;
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
                backgroundColor: "#1976d2",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              },
            }}
          />
        </Stack>
      )}
    </div>
  );
}
