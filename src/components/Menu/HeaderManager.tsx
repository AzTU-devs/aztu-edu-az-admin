import { ReactNode, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
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

type MutateResult = "SUCCESS" | "NOT FOUND" | "ERROR";

/** Row identity for dnd-kit: a one-letter level tag plus the row id. */
type Kind = "h" | "i" | "s";
const rowKey = (kind: Kind, id: number) => `${kind}${id}`;
const rowId = (key: string) => Number(key.slice(1));

const toast = (icon: "success" | "error" | "warning", title: string) =>
  Swal.fire({ icon, title, timer: icon === "success" ? 1400 : 2400, showConfirmButton: false });

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

const sortByOrder = <T extends { display_order: number }>(rows: T[]) =>
  [...rows].sort((a, b) => a.display_order - b.display_order);

/** Per-language slug of a row, falling back to whichever translation exists. */
const slugOf = (
  row: { slug_az?: string; slug_en?: string; slug?: string | null } | undefined,
  lang: "az" | "en"
) => (lang === "az" ? row?.slug_az : row?.slug_en) || row?.slug || "";

const MODAL_TITLES = {
  header: { create: "Yeni başlıq", edit: "Başlığı redaktə et" },
  item: { create: "Yeni element", edit: "Elementi redaktə et" },
  subitem: { create: "Yeni alt-element", edit: "Alt-elementi redaktə et" },
} as const;

// ── small building blocks ───────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
    />
  );
}

/**
 * The URL the API will mint for this row when no direct_url overrides it.
 * One language per preview: each locale walks its own ancestors, so the `en`
 * path cannot be drawn under an `az` parent slug.
 */
function SlugPreview({
  lang,
  title,
  parentPath,
}: { lang: "az" | "en"; title: string; parentPath?: string }) {
  const slug = makeSlug(title);
  if (!slug) return null;
  const prefix = parentPath ? `/${parentPath}` : "";
  return (
    <p className="mt-1 font-mono text-xs text-gray-400">
      {lang}: <span className="text-blue-500">/{lang}{prefix}/{slug}</span>
    </p>
  );
}

/** Controlled on purpose — the shared `form/switch/Switch` keeps its own state,
 *  which would drift from the server whenever a save is rejected. */
