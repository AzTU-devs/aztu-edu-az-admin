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
    <div className="bg-white dark:bg-transparent text-gray-900 dark:text-gray-100">
      {/* Upload new hero */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-[10px] p-4 mb-6 bg-gray-50 dark:bg-gray-800">
        <p className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-200">Yeni hero yüklə</p>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            ref={newVideoRef}
            type="file"
            accept="video/*"
            onChange={(e) => setNewVideo(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-[6px] file:border-0 file:text-sm file:font-semibold file:bg-brand-500 file:text-white hover:file:bg-brand-600 cursor-pointer"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newVideo || creating}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-[6px] transition-colors"
          >
            {creating ? <CircularProgress size={16} sx={{ color: "white" }} /> : null}
            Yüklə
          </button>
        </div>
      </div>

      {/* Header row */}
      <div className="border border-gray-200 dark:border-gray-700 flex items-center px-[10px] py-[15px] rounded-[10px] mb-[10px] bg-gray-100 dark:bg-gray-800">
        <p style={{ width: "8%" }}>ID</p>
        <p style={{ width: "32%" }}>Video</p>
        <p style={{ width: "20%" }}>Yaradılma tarixi</p>
        <p style={{ width: "12%", textAlign: "center" }}>Status</p>
        <p style={{ width: "28%", textAlign: "right" }}>Əməliyyatlar</p>
      </div>

      {loading ? (
        <>
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[20px] mb-[10px] bg-white dark:bg-gray-800 animate-pulse"
            >
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "8%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-12 ml-2" style={{ width: "32%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 ml-2" style={{ width: "20%" }}></div>
              <div className="flex justify-center ml-2" style={{ width: "12%" }}>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 w-16"></div>
              </div>
              <div className="flex justify-end gap-2 ml-2" style={{ width: "28%" }}>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-10"></div>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-10"></div>
                <div className="bg-gray-300 dark:bg-gray-600 rounded h-10 w-10"></div>
              </div>
            </div>
          ))}
        </>
      ) : error ? (
        <div className="text-center text-red-500 dark:text-red-400 py-10">{error}</div>
      ) : heroes.length > 0 ? (
        heroes.map((hero) => (
          <div
            key={hero.hero_id}
            className="flex items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[12px] mb-[10px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <p className="font-bold text-[15px] text-gray-600 dark:text-gray-100" style={{ width: "8%" }}>
              {hero.hero_id}
            </p>

            <div style={{ width: "32%" }}>
              <video
                src={`${API_BASE_URL}/${hero.video}`}
                className="h-16 rounded-[6px] object-cover"
                muted
                preload="metadata"
              />
            </div>

            <p className="text-[13px] text-gray-500 dark:text-gray-400" style={{ width: "20%" }}>
              {new Date(hero.created_at).toLocaleDateString("az-AZ")}
            </p>

            <div style={{ width: "12%", display: "flex", justifyContent: "center" }}>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                hero.is_active
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              }`}>
                {hero.is_active ? "Aktiv" : "Deaktiv"}
              </span>
            </div>

            <div className="flex justify-end items-center gap-2 flex-wrap" style={{ width: "28%" }}>
              {/* Update video */}
              <label className="bg-yellow-400 p-[8px] rounded-[5px] cursor-pointer flex items-center" title="Videonu dəyiş">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  ref={(el) => { updateVideoRefs.current[hero.hero_id] = el; }}
                  onChange={() => handleUpdate(hero.hero_id)}
                />
                {updatingId === hero.hero_id ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  <EditIcon sx={{ color: "white", fontSize: "22px" }} />
                )}
              </label>

              {/* Toggle active */}
              <button
                type="button"
                className={`p-[8px] rounded-[5px] flex justify-center items-center ${
                  hero.is_active ? "bg-orange-500" : "bg-green-500"
                }`}
                onClick={() => handleToggle(hero)}
                disabled={togglingId === hero.hero_id}
                title={hero.is_active ? "Deaktiv et" : "Aktiv et"}
              >
                {togglingId === hero.hero_id ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : hero.is_active ? (
                  <CancelIcon sx={{ color: "white", fontSize: "22px" }} />
                ) : (
                  <CheckCircleIcon sx={{ color: "white", fontSize: "22px" }} />
                )}
              </button>

              {/* Delete */}
              <button
                type="button"
                className="bg-red-500 p-[8px] rounded-[5px] flex justify-center items-center"
                onClick={() => handleDelete(hero.hero_id)}
                disabled={deletingId === hero.hero_id}
                title="Sil"
              >
                {deletingId === hero.hero_id ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  <DeleteIcon sx={{ color: "white", fontSize: "22px" }} />
                )}
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">Hero yoxdur</div>
      )}
    </div>
  );
}
