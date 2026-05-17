import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  NewsCategory,
  getNewsCategories,
  createNewsCategory,
  updateNewsCategory,
  deleteNewsCategory,
  getNewsCategoryDetails,
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [azTitle, setAzTitle] = useState("");
  const [enTitle, setEnTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const resetForm = () => {
    setAzTitle("");
    setEnTitle("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!azTitle.trim() || !enTitle.trim()) return;
    setSubmitting(true);
    const result = editingId
      ? await updateNewsCategory(editingId, { az_title: azTitle, en_title: enTitle })
      : await createNewsCategory({ az_title: azTitle, en_title: enTitle });
    setSubmitting(false);

    if (result === "SUCCESS") {
      Swal.fire({
        icon: "success",
        title: editingId ? "Kateqoriya yeniləndi" : "Kateqoriya əlavə edildi",
        showConfirmButton: false,
        timer: 1500,
      });
      resetForm();
      fetchCategories();
    } else if (result === "EXISTS") {
      Swal.fire({ icon: "warning", title: "Bu kateqoriya artıq mövcuddur", timer: 2000, showConfirmButton: false });
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Əməliyyat zamanı xəta baş verdi", timer: 2000, showConfirmButton: false });
    }
  };

  const handleEdit = async (categoryId: number) => {
    const detail = await getNewsCategoryDetails(categoryId);
    if (detail === "ERROR" || typeof detail === "string") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Məlumat alına bilmədi", timer: 2000, showConfirmButton: false });
      return;
    }
    setEditingId(categoryId);
    setAzTitle(detail.az_title || "");
    setEnTitle(detail.en_title || "");
    setShowForm(true);
  };

  const handleDelete = async (cat: NewsCategory) => {
    if ((cat.news_count ?? 0) > 0) {
      Swal.fire({
        icon: "warning",
        title: "Silmək olmaz",
        text: `Bu kateqoriyada ${cat.news_count} xəbər var. Əvvəlcə xəbərləri silin və ya başqa kateqoriyaya köçürün.`,
      });
      return;
    }
    const result = await Swal.fire({
      icon: "warning",
      title: "Əminsiniz?",
      text: `"${cat.title}" kateqoriyası silinəcək`,
      showCancelButton: true,
      confirmButtonText: "Sil",
      cancelButtonText: "İmtina",
      confirmButtonColor: "#d33",
    });
    if (!result.isConfirmed) return;

    const res = await deleteNewsCategory(cat.category_id);
    if (res === "SUCCESS") {
      Swal.fire({ icon: "success", title: "Silindi", timer: 1500, showConfirmButton: false });
      fetchCategories();
    } else if (res === "HAS_NEWS") {
      Swal.fire({ icon: "warning", title: "Silmək olmaz", text: "Bu kateqoriyada xəbərlər mövcuddur." });
    } else {
      Swal.fire({ icon: "error", title: "Xəta", text: "Silmə zamanı xəta baş verdi", timer: 2000, showConfirmButton: false });
    }
  };

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors shadow-sm"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
        >
          <AddIcon fontSize="small" />
          {editingId ? "Redaktə" : "Yeni kateqoriya"}
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="overflow-hidden rounded-2xl border border-brand-100 dark:border-brand-900/30 bg-brand-50/50 dark:bg-brand-900/10 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {editingId ? "Kateqoriyanı redaktə et" : "Yeni xəbər kateqoriyası"}
          </h3>
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
              onClick={handleSubmit}
              disabled={submitting || !azTitle.trim() || !enTitle.trim()}
            >
              {submitting ? "Yadda saxlanılır..." : editingId ? "Yenilə" : "Əlavə et"}
            </Button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={resetForm}
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
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "55%" }}>Kateqoriya adı</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ width: "20%" }}>Xəbər sayı</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right" style={{ width: "15%" }}>Əməliyyatlar</p>
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
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200" style={{ width: "55%" }}>{cat.title}</p>
              <div style={{ width: "20%" }}>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                  {cat.news_count ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end" style={{ width: "15%" }}>
                <button
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-brand-600 transition-colors"
                  onClick={() => handleEdit(cat.category_id)}
                  title="Redaktə"
                >
                  <EditIcon fontSize="small" />
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded-lg transition-colors ${(cat.news_count ?? 0) > 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-red-50 hover:text-red-600"}`}
                  onClick={() => handleDelete(cat)}
                  disabled={(cat.news_count ?? 0) > 0}
                  title={(cat.news_count ?? 0) > 0 ? "Xəbərlər var, silinə bilməz" : "Sil"}
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kateqoriya yoxdur</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hələ heç bir kateqoriya əlavə edilməyib</p>
          </div>
        )}
      </div>
    </div>
  );
}
