import { useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import Label from "../../../form/Label";
import { getImageUrl } from "../../../../util/imageUrl";
import { fieldLabel } from "../formStyles";

export interface ExistingImage {
  id: number;
  image_url: string;
}

interface ImageFieldProps {
  label?: string;
  /** Single already-saved image (director / worker / laboratory cover). */
  imageUrl?: string | null;
  /** Already-saved images that can be deleted individually (lab gallery). */
  existingImages?: ExistingImage[];
  onRemoveExisting?: (id: number) => void;
  /** Files picked but not yet uploaded. */
  files?: File[];
  onSelect: (files: File[]) => void;
  onRemovePending?: (index: number) => void;
  multiple?: boolean;
  hint?: string;
  disabled?: boolean;
}

export default function ImageField({
  label,
  imageUrl,
  existingImages,
  onRemoveExisting,
  files = [],
  onSelect,
  onRemovePending,
  multiple = false,
  hint,
  disabled = false,
}: ImageFieldProps) {
  // Callers rebuild the `files` array on every render, so key the object URLs on
  // the file contents instead — otherwise each render leaks a fresh blob URL and
  // the <img> flickers.
  const signature = files.map((file) => `${file.name}:${file.size}:${file.lastModified}`).join("|");
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature]
  );

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple,
    disabled,
    onDrop: (accepted) => {
      if (accepted.length > 0) onSelect(accepted);
    },
  });

  const showSingleExisting = imageUrl && files.length === 0;

  return (
    <div>
      {label ? <Label className={fieldLabel}>{label}</Label> : null}

      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-5 text-center transition-colors ${
          disabled
            ? "cursor-not-allowed border-gray-200 dark:border-gray-800 opacity-50"
            : isDragActive
            ? "cursor-pointer border-brand-400 bg-brand-50/60 dark:bg-brand-900/20"
            : "cursor-pointer border-gray-300 dark:border-gray-700 hover:border-brand-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        }`}
      >
        <input {...getInputProps()} />
        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5l4.5-4.5a2 2 0 012.83 0L15 16.5m-3-3l1.5-1.5a2 2 0 012.83 0L21 16.5M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {multiple ? "Şəkilləri buraya sürükləyin və ya seçin" : "Şəkli buraya sürükləyin və ya seçin"}
        </p>
        <p className="text-[11px] text-gray-400">{hint ?? "PNG, JPG, WEBP"}</p>
      </div>

      {showSingleExisting && (
        <div className="mt-3 flex items-center gap-3">
          <img
            src={getImageUrl(imageUrl)}
            alt=""
            className="h-20 w-20 rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
          />
          <span className="text-xs text-gray-400">Mövcud şəkil</span>
        </div>
      )}

      {(existingImages?.length ?? 0) > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {existingImages!.map((img) => (
            <div key={`existing-${img.id}`} className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <img src={getImageUrl(img.image_url)} alt="" className="h-24 w-full object-cover" />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(img.id)}
                  title="Sil"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {previews.map((url, idx) => (
            <div key={`pending-${idx}`} className="group relative overflow-hidden rounded-lg border border-dashed border-brand-300">
              <img src={url} alt="" className="h-24 w-full object-cover opacity-80" />
              <span className="absolute bottom-1 left-1 right-1 rounded bg-brand-500/85 px-1 text-center text-[10px] text-white">
                Yadda saxlayan zaman yüklənəcək
              </span>
              {onRemovePending && (
                <button
                  type="button"
                  onClick={() => onRemovePending(idx)}
                  title="Ləğv et"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
