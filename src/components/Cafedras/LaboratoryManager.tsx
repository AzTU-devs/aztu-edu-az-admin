import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Editor from "../editor/Editor";
import {
  Laboratory,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
  uploadLaboratoryImage,
} from "../../services/cafedra/cafedraService";

interface LabObjective {
  az: { title: string };
  en: { title: string };
}

interface LabFormValue {
  room_number: string;
  email: string;
  phone_number: string;
  az: { title: string; html_content: string };
  en: { title: string; html_content: string };
  objectives: LabObjective[];
  image_url?: string;
}

const emptyLab = (): LabFormValue => ({
  room_number: "",
  email: "",
  phone_number: "",
  az: { title: "", html_content: "" },
  en: { title: "", html_content: "" },
  objectives: [],
  image_url: "",
});

const toFormValue = (lab: Laboratory): LabFormValue => ({
  room_number: lab.room_number ?? "",
  email: lab.email ?? "",
  phone_number: lab.phone_number ?? "",
  az: { title: lab.az?.title ?? "", html_content: lab.az?.html_content ?? "" },
  en: { title: lab.en?.title ?? "", html_content: lab.en?.html_content ?? "" },
  objectives: (lab.objectives ?? []).map((o) => ({
    az: { title: o.az?.title ?? "" },
    en: { title: o.en?.title ?? "" },
  })),
  image_url: lab.image_url ?? "",
});

interface LaboratoryManagerProps {
  cafedraCode: string;
  laboratories: Laboratory[];
  onChanged: () => void;
}

