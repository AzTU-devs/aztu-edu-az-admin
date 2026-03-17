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
  AdminHeaderSection,
  AdminHeaderItem,
  AdminHeaderSubItem,
  BiLang,
  getAdminHeader,
  createHeaderSection,
  updateHeaderSection,
  deleteHeaderSection,
  createHeaderItem,
  updateHeaderItem,
  deleteHeaderItem,
  createHeaderSubItem,
  updateHeaderSubItem,
  deleteHeaderSubItem,
} from "../../services/menu/menuService";

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

// ── types for breadcrumb nav ────────────────────────────────
type View = "sections" | "items" | "subitems";

// ─────────────────────────────────────────────────────────────
export default function HeaderManager() {
  const [sections, setSections] = useState<AdminHeaderSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("sections");
  const [selectedSection, setSelectedSection] = useState<AdminHeaderSection | null>(null);
  const [selectedItem, setSelectedItem] = useState<AdminHeaderItem | null>(null);

  // modal state
  const [modal, setModal] = useState<{
    type: "section" | "item" | "subitem";
    mode: "create" | "edit";
    target?: AdminHeaderSection | AdminHeaderItem | AdminHeaderSubItem;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // form state — sections
  const [sKey, setSKey] = useState("");
  const [sImageFile, setSImageFile] = useState<File | null>(null);
  const [sCurrentImageUrl, setSCurrentImageUrl] = useState("");
  const [sOrder, setSOrder] = useState("1");
  const [sLabelAz, setSLabelAz] = useState("");
  const [sLabelEn, setSLabelEn] = useState("");
  const [sBaseAz, setSBaseAz] = useState("");
  const [sBaseEn, setSBaseEn] = useState("");
  const [sDirectUrl, setSDirectUrl] = useState("");

  // form state — items
  const [iSlug, setISlug] = useState("");
  const [iOrder, setIOrder] = useState("1");
  const [iTitleAz, setITitleAz] = useState("");
  const [iTitleEn, setITitleEn] = useState("");
  const [iItemType, setIItemType] = useState<"link" | "subheader">("link");

  // form state — sub-items
  const [siSlug, setSiSlug] = useState("");
  const [siOrder, setSiOrder] = useState("1");
  const [siTitleAz, setSiTitleAz] = useState("");
  const [siTitleEn, setSiTitleEn] = useState("");

  const fetch = async () => {
    setLoading(true);
    const res = await getAdminHeader();
    if (res !== "ERROR") setSections(res);
    else Swal.fire({ icon: "error", title: "Məlumatlar yüklənə bilmədi", timer: 2000, showConfirmButton: false });
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  // ── open modal helpers ─────────────────────────────────────
  const openCreateSection = () => {
    setSKey(""); setSImageFile(null); setSCurrentImageUrl(""); setSOrder("1");
    setSLabelAz(""); setSLabelEn(""); setSBaseAz(""); setSBaseEn(""); setSDirectUrl("");
    setModal({ type: "section", mode: "create" });
  };

  const openEditSection = (s: AdminHeaderSection) => {
    setSKey(s.section_key); setSImageFile(null); setSCurrentImageUrl(s.image_url);
    setSOrder(String(s.display_order));
    setSLabelAz(s.label?.az || ""); setSLabelEn(s.label?.en || "");
    setSBaseAz(s.base_path?.az || ""); setSBaseEn(s.base_path?.en || "");
    setSDirectUrl(s.direct_url || "");
    setModal({ type: "section", mode: "edit", target: s });
  };

  const openCreateItem = () => {
    setISlug(""); setIOrder("1"); setITitleAz(""); setITitleEn(""); setIItemType("link");
    setModal({ type: "item", mode: "create" });
  };

  const openEditItem = (item: AdminHeaderItem) => {
    setISlug(item.slug || ""); setIOrder(String(item.display_order));
    setITitleAz(item.title?.az || ""); setITitleEn(item.title?.en || "");
    setIItemType(item.item_type || (item.slug === null ? "subheader" : "link"));
    setModal({ type: "item", mode: "edit", target: item });
  };

  const openCreateSubItem = () => {
    setSiSlug(""); setSiOrder("1"); setSiTitleAz(""); setSiTitleEn("");
    setModal({ type: "subitem", mode: "create" });
  };

  const openEditSubItem = (si: AdminHeaderSubItem) => {
    setSiSlug(si.slug); setSiOrder(String(si.display_order));
    setSiTitleAz(si.title?.az || ""); setSiTitleEn(si.title?.en || "");
    setModal({ type: "subitem", mode: "edit", target: si });
  };

  // ── submit ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!modal) return;
    setSaving(true);

    if (modal.type === "section") {
      if (modal.mode === "create") {
        if (!sImageFile) {
          Swal.fire({ icon: "warning", title: "Şəkil seçilməyib", timer: 2000, showConfirmButton: false });
          setSaving(false);
          return;
        }
        const res = await createHeaderSection({
          section_key: sKey,
          image: sImageFile,
          display_order: Number(sOrder),
          label_az: sLabelAz,
          label_en: sLabelEn,
          base_path_az: sBaseAz,
          base_path_en: sBaseEn,
          direct_url: sDirectUrl || undefined,
        });
        if (res === "CONFLICT") { Swal.fire({ icon: "warning", title: "Bu açar artıq mövcuddur", timer: 2000, showConfirmButton: false }); }
        else if (res === "ERROR") { Swal.fire({ icon: "error", title: "Xəta baş verdi", timer: 2000, showConfirmButton: false }); }
        else { Swal.fire({ icon: "success", title: "Bölmə yaradıldı", timer: 1500, showConfirmButton: false }); fetch(); }
      } else {
        const target = modal.target as AdminHeaderSection;
        const updatePayload: Parameters<typeof updateHeaderSection>[1] = {
          display_order: Number(sOrder),
          label_az: sLabelAz,
          label_en: sLabelEn,
          base_path_az: sBaseAz,
          base_path_en: sBaseEn,
          direct_url: sDirectUrl,
        };
        if (sImageFile) updatePayload.image = sImageFile;
        const res = await updateHeaderSection(target.id, updatePayload);
        if (res !== "SUCCESS") Swal.fire({ icon: "error", title: "Yenilənə bilmədi", timer: 2000, showConfirmButton: false });
        else { Swal.fire({ icon: "success", title: "Yeniləndi", timer: 1500, showConfirmButton: false }); fetch(); }
      }
    }

    if (modal.type === "item" && selectedSection) {
      const title: BiLang = { az: iTitleAz, en: iTitleEn };
      const slug = iItemType === "subheader" ? null : (iSlug || null);

      if (modal.mode === "create") {
        const res = await createHeaderItem({ section_id: selectedSection.id, item_type: iItemType, slug, display_order: Number(iOrder), title });
        if (res === "ERROR") Swal.fire({ icon: "error", title: "Xəta baş verdi", timer: 2000, showConfirmButton: false });
        else { Swal.fire({ icon: "success", title: "Element yaradıldı", timer: 1500, showConfirmButton: false }); fetch(); }
      } else {
        const target = modal.target as AdminHeaderItem;
        const res = await updateHeaderItem(target.id, { item_type: iItemType, slug, display_order: Number(iOrder), title });
        if (res !== "SUCCESS") Swal.fire({ icon: "error", title: "Yenilənə bilmədi", timer: 2000, showConfirmButton: false });
        else { Swal.fire({ icon: "success", title: "Yeniləndi", timer: 1500, showConfirmButton: false }); fetch(); }
      }
    }

    if (modal.type === "subitem" && selectedItem) {
      const title: BiLang = { az: siTitleAz, en: siTitleEn };

      if (modal.mode === "create") {
        const res = await createHeaderSubItem({ item_id: selectedItem.id, slug: siSlug, display_order: Number(siOrder), title });
        if (res === "ERROR") Swal.fire({ icon: "error", title: "Xəta baş verdi", timer: 2000, showConfirmButton: false });
        else { Swal.fire({ icon: "success", title: "Alt-element yaradıldı", timer: 1500, showConfirmButton: false }); fetch(); }
      } else {
        const target = modal.target as AdminHeaderSubItem;
        const res = await updateHeaderSubItem(target.id, { slug: siSlug, display_order: Number(siOrder), title });
        if (res !== "SUCCESS") Swal.fire({ icon: "error", title: "Yenilənə bilmədi", timer: 2000, showConfirmButton: false });
        else { Swal.fire({ icon: "success", title: "Yeniləndi", timer: 1500, showConfirmButton: false }); fetch(); }
      }
    }

    setSaving(false);
    setModal(null);
  };

  // ── delete handlers ────────────────────────────────────────
  const handleDeleteSection = async (s: AdminHeaderSection) => {
    const confirm = await Swal.fire({
      title: `"${s.label?.az || s.section_key}" bölməsini silmək istəyirsiniz?`,
      text: "Bu əməliyyat bütün elementləri də siləcək!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
    });
    if (!confirm.isConfirmed) return;
    const res = await deleteHeaderSection(s.id);
    if (res === "SUCCESS") { Swal.fire({ icon: "success", title: "Silindi", timer: 1500, showConfirmButton: false }); fetch(); }
    else Swal.fire({ icon: "error", title: "Silinə bilmədi", timer: 2000, showConfirmButton: false });
  };

  const handleDeleteItem = async (item: AdminHeaderItem) => {
    const confirm = await Swal.fire({
      title: `"${item.title?.az}" elementini silmək istəyirsiniz?`,
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
    if (res === "SUCCESS") { Swal.fire({ icon: "success", title: "Silindi", timer: 1500, showConfirmButton: false }); fetch(); }
    else Swal.fire({ icon: "error", title: "Silinə bilmədi", timer: 2000, showConfirmButton: false });
  };

  const handleDeleteSubItem = async (si: AdminHeaderSubItem) => {
    const confirm = await Swal.fire({
      title: `"${si.title?.az}" alt-elementini silmək istəyirsiniz?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
    });
    if (!confirm.isConfirmed) return;
    const res = await deleteHeaderSubItem(si.id);
    if (res === "SUCCESS") { Swal.fire({ icon: "success", title: "Silindi", timer: 1500, showConfirmButton: false }); fetch(); }
    else Swal.fire({ icon: "error", title: "Silinə bilmədi", timer: 2000, showConfirmButton: false });
  };

  // ── get current items/sub-items from sections state ────────
  const currentItems: AdminHeaderItem[] = selectedSection
    ? (sections.find(s => s.id === selectedSection.id)?.items || [])
    : [];

  const currentSubItems: AdminHeaderSubItem[] = selectedItem
    ? (currentItems.find(i => i.id === selectedItem.id)?.sub_items || [])
    : [];

  // ── render ─────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <button
          onClick={() => setView("sections")}
          className={view === "sections" ? "text-blue-600 font-medium" : "hover:text-gray-700 dark:hover:text-gray-200"}
        >
          Bölmələr
        </button>
        {view !== "sections" && selectedSection && (
          <>
            <ChevronRightIcon sx={{ fontSize: 16 }} />
            <button
              onClick={() => setView("items")}
              className={view === "items" ? "text-blue-600 font-medium" : "hover:text-gray-700 dark:hover:text-gray-200"}
            >
              {selectedSection.label?.az || selectedSection.section_key}
            </button>
          </>
        )}
        {view === "subitems" && selectedItem && (
          <>
            <ChevronRightIcon sx={{ fontSize: 16 }} />
            <span className="text-blue-600 font-medium">{selectedItem.title?.az}</span>
          </>
        )}
      </div>

      {/* ── SECTIONS VIEW ─────────────────────────────────── */}
      {view === "sections" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={openCreateSection}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <AddIcon sx={{ fontSize: 18 }} /> Yeni bölmə
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><CircularProgress /></div>
          ) : sections.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">Bölmə yoxdur</p>
          ) : (
            <div className="space-y-2">
              {sections.map((s) => (
                <div key={s.id} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
                  <div className="flex items-center px-4 py-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{s.label?.az || s.section_key}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Key: <span className="font-mono">{s.section_key}</span> · Sıra: {s.display_order} · {s.base_path?.az}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setSelectedSection(s); setView("items"); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Elementlər <ExpandMoreIcon sx={{ fontSize: 16 }} />
                      </button>
                      <button onClick={() => openEditSection(s)} className="p-1.5 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors">
                        <EditIcon sx={{ fontSize: 16, color: "white" }} />
                      </button>
                      <button onClick={() => handleDeleteSection(s)} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
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
      {view === "items" && selectedSection && (
        <>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setView("sections")}
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
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.title?.az}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.item_type === "subheader" ? (
                          <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">Kateqoriya başlığı</span>
                        ) : (
                          <>Slug: <span className="font-mono">{item.slug}</span></>
                        )}
                        {" "}· Sıra: {item.display_order}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.item_type === "subheader" && (
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
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{si.title?.az}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Slug: <span className="font-mono">{si.slug}</span> · Sıra: {si.display_order}
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
            modal.type === "section" ? (modal.mode === "create" ? "Yeni bölmə" : "Bölməni düzəlt") :
            modal.type === "item" ? (modal.mode === "create" ? "Yeni element" : "Elementi düzəlt") :
            (modal.mode === "create" ? "Yeni alt-element" : "Alt-elementi düzəlt")
          }
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          loading={saving}
        >
          {/* SECTION FORM */}
          {modal.type === "section" && (
            <>
              <Field label="Açar (section_key) *">
                <Input value={sKey} onChange={setSKey} placeholder="about" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Başlıq (AZ) *"><Input value={sLabelAz} onChange={setSLabelAz} placeholder="HAQQIMIZDA" /></Field>
                <Field label="Başlıq (EN) *"><Input value={sLabelEn} onChange={setSLabelEn} placeholder="ABOUT" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Yol (AZ) *"><Input value={sBaseAz} onChange={setSBaseAz} placeholder="/haqqimizda" /></Field>
                <Field label="Yol (EN) *"><Input value={sBaseEn} onChange={setSBaseEn} placeholder="/about" /></Field>
              </div>
              <Field label={modal.mode === "edit" ? "Şəkil (dəyişdirmək üçün seçin)" : "Şəkil *"}>
                {modal.mode === "edit" && sCurrentImageUrl && !sImageFile && (
                  <img src={sCurrentImageUrl} alt="current" className="h-16 w-auto rounded mb-2 object-cover" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setSImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </Field>
              <Field label="Birbaşa URL (isteğe bağlı)">
                <Input value={sDirectUrl} onChange={setSDirectUrl} placeholder="https://tqdk.gov.az" />
              </Field>
              <Field label="Sıra *"><Input value={sOrder} onChange={setSOrder} placeholder="1" /></Field>
            </>
          )}

          {/* ITEM FORM */}
          {modal.type === "item" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Başlıq (AZ) *"><Input value={iTitleAz} onChange={setITitleAz} placeholder="Tarix" /></Field>
                <Field label="Başlıq (EN) *"><Input value={iTitleEn} onChange={setITitleEn} placeholder="History" /></Field>
              </div>
              <Field label="Növ *">
                <select
                  value={iItemType}
                  onChange={(e) => setIItemType(e.target.value as "link" | "subheader")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="link">Link (birbaşa keçid)</option>
                  <option value="subheader">Kateqoriya başlığı (alt-elementlər)</option>
                </select>
              </Field>
              {iItemType === "link" && (
                <Field label="Slug *"><Input value={iSlug} onChange={setISlug} placeholder="/about/history" /></Field>
              )}
              <Field label="Sıra *"><Input value={iOrder} onChange={setIOrder} placeholder="1" /></Field>
            </>
          )}

          {/* SUBITEM FORM */}
          {modal.type === "subitem" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Başlıq (AZ) *"><Input value={siTitleAz} onChange={setSiTitleAz} placeholder="Rektor" /></Field>
                <Field label="Başlıq (EN) *"><Input value={siTitleEn} onChange={setSiTitleEn} placeholder="Rector" /></Field>
              </div>
              <Field label="Slug *"><Input value={siSlug} onChange={setSiSlug} placeholder="leadership/rector" /></Field>
              <Field label="Sıra *"><Input value={siOrder} onChange={setSiOrder} placeholder="1" /></Field>
            </>
          )}
        </MenuModal>
      )}
    </div>
  );
}
