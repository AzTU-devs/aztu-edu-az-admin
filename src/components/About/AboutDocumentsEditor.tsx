import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";

import Button from "../ui/button/Button";
import {
  createAboutItem,
  deleteAboutItem,
  updateAboutItem,
  uploadAboutItemFile,
  type AboutSection,
} from "../../services/about/aboutService";

/**
 * Row editor for `documents` blocks.
 *
 * The policy library is ~26 entries, most of which ship a *separate* Azerbaijani
 * and English PDF for the same document — so each row exposes three file slots:
 * one language-neutral, plus an AZ and an EN override. Titles and the category
 * tag are edited inline; only touched rows are sent on save.
 */

interface RowState {
  az: { title: string; file_url: string };
  en: { title: string; file_url: string };
  item_key: string;
  dirty: boolean;
  files: { neutral: File | null; az: File | null; en: File | null };
}

const blankRow = (): RowState => ({
  az: { title: "", file_url: "" },
  en: { title: "", file_url: "" },
  item_key: "",
  dirty: true,
  files: { neutral: null, az: null, en: null },
});

interface AboutDocumentsEditorProps {
  section: AboutSection;
  onChanged: () => void;
}

export default function AboutDocumentsEditor({ section, onChanged }: AboutDocumentsEditorProps) {
  const [rows, setRows] = useState<Record<number, RowState>>({});
  const [newRows, setNewRows] = useState<RowState[]>([]);
  const [saving, setSaving] = useState(false);

  const signature = section.items.map((item) => item.id).join(",");
  useEffect(() => {
    const next: Record<number, RowState> = {};
    section.items.forEach((item) => {
      next[item.id] = {
        az: { title: item.az?.title ?? "", file_url: item.az?.file_url ?? "" },
        en: { title: item.en?.title ?? "", file_url: item.en?.file_url ?? "" },
        item_key: item.item_key ?? "",
        dirty: false,
        files: { neutral: null, az: null, en: null },
      };
    });
    setRows(next);
    setNewRows([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const patch = (id: number, apply: (row: RowState) => RowState) =>
    setRows((prev) => ({ ...prev, [id]: { ...apply(prev[id] ?? blankRow()), dirty: true } }));

  const patchNew = (index: number, apply: (row: RowState) => RowState) =>
    setNewRows((prev) => prev.map((row, i) => (i === index ? apply(row) : row)));

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Sənədi silmək?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    const result = await deleteAboutItem(id);
    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Sənəd silinmədi." });
      return;
    }
    onChanged();
  };

  /** Sends the three optional attachments; returns how many failed. */
  const pushFiles = async (itemId: number, files: RowState["files"]): Promise<number> => {
    let failed = 0;
    if (files.neutral && (await uploadAboutItemFile(itemId, files.neutral)) !== "SUCCESS") failed += 1;
    if (files.az && (await uploadAboutItemFile(itemId, files.az, "az")) !== "SUCCESS") failed += 1;
    if (files.en && (await uploadAboutItemFile(itemId, files.en, "en")) !== "SUCCESS") failed += 1;
    return failed;
  };

  const dirtyIds = Object.entries(rows)
    .filter(([, row]) => row.dirty)
    .map(([id]) => Number(id));

  const pending = dirtyIds.length + newRows.length;

  const handleSave = async () => {
    setSaving(true);
    try {
      let failures = 0;

      for (const id of dirtyIds) {
        const row = rows[id];
        const result = await updateAboutItem(id, {
          item_key: row.item_key,
          az: { title: row.az.title },
          en: { title: row.en.title },
        });
        if (result !== "SUCCESS") failures += 1;
        else failures += await pushFiles(id, row.files);
      }

      for (const row of newRows) {
        const created = await createAboutItem(section.id, {
          item_key: row.item_key,
          az: { title: row.az.title },
          en: { title: row.en.title },
        });
        if (created.status !== "SUCCESS") failures += 1;
        else failures += await pushFiles(created.id, row.files);
      }

      if (failures > 0) {
        Swal.fire({ icon: "error", title: "Xəta", text: `${failures} əməliyyat uğursuz oldu.` });
      } else {
        // Editing titles in place leaves the row ids alone, so the seeding
        // effect will not re-run — clear the markers here or they stick.
        setRows((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, row]) => [
              id,
              { ...row, dirty: false, files: { neutral: null, az: null, en: null } },
            ])
          )
        );
        setNewRows([]);
        Swal.fire({ icon: "success", title: "Yadda saxlanıldı", showConfirmButton: false, timer: 1200 });
      }
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const fileSlot = (
    label: string,
    stored: string,
    picked: File | null,
    onPick: (file: File | null) => void
  ) => (
    <div>
      <p className="mb-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <input
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        onChange={(event) => onPick(event.target.files?.[0] ?? null)}
        className="block w-full text-xs text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-brand-50 file:px-2 file:py-1 file:text-xs file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
      />
      {picked ? (
        <p className="mt-0.5 truncate text-[11px] text-brand-600 dark:text-brand-400">{picked.name}</p>
      ) : stored ? (
        <p className="mt-0.5 truncate text-[11px] text-gray-400">{stored.split("/").pop()}</p>
      ) : (
        <p className="mt-0.5 text-[11px] text-gray-300 dark:text-gray-600">Fayl yoxdur</p>
      )}
    </div>
  );

  const renderRow = (
    key: string,
    row: RowState,
    apply: (mutate: (row: RowState) => RowState) => void,
    onRemove: () => void,
    index: number
  ) => (
    <div
      key={key}
      className={`rounded-xl border p-4 ${
        row.dirty
          ? "border-amber-200 bg-amber-50/40 dark:border-amber-500/30 dark:bg-amber-500/5"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">#{index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-500 hover:text-red-600"
        >
          Sil
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <p className="mb-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">Ad (AZ)</p>
          <input
            value={row.az.title}
            onChange={(event) =>
              apply((current) => ({ ...current, az: { ...current.az, title: event.target.value } }))
            }
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
        <div>
          <p className="mb-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">Ad (EN)</p>
          <input
            value={row.en.title}
            onChange={(event) =>
              apply((current) => ({ ...current, en: { ...current.en, title: event.target.value } }))
            }
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
        <div>
          <p className="mb-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">Kateqoriya</p>
          <input
            value={row.item_key}
            onChange={(event) => apply((current) => ({ ...current, item_key: event.target.value }))}
            placeholder="academic"
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {fileSlot("Fayl (hər iki dil)", "", row.files.neutral, (file) =>
          apply((current) => ({ ...current, files: { ...current.files, neutral: file } }))
        )}
        {fileSlot("Fayl (AZ)", row.az.file_url, row.files.az, (file) =>
          apply((current) => ({ ...current, files: { ...current.files, az: file } }))
        )}
        {fileSlot("Fayl (EN)", row.en.file_url, row.files.en, (file) =>
          apply((current) => ({ ...current, files: { ...current.files, en: file } }))
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">Sənədlər</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {section.items.length} sənəd
            {pending > 0 ? ` · ${pending} dəyişiklik saxlanmayıb` : ""}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setNewRows((prev) => [...prev, blankRow()])}>
          + Sənəd əlavə et
        </Button>
      </div>

      <div className="space-y-3">
        {section.items.length === 0 && newRows.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Hələ sənəd yoxdur.</p>
        ) : null}

        {section.items.map((item, index) =>
          renderRow(
            String(item.id),
            rows[item.id] ?? blankRow(),
            (mutate) => patch(item.id, mutate),
            () => void handleDelete(item.id),
            index
          )
        )}

        {newRows.map((row, index) =>
          renderRow(
            `new-${index}`,
            row,
            (mutate) => patchNew(index, mutate),
            () => setNewRows((prev) => prev.filter((_, i) => i !== index)),
            section.items.length + index
          )
        )}
      </div>

      {pending > 0 ? (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Sənədləri yadda saxla
          </Button>
        </div>
      ) : null}
    </div>
  );
}
