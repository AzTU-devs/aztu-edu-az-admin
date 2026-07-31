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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  HeroCertificate,
  FAMILY_OPTIONS,
  getHeroCertificates,
  reorderHeroCertificate,
  activateHeroCertificate,
  deactivateHeroCertificate,
  deleteHeroCertificate,
} from "../../services/heroCertificate/heroCertificateService";
import { API_BASE_URL } from "../../util/apiClient";

/** Stored paths are relative (`static/uploads/...`); externally hosted ones are absolute. */
function resolveFileUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

const FAMILY_LABELS: Record<string, string> = FAMILY_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {} as Record<string, string>
);

const FAMILY_BADGE_CLASSES: Record<string, string> = {
  world: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  europe: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  subject: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

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

export default function HeroCertificates() {
  const lang = "az";
  const [end, setEnd] = useState(PAGE_SIZE);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<HeroCertificate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [total, setTotal] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor));

  const fetchCertificates = (s: number, e: number) => {
    setLoading(true);
    setError(null);
    getHeroCertificates(s, e, lang)
      .then((res) => {
        if (res && typeof res === "object" && "certificates" in res) {
          setCertificates(res.certificates);
          setTotal(res.total);
        } else if (res === "NO CONTENT") {
          setCertificates([]);
          setTotal(0);
        } else {
          setError("Sertifikatlar yüklənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
          setCertificates([]);
          setTotal(0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCertificates(start, end);
  }, [start, end]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = certificates.findIndex((c) => c.certificate_id.toString() === active.id);
    const newIndex = certificates.findIndex((c) => c.certificate_id.toString() === over.id);

    // `display_order` is global while `newIndex` is an index within the current
    // page, so the page offset has to be added back before either the optimistic
    // renumbering or the request can be correct.
    const updated = arrayMove(certificates, oldIndex, newIndex).map(
      (c, idx) => ({ ...c, display_order: start + idx + 1 })
    );
    setCertificates(updated);

    const result = await reorderHeroCertificate({
      certificate_id: Number(active.id),
      new_order: start + newIndex + 1,
    });

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Sıra uğurla dəyişdirildi", showConfirmButton: false, timer: 1500 });
      fetchCertificates(start, end);
    } else {
      Swal.fire({ icon: "error", title: "Sıra dəyişdirilə bilmədi", showConfirmButton: false, timer: 1500 });
      fetchCertificates(start, end);
    }
  };

  const handleChangeOrder = async (certificateId: number, currentOrder: number) => {
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

    const result = await reorderHeroCertificate({ certificate_id: certificateId, new_order: newOrder });

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Sıra uğurla dəyişdirildi", showConfirmButton: false, timer: 1500 });
      fetchCertificates(start, end);
    } else {
      Swal.fire({ icon: "error", title: "Xəta baş verdi", text: "Sıra dəyişdirilə bilmədi" });
    }
  };

  const handleToggle = async (certificate: HeroCertificate) => {
    setTogglingId(certificate.certificate_id);
    const result = certificate.is_active
      ? await deactivateHeroCertificate(certificate.certificate_id)
      : await activateHeroCertificate(certificate.certificate_id);
    setTogglingId(null);

    if (result === "SUCCESS") {
      Swal.fire({
        icon: "success",
        title: certificate.is_active ? "Deaktiv edildi" : "Aktiv edildi",
        showConfirmButton: false,
        timer: 1500,
      });
      fetchCertificates(start, end);
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Sertifikat tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Status dəyişdirilə bilmədi", showConfirmButton: false, timer: 1500 });
    }
  };

  const handleDelete = async (certificateId: number) => {
    const confirmResult = await Swal.fire({
      title: "Sertifikatı silmək istədiyinizə əminsiniz?",
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

    setDeletingId(certificateId);
    const result = await deleteHeroCertificate(certificateId);
    setDeletingId(null);

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1500 });

      // Patching the list locally is not enough: the API renumbers
      // `display_order` after a delete, and the next page's first row rolls up
      // into this one. Deleting the last row of the last page also has to step
      // back a page — otherwise `start` points past the end, the refetch comes
      // back 204, and the pagination unmounts while the user is stranded on an
      // empty screen with no way back to page 1.
      const remaining = Math.max(0, total - 1);
      const lastPageStart = Math.max(0, (Math.ceil(remaining / PAGE_SIZE) - 1) * PAGE_SIZE);
      const nextStart = Math.min(start, lastPageStart);

      if (nextStart !== start) {
        setStart(nextStart);
        setEnd(nextStart + PAGE_SIZE); // the effect refetches on the new window
      } else {
        fetchCertificates(start, end);
      }
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Sertifikat tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Gözlənilməz xəta", text: "Zəhmət olmasa biraz sonra yenidən cəhd edin", showConfirmButton: false, timer: 1500 });
    }
  };

  /** Image renders inline; otherwise fall back to a document chip, then an external link chip. */
  const renderPreview = (certificate: HeroCertificate) => {
    if (certificate.image) {
      return (
        <img
          src={resolveFileUrl(certificate.image)}
          alt={certificate.title ?? certificate.rank_label}
          className="h-9 w-9 object-contain rounded-md border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
        />
      );
    }

    if (certificate.document) {
      return (
        <a
          href={resolveFileUrl(certificate.document)}
          target="_blank"
          rel="noopener noreferrer"
          title="Sənədi aç"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          Sənəd
        </a>
      );
    }

    if (certificate.external_url) {
      return (
        <a
          href={resolveFileUrl(certificate.external_url)}
          target="_blank"
          rel="noopener noreferrer"
          title="Keçidi aç"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <path d="M15 3h6v6M10 14L21 3" />
          </svg>
          Keçid
        </a>
      );
    }

    return <span className="text-gray-400 dark:text-gray-600 italic text-sm">—</span>;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "4%" }}>#</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "5%" }}>Sıra</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "8%" }}>Öncədən</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "9%" }}>Reytinq</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "26%" }}>Başlıq</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "11%" }}>Kateqoriya</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "11%" }}>Tarix</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "10%" }}>Status</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "16%" }}>Əməliyyatlar</p>
        </div>

        {loading ? (
          <div>
            {[...Array(PAGE_SIZE)].map((_, idx) => (
              <div key={idx} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 animate-pulse">
                <div className="h-4 w-4 bg-gray-100 dark:bg-gray-800 rounded" style={{ width: "4%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-1" style={{ width: "4%" }}></div>
                <div className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded-lg ml-2" style={{ width: "7%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-2" style={{ width: "8%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "24%" }}></div>
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "9%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "9%" }}></div>
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full ml-3" style={{ width: "8%" }}></div>
                <div className="flex justify-end gap-1.5 ml-3" style={{ width: "15%" }}>
                  <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-7 w-12 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-7 w-7 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
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
        ) : certificates.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={certificates.map((c) => c.certificate_id.toString())} strategy={verticalListSortingStrategy}>
              {certificates.map((certificate) => (
                <SortableItem key={certificate.certificate_id} id={certificate.certificate_id.toString()}>
                  {({ attributes, listeners }) => (
                    <div className="flex items-center px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-150">
                      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" style={{ width: "4%" }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="4" cy="3" r="1.5" fill="#9CA3AF" /><circle cx="4" cy="8" r="1.5" fill="#9CA3AF" /><circle cx="4" cy="13" r="1.5" fill="#9CA3AF" />
                          <circle cx="10" cy="3" r="1.5" fill="#9CA3AF" /><circle cx="10" cy="8" r="1.5" fill="#9CA3AF" /><circle cx="10" cy="13" r="1.5" fill="#9CA3AF" />
                        </svg>
                      </div>

                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400" style={{ width: "5%" }}>{certificate.display_order}</p>

                      <div style={{ width: "8%" }}>{renderPreview(certificate)}</div>

                      <div style={{ width: "9%" }}>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono text-xs font-semibold">
                          {certificate.rank_label}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 pr-3" style={{ width: "26%" }}>
                        {certificate.title
                          ? truncate(certificate.title, 45)
                          : <span className="text-gray-400 dark:text-gray-600 italic">—</span>}
                      </p>

                      <div style={{ width: "11%" }}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${FAMILY_BADGE_CLASSES[certificate.family] ?? FAMILY_BADGE_CLASSES.other}`}>
                          {FAMILY_LABELS[certificate.family] ?? certificate.family}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400" style={{ width: "11%" }}>
                        {certificate.issued_date
                          ? new Date(certificate.issued_date).toLocaleDateString("az-AZ")
                          : <span className="text-gray-400 dark:text-gray-600 italic">—</span>}
                      </p>

                      <div style={{ width: "10%" }}>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          certificate.is_active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${certificate.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                          {certificate.is_active ? "Aktiv" : "Deaktiv"}
                        </span>
                      </div>

                      <div className="flex justify-end items-center gap-1" style={{ width: "16%" }}>
                        <Link to={`/hero-certificates/${certificate.certificate_id}`}>
                          <button className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Düzəliş et">
                            <EditIcon sx={{ fontSize: 18 }} />
                          </button>
                        </Link>

                        <button
                          type="button"
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30 transition-colors"
                          onClick={() => handleChangeOrder(certificate.certificate_id, certificate.display_order)}
                        >
                          Sıra
                        </button>

                        <button
                          type="button"
                          className={`p-1.5 rounded-lg transition-colors ${
                            certificate.is_active
                              ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                          onClick={() => handleToggle(certificate)}
                          disabled={togglingId === certificate.certificate_id}
                          title={certificate.is_active ? "Deaktiv et" : "Aktiv et"}
                        >
                          {togglingId === certificate.certificate_id ? (
                            <CircularProgress size={18} sx={{ color: "currentColor" }} />
                          ) : certificate.is_active ? (
                            <CheckCircleIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <CancelIcon sx={{ fontSize: 18 }} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => handleDelete(certificate.certificate_id)}
                          disabled={deletingId === certificate.certificate_id}
                          title="Sil"
                        >
                          {deletingId === certificate.certificate_id ? (
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sertifikat yoxdur</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hələ heç bir sertifikat əlavə edilməyib</p>
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
