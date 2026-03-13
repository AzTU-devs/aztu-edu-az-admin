import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LinkIcon from "@mui/icons-material/Link";
import MenuModal from "./MenuModal";
import {
  AdminFooterColumn,
  AdminFooterLink,
  AdminPartnerLogo,
  AdminQuickIcon,
  AdminFooterData,
  BiLang,
  getAdminFooter,
  createFooterColumn,
  updateFooterColumn,
  deleteFooterColumn,
  createFooterLink,
  updateFooterLink,
  deleteFooterLink,
  createPartnerLogo,
  updatePartnerLogo,
  deletePartnerLogo,
  createQuickIcon,
  updateQuickIcon,
  deleteQuickIcon,
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

type Tab = "columns" | "logos" | "icons";

type ModalType =
  | { kind: "column"; mode: "create" | "edit"; target?: AdminFooterColumn }
  | { kind: "link"; mode: "create" | "edit"; column: AdminFooterColumn; target?: AdminFooterLink }
  | { kind: "logo"; mode: "create" | "edit"; target?: AdminPartnerLogo }
  | { kind: "icon"; mode: "create" | "edit"; target?: AdminQuickIcon };

export default function FooterManager() {
  const [tab, setTab] = useState<Tab>("columns");
  const [data, setData] = useState<AdminFooterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCols, setExpandedCols] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<ModalType | null>(null);
  const [saving, setSaving] = useState(false);

  // Column form
  const [colOrder, setColOrder] = useState("1");
  const [colTitleAz, setColTitleAz] = useState("");
  const [colTitleEn, setColTitleEn] = useState("");

  // Link form
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOrder, setLinkOrder] = useState("1");
  const [linkLabelAz, setLinkLabelAz] = useState("");
  const [linkLabelEn, setLinkLabelEn] = useState("");

  // Logo form
  const [logoLabel, setLogoLabel] = useState("");
  const [logoImageUrl, setLogoImageUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoOrder, setLogoOrder] = useState("1");

  // Icon form
  const [iconName, setIconName] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [iconOrder, setIconOrder] = useState("1");
  const [iconLabelAz, setIconLabelAz] = useState("");
  const [iconLabelEn, setIconLabelEn] = useState("");

  const fetch = async () => {
    setLoading(true);
    const res = await getAdminFooter();
    if (res !== "ERROR") setData(res);
    else Swal.fire({ icon: "error", title: "Məlumatlar yüklənə bilmədi", timer: 2000, showConfirmButton: false });
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const toggleExpand = (id: number) => {
    setExpandedCols(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // ── open modals ───────────────────────────────────────────
  const openCreateColumn = () => {
    setColOrder("1"); setColTitleAz(""); setColTitleEn("");
    setModal({ kind: "column", mode: "create" });
  };

  const openEditColumn = (col: AdminFooterColumn) => {
    setColOrder(String(col.display_order));
    setColTitleAz(col.title?.az || ""); setColTitleEn(col.title?.en || "");
    setModal({ kind: "column", mode: "edit", target: col });
  };

  const openCreateLink = (col: AdminFooterColumn) => {
    setLinkUrl(""); setLinkOrder("1"); setLinkLabelAz(""); setLinkLabelEn("");
    setModal({ kind: "link", mode: "create", column: col });
  };

  const openEditLink = (col: AdminFooterColumn, link: AdminFooterLink) => {
    setLinkUrl(link.url); setLinkOrder(String(link.display_order));
    setLinkLabelAz(link.label?.az || ""); setLinkLabelEn(link.label?.en || "");
    setModal({ kind: "link", mode: "edit", column: col, target: link });
  };

  const openCreateLogo = () => {
    setLogoLabel(""); setLogoImageUrl(""); setLogoUrl(""); setLogoOrder("1");
    setModal({ kind: "logo", mode: "create" });
  };

  const openEditLogo = (logo: AdminPartnerLogo) => {
    setLogoLabel(logo.label); setLogoImageUrl(logo.image_url); setLogoUrl(logo.url); setLogoOrder(String(logo.display_order));
    setModal({ kind: "logo", mode: "edit", target: logo });
  };

  const openCreateIcon = () => {
    setIconName(""); setIconUrl(""); setIconOrder("1"); setIconLabelAz(""); setIconLabelEn("");
    setModal({ kind: "icon", mode: "create" });
  };

  const openEditIcon = (icon: AdminQuickIcon) => {
    setIconName(icon.icon); setIconUrl(icon.url); setIconOrder(String(icon.display_order));
    setIconLabelAz(icon.label?.az || ""); setIconLabelEn(icon.label?.en || "");
    setModal({ kind: "icon", mode: "edit", target: icon });
  };

  // ── submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!modal) return;
    setSaving(true);

    const ok = async (fn: () => Promise<any>, successMsg: string) => {
      const res = await fn();
      if (res === "ERROR" || res === "NOT FOUND") {
        Swal.fire({ icon: "error", title: "Xəta baş verdi", timer: 2000, showConfirmButton: false });
      } else {
        Swal.fire({ icon: "success", title: successMsg, timer: 1500, showConfirmButton: false });
        fetch();
      }
    };

    if (modal.kind === "column") {
      const title: BiLang = { az: colTitleAz, en: colTitleEn };
      if (modal.mode === "create") {
        await ok(() => createFooterColumn({ display_order: Number(colOrder), title }), "Sütun yaradıldı");
      } else {
        await ok(() => updateFooterColumn(modal.target!.id, { display_order: Number(colOrder), title }), "Yeniləndi");
      }
    }

    if (modal.kind === "link") {
      const label: BiLang = { az: linkLabelAz, en: linkLabelEn };
      if (modal.mode === "create") {
        await ok(() => createFooterLink({ column_id: modal.column.id, url: linkUrl, display_order: Number(linkOrder), label }), "Link yaradıldı");
      } else {
        await ok(() => updateFooterLink(modal.target!.id, { url: linkUrl, display_order: Number(linkOrder), label }), "Yeniləndi");
      }
    }

    if (modal.kind === "logo") {
      if (modal.mode === "create") {
        await ok(() => createPartnerLogo({ label: logoLabel, image_url: logoImageUrl, url: logoUrl, display_order: Number(logoOrder) }), "Logo yaradıldı");
      } else {
        await ok(() => updatePartnerLogo(modal.target!.id, { label: logoLabel, image_url: logoImageUrl, url: logoUrl, display_order: Number(logoOrder) }), "Yeniləndi");
      }
    }

    if (modal.kind === "icon") {
      const label: BiLang = { az: iconLabelAz, en: iconLabelEn };
      if (modal.mode === "create") {
        await ok(() => createQuickIcon({ icon: iconName, url: iconUrl, display_order: Number(iconOrder), label }), "İkon yaradıldı");
      } else {
        await ok(() => updateQuickIcon(modal.target!.id, { icon: iconName, url: iconUrl, display_order: Number(iconOrder), label }), "Yeniləndi");
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
        {(["columns", "logos", "icons"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            {t === "columns" ? "Sütunlar & Linklər" : t === "logos" ? "Partner Loqolar" : "Sürətli İkonlar"}
          </button>
        ))}
      </div>

      {/* ── COLUMNS TAB ─────────────────────────────────── */}
      {tab === "columns" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={openCreateColumn} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <AddIcon sx={{ fontSize: 18 }} /> Yeni sütun
            </button>
          </div>
          {(!data?.columns || data.columns.length === 0) ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Sütun yoxdur</p>
          ) : (
            data.columns.map((col) => (
              <div key={col.id} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
                {/* Column header */}
                <div className="flex items-center px-4 py-3 gap-3">
                  <button onClick={() => toggleExpand(col.id)} className="p-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
                    {expandedCols.has(col.id) ? <ExpandLessIcon sx={{ fontSize: 20 }} /> : <ExpandMoreIcon sx={{ fontSize: 20 }} />}
                  </button>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{col.title?.az}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sıra: {col.display_order} · {col.links?.length || 0} link</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openCreateLink(col)} className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-colors">
                      <AddIcon sx={{ fontSize: 14 }} /> Link
                    </button>
                    <button onClick={() => openEditColumn(col)} className="p-1.5 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors">
                      <EditIcon sx={{ fontSize: 16, color: "white" }} />
                    </button>
                    <button onClick={() => confirmDelete(`"${col.title?.az}" sütununu silmək istəyirsiniz?`, () => deleteFooterColumn(col.id))} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                      <DeleteIcon sx={{ fontSize: 16, color: "white" }} />
                    </button>
                  </div>
                </div>

                {/* Links */}
                {expandedCols.has(col.id) && (
                  <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 px-4 py-2 space-y-1">
                    {(!col.links || col.links.length === 0) ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 py-2">Link yoxdur</p>
                    ) : (
                      col.links.map((link) => (
                        <div key={link.id} className="flex items-center gap-2 py-1">
                          <LinkIcon sx={{ fontSize: 14, color: "#6B7280" }} />
                          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{link.label?.az}</span>
                          <span className="text-xs text-gray-400 font-mono hidden sm:inline">{link.url}</span>
                          <span className="text-xs text-gray-400">#{link.display_order}</span>
                          <button onClick={() => openEditLink(col, link)} className="p-1 bg-yellow-400 rounded hover:bg-yellow-500">
                            <EditIcon sx={{ fontSize: 13, color: "white" }} />
                          </button>
                          <button onClick={() => confirmDelete(`"${link.label?.az}" linkini silmək istəyirsiniz?`, () => deleteFooterLink(link.id))} className="p-1 bg-red-500 rounded hover:bg-red-600">
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

      {/* ── PARTNER LOGOS TAB ────────────────────────────── */}
      {tab === "logos" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={openCreateLogo} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <AddIcon sx={{ fontSize: 18 }} /> Yeni loqo
            </button>
          </div>
          {(!data?.partner_logos || data.partner_logos.length === 0) ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loqo yoxdur</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.partner_logos.map((logo) => (
                <div key={logo.id} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-4 flex flex-col gap-3">
                  {logo.image_url && (
                    <img src={logo.image_url} alt={logo.label} className="h-10 object-contain self-start" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{logo.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{logo.url} · Sıra: {logo.display_order}</p>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => openEditLogo(logo)} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400 text-white rounded-lg text-xs hover:bg-yellow-500 transition-colors">
                      <EditIcon sx={{ fontSize: 14 }} /> Düzəlt
                    </button>
                    <button onClick={() => confirmDelete(`"${logo.label}" loqosunu silmək istəyirsiniz?`, () => deletePartnerLogo(logo.id))} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors">
                      <DeleteIcon sx={{ fontSize: 14 }} /> Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── QUICK ICONS TAB ──────────────────────────────── */}
      {tab === "icons" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={openCreateIcon} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <AddIcon sx={{ fontSize: 18 }} /> Yeni ikon
            </button>
          </div>
          {(!data?.quick_icons || data.quick_icons.length === 0) ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">İkon yoxdur</p>
          ) : (
            <div className="space-y-2">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400">
                <span className="col-span-3">İkon adı</span>
                <span className="col-span-3">Başlıq (AZ)</span>
                <span className="col-span-3">URL</span>
                <span className="col-span-1 text-center">Sıra</span>
                <span className="col-span-2 text-right">Əməliyyat</span>
              </div>
              {data.quick_icons.map((icon) => (
                <div key={icon.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <span className="col-span-3 text-sm font-mono text-gray-700 dark:text-gray-300">{icon.icon}</span>
                  <span className="col-span-3 text-sm text-gray-700 dark:text-gray-300">{icon.label?.az}</span>
                  <span className="col-span-3 text-xs text-gray-500 dark:text-gray-400 truncate">{icon.url}</span>
                  <span className="col-span-1 text-sm text-center text-gray-500">{icon.display_order}</span>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button onClick={() => openEditIcon(icon)} className="p-1.5 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors">
                      <EditIcon sx={{ fontSize: 15, color: "white" }} />
                    </button>
                    <button onClick={() => confirmDelete(`"${icon.label?.az}" ikonunu silmək istəyirsiniz?`, () => deleteQuickIcon(icon.id))} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                      <DeleteIcon sx={{ fontSize: 15, color: "white" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL ────────────────────────────────────────── */}
      {modal && (
        <MenuModal
          title={
            modal.kind === "column" ? (modal.mode === "create" ? "Yeni sütun" : "Sütunu düzəlt") :
            modal.kind === "link" ? (modal.mode === "create" ? "Yeni link" : "Linki düzəlt") :
            modal.kind === "logo" ? (modal.mode === "create" ? "Yeni partner loqosu" : "Loqonu düzəlt") :
            (modal.mode === "create" ? "Yeni sürətli ikon" : "İkonu düzəlt")
          }
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          loading={saving}
        >
          {modal.kind === "column" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Başlıq (AZ) *"><Input value={colTitleAz} onChange={setColTitleAz} placeholder="Haqqımızda" /></Field>
                <Field label="Başlıq (EN) *"><Input value={colTitleEn} onChange={setColTitleEn} placeholder="About" /></Field>
              </div>
              <Field label="Sıra *"><Input value={colOrder} onChange={setColOrder} placeholder="1" /></Field>
            </>
          )}
          {modal.kind === "link" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Etiket (AZ) *"><Input value={linkLabelAz} onChange={setLinkLabelAz} placeholder="Tarix" /></Field>
                <Field label="Etiket (EN) *"><Input value={linkLabelEn} onChange={setLinkLabelEn} placeholder="History" /></Field>
              </div>
              <Field label="URL *"><Input value={linkUrl} onChange={setLinkUrl} placeholder="/about/history" /></Field>
              <Field label="Sıra *"><Input value={linkOrder} onChange={setLinkOrder} placeholder="1" /></Field>
            </>
          )}
          {modal.kind === "logo" && (
            <>
              <Field label="Ad / Alt mətn *"><Input value={logoLabel} onChange={setLogoLabel} placeholder="Prezident.az" /></Field>
              <Field label="Şəkil URL *"><Input value={logoImageUrl} onChange={setLogoImageUrl} placeholder="https://cdn.aztu.edu.az/logos/..." /></Field>
              <Field label="Xarici URL *"><Input value={logoUrl} onChange={setLogoUrl} placeholder="https://president.az" /></Field>
              <Field label="Sıra *"><Input value={logoOrder} onChange={setLogoOrder} placeholder="1" /></Field>
            </>
          )}
          {modal.kind === "icon" && (
            <>
              <Field label="MUI İkon adı *">
                <Input value={iconName} onChange={setIconName} placeholder="ImportContacts" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nümunə: ImportContacts, TrendingUp, School</p>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Etiket (AZ) *"><Input value={iconLabelAz} onChange={setIconLabelAz} placeholder="E-Kitabxana" /></Field>
                <Field label="Etiket (EN) *"><Input value={iconLabelEn} onChange={setIconLabelEn} placeholder="E-Library" /></Field>
              </div>
              <Field label="URL *"><Input value={iconUrl} onChange={setIconUrl} placeholder="/research/library" /></Field>
              <Field label="Sıra *"><Input value={iconOrder} onChange={setIconOrder} placeholder="1" /></Field>
            </>
          )}
        </MenuModal>
      )}
    </div>
  );
}