export default function LaboratoryManager({ cafedraCode, laboratories, onChanged }: LaboratoryManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [value, setValue] = useState<LabFormValue>(emptyLab());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Bump key to force Editor remount with fresh initialContent when (re)opening.
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (modalOpen) setEditorKey((k) => k + 1);
  }, [modalOpen]);

  const openAdd = () => {
    setEditingId(null);
    setValue(emptyLab());
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (lab: Laboratory) => {
    setEditingId(lab.id ?? null);
    setValue(toFormValue(lab));
    setImageFile(null);
    setModalOpen(true);
  };

  const setField = (field: "room_number" | "email" | "phone_number", v: string) =>
    setValue((prev) => ({ ...prev, [field]: v }));
  const setTr = (lang: "az" | "en", field: "title" | "html_content", v: string) =>
    setValue((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: v } }));

  const addObjective = () =>
    setValue((prev) => ({ ...prev, objectives: [...prev.objectives, { az: { title: "" }, en: { title: "" } }] }));
  const removeObjective = (idx: number) =>
    setValue((prev) => ({ ...prev, objectives: prev.objectives.filter((_, i) => i !== idx) }));
  const setObjective = (idx: number, lang: "az" | "en", v: string) =>
    setValue((prev) => {
      const list = [...prev.objectives];
      list[idx] = { ...list[idx], [lang]: { title: v } };
      return { ...prev, objectives: list };
    });

  const handleSubmit = async () => {
    if (!value.az.title.trim() || !value.en.title.trim()) {
      Swal.fire({ icon: "warning", title: "Xahiş olunur", text: "Laboratoriya adı hər iki dildə tələb olunur." });
      return;
    }
    setSubmitting(true);
    try {
      const payload: Laboratory = {
        az: value.az,
        en: value.en,
        room_number: value.room_number,
        email: value.email,
        phone_number: value.phone_number,
        objectives: value.objectives as any,
        gallery_images: [],
      };

      if (editingId) {
        const res = await updateLaboratory(editingId, payload);
        if (res !== "SUCCESS") {
          Swal.fire({ icon: "error", title: "Xəta", text: "Laboratoriya yenilənərkən xəta baş verdi." });
          return;
        }
        if (imageFile) await uploadLaboratoryImage(editingId, imageFile);
      } else {
        const res: any = await createLaboratory(cafedraCode, payload);
        if (res.status !== "SUCCESS") {
          Swal.fire({ icon: "error", title: "Xəta", text: "Laboratoriya əlavə edilərkən xəta baş verdi." });
          return;
        }
        if (imageFile && res.id) await uploadLaboratoryImage(res.id, imageFile);
      }

      setModalOpen(false);
      setEditingId(null);
      Swal.fire({ icon: "success", title: "Uğurlu", showConfirmButton: false, timer: 1400 });
      onChanged();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (lab: Laboratory) => {
    if (!lab.id) return;
    const confirm = await Swal.fire({
      title: "Laboratoriyanı silmək istədiyinizə əminsiniz?",
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

    const res = await deleteLaboratory(lab.id);
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
          <p className="font-semibold text-gray-800 dark:text-gray-100">Laboratoriyalar</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Laboratoriyaları ayrıca əlavə edin, redaktə edin və silin.</p>
        </div>
        <Button size="sm" onClick={openAdd}>+ Əlavə et</Button>
      </div>

      <div className="space-y-3">
        {laboratories.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Hələ heç bir laboratoriya yoxdur.</p>
        )}
        {laboratories.map((lab) => (
          <div
            key={lab.id}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              {lab.image_url ? (
                <img src={lab.image_url} alt="" className="h-12 w-12 rounded-lg border border-gray-200 object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-800">—</div>
              )}
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{lab.az?.title || lab.en?.title || "—"}</p>
                {lab.room_number ? <p className="text-sm text-gray-500 dark:text-gray-400">Otaq: {lab.room_number}</p> : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(lab)}>Redaktə et</Button>
              <button
                type="button"
                onClick={() => handleDelete(lab)}
                className="rounded-lg bg-red-500 px-4 py-3 text-sm text-white transition hover:bg-red-600"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        className="max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto p-6 sm:p-8"
      >
        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-gray-100">
          Laboratoriya — {editingId ? "Redaktə et" : "Əlavə et"}
        </h3>

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Otaq nömrəsi</Label>
              <Input value={value.room_number} onChange={(e) => setField("room_number", e.target.value)} placeholder="Otaq" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={value.email} onChange={(e) => setField("email", e.target.value)} placeholder="lab@aztu.edu.az" />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input value={value.phone_number} onChange={(e) => setField("phone_number", e.target.value)} placeholder="+994 ..." />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">AZ</p>
              <Label>Başlıq</Label>
              <Input value={value.az.title} onChange={(e) => setTr("az", "title", e.target.value)} placeholder="Laboratoriya adı" />
              <div className="mt-3">
                <Label>Məzmun</Label>
                <Editor key={`az-${editorKey}`} initialContent={value.az.html_content} onUpdate={(html) => setTr("az", "html_content", html)} />
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">EN</p>
              <Label>Title</Label>
              <Input value={value.en.title} onChange={(e) => setTr("en", "title", e.target.value)} placeholder="Laboratory name" />
              <div className="mt-3">
                <Label>Content</Label>
                <Editor key={`en-${editorKey}`} initialContent={value.en.html_content} onUpdate={(html) => setTr("en", "html_content", html)} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Məqsədlər</p>
              <Button size="sm" variant="outline" onClick={addObjective}>+ Məqsəd əlavə et</Button>
            </div>
            {value.objectives.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Heç bir məqsəd yoxdur.</p>}
            <div className="space-y-3">
              {value.objectives.map((obj, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input value={obj.az.title} onChange={(e) => setObjective(idx, "az", e.target.value)} placeholder="AZ məqsəd" />
                  <div className="flex gap-2">
                    <Input value={obj.en.title} onChange={(e) => setObjective(idx, "en", e.target.value)} placeholder="EN objective" />
                    <button type="button" onClick={() => removeObjective(idx)} className="rounded-lg bg-red-500 px-3 text-sm text-white hover:bg-red-600">Sil</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Əsas şəkil</Label>
            <div className="flex flex-wrap items-center gap-4">
              {value.image_url ? <img src={value.image_url} alt="" className="h-14 w-14 rounded-lg border border-gray-200 object-cover" /> : null}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-white hover:file:bg-brand-600 dark:text-gray-300"
              />
              {imageFile ? <span className="text-xs text-gray-500">Seçildi: {imageFile.name}</span> : null}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Ləğv et</Button>
          <Button onClick={handleSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
            Yadda saxla
          </Button>
        </div>
      </Modal>
    </div>
  );
}