function ActiveToggle({
  checked,
  disabled,
  onChange,
}: { checked: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      title={checked ? "Saytda görünür — gizlətmək üçün klikləyin" : "Saytda gizlidir — göstərmək üçün klikləyin"}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
        checked ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
          checked ? "left-[1.125rem]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function SortableRow({
  id,
  disabled,
  children,
}: { id: string; disabled: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-stretch gap-1.5"
    >
      {disabled ? (
        <span className="w-6 shrink-0" />
      ) : (
        <button
          type="button"
          {...attributes}
          {...listeners}
          title="Sıralamaq üçün sürükləyin"
          className="flex w-6 shrink-0 cursor-grab items-center justify-center rounded-lg text-gray-300 hover:text-gray-500 active:cursor-grabbing dark:text-gray-600 dark:hover:text-gray-400"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="7" cy="4" r="1.4" />
            <circle cx="13" cy="4" r="1.4" />
            <circle cx="7" cy="10" r="1.4" />
            <circle cx="13" cy="10" r="1.4" />
            <circle cx="7" cy="16" r="1.4" />
            <circle cx="13" cy="16" r="1.4" />
          </svg>
        </button>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** A button on branch rows, a plain box on leaves — so leaves never advertise
 *  an expansion that does not exist. */
function Expander({
  onToggle,
  expanded,
  children,
}: { onToggle?: () => void; expanded?: boolean; children: ReactNode }) {
  const shared = "flex min-w-0 flex-1 items-center gap-3 text-left";
  if (!onToggle) return <div className={shared}>{children}</div>;
  return (
    <button type="button" onClick={onToggle} aria-expanded={expanded} className={`${shared} rounded-lg`}>
      {children}
    </button>
  );
}

type RowCardProps = {
  title: string;
  translation: string;
  path: string;
  imageUrl?: string | null;
  isActive: boolean;
  busy: boolean;
  /** Undefined on leaves — they get no expander and no child count. */
  childCount?: number;
  childLabel?: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function RowCard({
  title,
  translation,
  path,
  imageUrl,
  isActive,
  busy,
  childCount,
  childLabel,
  expanded,
  onToggleExpand,
  onToggleActive,
  onEdit,
  onDelete,
}: RowCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
        isActive
          ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          : "border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/40"
      } ${busy ? "opacity-60" : ""}`}
    >
      {/* Chevron, thumbnail and label are one control on a parent row — clicking
          the name to open a branch is what a tree is expected to do, and a lone
          chevron is a small target next to three other buttons. */}
      <Expander onToggle={onToggleExpand} expanded={expanded}>
        {onToggleExpand ? (
          <span className="shrink-0 text-gray-400">
            {expanded ? (
              <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
            ) : (
              <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
            )}
          </span>
        ) : (
          <span className="w-[26px] shrink-0" />
        )}

        {imageUrl && <img src={imageUrl} alt="" className="h-9 w-14 shrink-0 rounded object-cover" />}

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span
              className={`truncate text-sm font-semibold ${
                isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {title || "— adsız —"}
            </span>
            {translation && (
              <span className="truncate text-xs text-gray-400 dark:text-gray-500">{translation}</span>
            )}
            {childCount !== undefined && (
              <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                {childCount} {childLabel}
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate font-mono text-xs text-gray-400 dark:text-gray-500">
            {path}
          </span>
        </span>
      </Expander>

      <div className="flex shrink-0 items-center gap-1.5">
        <ActiveToggle checked={isActive} disabled={busy} onChange={onToggleActive} />
        <button
          onClick={onEdit}
          title="Redaktə et"
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        >
          <EditIcon sx={{ fontSize: 17 }} />
        </button>
        <button
          onClick={onDelete}
          title="Sil"
          className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
        >
          <DeleteIcon sx={{ fontSize: 17 }} />
        </button>
      </div>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
    >
      <AddIcon sx={{ fontSize: 15 }} /> {label}
    </button>
  );
}

// ── modal state ─────────────────────────────────────────────
type Modal =
  | { kind: "header"; mode: "create" }
  | { kind: "header"; mode: "edit"; row: AdminMenuHeader }
  | { kind: "item"; mode: "create"; headerId: number }
  | { kind: "item"; mode: "edit"; row: AdminMenuHeaderItem }
  | { kind: "subitem"; mode: "create"; itemId: number }
  | { kind: "subitem"; mode: "edit"; row: AdminMenuHeaderSubItem };

type Form = {
  titleAz: string;
  titleEn: string;
  directUrl: string;
  hasSubitems: boolean;
  isActive: boolean;
  imageFile: File | null;
  currentImageUrl: string;
};

const emptyForm = (): Form => ({
  titleAz: "",
  titleEn: "",
  directUrl: "",
  hasSubitems: true,
  isActive: true,
  imageFile: null,
  currentImageUrl: "",
});

// ─────────────────────────────────────────────────────────────
export default function HeaderManager() {
  const [headers, setHeaders] = useState<AdminMenuHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [openHeaders, setOpenHeaders] = useState<number[]>([]);
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [busyRows, setBusyRows] = useState<string[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [modal, setModal] = useState<Modal | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await getAdminHeader();
    if (res === "ERROR") toast("error", "Məlumatlar yüklənə bilmədi");
    else setHeaders(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const allItems = useMemo(() => headers.flatMap((h) => h.items ?? []), [headers]);

  const toggleIn = (list: number[], id: number) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  // ── immutable tree patches ────────────────────────────────
  const patchHeader = (id: number, patch: Partial<AdminMenuHeader>) =>
    setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));

  const patchItem = (id: number, patch: Partial<AdminMenuHeaderItem>) =>
    setHeaders((prev) =>
      prev.map((h) => ({
        ...h,
        items: (h.items ?? []).map((i) => (i.id === id ? { ...i, ...patch } : i)),
      }))
    );

  const patchSubItem = (id: number, patch: Partial<AdminMenuHeaderSubItem>) =>
    setHeaders((prev) =>
      prev.map((h) => ({
        ...h,
        items: (h.items ?? []).map((i) => ({
          ...i,
          sub_items: (i.sub_items ?? []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      }))
    );

  // ── drag & drop ───────────────────────────────────────────
  /**
   * Every row's sibling group, keyed by row. Rows may only be dropped among
   * their own siblings — the API has no "move to another parent" call, and a
   * drag that silently snaps back reads as a bug.
   */
  const groupOf = useMemo(() => {
    const map: Record<string, string> = {};
    headers.forEach((h) => {
      map[rowKey("h", h.id)] = "root";
      (h.items ?? []).forEach((i) => {
        map[rowKey("i", i.id)] = rowKey("h", h.id);
        (i.sub_items ?? []).forEach((s) => {
          map[rowKey("s", s.id)] = rowKey("i", i.id);
        });
      });
    });
    return map;
  }, [headers]);

  /** Keeps the drop indicator inside the dragged row's own list. */
  const restrictToSiblings: CollisionDetection = (args) => {
    const group = groupOf[String(args.active.id)];
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => groupOf[String(container.id)] === group
      ),
    });
  };

  /** Moves one sibling and renumbers the list to 1..n, reporting only the rows
   *  whose `display_order` actually moved — those are the ones worth a PUT. */
  const reorderSiblings = <T extends { id: number; display_order: number }>(
    siblings: T[],
    kind: Kind,
    from: string,
    to: string
  ) => {
    const sorted = sortByOrder(siblings);
    const oldIndex = sorted.findIndex((row) => rowKey(kind, row.id) === from);
    const newIndex = sorted.findIndex((row) => rowKey(kind, row.id) === to);
    if (oldIndex < 0 || newIndex < 0) return null;

    const moved = arrayMove(sorted, oldIndex, newIndex).map((row, index) => ({
      ...row,
      display_order: index + 1,
    }));
    const changed = moved.filter(
      (row) => siblings.find((s) => s.id === row.id)?.display_order !== row.display_order
    );
    return { moved, changed };
  };

  const saveOrder = async (saves: Promise<MutateResult>[]) => {
    if (saves.length === 0) return;
    setSavingOrder(true);
    const results = await Promise.all(saves);
    setSavingOrder(false);
    if (results.some((res) => res !== "SUCCESS")) {
      toast("error", "Sıralama yadda saxlanmadı");
      loadData(); // the optimistic tree no longer matches the server
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = String(active.id);
    const to = String(over.id);
    if (groupOf[from] !== groupOf[to]) return;

    if (from.startsWith("h")) {
      const result = reorderSiblings(headers, "h", from, to);
      if (!result) return;
      setHeaders(result.moved);
      await saveOrder(
        result.changed.map((row) => updateMenuHeader(row.id, { display_order: row.display_order }))
      );
      return;
    }

    if (from.startsWith("i")) {
      const headerId = rowId(groupOf[from]);
      const result = reorderSiblings(
        headers.find((h) => h.id === headerId)?.items ?? [],
        "i",
        from,
        to
      );
      if (!result) return;
      setHeaders((prev) => prev.map((h) => (h.id === headerId ? { ...h, items: result.moved } : h)));
      await saveOrder(
        result.changed.map((row) => updateHeaderItem(row.id, { display_order: row.display_order }))
      );
      return;
    }

    const itemId = rowId(groupOf[from]);
    const result = reorderSiblings(
      allItems.find((i) => i.id === itemId)?.sub_items ?? [],
      "s",
      from,
      to
    );
    if (!result) return;
    setHeaders((prev) =>
      prev.map((h) => ({
        ...h,
        items: (h.items ?? []).map((i) => (i.id === itemId ? { ...i, sub_items: result.moved } : i)),
      }))
    );
    await saveOrder(
      result.changed.map((row) => updateHeaderSubItem(row.id, { display_order: row.display_order }))
    );
  };

  // ── inline visibility toggle ──────────────────────────────
  const toggleActive = async (kind: Kind, id: number, current: boolean) => {
    const key = rowKey(kind, id);
    const next = !current;

    const apply = (value: boolean) => {
      if (kind === "h") patchHeader(id, { is_active: value });
      else if (kind === "i") patchItem(id, { is_active: value });
      else patchSubItem(id, { is_active: value });
    };

    setBusyRows((prev) => [...prev, key]);
    apply(next);

    const res =
      kind === "h"
        ? await updateMenuHeader(id, { is_active: next })
        : kind === "i"
        ? await updateHeaderItem(id, { is_active: next })
        : await updateHeaderSubItem(id, { is_active: next });

    setBusyRows((prev) => prev.filter((k) => k !== key));
    if (res !== "SUCCESS") {
      apply(current);
      toast("error", "Dəyişiklik yadda saxlanmadı");
    }
  };

  // ── delete ────────────────────────────────────────────────
  const runDelete = async (
    title: string,
    text: string | undefined,
    call: () => Promise<MutateResult>
  ) => {
    const confirmed = await Swal.fire({
      title: `"${title}" silinsin?`,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
    });
    if (!confirmed.isConfirmed) return;

    const res = await call();
    if (res === "SUCCESS") {
      toast("success", "Silindi");
      loadData();
    } else {
      toast("error", "Silinə bilmədi");
    }
  };

  // ── modal ─────────────────────────────────────────────────
  const openCreate = (next: Modal) => {
    setForm({ ...emptyForm(), hasSubitems: next.kind !== "subitem" });
    setModal(next);
  };

  const openEditHeader = (row: AdminMenuHeader) => {
    setForm({
      titleAz: row.title_az || row.title,
      titleEn: row.title_en || row.title,
      directUrl: row.direct_url || "",
      hasSubitems: row.has_subitems,
      isActive: row.is_active,
      imageFile: null,
      currentImageUrl: row.image_url || "",
    });
    setModal({ kind: "header", mode: "edit", row });
  };

  const openEditItem = (row: AdminMenuHeaderItem) => {
    setForm({
      titleAz: row.title_az || row.title,
      titleEn: row.title_en || row.title,
      directUrl: row.direct_url || "",
      hasSubitems: row.has_subitems,
      isActive: row.is_active,
      imageFile: null,
      currentImageUrl: "",
    });
    setModal({ kind: "item", mode: "edit", row });
  };

  const openEditSubItem = (row: AdminMenuHeaderSubItem) => {
    setForm({
      titleAz: row.title_az || row.title,
      titleEn: row.title_en || row.title,
      directUrl: row.direct_url || "",
      hasSubitems: false,
      isActive: row.is_active,
      imageFile: null,
      currentImageUrl: "",
    });
    setModal({ kind: "subitem", mode: "edit", row });
  };

  /** Ancestor path for the URL preview, walked in the previewed language. */
  const parentPath = (lang: "az" | "en"): string => {
    if (!modal || modal.kind === "header") return "";
    if (modal.kind === "item") {
      const headerId = modal.mode === "create" ? modal.headerId : modal.row.header_id;
      return slugOf(headers.find((h) => h.id === headerId), lang);
    }
    const itemId = modal.mode === "create" ? modal.itemId : modal.row.item_id;
    const item = allItems.find((i) => i.id === itemId);
    return [slugOf(headers.find((h) => h.id === item?.header_id), lang), slugOf(item, lang)]
      .filter(Boolean)
      .join("/");
  };

  const handleSubmit = async () => {
    if (!modal) return;
    if (!form.titleAz.trim() || !form.titleEn.trim()) {
      toast("warning", "Hər iki dildə başlıq tələb olunur");
      return;
    }

    const titles = { title_az: form.titleAz.trim(), title_en: form.titleEn.trim() };
    setSaving(true);
    let ok = false;

    if (modal.kind === "header") {
      if (modal.mode === "create") {
        // New rows land at the end of their list; from there they are dragged.
        const res = await createMenuHeader({
          ...titles,
          display_order: headers.length + 1,
          has_subitems: form.hasSubitems,
          direct_url: form.hasSubitems ? undefined : form.directUrl,
          image: form.imageFile || undefined,
        });
        ok = res !== "ERROR";
      } else {
        const res = await updateMenuHeader(modal.row.id, {
          ...titles,
          has_subitems: form.hasSubitems,
          direct_url: form.hasSubitems ? "" : form.directUrl,
          is_active: form.isActive,
          ...(form.imageFile ? { image: form.imageFile } : {}),
        });
        ok = res === "SUCCESS";
      }
    }

    if (modal.kind === "item") {
      if (modal.mode === "create") {
        const siblings = headers.find((h) => h.id === modal.headerId)?.items ?? [];
        const res = await createHeaderItem({
          header_id: modal.headerId,
          ...titles,
          display_order: siblings.length + 1,
          has_subitems: form.hasSubitems,
          direct_url: form.hasSubitems ? null : form.directUrl || null,
        });
        if (res === "BAD REQUEST") {
          setSaving(false);
          toast("warning", "Bu başlıq birbaşa keçiddir — element əlavə edilə bilməz");
          return;
        }
        ok = res !== "ERROR";
      } else {
        const res = await updateHeaderItem(modal.row.id, {
          ...titles,
          has_subitems: form.hasSubitems,
          direct_url: form.hasSubitems ? "" : form.directUrl,
          is_active: form.isActive,
        });
        ok = res === "SUCCESS";
      }
    }

    if (modal.kind === "subitem") {
      if (modal.mode === "create") {
        const siblings = allItems.find((i) => i.id === modal.itemId)?.sub_items ?? [];
        const res = await createHeaderSubItem({
          item_id: modal.itemId,
          ...titles,
          display_order: siblings.length + 1,
          direct_url: form.directUrl || null,
        });
        if (res === "BAD REQUEST") {
          setSaving(false);
          toast("warning", "Bu element birbaşa keçiddir — alt-element əlavə edilə bilməz");
          return;
        }
        ok = res !== "ERROR";
      } else {
        const res = await updateHeaderSubItem(modal.row.id, {
          ...titles,
          // "" tells the API to clear the override; null would mean "leave it
          // alone", so a cleared field could never be saved.
          direct_url: form.directUrl,
          is_active: form.isActive,
        });
        ok = res === "SUCCESS";
      }
    }

    setSaving(false);
    if (!ok) {
      toast("error", modal.mode === "create" ? "Yaradıla bilmədi" : "Yenilənə bilmədi");
      return;
    }
    toast("success", modal.mode === "create" ? "Əlavə edildi" : "Yeniləndi");
    setModal(null);
    loadData();
  };

  // ── render ────────────────────────────────────────────────
  const sortedHeaders = sortByOrder(headers);
  const showSlugPreview = modal ? modal.kind === "subitem" || !form.hasSubitems : false;

  const renderSubItems = (header: AdminMenuHeader, item: AdminMenuHeaderItem) => {
    const subs = sortByOrder(item.sub_items ?? []);
    return (
      <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-100 pl-4 dark:border-gray-700">
        {subs.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">Alt-element yoxdur.</p>
        )}
        <SortableContext
          items={subs.map((s) => rowKey("s", s.id))}
          strategy={verticalListSortingStrategy}
        >
          {subs.map((sub) => (
            <SortableRow key={sub.id} id={rowKey("s", sub.id)} disabled={subs.length < 2}>
              <RowCard
                title={sub.title_az || sub.title}
                translation={sub.title_en}
                path={
                  sub.direct_url ||
                  `/az/${slugOf(header, "az")}/${slugOf(item, "az")}/${slugOf(sub, "az")}`
                }
                isActive={sub.is_active}
                busy={busyRows.includes(rowKey("s", sub.id))}
                onToggleActive={() => toggleActive("s", sub.id, sub.is_active)}
                onEdit={() => openEditSubItem(sub)}
                onDelete={() =>
                  runDelete(sub.title_az || sub.title, undefined, () => deleteHeaderSubItem(sub.id))
                }
              />
            </SortableRow>
          ))}
        </SortableContext>
        <AddButton
          label="Alt-element əlavə et"
          onClick={() => openCreate({ kind: "subitem", mode: "create", itemId: item.id })}
        />
      </div>
    );
  };

  const renderItems = (header: AdminMenuHeader) => {
    const items = sortByOrder(header.items ?? []);
    return (
      <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-100 pl-4 dark:border-gray-700">
        {items.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">Element yoxdur.</p>
        )}
        <SortableContext
          items={items.map((i) => rowKey("i", i.id))}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => {
            const expanded = openItems.includes(item.id);
            return (
              <div key={item.id}>
                <SortableRow id={rowKey("i", item.id)} disabled={items.length < 2}>
                  <RowCard
                    title={item.title_az || item.title}
                    translation={item.title_en}
                    path={item.direct_url || `/az/${slugOf(header, "az")}/${slugOf(item, "az")}`}
                    isActive={item.is_active}
                    busy={busyRows.includes(rowKey("i", item.id))}
                    childCount={item.has_subitems ? (item.sub_items ?? []).length : undefined}
                    childLabel="alt-element"
                    expanded={expanded}
                    onToggleExpand={
                      item.has_subitems
                        ? () => setOpenItems((prev) => toggleIn(prev, item.id))
                        : undefined
                    }
                    onToggleActive={() => toggleActive("i", item.id, item.is_active)}
                    onEdit={() => openEditItem(item)}
                    onDelete={() =>
                      runDelete(item.title_az || item.title, "Alt-elementlər də silinəcək.", () =>
                        deleteHeaderItem(item.id)
                      )
                    }
                  />
                </SortableRow>
                {item.has_subitems && expanded && renderSubItems(header, item)}
              </div>
            );
          })}
        </SortableContext>
        <AddButton
          label="Element əlavə et"
          onClick={() => openCreate({ kind: "item", mode: "create", headerId: header.id })}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Sıranı dəyişmək üçün sətirləri sürükləyin — dəyişiklik dərhal yadda saxlanılır.
        </p>
        <div className="flex items-center gap-3">
          {savingOrder && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <CircularProgress size={12} /> Sıra yadda saxlanılır…
            </span>
          )}
          <button
            onClick={() => openCreate({ kind: "header", mode: "create" })}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <AddIcon sx={{ fontSize: 18 }} /> Yeni başlıq
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <CircularProgress />
        </div>
      ) : sortedHeaders.length === 0 ? (
        <p className="py-12 text-center text-gray-500 dark:text-gray-400">
          Hələ heç bir başlıq yoxdur.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={restrictToSiblings}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedHeaders.map((h) => rowKey("h", h.id))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedHeaders.map((header) => {
                const expanded = openHeaders.includes(header.id);
                return (
                  <div
                    key={header.id}
                    className="rounded-xl border border-gray-200 p-2 dark:border-gray-700"
                  >
                    <SortableRow
                      id={rowKey("h", header.id)}
                      disabled={sortedHeaders.length < 2}
                    >
                      <RowCard
                        title={header.title_az || header.title}
                        translation={header.title_en}
                        path={header.direct_url || `/az/${slugOf(header, "az")}`}
                        imageUrl={header.image_url}
                        isActive={header.is_active}
                        busy={busyRows.includes(rowKey("h", header.id))}
                        childCount={header.has_subitems ? (header.items ?? []).length : undefined}
                        childLabel="element"
                        expanded={expanded}
                        onToggleExpand={
                          header.has_subitems
                            ? () => setOpenHeaders((prev) => toggleIn(prev, header.id))
                            : undefined
                        }
                        onToggleActive={() => toggleActive("h", header.id, header.is_active)}
                        onEdit={() => openEditHeader(header)}
                        onDelete={() =>
                          runDelete(
                            header.title_az || header.title,
                            "Bütün elementlər və alt-elementlər də silinəcək.",
                            () => deleteMenuHeader(header.id)
                          )
                        }
                      />
                    </SortableRow>
                    {header.has_subitems && expanded && renderItems(header)}
                  </div>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* ── MODAL ─────────────────────────────────────────── */}
      {modal && (
        <MenuModal
          title={MODAL_TITLES[modal.kind][modal.mode]}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          loading={saving}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Field label="Başlıq (AZ) *">
                <Input
                  value={form.titleAz}
                  onChange={(v) => setForm({ ...form, titleAz: v })}
                  placeholder="Universitet"
                />
              </Field>
              {showSlugPreview && !form.directUrl && (
                <SlugPreview lang="az" title={form.titleAz} parentPath={parentPath("az")} />
              )}
            </div>
            <div>
              <Field label="Başlıq (EN) *">
                <Input
                  value={form.titleEn}
                  onChange={(v) => setForm({ ...form, titleEn: v })}
                  placeholder="University"
                />
              </Field>
              {showSlugPreview && !form.directUrl && (
                <SlugPreview lang="en" title={form.titleEn} parentPath={parentPath("en")} />
              )}
            </div>
          </div>

          {modal.kind !== "subitem" && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
              <label className="group flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.hasSubitems}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hasSubitems: e.target.checked,
                      directUrl: e.target.checked ? "" : form.directUrl,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-blue-600 dark:text-gray-300">
                  Açılan siyahıdır (alt-elementləri var)
                </span>
              </label>
              <p className="mt-1 pl-6 text-xs text-gray-400">
                İşarəsiz qalarsa birbaşa keçid olur və alt-element qəbul etmir.
              </p>
            </div>
          )}

          {showSlugPreview && (
            <Field label="Birbaşa URL" hint="Boş qalarsa yuxarıdakı daxili keçid avtomatik yaradılır.">
              <Input
                value={form.directUrl}
                onChange={(v) => setForm({ ...form, directUrl: v })}
                placeholder="/az/… və ya https://…"
              />
            </Field>
          )}

          {modal.kind === "header" && (
            <Field label={modal.mode === "edit" ? "Şəkil (dəyişdirmək üçün seçin)" : "Şəkil"}>
              {form.currentImageUrl && !form.imageFile && (
                <img
                  src={form.currentImageUrl}
                  alt=""
                  className="mb-2 h-16 w-auto rounded object-cover"
                />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] || null })}
                className="w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-300"
              />
            </Field>
          )}

          {modal.mode === "edit" && (
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <ActiveToggle
                checked={form.isActive}
                onChange={() => setForm({ ...form, isActive: !form.isActive })}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Saytda göstərilsin
              </span>
            </div>
          )}
        </MenuModal>
      )}
    </div>
  );
}
