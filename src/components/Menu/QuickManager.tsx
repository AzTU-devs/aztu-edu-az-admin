import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MenuModal from "./MenuModal";
import {
  AdminQuickLeftItem,
  AdminQuickSection,
  AdminQuickSectionItem,
  BiLang,
  getAdminQuickMenu,
  createQuickLeftItem,
  updateQuickLeftItem,
  deleteQuickLeftItem,
  createQuickSection,
  updateQuickSection,
  deleteQuickSection,
  createQuickSectionItem,
  updateQuickSectionItem,
  deleteQuickSectionItem,
} from "../../services/menu/menuService";

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

type Tab = "left" | "sections";

type ModalType =
  | { kind: "left"; mode: "create" | "edit"; target?: AdminQuickLeftItem }
  | { kind: "section"; mode: "create" | "edit"; target?: AdminQuickSection }
  | { kind: "sectionItem"; mode: "create" | "edit"; section: AdminQuickSection; target?: AdminQuickSectionItem };

export default function QuickManager() {
  const [tab, setTab] = useState<Tab>("left");
  const [leftItems, setLeftItems] = useState<AdminQuickLeftItem[]>([]);
  const [sections, setSections] = useState<AdminQuickSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<ModalType | null>(null);
  const [saving, setSaving] = useState(false);

  // Left item form
  const [liUrl, setLiUrl] = useState("");
  const [liOrder, setLiOrder] = useState("1");
  const [liLabelAz, setLiLabelAz] = useState("");
  const [liLabelEn, setLiLabelEn] = useState("");

  // Section form
  const [secKey, setSecKey] = useState("");
  const [secOrder, setSecOrder] = useState("1");
  const [secTitleAz, setSecTitleAz] = useState("");
  const [secTitleEn, setSecTitleEn] = useState("");

  // Section item form
  const [siUrl, setSiUrl] = useState("");
  const [siOrder, setSiOrder] = useState("1");
  const [siLabelAz, setSiLabelAz] = useState("");
  const [siLabelEn, setSiLabelEn] = useState("");

  const fetch = async () => {
    setLoading(true);
    const res = await getAdminQuickMenu();
    if (res !== "ERROR") {
      setLeftItems(res.left_items);
      setSections(res.sections);
    } else {
      Swal.fire({ icon: "error", title: "Məlumatlar yüklənə bilmədi", timer: 2000, showConfirmButton: false });
    }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const toggleSection = (id: number) => {
    setExpandedSections(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // ── open modals ───────────────────────────────────────────
  const openCreateLeft = () => {
    setLiUrl(""); setLiOrder("1"); setLiLabelAz(""); setLiLabelEn("");
    setModal({ kind: "left", mode: "create" });
  };

  const openEditLeft = (item: AdminQuickLeftItem) => {
    setLiUrl(item.url); setLiOrder(String(item.display_order));
    setLiLabelAz(item.label?.az || ""); setLiLabelEn(item.label?.en || "");
    setModal({ kind: "left", mode: "edit", target: item });
  };

  const openCreateSection = () => {
    setSecKey(""); setSecOrder("1"); setSecTitleAz(""); setSecTitleEn("");
    setModal({ kind: "section", mode: "create" });
  };

  const openEditSection = (sec: AdminQuickSection) => {
    setSecKey(sec.section_key); setSecOrder(String(sec.display_order));
    setSecTitleAz(sec.title?.az || ""); setSecTitleEn(sec.title?.en || "");
    setModal({ kind: "section", mode: "edit", target: sec });
  };

  const openCreateSectionItem = (sec: AdminQuickSection) => {
    setSiUrl(""); setSiOrder("1"); setSiLabelAz(""); setSiLabelEn("");
    setModal({ kind: "sectionItem", mode: "create", section: sec });
  };

  const openEditSectionItem = (sec: AdminQuickSection, item: AdminQuickSectionItem) => {
    setSiUrl(item.url); setSiOrder(String(item.display_order));
    setSiLabelAz(item.label?.az || ""); setSiLabelEn(item.label?.en || "");
    setModal({ kind: "sectionItem", mode: "edit", section: sec, target: item });
  };

  // ── submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!modal) return;
    setSaving(true);

    const ok = async (fn: () => Promise<any>, successMsg: string) => {
      const res = await fn();
      if (typeof res === "object" && res !== null && "id" in res) {
        Swal.fire({ icon: "success", title: successMsg, timer: 1500, showConfirmButton: false });
        fetch();
      } else if (res === "SUCCESS") {
        Swal.fire({ icon: "success", title: successMsg, timer: 1500, showConfirmButton: false });
        fetch();
      } else if (res === "CONFLICT") {
        Swal.fire({ icon: "warning", title: "Bu açar artıq mövcuddur", timer: 2000, showConfirmButton: false });
      } else {
        Swal.fire({ icon: "error", title: "Xəta baş verdi", timer: 2000, showConfirmButton: false });
      }
    };

    if (modal.kind === "left") {
      const label: BiLang = { az: liLabelAz, en: liLabelEn };
      if (modal.mode === "create") {
        await ok(() => createQuickLeftItem({ url: liUrl, display_order: Number(liOrder), label }), "Element yaradıldı");
      } else {
        await ok(() => updateQuickLeftItem(modal.target!.id, { url: liUrl, display_order: Number(liOrder), label }), "Yeniləndi");
      }
    }

    if (modal.kind === "section") {
      const title: BiLang = { az: secTitleAz, en: secTitleEn };
      if (modal.mode === "create") {
        await ok(() => createQuickSection({ section_key: secKey, display_order: Number(secOrder), title }), "Bölmə yaradıldı");
      } else {
        await ok(() => updateQuickSection(modal.target!.id, { display_order: Number(secOrder), title }), "Yeniləndi");
      }
    }

    if (modal.kind === "sectionItem") {
      const label: BiLang = { az: siLabelAz, en: siLabelEn };
      if (modal.mode === "create") {
        await ok(() => createQuickSectionItem({ section_id: modal.section.id, url: siUrl, display_order: Number(siOrder), label }), "Link yaradıldı");
      } else {
        await ok(() => updateQuickSectionItem(modal.target!.id, { url: siUrl, display_order: Number(siOrder), label }), "Yeniləndi");
      }
    }

    setSaving(false);
    setModal(null);
  };

  // ── delete ────────────────────────────────────────────────
  const confirmDelete = async (msg: string, fn: () => Promise<"SUCCESS" | "NOT FOUND" | "ERROR">) => {
    const c = await Swal.fire({ title: msg, icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", cancelButtonColor: "#3085d6", confirmButtonText: "Sil", cancelButtonText: "İmtina" });
    if (!c.isConfirmed) return;
    const res = await fn();
    if (res === "SUCCESS") { Swal.fire({ icon: "success", title: "Silindi", timer: 1500, showConfirmButton: false }); fetch(); }
    else Swal.fire({ icon: "error", title: "Silinə bilmədi", timer: 2000, showConfirmButton: false });
  };

  if (loading) return <div className="flex justify-center py-12"><CircularProgress /></div>;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(["left", "sections"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            {t === "left" ? "Sol Keçidlər" : "Bölmələr & Elementlər"}
          </button>
        ))}
      </div>

      {/* ── LEFT ITEMS TAB ───────────────────────────────── */}
      {tab === "left" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={openCreateLeft} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <AddIcon sx={{ fontSize: 18 }} /> Yeni keçid
            </button>
          </div>
          {leftItems.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Keçid yoxdur</p>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400">
                <span className="col-span-4">Etiket (AZ)</span>
                <span className="col-span-4">Etiket (EN)</span>
                <span className="col-span-2">URL</span>
                <span className="col-span-1 text-center">Sıra</span>
                <span className="col-span-1 text-right">Əməl.</span>
              </div>
              {leftItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <span className="col-span-4 text-sm text-gray-900 dark:text-gray-100">{item.label?.az}</span>
                  <span className="col-span-4 text-sm text-gray-600 dark:text-gray-400">{item.label?.en}</span>
                  <span className="col-span-2 text-xs text-gray-500 truncate">{item.url}</span>
                  <span className="col-span-1 text-sm text-center text-gray-500">{item.display_order}</span>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button onClick={() => openEditLeft(item)} className="p-1.5 bg-yellow-400 rounded hover:bg-yellow-500">
                      <EditIcon sx={{ fontSize: 14, color: "white" }} />
                    </button>
                    <button onClick={() => confirmDelete(`"${item.label?.az}" keçidini silmək istəyirsiniz?`, () => deleteQuickLeftItem(item.id))} className="p-1.5 bg-red-500 rounded hover:bg-red-600">
                      <DeleteIcon sx={{ fontSize: 14, color: "white" }} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── SECTIONS TAB ─────────────────────────────────── */}
      {tab === "sections" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={openCreateSection} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <AddIcon sx={{ fontSize: 18 }} /> Yeni bölmə
            </button>
          </div>
          {sections.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Bölmə yoxdur</p>
          ) : (
            sections.map((sec) => (
              <div key={sec.id} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
                <div className="flex items-center px-4 py-3 gap-3">
                  <button onClick={() => toggleSection(sec.id)} className="p-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
                    {expandedSections.has(sec.id) ? <ExpandLessIcon sx={{ fontSize: 20 }} /> : <ExpandMoreIcon sx={{ fontSize: 20 }} />}
                  </button>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{sec.title?.az}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Key: <span className="font-mono">{sec.section_key}</span> · Sıra: {sec.display_order} · {sec.items?.length || 0} element</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openCreateSectionItem(sec)} className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-colors">
                      <AddIcon sx={{ fontSize: 14 }} /> Link
                    </button>
                    <button onClick={() => openEditSection(sec)} className="p-1.5 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors">
                      <EditIcon sx={{ fontSize: 16, color: "white" }} />
                    </button>
                    <button onClick={() => confirmDelete(`"${sec.title?.az}" bölməsini silmək istəyirsiniz?`, () => deleteQuickSection(sec.id))} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                      <DeleteIcon sx={{ fontSize: 16, color: "white" }} />
                    </button>
                  </div>
                </div>

                {expandedSections.has(sec.id) && (
                  <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 px-4 py-2 space-y-1">
                    {(!sec.items || sec.items.length === 0) ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 py-2">Element yoxdur</p>
                    ) : (
                      sec.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 py-1.5">
                          <div className="flex-1">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{item.label?.az}</span>
                            <span className="ml-2 text-xs text-gray-400 font-mono">{item.url}</span>
                          </div>
                          <span className="text-xs text-gray-400">#{item.display_order}</span>
                          <button onClick={() => openEditSectionItem(sec, item)} className="p-1 bg-yellow-400 rounded hover:bg-yellow-500">
                            <EditIcon sx={{ fontSize: 13, color: "white" }} />
                          </button>
                          <button onClick={() => confirmDelete(`"${item.label?.az}" elementini silmək istəyirsiniz?`, () => deleteQuickSectionItem(item.id))} className="p-1 bg-red-500 rounded hover:bg-red-600">
                            <DeleteIcon sx={{ fontSize: 13, color: "white" }} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MODAL ────────────────────────────────────────── */}
      {modal && (
        <MenuModal
          title={
            modal.kind === "left" ? (modal.mode === "create" ? "Yeni sol keçid" : "Keçidi düzəlt") :
            modal.kind === "section" ? (modal.mode === "create" ? "Yeni bölmə" : "Bölməni düzəlt") :
            (modal.mode === "create" ? "Yeni element" : "Elementi düzəlt")
          }
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          loading={saving}
        >
          {(modal.kind === "left" || modal.kind === "sectionItem") && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Etiket (AZ) *"><Input value={modal.kind === "left" ? liLabelAz : siLabelAz} onChange={modal.kind === "left" ? setLiLabelAz : setSiLabelAz} placeholder="Reytinq" /></Field>
                <Field label="Etiket (EN) *"><Input value={modal.kind === "left" ? liLabelEn : siLabelEn} onChange={modal.kind === "left" ? setLiLabelEn : setSiLabelEn} placeholder="Ranking" /></Field>
              </div>
              <Field label="URL *"><Input value={modal.kind === "left" ? liUrl : siUrl} onChange={modal.kind === "left" ? setLiUrl : setSiUrl} placeholder="/about/rankings" /></Field>
              <Field label="Sıra *"><Input value={modal.kind === "left" ? liOrder : siOrder} onChange={modal.kind === "left" ? setLiOrder : setSiOrder} placeholder="1" /></Field>
            </>
          )}
          {modal.kind === "section" && (
            <>
              <Field label="Açar (section_key) *"><Input value={secKey} onChange={setSecKey} placeholder="platform" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Başlıq (AZ) *"><Input value={secTitleAz} onChange={setSecTitleAz} placeholder="Platforma" /></Field>
                <Field label="Başlıq (EN) *"><Input value={secTitleEn} onChange={setSecTitleEn} placeholder="Platform" /></Field>
              </div>
              <Field label="Sıra *"><Input value={secOrder} onChange={setSecOrder} placeholder="1" /></Field>
            </>
          )}
        </MenuModal>
      )}
    </div>
  );
}
