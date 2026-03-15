import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AddIcon from "@mui/icons-material/Add";
import {
  NewsCategory,
  getNewsCategories,
  createNewsCategory,
} from "../../services/newsCategory/newsCategoryService";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function NewsCategories() {
  const lang = "az";
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [azTitle, setAzTitle] = useState("");
  const [enTitle, setEnTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    setError(null);
    getNewsCategories(lang)
      .then((res) => {
        if (Array.isArray(res)) {
          setCategories(res);
        } else if (res === "NO CONTENT") {
          setCategories([]);
        } else {
          setError("Kateqoriyalar yüklənərkən xəta baş verdi.");
          setCategories([]);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!azTitle.trim() || !enTitle.trim()) return;

    setCreating(true);
    const result = await createNewsCategory({ az_title: azTitle, en_title: enTitle });
    setCreating(false);

    if (result === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Kateqoriya əlavə edildi", showConfirmButton: false, timer: 1500 });
      setAzTitle("");
      setEnTitle("");
      setShowForm(false);
      fetchCategories();
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Kateqoriya əlavə edilərkən xəta baş verdi", timer: 2000, showConfirmButton: false });
    }
  };

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors shadow-sm"
          onClick={() => setShowForm((v) => !v)}
        >
          <AddIcon fontSize="small" />
          Yeni kateqoriya
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="overflow-hidden rounded-2xl border border-brand-100 dark:border-brand-900/30 bg-brand-50/50 dark:bg-brand-900/10 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Yeni xəbər kateqoriyası</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">AZ başlıq</Label>
              <Input placeholder="Azerbaijanca başlıq" value={azTitle} onChange={(e) => setAzTitle(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">EN başlıq</Label>
              <Input placeholder="English title" value={enTitle} onChange={(e) => setEnTitle(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600"
              onClick={handleCreate}
              disabled={creating || !azTitle.trim() || !enTitle.trim()}
            >
              {creating ? "Əlavə edilir..." : "Əlavə et"}
            </Button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => { setShowForm(false); setAzTitle(""); setEnTitle(""); }}
            >
              İmtina
            </button>
          </div>
        </div>
      )}

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "10%" }}>#ID</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "90%" }}>Kateqoriya adı</p>
        </div>

        {loading ? (
          <div>
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="flex items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800 last:border-b-0 animate-pulse">
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-lg" style={{ width: "8%" }}></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full ml-4" style={{ width: "50%" }}></div>
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
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <div key={cat.category_id} className="flex items-center px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors duration-150">
              <div style={{ width: "10%" }}>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono text-xs font-semibold">
                  #{cat.category_id}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200" style={{ width: "90%" }}>{cat.title}</p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kateqoriya yoxdur</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hələ heç bir kateqoriya əlavə edilməyib</p>
          </div>
        )}
      </div>
    </div>
  );
}
