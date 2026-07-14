import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Editor from "../editor/Editor";
import Button from "../ui/button/Button";
import { getImageUrl } from "../../util/imageUrl";
import {
  Laboratory,
  LaboratoryGalleryImage,
  Cafedra,
  getCafedras,
  createLaboratory,
  updateLaboratory,
  uploadLaboratoryImage,
  uploadLaboratoryGalleryImage,
  deleteLaboratoryGalleryImage,
} from "../../services/cafedra/cafedraService";

interface LabObjective {
  id?: number;
  az: { title: string };
  en: { title: string };
}

interface LabFormValue {
  cafedra_code: string;
  room_number: string;
  authorized_person: string;
  email: string;
  phone_number: string;
  az: { title: string; html_content: string };
  en: { title: string; html_content: string };
  objectives: LabObjective[];
  image_url?: string | null;
  gallery_images: LaboratoryGalleryImage[];
}

const emptyForm = (): LabFormValue => ({
  cafedra_code: "",
  room_number: "",
  authorized_person: "",
  email: "",
  phone_number: "",
  az: { title: "", html_content: "" },
  en: { title: "", html_content: "" },
  objectives: [],
  image_url: "",
  gallery_images: [],
});

const toFormValue = (lab: Laboratory): LabFormValue => ({
  cafedra_code: lab.cafedra_code ?? "",
  room_number: lab.room_number ?? "",
  authorized_person: lab.authorized_person ?? "",
  email: lab.email ?? "",
  phone_number: lab.phone_number ?? "",
  az: { title: lab.az?.title ?? "", html_content: lab.az?.html_content ?? "" },
  en: { title: lab.en?.title ?? "", html_content: lab.en?.html_content ?? "" },
  objectives: (lab.objectives ?? []).map((o) => ({
    id: o.id,
    az: { title: o.az?.title ?? "" },
    en: { title: o.en?.title ?? "" },
  })),
  image_url: lab.image_url ?? "",
  gallery_images: lab.gallery_images ?? [],
});

interface ResearchLaboratoryFormProps {
  initialValue?: Laboratory | null;
  submitLabel?: string;
}

