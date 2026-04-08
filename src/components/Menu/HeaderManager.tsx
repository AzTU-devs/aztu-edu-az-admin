import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuModal from "./MenuModal";
import {
  AdminMenuHeader,
  AdminMenuHeaderItem,
  AdminMenuHeaderSubItem,
  getAdminHeader,
  createMenuHeader,
  updateMenuHeader,
  deleteMenuHeader,
  createHeaderItem,
  updateHeaderItem,
  deleteHeaderItem,
  createHeaderSubItem,
  updateHeaderSubItem,
  deleteHeaderSubItem,
} from "../../services/menu/menuService";

// ── slug preview helper ─────────────────────────────────────
function makeSlug(title: string): string {
  const az: Record<string, string> = {
    ə: "e", Ə: "E", ü: "u", Ü: "U", ö: "o", Ö: "O",
    ğ: "g", Ğ: "G", ı: "i", İ: "I", ç: "c", Ç: "C", ş: "s", Ş: "S",
  };
  return title
    .replace(/[əƏüÜöÖğĞıİçÇşŞ]/g, (ch) => az[ch] ?? ch)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── helpers ────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

function SlugPreview({ title, parentPath }: { title: string; parentPath?: string }) {
  const slug = makeSlug(title);
  if (!slug) return null;
  const prefix = parentPath ? `/${parentPath}` : "";
  return (
    <div className="text-xs text-gray-400 mt-1 font-mono space-y-0.5">
      <p>az: <span className="text-blue-500">/az{prefix}/{slug}</span></p>
      <p>en: <span className="text-blue-500">/en{prefix}/{slug}</span></p>
    </div>
  );
}

// ── types for breadcrumb nav ────────────────────────────────
type View = "headers" | "items" | "subitems";

// ─────────────────────────────────────────────────────────────
export default function HeaderManager() {
  const [headers, setHeaders] = useState<AdminMenuHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("headers");
  const [selectedHeader, setSelectedHeader] = useState<AdminMenuHeader | null>(null);
  const [selectedItem, setSelectedItem] = useState<AdminMenuHeaderItem | null>(null);

  // modal state
  const [modal, setModal] = useState<{
    type: "header" | "item" | "subitem";
    mode: "create" | "edit";
    target?: AdminMenuHeader | AdminMenuHeaderItem | AdminMenuHeaderSubItem;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // form state — headers
  const [hTitleAz, setHTitleAz] = useState("");
  const [hTitleEn, setHTitleEn] = useState("");
  const [hImageFile, setHImageFile] = useState<File | null>(null);
  const [hCurrentImageUrl, setHCurrentImageUrl] = useState("");
  const [hOrder, setHOrder] = useState("1");
  const [hDirectUrl, setHDirectUrl] = useState("");
  const [hHasSubitems, setHHasSubitems] = useState(true);

  // form state — items
  const [iTitleAz, setITitleAz] = useState("");
  const [iTitleEn, setITitleEn] = useState("");
  const [iOrder, setIOrder] = useState("1");
  const [iDirectUrl, setIDirectUrl] = useState("");
  const [iHasSubitems, setIHasSubitems] = useState(false);

  // form state — sub-items
  const [siTitleAz, setSiTitleAz] = useState("");
  const [siTitleEn, setSiTitleEn] = useState("");
  const [siOrder, setSiOrder] = useState("1");
  const [siDirectUrl, setSiDirectUrl] = useState("");

  const loadData = async () => {
    setLoading(true);
    const res = await getAdminHeader();
    if (res !== "ERROR") setHeaders(Array.isArray(res) ? res : []);
    else Swal.fire({ icon: "error", title: "Məlumatlar yüklənə bilmədi", timer: 2000, showConfirmButton: false });
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // ── open modal helpers ─────────────────────────────────────
  const openCreateHeader = () => {
    setHTitleAz(""); setHTitleEn(""); setHImageFile(null);
    setHCurrentImageUrl(""); setHOrder("1"); setHDirectUrl("");
    setHHasSubitems(true);
    setModal({ type: "header", mode: "create" });
  };

  const openEditHeader = (h: AdminMenuHeader) => {
    setHTitleAz(h.title); setHTitleEn(h.title);
    setHImageFile(null); setHCurrentImageUrl(h.image_url || "");
    setHOrder(String(h.display_order)); setHDirectUrl(h.direct_url || "");
    setHHasSubitems((String(h.has_subitems) === "1" || h.has_subitems === true));
    setModal({ type: "header", mode: "edit", target: h });
  };

  const openCreateItem = () => {
    setITitleAz(""); setITitleEn(""); setIOrder("1"); setIDirectUrl("");
    setIHasSubitems(false);
    setModal({ type: "item", mode: "create" });
  };

  const openEditItem = (item: AdminMenuHeaderItem) => {
    setITitleAz(item.title); setITitleEn(item.title);
    setIOrder(String(item.display_order)); setIDirectUrl(item.direct_url || "");
    setIHasSubitems((String(item.has_subitems) === "1" || item.has_subitems === true));
    setModal({ type: "item", mode: "edit", target: item });
  };

  const openCreateSubItem = () => {
    setSiTitleAz(""); setSiTitleEn(""); setSiOrder("1"); setSiDirectUrl("");
    setModal({ type: "subitem", mode: "create" });
  };

  const openEditSubItem = (si: AdminMenuHeaderSubItem) => {
    setSiTitleAz(si.title); setSiTitleEn(si.title);
    setSiOrder(String(si.display_order)); setSiDirectUrl(si.direct_url || "");
    setModal({ type: "subitem", mode: "edit", target: si });
  };

  // ── submit ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!modal) return;
    setSaving(true);

    if (modal.type === "header") {
      if (modal.mode === "create") {
        const res = await createMenuHeader({
          title_az: hTitleAz,
          title_en: hTitleEn,
          display_order: parseInt(hOrder) || 0,
          has_subitems: hHasSubitems,
          direct_url: hDirectUrl || undefined,
          image: hImageFile || undefined,
        });
        if (res === "ERROR") Swal.fire({ icon: "error", title: "Xəta baş verdi", timer: 2000, showConfirmButton: false });
        else { Swal.fire({ icon: "success", title: "Başlıq yaradıldı", timer: 1500, showConfirmButton: false }); loadData(); }
      } else {
        const target = modal.target as AdminMenuHeader;
        const payload: Parameters<typeof updateMenuHeader>[1] = {
          title_az: hTitleAz,
          title_en: hTitleEn,
          display_order: parseInt(hOrder) || 0,
          has_subitems: hHasSubitems,
          direct_url: hDirectUrl,
        };
        if (hImageFile) payload.image = hImageFile;
        const res = await updateMenuHeader(target.id, payload);
        if (res !== "SUCCESS") Swal.fire({ icon: "error", title: "Yenilənə bilmədi", timer: 2000, showConfirmButton: false });
        else { Swal.fire({ icon: "success", title: "Yeniləndi", timer: 1500, showConfirmButton: false }); loadData(); }
      }
    }

    if (modal.type === "item" && selectedHeader) {
      if (modal.mode === "create") {
        const res = await createHeaderItem({
          header_id: selectedHeader.id,
          title_az: iTitleAz,
          title_en: iTitleEn,
          display_order: parseInt(iOrder) || 0,
          has_subitems: iHasSubitems,
          direct_url: iDirectUrl || null,
        });
        if (res === "BAD REQUEST") Swal.fire({ icon: "warning", title: "Bu başlığın birbaşa URL-i var, element əlavə edilə bilməz", timer: 3000, showConfirmButton: false });
        else if (res === "ERROR") Swal.fire({ icon: "error", title: "Xəta baş verdi", timer: 2000, showConfirmButton: false });
        else { Swal.fire({ icon: "success", title: "Element yaradıldı", timer: 1500, showConfirmButton: false }); loadData(); }
      } else {
        const target = modal.target as AdminMenuHeaderItem;
        const res = await updateHeaderItem(target.id, {
          title_az: iTitleAz,
          title_en: iTitleEn,
          display_order: parseInt(iOrder) || 0,
          has_subitems: iHasSubitems,
          direct_url: iDirectUrl,
        });
        if (res !== "SUCCESS") Swal.fire({ icon: "error", title: "Yenilənə bilmədi", timer: 2000, showConfirmButton: false });
        else { Swal.fire({ icon: "success", title: "Yeniləndi", timer: 1500, showConfirmButton: false }); loadData(); }
      }
    }

    if (modal.type === "subitem" && selectedItem) {
      if (modal.mode === "create") {
        const res = await createHeaderSubItem({
          item_id: selectedItem.id,
          title_az: siTitleAz,
          title_en: siTitleEn,
          direct_url: siDirectUrl || null,
          display_order: parseInt(siOrder) || 0,
        });
        if (res === "BAD REQUEST") Swal.fire({ icon: "warning", title: "Bu elementin birbaşa URL-i var, alt-element əlavə edilə bilməz", timer: 3000, showConfirmButton: false });
        else if (res === "ERROR") Swal.fire({ icon: "error", title: "Xəta baş verdi", timer: 2000, showConfirmButton: false });
        else { Swal.fire({ icon: "success", title: "Alt-element yaradıldı", timer: 1500, showConfirmButton: false }); loadData(); }
      } else {
        const target = modal.target as AdminMenuHeaderSubItem;
        const res = await updateHeaderSubItem(target.id, {
          title_az: siTitleAz,
          title_en: siTitleEn,
          direct_url: siDirectUrl || null,
          display_order: parseInt(siOrder) || 0,
        });
        if (res !== "SUCCESS") Swal.fire({ icon: "error", title: "Yenilənə bilmədi", timer: 2000, showConfirmButton: false });
        else { Swal.fire({ icon: "success", title: "Yeniləndi", timer: 1500, showConfirmButton: false }); loadData(); }
      }
    }

    setSaving(false);
    setModal(null);
  };

  // ── delete handlers ────────────────────────────────────────
  const handleDeleteHeader = async (h: AdminMenuHeader) => {
    const confirm = await Swal.fire({
      title: `"${h.title}" başlığını silmək istəyirsiniz?`,
      text: "Bu əməliyyat bütün elementləri və alt-elementləri də siləcək!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
    });
    if (!confirm.isConfirmed) return;
    const res = await deleteMenuHeader(h.id);
    if (res === "SUCCESS") { Swal.fire({ icon: "success", title: "Silindi", timer: 1500, showConfirmButton: false }); loadData(); }
    else Swal.fire({ icon: "error", title: "Silinə bilmədi", timer: 2000, showConfirmButton: false });
  };

  const handleDeleteItem = async (item: AdminMenuHeaderItem) => {
    const confirm = await Swal.fire({
      title: `"${item.title}" elementini silmək istəyirsiniz?`,
      text: "Alt-elementlər də silinəcək!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
    });
    if (!confirm.isConfirmed) return;
    const res = await deleteHeaderItem(item.id);
    if (res === "SUCCESS") { Swal.fire({ icon: "success", title: "Silindi", timer: 1500, showConfirmButton: false }); loadData(); }
    else Swal.fire({ icon: "error", title: "Silinə bilmədi", timer: 2000, showConfirmButton: false });
  };

  const handleDeleteSubItem = async (si: AdminMenuHeaderSubItem) => {
    const confirm = await Swal.fire({
      title: `"${si.title}" alt-elementini silmək istəyirsiniz?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
    });
    if (!confirm.isConfirmed) return;
    const res = await deleteHeaderSubItem(si.id);
    if (res === "SUCCESS") { Swal.fire({ icon: "success", title: "Silindi", timer: 1500, showConfirmButton: false }); loadData(); }
    else Swal.fire({ icon: "error", title: "Silinə bilmədi", timer: 2000, showConfirmButton: false });
  };

  // ── get current items/sub-items from headers state ─────────
  const currentItems: AdminMenuHeaderItem[] = selectedHeader
    ? (headers.find(h => h.id === selectedHeader.id)?.items || [])
    : [];

  const currentSubItems: AdminMenuHeaderSubItem[] = selectedItem
    ? (currentItems.find(i => i.id === selectedItem.id)?.sub_items || [])
    : [];

  // ── render ─────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <button
          onClick={() => setView("headers")}
          className={view === "headers" ? "text-blue-600 font-medium" : "hover:text-gray-700 dark:hover:text-gray-200"}
        >
          Başlıqlar
        </button>
        {view !== "headers" && selectedHeader && (
          <>
            <ChevronRightIcon sx={{ fontSize: 16 }} />
            <button
              onClick={() => setView("items")}
              className={view === "items" ? "text-blue-600 font-medium" : "hover:text-gray-700 dark:hover:text-gray-200"}
            >
              {selectedHeader.title}
            </button>
          </>
        )}
        {view === "subitems" && selectedItem && (
          <>
            <ChevronRightIcon sx={{ fontSize: 16 }} />
            <span className="text-blue-600 font-medium">{selectedItem.title}</span>
          </>
        )}
      </div>

      {/* ── HEADERS VIEW ──────────────────────────────────── */}
      {view === "headers" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={openCreateHeader}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <AddIcon sx={{ fontSize: 18 }} /> Yeni başlıq
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><CircularProgress /></div>
          ) : headers.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">Başlıq yoxdur</p>
          ) : (
            <div className="space-y-2">
              {headers.map((h) => (
                <div key={h.id} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
                  <div className="flex items-center px-4 py-3 gap-3">
                    {h.image_url && (
                      <img src={h.image_url} alt="" className="h-10 w-16 rounded object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{h.title}</p>
                        {(String(h.has_subitems) === "1" || h.has_subitems === true) ? (
                          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider">KATEQORİYA</span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider">KEÇİD</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                        /{h.slug}
                        {h.direct_url && <span className="ml-2 not-italic text-green-600 dark:text-green-400">→ {h.direct_url}</span>}
                        <span className="not-italic ml-2">· Sıra: {h.display_order}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {(String(h.has_subitems) === "1" || h.has_subitems === true) && (
                        <button
                          onClick={() => { setSelectedHeader(h); setView("items"); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Elementlər <ExpandMoreIcon sx={{ fontSize: 16 }} />
                        </button>
                      )}
                      <button onClick={() => openEditHeader(h)} className="p-1.5 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors">
                        <EditIcon sx={{ fontSize: 16, color: "white" }} />
                      </button>
                      <button onClick={() => handleDeleteHeader(h)} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                        <DeleteIcon sx={{ fontSize: 16, color: "white" }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── ITEMS VIEW ────────────────────────────────────── */}
      {view === "items" && selectedHeader && (
        <>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView("headers")}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} /> Geri
            </button>
            <button
              onClick={openCreateItem}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <AddIcon sx={{ fontSize: 18 }} /> Yeni element
            </button>
          </div>

          {currentItems.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">Element yoxdur</p>
          ) : (
            <div className="space-y-2">
              {currentItems.map((item) => (
                <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <div className="flex items-center px-4 py-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.title}</p>
                        {(String(item.has_subitems) === "1" || item.has_subitems === true) ? (
                          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider">KATEQORİYA</span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider">KEÇİD</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                        {item.slug && <>/{item.slug}</>}
                        {item.direct_url && <span className="text-green-600 dark:text-green-400"> → {item.direct_url}</span>}
                        <span className="not-italic ml-2">· Sıra: {item.display_order}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {(String(item.has_subitems) === "1" || item.has_subitems === true) && (
                        <button
                          onClick={() => { setSelectedItem(item); setView("subitems"); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Alt-elementlər <ExpandMoreIcon sx={{ fontSize: 16 }} />
                        </button>
                      )}
                      <button onClick={() => openEditItem(item)} className="p-1.5 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors">
                        <EditIcon sx={{ fontSize: 16, color: "white" }} />
                      </button>
                      <button onClick={() => handleDeleteItem(item)} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                        <DeleteIcon sx={{ fontSize: 16, color: "white" }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── SUB-ITEMS VIEW ────────────────────────────────── */}
      {view === "subitems" && selectedItem && (
        <>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView("items")}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} /> Geri
            </button>
            <button
              onClick={openCreateSubItem}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <AddIcon sx={{ fontSize: 18 }} /> Yeni alt-element
            </button>
          </div>

          {currentSubItems.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">Alt-element yoxdur</p>
          ) : (
            <div className="space-y-2">
              {currentSubItems.map((si) => (
                <div key={si.id} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <div className="flex items-center px-4 py-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{si.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                        {si.slug && <>/{si.slug} · </>}
                        <span className="text-green-600 dark:text-green-400">{si.direct_url}</span>
                        <span className="not-italic ml-2">· Sıra: {si.display_order}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEditSubItem(si)} className="p-1.5 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors">
                        <EditIcon sx={{ fontSize: 16, color: "white" }} />
                      </button>
                      <button onClick={() => handleDeleteSubItem(si)} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                        <DeleteIcon sx={{ fontSize: 16, color: "white" }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MODAL ─────────────────────────────────────────── */}
      {modal && (
        <MenuModal
          title={
            modal.type === "header" ? (modal.mode === "create" ? "Yeni başlıq" : "Başlığı düzəlt") :
            modal.type === "item" ? (modal.mode === "create" ? "Yeni element" : "Elementi düzəlt") :
            (modal.mode === "create" ? "Yeni alt-element" : "Alt-elementi düzəlt")
          }
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          loading={saving}
        >
          {/* HEADER FORM */}
          {modal.type === "header" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Field label="Başlıq (AZ) *">
                    <Input value={hTitleAz} onChange={setHTitleAz} placeholder="Universitet" />
                  </Field>
                </div>
                <div>
                  <Field label="Başlıq (EN) *">
                    <Input value={hTitleEn} onChange={setHTitleEn} placeholder="University" />
                  </Field>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={hHasSubitems}
                    onChange={(e) => {
                      setHHasSubitems(e.target.checked);
                      if (e.target.checked) setHDirectUrl("");
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                    Alt-elementləri var? (Kateqoriya kimi davranır)
                  </span>
                </label>

                {!hHasSubitems ? (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Field label="Birbaşa URL (isteğe bağlı — boş qalarsa avtomatik daxili link yaradılacaq)">
                      <Input value={hDirectUrl} onChange={setHDirectUrl} placeholder="https://..." />
                    </Field>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <SlugPreview title={hTitleAz} />
                      <SlugPreview title={hTitleEn} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <SlugPreview title={hTitleAz} />
                    <SlugPreview title={hTitleEn} />
                  </div>
                )}
              </div>

              <Field label={modal.mode === "edit" ? "Şəkil (dəyişdirmək üçün seçin)" : "Şəkil (isteğe bağlı)"}>
                {modal.mode === "edit" && hCurrentImageUrl && !hImageFile && (
                  <img src={hCurrentImageUrl} alt="current" className="h-16 w-auto rounded mb-2 object-cover" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setHImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </Field>
              <Field label="Sıra *"><Input value={hOrder} onChange={setHOrder} placeholder="1" /></Field>
            </>
          )}

          {/* ITEM FORM */}
          {modal.type === "item" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Field label="Başlıq (AZ) *">
                    <Input value={iTitleAz} onChange={setITitleAz} placeholder="Haqqımızda" />
                  </Field>
                  <SlugPreview 
                    title={iTitleAz} 
                    parentPath={selectedHeader?.slug || ""} 
                  />
                </div>
                <div>
                  <Field label="Başlıq (EN) *">
                    <Input value={iTitleEn} onChange={setITitleEn} placeholder="About Us" />
                  </Field>
                  <SlugPreview 
                    title={iTitleEn} 
                    parentPath={selectedHeader?.slug || ""} 
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={iHasSubitems}
                    onChange={(e) => {
                      setIHasSubitems(e.target.checked);
                      if (e.target.checked) setIDirectUrl("");
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                    Alt-elementləri var? (Dropdown sütun başlığı)
                  </span>
                </label>

                {!iHasSubitems && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Field label="Birbaşa URL (isteğe bağlı — boş qalarsa avtomatik daxili link yaradılacaq)">
                      <Input value={iDirectUrl} onChange={setIDirectUrl} placeholder="/az/..." />
                    </Field>
                  </div>
                )}
              </div>

              <Field label="Sıra *"><Input value={iOrder} onChange={setIOrder} placeholder="1" /></Field>
            </>
          )}

          {/* SUBITEM FORM */}
          {modal.type === "subitem" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Field label="Başlıq (AZ) *">
                    <Input value={siTitleAz} onChange={setSiTitleAz} placeholder="Rektor" />
                  </Field>
                  <SlugPreview 
                    title={siTitleAz} 
                    parentPath={`${selectedHeader?.slug || ""}/${selectedItem?.slug || ""}`.split("/").filter(Boolean).join("/")} 
                  />
                </div>
                <div>
                  <Field label="Başlıq (EN) *">
                    <Input value={siTitleEn} onChange={setSiTitleEn} placeholder="Rector" />
                  </Field>
                  <SlugPreview 
                    title={siTitleEn} 
                    parentPath={`${selectedHeader?.slug || ""}/${selectedItem?.slug || ""}`.split("/").filter(Boolean).join("/")} 
                  />
                </div>
              </div>
              <Field label="Birbaşa URL (isteğe bağlı — boş qalarsa avtomatik yaradılacaq)">
                <Input value={siDirectUrl} onChange={setSiDirectUrl} placeholder="/az/..." />
              </Field>
              <Field label="Sıra *"><Input value={siOrder} onChange={setSiOrder} placeholder="1" /></Field>
            </>
          )}
        </MenuModal>
      )}
    </div>
  );
}
