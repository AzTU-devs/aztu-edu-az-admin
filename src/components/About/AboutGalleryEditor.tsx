import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";

import Button from "../ui/button/Button";
import { getImageUrl } from "../../util/imageUrl";
import {
  createAboutItem,
  deleteAboutItem,
  updateAboutItem,
  uploadAboutItemImage,
  type AboutSection,
} from "../../services/about/aboutService";

/**
 * Thumbnail-grid editor for `gallery` blocks.
 *
 * The rector's gallery is 22 images; adding them one modal at a time is the
 * wrong shape for the job. Files are selected in bulk and uploaded in sequence,
 * then captions are typed straight onto the tiles.
 */

interface AboutGalleryEditorProps {
  section: AboutSection;
  onChanged: () => void;
}

interface CaptionState {
  az: string;
  en: string;
  dirty: boolean;
}

export default function AboutGalleryEditor({ section, onChanged }: AboutGalleryEditorProps) {
  const [lang, setLang] = useState<"az" | "en">("az");
  const [captions, setCaptions] = useState<Record<number, CaptionState>>({});
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const signature = section.items.map((item) => item.id).join(",");
  useEffect(() => {
    const next: Record<number, CaptionState> = {};
    section.items.forEach((item) => {
      next[item.id] = {
        az: item.az?.caption ?? "",
        en: item.en?.caption ?? "",
        dirty: false,
      };
    });
    setCaptions(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const setCaption = (id: number, value: string) =>
    setCaptions((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { az: "", en: "", dirty: false }), [lang]: value, dirty: true },
    }));

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setUploading({ done: 0, total: list.length });

    let failed = 0;
    for (let index = 0; index < list.length; index += 1) {
      // The row must exist before the image can be attached to it.
      const created = await createAboutItem(section.id, { az: {}, en: {} });
      if (created.status !== "SUCCESS") {
        failed += 1;
      } else {
        const upload = await uploadAboutItemImage(created.id, list[index]);
        if (upload !== "SUCCESS") failed += 1;
      }
      setUploading({ done: index + 1, total: list.length });
    }

    setUploading(null);
    if (fileInput.current) fileInput.current.value = "";

    if (failed > 0) {
      Swal.fire({ icon: "warning", title: "Bəzi şəkillər yüklənmədi", text: `${failed} fayl.` });
    }
    onChanged();
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Şəkli silmək?",
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
      Swal.fire({ icon: "error", title: "Xəta", text: "Şəkil silinmədi." });
      return;
    }
    onChanged();
  };

  const dirtyIds = Object.entries(captions)
    .filter(([, state]) => state.dirty)
    .map(([id]) => Number(id));

  const handleSaveCaptions = async () => {
    setSaving(true);
    try {
      let failures = 0;
      for (const id of dirtyIds) {
        const state = captions[id];
        const result = await updateAboutItem(id, {
          az: { caption: state.az },
          en: { caption: state.en },
        });
        if (result !== "SUCCESS") failures += 1;
      }

      if (failures > 0) {
        Swal.fire({ icon: "error", title: "Xəta", text: `${failures} altyazı saxlanmadı.` });
      } else {
        // The row ids are unchanged by a caption-only save, so the seeding
        // effect will not re-run — clear the markers here or they stick.
        setCaptions((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([id, state]) => [id, { ...state, dirty: false }])
          )
        );
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
          <p className="font-semibold text-gray-800 dark:text-gray-100">Qalereya</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {section.items.length} şəkil
            {dirtyIds.length > 0 ? ` · ${dirtyIds.length} altyazı saxlanmayıb` : ""}
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
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => void handleFiles(event.target.files)}
            className="hidden"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInput.current?.click()}
            disabled={uploading !== null}
          >
            {uploading ? `Yüklənir ${uploading.done}/${uploading.total}` : "+ Şəkil yüklə"}
          </Button>
        </div>
      </div>

      {section.items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Hələ şəkil yoxdur. Bir neçə faylı eyni anda seçə bilərsiniz.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {section.items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="relative">
                {item.image_url ? (
                  <img
                    src={getImageUrl(item.image_url)}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-gray-100 text-xs text-gray-400 dark:bg-gray-800">
                    Şəkil yoxdur
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  title="Sil"
                  className="absolute right-1.5 top-1.5 rounded-md bg-black/50 px-2 py-0.5 text-xs text-white hover:bg-red-500"
                >
                  ×
                </button>
              </div>
              <input
                value={captions[item.id]?.[lang] ?? ""}
                onChange={(event) => setCaption(item.id, event.target.value)}
                placeholder="Altyazı"
                className="w-full border-0 border-t border-gray-200 px-2 py-2 text-xs focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          ))}
        </div>
      )}

      {dirtyIds.length > 0 ? (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSaveCaptions}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Altyazıları yadda saxla
          </Button>
        </div>
      ) : null}
    </div>
  );
}
