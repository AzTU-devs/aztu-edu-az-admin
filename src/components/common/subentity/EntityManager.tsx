import { ReactNode, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import { getImageUrl } from "../../../util/imageUrl";

export type CreateResult = { status: "SUCCESS"; id: number } | { status: "ERROR" };
export type MutateResult = "SUCCESS" | "NOT FOUND" | "ERROR";

export interface EntityFormHelpers {
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  /** Bumped on every modal open — pass it to `RichTextField`'s `remountKey`. */
  editorKey: number;
}

export interface EntityManagerProps<T, V> {
  title: string;
  description?: string;
  items: T[];
  getId: (item: T) => number;
  getPrimary: (item: T) => string;
  getSecondary?: (item: T) => string;
  getThumb?: (item: T) => string | undefined;
  showThumb?: boolean;
  toFormValue: (item: T) => V;
  emptyValue: () => V;
  renderForm: (value: V, onChange: (next: V) => void, helpers: EntityFormHelpers) => ReactNode;
  /** Returns an error message, or null when the value may be submitted. */
  validate?: (value: V) => string | null;
  onCreate: (value: V) => Promise<CreateResult>;
  onUpdate: (id: number, value: V) => Promise<MutateResult>;
  onDelete: (id: number) => Promise<MutateResult>;
  onUploadImage?: (id: number, file: File) => Promise<unknown>;
  /** When supplied, rows become drag-sortable and the new id order is sent. */
  onReorder?: (ids: number[]) => Promise<MutateResult>;
  onChanged: () => void;
  modalClassName?: string;
  emptyText?: string;
  addLabel?: string;
  /** Rendered above the list — used for the publications year grouping. */
  header?: ReactNode;
}

function SortableRow({ id, disabled, children }: { id: number; disabled: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="flex items-stretch gap-2"
    >
      {!disabled && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          title="Sıralamaq üçün sürükləyin"
          className="flex w-7 shrink-0 cursor-grab items-center justify-center rounded-lg text-gray-300 hover:text-gray-500 active:cursor-grabbing dark:text-gray-600 dark:hover:text-gray-400"
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

export default function EntityManager<T, V>({
  title,
  description,
  items,
  getId,
  getPrimary,
  getSecondary,
  getThumb,
  showThumb = false,
  toFormValue,
  emptyValue,
  renderForm,
  validate,
  onCreate,
  onUpdate,
  onDelete,
  onUploadImage,
  onReorder,
  onChanged,
  modalClassName = "max-w-3xl mx-4 my-8 max-h-[90vh] overflow-y-auto p-6 sm:p-8",
  emptyText = "Hələ heç bir qeyd yoxdur.",
  addLabel = "+ Əlavə et",
  header,
}: EntityManagerProps<T, V>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [value, setValue] = useState<V>(() => emptyValue());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // `Editor` seeds initialContent once at mount; bump this on every open so the
  // fields inside the modal remount against the row being edited.
  const [editorKey, setEditorKey] = useState(0);
  const [order, setOrder] = useState<number[]>(() => items.map(getId));

  // Callers pass `items` as a freshly-mapped array on every render, so compare
  // the id sequence rather than the array identity — otherwise this setState
  // re-triggers itself forever.
  const idSignature = items.map(getId).join(",");
  useEffect(() => {
    setOrder(idSignature === "" ? [] : idSignature.split(",").map(Number));
  }, [idSignature]);

  useEffect(() => {
    if (modalOpen) setEditorKey((k) => k + 1);
  }, [modalOpen]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const openAdd = () => {
    setEditing(null);
    setValue(emptyValue());
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    setValue(toFormValue(item));
    setImageFile(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const validationError = validate ? validate(value) : null;

  const handleSubmit = async () => {
    if (validationError) {
      Swal.fire({ icon: "warning", title: "Xahiş olunur", text: validationError });
      return;
    }
    setSubmitting(true);
    try {
      let targetId: number;
      if (editing) {
        const id = getId(editing);
        const res = await onUpdate(id, value);
        if (res !== "SUCCESS") {
          Swal.fire({ icon: "error", title: "Xəta", text: "Yenilənmə zamanı xəta baş verdi." });
          return;
        }
        targetId = id;
      } else {
        const res = await onCreate(value);
        if (res.status !== "SUCCESS") {
          Swal.fire({ icon: "error", title: "Xəta", text: "Əlavə edilərkən xəta baş verdi." });
          return;
        }
        targetId = res.id;
      }

      // Upload the image after the row exists. Surface a real failure (e.g.
      // unsupported format / too large) instead of silently reporting success.
      // Upload services return either "SUCCESS" (string) or { status: "SUCCESS" }.
      let imageError: string | null = null;
      if (imageFile && onUploadImage) {
        const imgRes = await onUploadImage(targetId, imageFile);
        const ok =
          imgRes === "SUCCESS" ||
          (typeof imgRes === "object" && imgRes !== null && (imgRes as { status?: string }).status === "SUCCESS");
        if (!ok) {
          imageError =
            typeof imgRes === "string"
              ? imgRes
              : (imgRes as { data?: { message?: string } })?.data?.message || "Şəkil yüklənə bilmədi.";
        }
      }

      closeModal();
      if (imageError) {
        Swal.fire({ icon: "warning", title: "Məlumat saxlanıldı, lakin şəkil yüklənmədi", text: imageError });
      } else {
        Swal.fire({ icon: "success", title: "Uğurlu", showConfirmButton: false, timer: 1400 });
      }
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

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!onReorder) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as number);
    const newIndex = order.indexOf(over.id as number);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);
    const res = await onReorder(next);
    if (res !== "SUCCESS") {
      setOrder(items.map(getId));
      Swal.fire({ icon: "error", title: "Xəta", text: "Sıralama yadda saxlanmadı." });
      return;
    }
    onChanged();
  };

  const sorted = onReorder
    ? [...items].sort((a, b) => order.indexOf(getId(a)) - order.indexOf(getId(b)))
    : items;

  const renderRow = (item: T) => (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {showThumb ? (
          getThumb?.(item) ? (
            <img src={getImageUrl(getThumb(item))} alt="" className="h-11 w-11 rounded-full border border-gray-200 object-cover" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400 dark:bg-gray-800">—</div>
          )
        ) : null}
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-700 dark:text-gray-200">{getPrimary(item)}</p>
          {getSecondary ? (
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{getSecondary(item)}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
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
  );

  const list = (
    <div className="space-y-3">
      {sorted.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">{emptyText}</p>}
      {onReorder ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map(getId)} strategy={verticalListSortingStrategy}>
            {sorted.map((item) => (
              <SortableRow key={getId(item)} id={getId(item)} disabled={sorted.length < 2}>
                {renderRow(item)}
              </SortableRow>
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        sorted.map((item) => <div key={getId(item)}>{renderRow(item)}</div>)
      )}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
          {description ? <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p> : null}
        </div>
        <Button size="sm" onClick={openAdd}>{addLabel}</Button>
      </div>

      {header}
      {list}

      <Modal isOpen={modalOpen} onClose={closeModal} className={modalClassName}>
        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-gray-100">
          {`${title} — ${editing ? "Redaktə et" : "Əlavə et"}`}
        </h3>

        {renderForm(value, setValue, { imageFile, setImageFile, editorKey })}

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={closeModal} disabled={submitting}>
            Ləğv et
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || validationError !== null}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Yadda saxla
          </Button>
        </div>
      </Modal>
    </div>
  );
}