export default function ResearchLaboratoryForm({ initialValue, submitLabel }: ResearchLaboratoryFormProps) {
  const navigate = useNavigate();
  const editingId = initialValue?.id ?? null;

  const [value, setValue] = useState<LabFormValue>(initialValue ? toFormValue(initialValue) : emptyForm());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pendingGallery, setPendingGallery] = useState<File[]>([]);
  const [cafedras, setCafedras] = useState<Cafedra[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  // Editor is uncontrolled after mount; a stable key keeps it from remounting on each keystroke.
  const editorKey = editingId ?? "new";

  useEffect(() => {
    getCafedras(0, 200).then((res) => {
      if (res && typeof res === "object" && "cafedras" in res) setCafedras(res.cafedras);
    });
  }, []);

  const setField = (field: "cafedra_code" | "room_number" | "authorized_person" | "email" | "phone_number", v: string) =>
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

  // Gallery: on edit the lab already exists so we upload/delete immediately; on create we queue.
  const handleGallerySelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files);

    if (editingId) {
      setGalleryBusy(true);
      for (const file of fileArr) {
        const res = await uploadLaboratoryGalleryImage(editingId, file);
        if (res.status === "SUCCESS" && res.id && res.image_url) {
          setValue((prev) => ({
            ...prev,
            gallery_images: [...prev.gallery_images, { id: res.id as number, image_url: res.image_url as string }],
          }));
        }
      }
      setGalleryBusy(false);
      Swal.fire({ icon: "success", title: "Qalereya şəkilləri yükləndi", showConfirmButton: false, timer: 1200 });
    } else {
      setPendingGallery((prev) => [...prev, ...fileArr]);
    }
  };

  const removeExistingGallery = async (galleryImageId: number) => {
    const res = await deleteLaboratoryGalleryImage(galleryImageId);
    if (res === "SUCCESS") {
      setValue((prev) => ({ ...prev, gallery_images: prev.gallery_images.filter((g) => g.id !== galleryImageId) }));
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Şəkil silinərkən xəta baş verdi." });
    }
  };

  const removePendingGallery = (idx: number) =>
    setPendingGallery((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!editingId && !value.cafedra_code) {
      Swal.fire({ icon: "warning", title: "Xahiş olunur", text: "Zəhmət olmasa kafedra seçin." });
      return;
    }
    if (!value.az.title.trim() || !value.en.title.trim()) {
      Swal.fire({ icon: "warning", title: "Xahiş olunur", text: "Laboratoriya adı hər iki dildə tələb olunur." });
      return;
    }

    setSubmitting(true);
    try {
      const payload: Laboratory = {
        cafedra_code: value.cafedra_code,
        az: value.az,
        en: value.en,
        room_number: value.room_number,
        authorized_person: value.authorized_person,
        email: value.email,
        phone_number: value.phone_number,
        objectives: value.objectives,
        gallery_images: [],
      };

      if (editingId) {
        const res = await updateLaboratory(editingId, payload);
        if (res !== "SUCCESS") {
          Swal.fire({ icon: "error", title: "Xəta", text: "Laboratoriya yenilənərkən xəta baş verdi." });
          return;
        }
        if (imageFile) await uploadLaboratoryImage(editingId, imageFile);
        Swal.fire({ icon: "success", title: "Uğurla yadda saxlanıldı", showConfirmButton: false, timer: 1400 });
        window.location.reload();
      } else {
        const res: any = await createLaboratory(value.cafedra_code, payload);
        if (res.status !== "SUCCESS" || !res.id) {
          Swal.fire({ icon: "error", title: "Xəta", text: "Laboratoriya əlavə edilərkən xəta baş verdi." });
          return;
        }
        const newId = res.id as number;
        if (imageFile) await uploadLaboratoryImage(newId, imageFile);
        for (const file of pendingGallery) {
          await uploadLaboratoryGalleryImage(newId, file);
        }
        Swal.fire({ icon: "success", title: "Uğurla yaradıldı", showConfirmButton: false, timer: 1400 });
        navigate(`/research-laboratories/${newId}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cafedra + contact */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Kafedra <span className="text-red-500">*</span></Label>
            <select
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:disabled:bg-gray-800"
              value={value.cafedra_code}
              onChange={(e) => setField("cafedra_code", e.target.value)}
              disabled={!!editingId}
            >
              <option value="">-- Kafedra seçin --</option>
              {cafedras.map((c) => {
                const name = c.cafedra_name ?? c.title;
                return (
                  <option key={c.cafedra_code} value={c.cafedra_code}>
                    {name ? `${name} (${c.cafedra_code})` : c.cafedra_code}
                  </option>
                );
              })}
            </select>
            {editingId ? (
              <p className="mt-1 text-xs text-gray-400">Mövcud laboratoriyanın kafedrası dəyişdirilə bilməz.</p>
            ) : null}
          </div>
          <div>
            <Label>Otaq nömrəsi</Label>
            <Input value={value.room_number} onChange={(e) => setField("room_number", e.target.value)} placeholder="Məs: IV bina, 008" />
          </div>
          <div>
            <Label>Məsul şəxs</Label>
            <Input value={value.authorized_person} onChange={(e) => setField("authorized_person", e.target.value)} placeholder="Ad Soyad" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={value.email} onChange={(e) => setField("email", e.target.value)} placeholder="lab@aztu.edu.az" />
          </div>
          <div>
            <Label>Mobil nömrə</Label>
            <Input value={value.phone_number} onChange={(e) => setField("phone_number", e.target.value)} placeholder="+994 ..." />
          </div>
        </div>
      </div>

      {/* Bilingual name + description */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">AZ</p>
          <Label>Laboratoriyanın adı</Label>
          <Input value={value.az.title} onChange={(e) => setTr("az", "title", e.target.value)} placeholder="Laboratoriya adı" />
          <div className="mt-3">
            <Label>Təsviri</Label>
            <Editor key={`az-${editorKey}`} initialContent={value.az.html_content} onUpdate={(html) => setTr("az", "html_content", html)} />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">EN</p>
          <Label>Laboratory name</Label>
          <Input value={value.en.title} onChange={(e) => setTr("en", "title", e.target.value)} placeholder="Laboratory name" />
          <div className="mt-3">
            <Label>Description</Label>
            <Editor key={`en-${editorKey}`} initialContent={value.en.html_content} onUpdate={(html) => setTr("en", "html_content", html)} />
          </div>
        </div>
      </div>

      {/* Objectives (goals) */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Məqsədlər (Goals)</p>
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

      {/* Main image */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Label>Əsas şəkil</Label>
        <div className="flex flex-wrap items-center gap-4">
          {imageFile ? (
            <img src={URL.createObjectURL(imageFile)} alt="" className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
          ) : value.image_url ? (
            <img src={getImageUrl(value.image_url)} alt="" className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
          ) : null}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-white hover:file:bg-brand-600 dark:text-gray-300"
          />
          {imageFile ? <span className="text-xs text-gray-500">Seçildi: {imageFile.name}</span> : null}
        </div>
      </div>

      {/* Gallery */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Qalereya</p>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600">
            {galleryBusy ? <CircularProgress size={14} color="inherit" /> : null}
            Şəkil əlavə et
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { handleGallerySelect(e.target.files); e.currentTarget.value = ""; }}
            />
          </label>
        </div>
        {!editingId && (
          <p className="mb-3 text-xs text-gray-400">Qalereya şəkilləri laboratoriya yaradıldıqdan sonra yüklənəcək.</p>
        )}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {value.gallery_images.map((g) => (
            <div key={`gallery-${g.id}`} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <img src={getImageUrl(g.image_url)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeExistingGallery(g.id)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                title="Sil"
              >
                ×
              </button>
            </div>
          ))}
          {pendingGallery.map((file, idx) => (
            <div key={`pending-${idx}`} className="group relative aspect-square overflow-hidden rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover opacity-80" />
              <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 text-[10px] text-white">Gözləyir</span>
              <button
                type="button"
                onClick={() => removePendingGallery(idx)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                title="Sil"
              >
                ×
              </button>
            </div>
          ))}
          {value.gallery_images.length === 0 && pendingGallery.length === 0 && (
            <p className="col-span-full text-sm text-gray-500 dark:text-gray-400">Hələ heç bir şəkil yoxdur.</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/research-laboratories")} disabled={submitting}>Ləğv et</Button>
        <Button onClick={handleSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}>
          {submitLabel ?? "Yadda saxla"}
        </Button>
      </div>
    </div>
  );
}
