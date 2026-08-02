import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { CircularProgress } from "@mui/material";
import Swal from "sweetalert2";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import {
  deleteOffice,
  getOffices,
  publishOffice,
  type OfficeListItem,
} from "../../services/office/officeService";

/** The Offices & Centres list — every centre, drafts included. */
export default function OfficesList() {
  const navigate = useNavigate();
  const [offices, setOffices] = useState<OfficeListItem[] | null>(null);
  const [error, setError] = useState(false);

  const load = async () => {
    setError(false);
    const result = await getOffices();
    if (result === "ERROR") {
      setError(true);
      setOffices(null);
    } else {
      setOffices(result);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (office: OfficeListItem) => {
    const confirm = await Swal.fire({
      title: "Ofis/mərkəzi silmək?",
      text: office.name_az || office.name_en || "Bu ofis birdəfəlik silinəcək.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "İmtina",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    const result = await deleteOffice(office.id);
    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Silinmədi." });
      return;
    }
    await load();
  };

  const handlePublish = async (office: OfficeListItem) => {
    const next = !office.is_active;
    if (!next) {
      const confirm = await Swal.fire({
        title: "Dərcdən çıxarmaq?",
        text: "Ofis saytda görünməyəcək.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Bəli",
        cancelButtonText: "İmtina",
        reverseButtons: true,
      });
      if (!confirm.isConfirmed) return;
    }
    const result = await publishOffice(office.id, next);
    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Əməliyyat alınmadı." });
      return;
    }
    await load();
  };

  return (
    <>
      <PageMeta title="Ofis və Mərkəzlər | AzTU Admin" description="Ofis və Mərkəzlər" />
      <PageBreadcrumb pageTitle="Ofis və Mərkəzlər" />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {offices ? `${offices.length} ofis/mərkəz` : ""}
        </p>
        <Button size="sm" onClick={() => navigate("/offices/new")}>
          + Yeni ofis/mərkəz
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="font-medium text-gray-700 dark:text-gray-200">Siyahı yüklənə bilmədi.</p>
          <div className="mt-4 flex justify-center">
            <Button size="sm" variant="outline" onClick={() => void load()}>
              Yenidən cəhd et
            </Button>
          </div>
        </div>
      ) : offices === null ? (
        <div className="flex justify-center py-20">
          <CircularProgress />
        </div>
      ) : offices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">Hələ ofis/mərkəz əlavə edilməyib.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3 font-medium">Ad</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {offices.map((office) => (
                <tr
                  key={office.id}
                  className="border-b border-gray-50 last:border-0 dark:border-gray-800/60"
                >
                  <td className="px-5 py-3">
                    <Link
                      to={`/offices/${office.id}`}
                      className="font-medium text-gray-800 hover:text-brand-500 dark:text-gray-100"
                    >
                      {office.name_az || office.name_en || `#${office.id}`}
                    </Link>
                    {office.name_en && office.name_az ? (
                      <span className="block text-xs text-gray-400">{office.name_en}</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">/{office.slug_az}</td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => void handlePublish(office)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        office.is_active
                          ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                      title={office.is_active ? "Dərcdən çıxar" : "Dərc et"}
                    >
                      {office.is_active ? "Dərc olunub" : "Qaralama"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/offices/${office.id}`}
                        className="text-xs font-medium text-brand-500 hover:text-brand-600"
                      >
                        Redaktə
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleDelete(office)}
                        className="text-xs font-medium text-red-500 hover:text-red-600"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
