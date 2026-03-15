import Swal from "sweetalert2";
import { useEffect, useRef, useState } from "react";
import { CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  Hero,
  getHeroes,
  createHero,
  updateHero,
  activateHero,
  deactivateHero,
  deleteHero,
} from "../../services/hero/heroService";
import { API_BASE_URL } from "../../util/apiClient";

export default function Heroes() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const newVideoRef = useRef<HTMLInputElement>(null);

  const updateVideoRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const fetchHeroes = () => {
    setLoading(true);
    setError(null);
    getHeroes()
      .then((res) => {
        if (res && typeof res === "object" && "heroes" in res) {
          setHeroes(res.heroes);
        } else if (res === "NO CONTENT") {
          setHeroes([]);
        } else {
          setError("Herolar yüklənərkən xəta baş verdi.");
          setHeroes([]);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  const handleCreate = async () => {
    if (!newVideo) return;
    setCreating(true);
    const result = await createHero(newVideo);
    setCreating(false);
    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Hero uğurla yaradıldı", showConfirmButton: false, timer: 1500 });
      setNewVideo(null);
      if (newVideoRef.current) newVideoRef.current.value = "";
      fetchHeroes();
    } else {
      Swal.fire({ icon: "error", title: "Xəta baş verdi", showConfirmButton: false, timer: 1500 });
    }
  };

  const handleUpdate = async (heroId: number) => {
    const input = updateVideoRefs.current[heroId];
    const file = input?.files?.[0];
    if (!file) return;
    setUpdatingId(heroId);
    const result = await updateHero(heroId, file);
    setUpdatingId(null);
    if (input) input.value = "";
    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Video yeniləndi", showConfirmButton: false, timer: 1500 });
      fetchHeroes();
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Hero tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Xəta baş verdi", showConfirmButton: false, timer: 1500 });
    }
  };

  const handleToggle = async (hero: Hero) => {
    setTogglingId(hero.hero_id);
    const result = hero.is_active
      ? await deactivateHero(hero.hero_id)
      : await activateHero(hero.hero_id);
    setTogglingId(null);
    if (result === "SUCCESS") {
      Swal.fire({
        icon: "success",
        title: hero.is_active ? "Deaktiv edildi" : "Aktiv edildi",
        showConfirmButton: false,
        timer: 1500,
      });
      fetchHeroes();
    } else {
      Swal.fire({ icon: "error", title: "Xəta baş verdi", showConfirmButton: false, timer: 1500 });
    }
  };

  const handleDelete = async (heroId: number) => {
    const confirmResult = await Swal.fire({
      title: "Heronu silmək istədiyinizə əminsiniz?",
      text: "Bu əməliyyat geri alına bilməz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
      reverseButtons: true,
    });
    if (!confirmResult.isConfirmed) return;
    setDeletingId(heroId);
    const result = await deleteHero(heroId);
    setDeletingId(null);
    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Uğurla silindi", showConfirmButton: false, timer: 1500 });
      setHeroes((prev) => prev.filter((h) => h.hero_id !== heroId));
    } else if (result === "NOT FOUND") {
      Swal.fire({ icon: "error", title: "Hero tapılmadı", showConfirmButton: false, timer: 1500 });
    } else {
      Swal.fire({ icon: "error", title: "Gözlənilməz xəta", showConfirmButton: false, timer: 1500 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload new hero */}
      <div className="overflow-hidden rounded-2xl border border-brand-100 dark:border-brand-900/30 bg-brand-50/50 dark:bg-brand-900/10 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/30">
            <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          Yeni hero video yüklə
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            ref={newVideoRef}
            type="file"
            accept="video/*"
            onChange={(e) => setNewVideo(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-500 file:text-white hover:file:bg-brand-600 cursor-pointer"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newVideo || creating}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            {creating ? <CircularProgress size={14} sx={{ color: "white" }} /> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            )}
            Yüklə
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        {/* Header */}
        <div className="flex items-center px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "7%" }}>#ID</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "38%" }}>Video</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "22%" }}>Yaradılma tarixi</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "13%" }}>Status</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "20%" }}>Əməliyyatlar</p>
        </div>

        {loading ? (
          <div>
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 animate-pulse">
                <div className="h-5 w-8 bg-gray-100 dark:bg-gray-800 rounded-lg" style={{ width: "7%" }} />
                <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl mr-2" style={{ width: "36%" }} />
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full" style={{ width: "20%" }} />
                <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-full ml-4" />
                <div className="flex justify-end gap-2 ml-auto">
                  <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-11 h-11 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : heroes.length > 0 ? (
          heroes.map((hero) => (
            <div
              key={hero.hero_id}
              className="flex items-center px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-150"
            >
              {/* ID */}
              <div style={{ width: "7%" }}>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono text-xs font-semibold">
                  #{hero.hero_id}
                </span>
              </div>

              {/* Video preview */}
              <div style={{ width: "38%" }} className="pr-4">
                <video
                  src={`${API_BASE_URL}/${hero.video}`}
                  className="h-16 w-full max-w-[200px] rounded-xl object-cover bg-gray-100 dark:bg-gray-800"
                  muted
                  preload="metadata"
                />
              </div>

              {/* Date */}
              <p className="text-sm text-gray-500 dark:text-gray-400" style={{ width: "22%" }}>
                {new Date(hero.created_at).toLocaleDateString("az-AZ")}
              </p>

              {/* Status */}
              <div style={{ width: "13%" }}>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  hero.is_active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${hero.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                  {hero.is_active ? "Aktiv" : "Deaktiv"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end items-center gap-1.5" style={{ width: "20%" }}>
                {/* Update video */}
                <label
                  className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer transition-colors"
                  title="Videonu dəyiş"
                >
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    ref={(el) => { updateVideoRefs.current[hero.hero_id] = el; }}
                    onChange={() => handleUpdate(hero.hero_id)}
                  />
                  {updatingId === hero.hero_id ? (
                    <CircularProgress size={18} sx={{ color: "#f59e0b" }} />
                  ) : (
                    <EditIcon sx={{ fontSize: 18 }} />
                  )}
                </label>

                {/* Toggle active */}
                <button
                  type="button"
                  className={`p-1.5 rounded-lg transition-colors ${
                    hero.is_active
                      ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => handleToggle(hero)}
                  disabled={togglingId === hero.hero_id}
                  title={hero.is_active ? "Deaktiv et" : "Aktiv et"}
                >
                  {togglingId === hero.hero_id ? (
                    <CircularProgress size={18} sx={{ color: "currentColor" }} />
                  ) : hero.is_active ? (
                    <CheckCircleIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <CancelIcon sx={{ fontSize: 18 }} />
                  )}
                </button>

                {/* Delete */}
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  onClick={() => handleDelete(hero.hero_id)}
                  disabled={deletingId === hero.hero_id}
                  title="Sil"
                >
                  {deletingId === hero.hero_id ? (
                    <CircularProgress size={18} sx={{ color: "#ef4444" }} />
                  ) : (
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Video yoxdur</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hələ heç bir hero video əlavə edilməyib</p>
          </div>
        )}
      </div>
    </div>
  );
}
