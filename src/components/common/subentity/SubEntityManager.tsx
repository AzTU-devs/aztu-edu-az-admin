import { useState } from "react";
import Swal from "sweetalert2";
import Button from "../../ui/button/Button";
import PersonFormModal from "./PersonFormModal";
import { PersonFormValue } from "./PersonForm";

export type CreateResult = { status: "SUCCESS"; id: number } | { status: "ERROR" };
export type MutateResult = "SUCCESS" | "NOT FOUND" | "ERROR";

interface SubEntityManagerProps<T> {
  title: string;
  description?: string;
  items: T[];
  getId: (item: T) => number;
  toFormValue: (item: T) => PersonFormValue;
  /** Display helpers for the list rows. */
  getName: (item: T) => string;
  getSubtitle?: (item: T) => string;
  getImage?: (item: T) => string | undefined;
  showImage?: boolean;
  onCreate: (value: PersonFormValue) => Promise<CreateResult>;
  onUpdate: (id: number, value: PersonFormValue) => Promise<MutateResult>;
  onDelete: (id: number) => Promise<MutateResult>;
  onUploadImage?: (id: number, file: File) => Promise<unknown>;
  /** Called after any successful mutation so the parent can refetch. */
  onChanged: () => void;
}

export default function SubEntityManager<T>({
  title,
  description,
  items,
  getId,
  toFormValue,
  getName,
  getSubtitle,
  getImage,
  showImage = true,
  onCreate,
  onUpdate,
  onDelete,
  onUploadImage,
  onChanged,
}: SubEntityManagerProps<T>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (item: T) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleSubmit = async (value: PersonFormValue, imageFile: File | null) => {
    setSubmitting(true);
    try {
      if (editing) {
        const id = getId(editing);
        const res = await onUpdate(id, value);
        if (res !== "SUCCESS") {
          Swal.fire({ icon: "error", title: "Xəta", text: "Yenilənmə zamanı xəta baş verdi." });
          return;
        }
        if (imageFile && onUploadImage) {
          await onUploadImage(id, imageFile);
        }
      } else {
        const res = await onCreate(value);
        if (res.status !== "SUCCESS") {
          Swal.fire({ icon: "error", title: "Xəta", text: "Əlavə edilərkən xəta baş verdi." });
          return;
        }
        if (imageFile && onUploadImage) {
          await onUploadImage(res.id, imageFile);
        }
      }

      setModalOpen(false);
      setEditing(null);
      Swal.fire({ icon: "success", title: "Uğurlu", showConfirmButton: false, timer: 1400 });
      onChanged();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: T) => {
    const confirm = await Swal.fire({
      title: "Silmək istədiyinizə əminsiniz?",
      text: "Bu əməliyyat geri alına bilməz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    const res = await onDelete(getId(item));
    if (res === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1400 });
      onChanged();
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Silinərkən xəta baş verdi." });
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
          {description ? <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p> : null}
        </div>
        <Button size="sm" onClick={openAdd}>+ Əlavə et</Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Hələ heç bir qeyd yoxdur.</p>
        )}
        {items.map((item) => (
          <div
            key={getId(item)}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              {showImage ? (
                getImage?.(item) ? (
                  <img src={getImage(item)} alt="" className="h-11 w-11 rounded-full border border-gray-200 object-cover" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400 dark:bg-gray-800">—</div>
                )
              ) : null}
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{getName(item)}</p>
                {getSubtitle ? <p className="text-sm text-gray-500 dark:text-gray-400">{getSubtitle(item)}</p> : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Redaktə et</Button>
              <button
                type="button"
                onClick={() => handleDelete(item)}
                className="rounded-lg bg-red-500 px-4 py-3 text-sm text-white transition hover:bg-red-600"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      <PersonFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={`${title} — ${editing ? "Redaktə et" : "Əlavə et"}`}
        initialValue={editing ? toFormValue(editing) : undefined}
        showImage={showImage}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
