import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";

import { Modal } from "../ui/modal";
import {
    createHonoraryDoctor,
    deleteHonoraryDoctor,
    getHonoraryDoctors,
    setHonoraryDoctorActive,
    updateHonoraryDoctor,
    type HonoraryDoctor,
} from "../../services/honoraryDoctor/honoraryDoctorService";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

/** Stored paths are relative to the API host; absolute URLs pass through. */
const imageUrl = (path?: string | null): string | undefined => {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path)) return path;
    const clean = path.replace(/^\//, "");
    return clean.startsWith("static/") || clean.startsWith("media/")
        ? `${API_BASE}/${clean}`
        : `${API_BASE}/static/${clean}`;
};

type FormState = {
    az_full_name: string;
    en_full_name: string;
    az_description: string;
    en_description: string;
    image: File | null;
    remove_image: boolean;
};

const EMPTY: FormState = {
    az_full_name: "",
    en_full_name: "",
    az_description: "",
    en_description: "",
    image: null,
    remove_image: false,
};

const field =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

export default function HonoraryDoctors() {
    const [doctors, setDoctors] = useState<HonoraryDoctor[] | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<HonoraryDoctor | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        const result = await getHonoraryDoctors();
        setDoctors(result === "ERROR" ? [] : result);
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY);
        setModalOpen(true);
    };

    const openEdit = (doctor: HonoraryDoctor) => {
        setEditing(doctor);
        setForm({
            az_full_name: doctor.az_full_name ?? "",
            en_full_name: doctor.en_full_name ?? "",
            az_description: doctor.az_description ?? "",
            en_description: doctor.en_description ?? "",
            image: null,
            remove_image: false,
        });
        setModalOpen(true);
    };

    const save = async () => {
        if (!form.az_full_name.trim() || !form.en_full_name.trim()) {
            Swal.fire({ icon: "warning", title: "Ad hər iki dildə tələb olunur." });
            return;
        }
        setSaving(true);
        const payload = {
            az_full_name: form.az_full_name.trim(),
            en_full_name: form.en_full_name.trim(),
            az_description: form.az_description.trim(),
            en_description: form.en_description.trim(),
            image: form.image,
            remove_image: form.remove_image,
        };
        const result = editing
            ? await updateHonoraryDoctor(editing.id, payload)
            : await createHonoraryDoctor(payload);
        setSaving(false);

        if (result !== "SUCCESS") {
            Swal.fire({ icon: "error", title: "Xəta", text: "Əməliyyat alınmadı." });
            return;
        }
        setModalOpen(false);
        await load();
    };

    const remove = async (doctor: HonoraryDoctor) => {
        const confirm = await Swal.fire({
            title: "Silinsin?",
            text: doctor.az_full_name ?? "",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Bəli",
            cancelButtonText: "İmtina",
            reverseButtons: true,
        });
        if (!confirm.isConfirmed) return;
        if ((await deleteHonoraryDoctor(doctor.id)) !== "SUCCESS") {
            Swal.fire({ icon: "error", title: "Xəta", text: "Silinmədi." });
            return;
        }
        await load();
    };

    const togglePublish = async (doctor: HonoraryDoctor) => {
        if ((await setHonoraryDoctorActive(doctor.id, !doctor.is_active)) !== "SUCCESS") {
            Swal.fire({ icon: "error", title: "Xəta", text: "Əməliyyat alınmadı." });
            return;
        }
        await load();
    };

    if (doctors === null) {
        return (
            <div className="flex justify-center py-20">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Fəxri Doktorlar</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Saytda avtomatik görünür. Sayı məhdud deyil.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                    <AddIcon fontSize="small" /> Yeni
                </button>
            </div>

            {doctors.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    Hələ heç bir fəxri doktor əlavə edilməyib.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {doctors.map((doctor) => (
                        <div
                            key={doctor.id}
                            className="flex gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                        >
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                {imageUrl(doctor.image) ? (
                                    <img
                                        src={imageUrl(doctor.image)}
                                        alt={doctor.az_full_name ?? ""}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center text-gray-400">
                                        <PersonIcon />
                                    </span>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-gray-800 dark:text-white/90">
                                    {doctor.az_full_name}
                                </p>
                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                    {doctor.en_full_name}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => togglePublish(doctor)}
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                            doctor.is_active
                                                ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                        }`}
                                    >
                                        {doctor.is_active ? "Dərc olunub" : "Qaralama"}
                                    </button>
                                    <button
                                        onClick={() => openEdit(doctor)}
                                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <EditIcon fontSize="small" />
                                    </button>
                                    <button
                                        onClick={() => remove(doctor)}
                                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                className="max-w-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto p-6 sm:p-8"
            >
                <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
                    {editing ? "Fəxri doktoru redaktə et" : "Yeni fəxri doktor"}
                </h4>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">Ad (AZ) *</span>
                            <input
                                className={field}
                                value={form.az_full_name}
                                onChange={(e) => setForm({ ...form, az_full_name: e.target.value })}
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">Ad (EN) *</span>
                            <input
                                className={field}
                                value={form.en_full_name}
                                onChange={(e) => setForm({ ...form, en_full_name: e.target.value })}
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">Təsvir (AZ)</span>
                            <textarea
                                rows={4}
                                className={field}
                                value={form.az_description}
                                onChange={(e) => setForm({ ...form, az_description: e.target.value })}
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">Təsvir (EN)</span>
                            <textarea
                                rows={4}
                                className={field}
                                value={form.en_description}
                                onChange={(e) => setForm({ ...form, en_description: e.target.value })}
                            />
                        </label>
                    </div>

                    <label className="block">
                        <span className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">Şəkil</span>
                        <input
                            type="file"
                            accept="image/*"
                            className={field}
                            onChange={(e) =>
                                setForm({ ...form, image: e.target.files?.[0] ?? null, remove_image: false })
                            }
                        />
                        {editing?.image && !form.image && (
                            <label className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                <input
                                    type="checkbox"
                                    checked={form.remove_image}
                                    onChange={(e) => setForm({ ...form, remove_image: e.target.checked })}
                                />
                                Mövcud şəkli sil
                            </label>
                        )}
                    </label>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={() => setModalOpen(false)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:text-gray-300"
                    >
                        İmtina
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                    >
                        {saving ? "Gözləyin..." : "Yadda saxla"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
