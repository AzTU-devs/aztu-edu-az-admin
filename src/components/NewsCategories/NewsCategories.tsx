import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CircularProgress } from "@mui/material";
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
    <div className="bg-white dark:bg-transparent text-gray-900 dark:text-gray-100">
      <div className="flex justify-end mb-4">
        <button
          type="button"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          onClick={() => setShowForm((v) => !v)}
        >
          <AddIcon fontSize="small" />
          Yeni kateqoriya
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 space-y-4">
          <h3 className="font-semibold text-lg">Yeni xəbər kateqoriyası</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[15px]">AZ başlıq</Label>
              <Input placeholder="Azerbaijanca başlıq" value={azTitle} onChange={(e) => setAzTitle(e.target.value)} />
            </div>
            <div>
              <Label className="text-[15px]">EN başlıq</Label>
              <Input placeholder="English title" value={enTitle} onChange={(e) => setEnTitle(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              onClick={handleCreate}
              disabled={creating || !azTitle.trim() || !enTitle.trim()}
            >
              {creating ? "Əlavə edilir..." : "Əlavə et"}
            </Button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg"
              onClick={() => { setShowForm(false); setAzTitle(""); setEnTitle(""); }}
            >
              İmtina
            </button>
          </div>
        </div>
      )}

      <div className="border border-gray-200 dark:border-gray-700 flex items-center px-[10px] py-[15px] rounded-[10px] mb-[10px] bg-gray-100 dark:bg-gray-800">
        <p style={{ width: "10%" }}>#ID</p>
        <p style={{ width: "90%" }}>Kateqoriya adı</p>
      </div>

      {loading ? (
        <>
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[20px] mb-[10px] bg-white dark:bg-gray-800 animate-pulse">
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6" style={{ width: "10%" }}></div>
              <div className="bg-gray-300 dark:bg-gray-600 rounded h-6 ml-4" style={{ width: "88%" }}></div>
            </div>
          ))}
        </>
      ) : error ? (
        <div className="text-center text-red-500 dark:text-red-400 py-10">{error}</div>
      ) : categories.length > 0 ? (
        categories.map((cat) => (
          <div
            key={cat.category_id}
            className="flex items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-[10px] py-[15px] mb-[10px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <p className="font-bold text-[16px] text-gray-500 dark:text-gray-400" style={{ width: "10%" }}>
              #{cat.category_id}
            </p>
            <p className="text-[16px] text-gray-800 dark:text-gray-200" style={{ width: "90%" }}>
              {cat.title}
            </p>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">Kateqoriya yoxdur</div>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <CircularProgress size={28} />
        </div>
      )}
    </div>
  );
}
