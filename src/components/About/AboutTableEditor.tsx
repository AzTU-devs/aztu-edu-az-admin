import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";

import Button from "../ui/button/Button";
import Label from "../form/Label";
import { Modal } from "../ui/modal";
import {
  createAboutItem,
  deleteAboutItem,
  reorderAboutItems,
  updateAboutItem,
  updateAboutSection,
  type AboutSection,
} from "../../services/about/aboutService";

/**
 * Spreadsheet-style editor for `table` blocks.
 *
 * The Scientific Board's membership list is 51 rows of 3 columns; entering that
 * through one modal per row is not a realistic ask, so rows are edited inline
 * and only the ones actually touched are sent on save. The paste importer turns
 * a copied spreadsheet into rows in one step.
 *
 * Column headings live on the section (per language); each row is an item whose
 * translated `extra` array holds that row's cells, positionally.
 */

interface RowState {
  /** null until the row has been created server-side. */
  id: number | null;
  az: string[];
  en: string[];
  dirty: boolean;
}

const toCells = (raw: unknown, width: number): string[] => {
  const cells = Array.isArray(raw) ? raw.map((cell) => String(cell ?? "")) : [];
  return Array.from({ length: width }, (_, index) => cells[index] ?? "");
};

const toHeaders = (raw: unknown): string[] =>
  Array.isArray(raw) ? raw.map((entry) => String(entry ?? "")) : [];

interface AboutTableEditorProps {
  section: AboutSection;
  onChanged: () => void;
}

