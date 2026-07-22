import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { CircularProgress } from "@mui/material";
import Swal from "sweetalert2";

import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import {
  getAboutPages,
  publishAboutPage,
  type AboutPageListItem,
} from "../../services/about/aboutService";
import { ABOUT_GROUP_LABELS, ABOUT_GROUP_ORDER } from "./aboutGroups";

/**
 * Index of every screen under the site's "Haqqımızda" dropdown.
 *
 * Grouped exactly the way the public header groups them, so an editor looking
 * for "Prorektorlar" finds it under the same heading they see on the site.
 */
export default function AboutPagesPage() {
  const [pages, setPages] = useState<AboutPageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  // An empty registry and a failed request are different problems with
  // different fixes — seed the pages vs. deploy/reach the API — so they must
  // not collapse into the same "no pages" screen.
  const [failed, setFailed] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAboutPages();
    setFailed(result === "ERROR");
    setPages(result === "ERROR" ? [] : result);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePublish = async (page: AboutPageListItem) => {
    if (page.is_active) {
      const confirm = await Swal.fire({
        title: "Səhifəni dərcdən çıxarmaq?",
        text: "Səhifə saytda görünməyəcək.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Bəli",
        cancelButtonText: "İmtina",
        reverseButtons: true,
      });
      if (!confirm.isConfirmed) return;
    }

    setBusyKey(page.page_key);
    const result = await publishAboutPage(page.page_key, !page.is_active);
    setBusyKey(null);

    if (result !== "SUCCESS") {
      Swal.fire({ icon: "error", title: "Xəta", text: "Vəziyyət dəyişdirilə bilmədi." });
      return;
    }
    void load();
  };

  const grouped = ABOUT_GROUP_ORDER.map((group) => ({
    group,
    label: ABOUT_GROUP_LABELS[group] ?? group,
    items: pages.filter((page) => page.group_key === group),
  })).filter((entry) => entry.items.length > 0);

  // A group_key the dashboard does not know about would otherwise vanish.
  const known = new Set(ABOUT_GROUP_ORDER as readonly string[]);
  const orphans = pages.filter((page) => !known.has(page.group_key));
  if (orphans.length > 0) {
    grouped.push({ group: "other", label: "Digər", items: orphans });
  }

  return (
    <>
      <PageMeta title="Haqqımızda | AzTU Admin" description="Haqqımızda bölməsinin səhifələri" />
      <PageBreadcrumb pageTitle="Haqqımızda" />

      {loading ? (
        <div className="flex justify-center py-20">
          <CircularProgress />
        </div>
      ) : failed ? (
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center dark:border-red-500/30 dark:bg-gray-900">
          <p className="font-medium text-red-600 dark:text-red-400">
            Səhifələr yüklənə bilmədi.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            API cavab vermir və ya{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">/api/about</code>{" "}
            endpoint-i hələ yayımlanmayıb. Backend-i yeniləyin və yenidən cəhd edin.
          </p>
          <div className="mt-4 flex justify-center">
            <Button size="sm" variant="outline" onClick={() => void load()}>
              Yenidən cəhd et
            </Button>
          </div>
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-300">Cədvəllər boşdur.</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sxem yaradılıb, lakin səhifə reyestri hələ doldurulmayıb. Verilənlər bazasında{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">
              migrations_about_pages_seed.sql
            </code>{" "}
            faylını icra edin — və ya serverdə{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">
              python -m app.scripts.seed_about_pages
            </code>
            .
          </p>
          <div className="mt-4 flex justify-center">
            <Button size="sm" variant="outline" onClick={() => void load()}>
              Yenilə
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((entry) => (
            <div key={entry.group}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {entry.label}
              </h2>
              <div className="space-y-3">
                {entry.items.map((page) => (
                  <div
                    key={page.page_key}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-800 dark:text-gray-100">
                        {page.title_az || page.title_en || page.page_key}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        /{page.slug_az ?? page.page_key} · {page.section_count} bölmə
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          page.is_active
                            ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {page.is_active ? "Dərc olunub" : "Qaralama"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyKey === page.page_key}
                        onClick={() => togglePublish(page)}
                      >
                        {page.is_active ? "Dərcdən çıxar" : "Dərc et"}
                      </Button>
                      <Link
                        to={`/about-pages/${page.page_key}`}
                        className="rounded-lg bg-brand-500 px-4 py-3 text-sm text-white transition hover:bg-brand-600"
                      >
                        Redaktə et
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
