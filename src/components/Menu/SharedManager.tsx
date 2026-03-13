import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import MenuModal from "./MenuModal";
import {
  AdminSocialLink,
  AdminContact,
  BiLang,
  getAdminSocialLinks,
  getAdminContacts,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  createContact,
  updateContact,
  deleteContact,
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

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <FacebookIcon sx={{ fontSize: 20, color: "#1877F2" }} />,
  instagram: <InstagramIcon sx={{ fontSize: 20, color: "#E1306C" }} />,
  linkedin: <LinkedInIcon sx={{ fontSize: 20, color: "#0A66C2" }} />,
  youtube: <YouTubeIcon sx={{ fontSize: 20, color: "#FF0000" }} />,
};

type Tab = "social" | "contact";

type ModalType =
  | { kind: "social"; mode: "create" | "edit"; target?: AdminSocialLink }
  | { kind: "contact"; mode: "create" | "edit"; target?: AdminContact };

export default function SharedManager() {
  const [tab, setTab] = useState<Tab>("social");
  const [socialLinks, setSocialLinks] = useState<AdminSocialLink[]>([]);
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType | null>(null);
  const [saving, setSaving] = useState(false);

  // Social link form
  const [slPlatform, setSlPlatform] = useState("facebook");
  const [slUrl, setSlUrl] = useState("");
  const [slContext, setSlContext] = useState("both");
  const [slOrder, setSlOrder] = useState("1");

  // Contact form
  const [cContext, setCContext] = useState<"footer" | "quick">("footer");
  const [cEmail, setCEmail] = useState("");
  const [cPhones, setCPhones] = useState("");
  const [cAddrAz, setCAddrAz] = useState("");
  const [cAddrEn, setCAddrEn] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [sl, ct] = await Promise.all([getAdminSocialLinks(), getAdminContacts()]);
    if (sl !== "ERROR") setSocialLinks(sl);
    if (ct !== "ERROR") setContacts(ct);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // ── open modals ───────────────────────────────────────────
  const openCreateSocial = () => {
    setSlPlatform("facebook"); setSlUrl(""); setSlContext("both"); setSlOrder("1");
    setModal({ kind: "social", mode: "create" });
  };

  const openEditSocial = (sl: AdminSocialLink) => {
    setSlPlatform(sl.platform); setSlUrl(sl.url); setSlContext(sl.context); setSlOrder(String(sl.display_order));
    setModal({ kind: "social", mode: "edit", target: sl });
  };

  const openCreateContact = () => {
    setCContext("footer"); setCEmail(""); setCPhones(""); setCAddrAz(""); setCAddrEn("");
    setModal({ kind: "contact", mode: "create" });
  };

  const openEditContact = (c: AdminContact) => {
    setCContext(c.context); setCEmail(c.email);
    setCPhones(c.phones.join("\n"));
    setCAddrAz(c.address?.az || ""); setCAddrEn(c.address?.en || "");
    setModal({ kind: "contact", mode: "edit", target: c });
  };

  // ── submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!modal) return;
    setSaving(true);

    const showSuccess = (msg: string) => {
      Swal.fire({ icon: "success", title: msg, timer: 1500, showConfirmButton: false });
      fetchAll();
    };
    const showError = () => Swal.fire({ icon: "error", title: "Xəta baş verdi", timer: 2000, showConfirmButton: false });

    if (modal.kind === "social") {
      if (modal.mode === "create") {
        const res = await createSocialLink({ platform: slPlatform, url: slUrl, context: slContext, display_order: Number(slOrder) });
        typeof res === "object" ? showSuccess("Social link yaradıldı") : showError();
      } else {
        const res = await updateSocialLink(modal.target!.id, { platform: slPlatform, url: slUrl, context: slContext, display_order: Number(slOrder) });
        res === "SUCCESS" ? showSuccess("Yeniləndi") : showError();
      }
    }

    if (modal.kind === "contact") {
      const phones = cPhones.split("\n").map(p => p.trim()).filter(Boolean);
      const address: BiLang | undefined = (cAddrAz || cAddrEn) ? { az: cAddrAz, en: cAddrEn } : undefined;

      if (modal.mode === "create") {
        const res = await createContact({ context: cContext, email: cEmail, phones, address });
        typeof res === "object" ? showSuccess("Əlaqə məlumatı yaradıldı") : showError();
      } else {
        const res = await updateContact(modal.target!.id, { email: cEmail, phones, address });
        res === "SUCCESS" ? showSuccess("Yeniləndi") : showError();
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
    if (res === "SUCCESS") { Swal.fire({ icon: "success", title: "Silindi", timer: 1500, showConfirmButton: false }); fetchAll(); }
    else Swal.fire({ icon: "error", title: "Silinə bilmədi", timer: 2000, showConfirmButton: false });
  };

  if (loading) return <div className="flex justify-center py-12"><CircularProgress /></div>;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(["social", "contact"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            {t === "social" ? "Social Linklər" : "Əlaqə Məlumatı"}
          </button>
        ))}
      </div>

      {/* ── SOCIAL LINKS TAB ─────────────────────────────── */}
      {tab === "social" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={openCreateSocial} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <AddIcon sx={{ fontSize: 18 }} /> Yeni link
            </button>
          </div>
          {socialLinks.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Social link yoxdur</p>
          ) : (
            <div className="space-y-2">
              {socialLinks.map((sl) => (
                <div key={sl.id} className="flex items-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <div className="shrink-0">{platformIcons[sl.platform] || null}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 capitalize">{sl.platform}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sl.url}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    sl.context === "both" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                    sl.context === "footer" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  }`}>
                    {sl.context === "both" ? "Hər ikisi" : sl.context === "footer" ? "Footer" : "Sürətli menyu"}
                  </span>
                  <span className="text-xs text-gray-400">#{sl.display_order}</span>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEditSocial(sl)} className="p-1.5 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors">
                      <EditIcon sx={{ fontSize: 15, color: "white" }} />
                    </button>
                    <button onClick={() => confirmDelete(`"${sl.platform}" linkini silmək istəyirsiniz?`, () => deleteSocialLink(sl.id))} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                      <DeleteIcon sx={{ fontSize: 15, color: "white" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CONTACT TAB ──────────────────────────────────── */}
      {tab === "contact" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={openCreateContact} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <AddIcon sx={{ fontSize: 18 }} /> Yeni əlaqə
            </button>
          </div>
          {contacts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Əlaqə məlumatı yoxdur</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((c) => (
                <div key={c.id} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      c.context === "footer"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    }`}>
                      {c.context === "footer" ? "Footer" : "Sürətli menyu"}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditContact(c)} className="p-1.5 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors">
                        <EditIcon sx={{ fontSize: 15, color: "white" }} />
                      </button>
                      <button onClick={() => confirmDelete("Bu əlaqə məlumatını silmək istəyirsiniz?", () => deleteContact(c.id))} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                        <DeleteIcon sx={{ fontSize: 15, color: "white" }} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{c.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Telefon(lar)</p>
                      {c.phones?.map((ph, i) => (
                        <p key={i} className="text-sm text-gray-900 dark:text-gray-100">{ph}</p>
                      ))}
                    </div>
                    {c.address && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ünvan (AZ)</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{c.address.az}</p>
                      </div>
                    )}
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
            modal.kind === "social"
              ? (modal.mode === "create" ? "Yeni social link" : "Social linki düzəlt")
              : (modal.mode === "create" ? "Yeni əlaqə məlumatı" : "Əlaqəni düzəlt")
          }
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          loading={saving}
        >
          {modal.kind === "social" && (
            <>
              <Field label="Platforma *">
                <select
                  value={slPlatform}
                  onChange={(e) => setSlPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {["facebook", "instagram", "linkedin", "youtube"].map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </Field>
              <Field label="URL *"><Input value={slUrl} onChange={setSlUrl} placeholder="https://facebook.com/aztu" /></Field>
              <Field label="Kontekst *">
                <select
                  value={slContext}
                  onChange={(e) => setSlContext(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="both">Hər ikisi</option>
                  <option value="footer">Yalnız footer</option>
                  <option value="quick">Yalnız sürətli menyu</option>
                </select>
              </Field>
              <Field label="Sıra *"><Input value={slOrder} onChange={setSlOrder} placeholder="1" /></Field>
            </>
          )}

          {modal.kind === "contact" && (
            <>
              <Field label="Kontekst *">
                <select
                  value={cContext}
                  onChange={(e) => setCContext(e.target.value as "footer" | "quick")}
                  disabled={modal.mode === "edit"}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="footer">Footer</option>
                  <option value="quick">Sürətli menyu</option>
                </select>
              </Field>
              <Field label="Email *"><Input value={cEmail} onChange={setCEmail} placeholder="aztu@aztu.edu.az" /></Field>
              <Field label="Telefon nömrələri * (hər sətirdə bir nömrə)">
                <textarea
                  value={cPhones}
                  onChange={(e) => setCPhones(e.target.value)}
                  rows={3}
                  placeholder={"(+994 12) 539-13-05\n(+994 12) 538-33-83"}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </Field>
              {cContext === "footer" && (
                <>
                  <Field label="Ünvan (AZ)"><Input value={cAddrAz} onChange={setCAddrAz} placeholder="H.Cavid prospekti 25, Bakı..." /></Field>
                  <Field label="Ünvan (EN)"><Input value={cAddrEn} onChange={setCAddrEn} placeholder="25 H.Javid Avenue, Baku..." /></Field>
                </>
              )}
            </>
          )}
        </MenuModal>
      )}
    </div>
  );
}