export default function AboutTableEditor({ section, onChanged }: AboutTableEditorProps) {
  const [lang, setLang] = useState<"az" | "en">("az");
  const [headersAz, setHeadersAz] = useState<string[]>(() => toHeaders(section.az?.headers));
  const [headersEn, setHeadersEn] = useState<string[]>(() => toHeaders(section.en?.headers));
  const [rows, setRows] = useState<RowState[]>([]);
  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  // Widest thing the block currently needs, never less than one so an empty
  // block still renders an editable cell.
  const naturalWidth = (source: AboutSection) => {
    const fromHeaders = Math.max(
      toHeaders(source.az?.headers).length,
      toHeaders(source.en?.headers).length
    );
    const fromRows = source.items.reduce((widest, item) => {
      const az = Array.isArray(item.az?.extra) ? (item.az.extra as unknown[]).length : 0;
      const en = Array.isArray(item.en?.extra) ? (item.en.extra as unknown[]).length : 0;
      return Math.max(widest, az, en);
    }, 0);
    return Math.max(1, fromHeaders, fromRows);
  };

  const [width, setWidth] = useState(() => naturalWidth(section));

  // Re-seed only when the row set itself changes. Deriving this from `width`
  // would make "+ Sütun" re-run the effect and discard unsaved edits.
  const signature = section.items.map((item) => item.id).join(",");
  useEffect(() => {
    const seedWidth = naturalWidth(section);
    setWidth(seedWidth);
    setRows(
      section.items.map((item) => ({
        id: item.id,
        az: toCells(item.az?.extra, seedWidth),
        en: toCells(item.en?.extra, seedWidth),
        dirty: false,
      }))
    );
    setHeadersAz(toHeaders(section.az?.headers));
    setHeadersEn(toHeaders(section.en?.headers));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const headers = lang === "az" ? headersAz : headersEn;
  const setHeaders = lang === "az" ? setHeadersAz : setHeadersEn;

  const setHeader = (index: number, value: string) =>
    setHeaders((prev) => {
      const next = Array.from({ length: width }, (_, i) => prev[i] ?? "");
      next[index] = value;
      return next;
    });

  const setCell = (rowIndex: number, colIndex: number, value: string) =>
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;
        const cells = [...row[lang]];
        cells[colIndex] = value;
        return { ...row, [lang]: cells, dirty: true };
      })
    );

  const addColumn = () => {
    setHeadersAz((prev) => [...Array.from({ length: width }, (_, i) => prev[i] ?? ""), ""]);
    setHeadersEn((prev) => [...Array.from({ length: width }, (_, i) => prev[i] ?? ""), ""]);
    setRows((prev) => prev.map((row) => ({ ...row, az: [...row.az, ""], en: [...row.en, ""], dirty: true })));
    setWidth((current) => current + 1);
  };

  const removeColumn = (index: number) => {
    if (width <= 1) return;
    const drop = (cells: string[]) => cells.filter((_, i) => i !== index);
    setHeadersAz(drop);
    setHeadersEn(drop);
    setRows((prev) => prev.map((row) => ({ ...row, az: drop(row.az), en: drop(row.en), dirty: true })));
    setWidth((current) => Math.max(1, current - 1));
  };

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: null, az: Array(width).fill(""), en: Array(width).fill(""), dirty: true },
    ]);

  const deleteRow = async (index: number) => {
    const row = rows[index];
    if (row.id === null) {
      setRows((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    const confirm = await Swal.fire({
      title: "Sətri silmək?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    const result = await deleteAboutItem(row.id);
    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Sətir silinmədi." });
      return;
    }
    onChanged();
  };

  const moveRow = async (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;

    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);

    const ids = next.map((row) => row.id).filter((id): id is number => id !== null);
    if (ids.length < 2) return;

    const result = await reorderAboutItems(section.id, ids);
    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Sıralama yadda saxlanmadı." });
      onChanged();
    }
  };

  const runImport = () => {
    const parsed = importText
      .split("\n")
      .map((line) => line.trimEnd())
      .filter((line) => line.trim() !== "")
      // Tab-separated is what a spreadsheet copy produces; a pipe is the
      // convenient fallback when typing rows by hand.
      .map((line) => (line.includes("\t") ? line.split("\t") : line.split("|")).map((cell) => cell.trim()));

    if (parsed.length === 0) {
      setImportOpen(false);
      return;
    }

    const widest = Math.max(width, ...parsed.map((cells) => cells.length));
    const pad = (cells: string[]) => Array.from({ length: widest }, (_, i) => cells[i] ?? "");

    if (widest > width) {
      setHeadersAz((prev) => pad(prev));
      setHeadersEn((prev) => pad(prev));
      setWidth(widest);
    }

    setRows((prev) => [
      ...prev.map((row) => ({ ...row, az: pad(row.az), en: pad(row.en), dirty: widest > width || row.dirty })),
      ...parsed.map((cells) => ({
        id: null,
        az: lang === "az" ? pad(cells) : Array(widest).fill(""),
        en: lang === "en" ? pad(cells) : Array(widest).fill(""),
        dirty: true,
      })),
    ]);

    setImportText("");
    setImportOpen(false);
  };

  const dirtyCount = rows.filter((row) => row.dirty).length;

  const handleSave = async () => {
    setSaving(true);
    try {
      const headerResult = await updateAboutSection(section.id, {
        az: { headers: Array.from({ length: width }, (_, i) => headersAz[i] ?? "") },
        en: { headers: Array.from({ length: width }, (_, i) => headersEn[i] ?? "") },
      });
      if (headerResult !== "SUCCESS") {
        Swal.fire({ icon: "error", title: "Xəta", text: "Sütun adları saxlanmadı." });
        return;
      }

      // Only touched rows are sent — a 51-row table would otherwise fire 51
      // requests every time a single cell changes.
      let failures = 0;
      for (const row of rows) {
        if (!row.dirty) continue;
        const payload = { az: { extra: row.az }, en: { extra: row.en } };
        const result =
          row.id === null
            ? (await createAboutItem(section.id, payload)).status === "SUCCESS"
              ? "SUCCESS"
              : "ERROR"
            : await updateAboutItem(row.id, payload);
        if (result !== "SUCCESS") failures += 1;
      }

      if (failures > 0) {
        Swal.fire({ icon: "error", title: "Xəta", text: `${failures} sətir saxlanmadı.` });
      } else {
        setRows((prev) => prev.map((row) => ({ ...row, dirty: false })));
        Swal.fire({ icon: "success", title: "Yadda saxlanıldı", showConfirmButton: false, timer: 1200 });
      }
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">Cədvəl</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {rows.length} sətir · {width} sütun
            {dirtyCount > 0 ? ` · ${dirtyCount} dəyişiklik saxlanmayıb` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
            {(["az", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  lang === code
                    ? "bg-brand-500 text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
            Cədvəldən yapışdır
          </Button>
          <Button size="sm" variant="outline" onClick={addColumn}>
            + Sütun
          </Button>
          <Button size="sm" variant="outline" onClick={addRow}>
            + Sətir
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-10" />
              {Array.from({ length: width }, (_, col) => (
                <th key={col} className="p-1 align-bottom">
                  <div className="flex items-center gap-1">
                    <input
                      value={headers[col] ?? ""}
                      onChange={(event) => setHeader(col, event.target.value)}
                      placeholder={`Sütun ${col + 1}`}
                      className="w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs font-semibold text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    />
                    {width > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeColumn(col)}
                        title="Sütunu sil"
                        className="shrink-0 px-1 text-xs text-gray-300 hover:text-red-500"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                </th>
              ))}
              <th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={width + 2}
                  className="py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Hələ sətir yoxdur. “Cədvəldən yapışdır” ilə toplu əlavə edə bilərsiniz.
                </td>
              </tr>
            ) : null}

            {rows.map((row, rowIndex) => (
              <tr key={row.id ?? `new-${rowIndex}`} className={row.dirty ? "bg-amber-50/40 dark:bg-amber-500/5" : ""}>
                <td className="px-1 text-center text-xs text-gray-400">{rowIndex + 1}</td>
                {Array.from({ length: width }, (_, col) => (
                  <td key={col} className="p-1">
                    <input
                      value={row[lang][col] ?? ""}
                      onChange={(event) => setCell(rowIndex, col, event.target.value)}
                      className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                  </td>
                ))}
                <td className="whitespace-nowrap px-1 text-right">
                  <button
                    type="button"
                    onClick={() => moveRow(rowIndex, -1)}
                    disabled={rowIndex === 0}
                    title="Yuxarı"
                    className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRow(rowIndex, 1)}
                    disabled={rowIndex === rows.length - 1}
                    title="Aşağı"
                    className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRow(rowIndex)}
                    title="Sil"
                    className="px-1 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Cədvəli yadda saxla
        </Button>
      </div>

      <Modal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        className="mx-4 my-8 max-w-2xl p-6 sm:p-8"
      >
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
          Cədvəldən yapışdır
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Excel və ya Word cədvəlindən sətirləri kopyalayıb bura yapışdırın. Hər sətir bir qeyd,
          xanalar tab və ya <code>|</code> ilə ayrılır. Sətirlər{" "}
          <strong>{lang === "az" ? "Azərbaycanca" : "İngiliscə"}</strong> sütununa əlavə olunacaq.
        </p>
        <Label>Məlumat</Label>
        <textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          rows={12}
          placeholder={"1\tVəliyev Vilayət\tRektor\n2\tYusifbəyli Nurəli\tProrektor"}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setImportOpen(false)}>
            Ləğv et
          </Button>
          <Button onClick={runImport}>Sətirləri əlavə et</Button>
        </div>
      </Modal>
    </div>
  );
}
