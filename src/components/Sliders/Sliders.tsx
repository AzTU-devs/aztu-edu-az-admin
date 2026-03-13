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
  Slider,
  deleteSlider,
  getSliders,
  reorderSlider,
} from "../../services/slider/sliderService";

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

export default function Sliders() {
  const lang = "az";
  const [end, setEnd] = useState(PAGE_SIZE);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [total, setTotal] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor));

  const fetchSliders = (s: number, e: number) => {
    setLoading(true);
    setError(null);
    getSliders(s, e, lang)
      .then((res) => {
        if (res && typeof res === "object" && "sliders" in res) {
          setSliders(res.sliders);
          setTotal(res.total);
        } else if (res === "NO CONTENT") {
          setSliders([]);
          setTotal(0);
        } else {
          setError("Slayderlər yüklənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
          setSliders([]);
          setTotal(0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSliders(start, end);
  }, [start, end]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sliders.findIndex((s) => s.slider_id.toString() === active.id);
    const newIndex = sliders.findIndex((s) => s.slider_id.toString() === over.id);

    const updated = arrayMove(sliders, oldIndex, newIndex).map(
      (s, idx) => ({ ...s, display_order: idx + 1 })
    );
    setSliders(updated);

    const result = await reorderSlider({
      slider_id: Number(active.id),
      new_order: newIndex + 1,
    });

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Sıra uğurla dəyişdirildi", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Sıra dəyişdirilə bilmədi", showConfirmButton: false, timer: 1500 });
    }
  };

  const handleChangeOrder = async (sliderId: number, currentOrder: number) => {
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

    const result = await reorderSlider({ slider_id: sliderId, new_order: newOrder });

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Sıra uğurla dəyişdirildi", showConfirmButton: false, timer: 1500 });
      fetchSliders(start, end);
    } else {
      Swal.fire({ icon: "error", title: "Xəta baş verdi", text: "Sıra dəyişdirilə bilmədi" });
    }
  };

  const handleDelete = async (sliderId: number) => {
    const confirmResult = await Swal.fire({
      title: "Slayderi silmək istədiyinizə əminsiniz?",
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

    setDeletingId(sliderId);
    const result = await deleteSlider(sliderId);
    setDeletingId(null);

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1500 });
      setSliders((prev) => prev.filter((s) => s.slider_id !== sliderId));
      setTotal((prev) => prev - 1);
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Slayder tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Gözlənilməz xəta", text: "Zəhmət olmasa biraz sonra yenidən cəhd edin", showConfirmButton: false, timer: 1500 });
    }
  };

  return (
    <div className="bg-white dark:bg-transparent text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="border border-gray-200 dark:border-gray-700 flex items-center px-[10px] py-[15px] rounded-[10px] mb-[10px] bg-gray-100 dark:bg-gray-800">
        <p style={{ width: "5%" }}>#</p>
        <p style={{ width: "8%" }}>Sıra</p>
        <p style={{ width: "35%" }}>Təsvir</p>
        <p style={{ width: "25%" }}>URL</p>
        <p style={{ width: "10%", textAlign: "center" }}>Status</p>
        <p style={{ width: "17%", textAlign: "right" }}>Əməliyyatlar</p>
      </div>

      {loading ? (
        <>
          {[...Array(PAGE_SIZE)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[20px] mb-[10px] bg-white dark:bg-gray-800 animate-pulse"
            >
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "5%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 ml-2" style={{ width: "7%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 ml-2" style={{ width: "34%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 ml-2" style={{ width: "24%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 ml-2" style={{ width: "9%" }}></div>
              <div className="flex justify-end gap-2 ml-2" style={{ width: "16%" }}>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-10"></div>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-16"></div>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-10"></div>
              </div>
            </div>
          ))}
        </>
      ) : error ? (
        <div className="text-center text-red-500 dark:text-red-400 py-10">{error}</div>
      ) : sliders.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={sliders.map((s) => s.slider_id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {sliders.map((slider) => (
              <SortableItem key={slider.slider_id} id={slider.slider_id.toString()}>
                {({ attributes, listeners }) => (
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[15px] mb-[10px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
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

                    <p className="font-bold text-[16px] text-gray-600 dark:text-gray-100" style={{ width: "8%" }}>
                      {slider.display_order}
                    </p>

                    <p className="text-[15px] text-gray-800 dark:text-gray-200" style={{ width: "35%" }}>
                      {truncate(slider.desc, 50)}
                    </p>

                    <p className="text-[14px] text-blue-500 dark:text-blue-400" style={{ width: "25%" }}>
                      {truncate(slider.url, 35)}
                    </p>

                    <div style={{ width: "10%", display: "flex", justifyContent: "center" }}>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        slider.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}>
                        {slider.is_active ? "Aktiv" : "Deaktiv"}
                      </span>
                    </div>

                    <div className="flex justify-end items-center gap-2" style={{ width: "17%" }}>
                      <Link to={`/sliders/${slider.slider_id}`}>
                        <div className="bg-yellow-400 p-[8px] rounded-[5px]">
                          <EditIcon sx={{ color: "white", fontSize: "22px" }} />
                        </div>
                      </Link>

                      <button
                        type="button"
                        className="bg-blue-500 px-[10px] py-[8px] rounded-[5px] flex justify-center items-center text-white text-sm"
                        onClick={() => handleChangeOrder(slider.slider_id, slider.display_order)}
                      >
                        Sıra dəyiş
                      </button>

                      <button
                        type="button"
                        className="bg-red-500 p-[8px] rounded-[5px] flex justify-center items-center"
                        onClick={() => handleDelete(slider.slider_id)}
                        disabled={deletingId === slider.slider_id}
                      >
                        {deletingId === slider.slider_id ? (
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
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">Slayder yoxdur</div>
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
