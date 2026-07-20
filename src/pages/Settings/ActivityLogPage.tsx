import { useCallback, useEffect, useMemo, useState } from "react";
import { Pagination, Stack } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import LoginIcon from "@mui/icons-material/Login";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import BlockIcon from "@mui/icons-material/Block";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import ActivityFilters, {
  EMPTY_ACTIVITY_FILTERS,
  toActivityQuery,
  type ActivityFilterState,
} from "../../components/settings/ActivityFilters";
import ActivityTable from "../../components/settings/ActivityTable";
import { formatDateTime, formatRelative } from "../../components/settings/LastLoginCell";
import activityService from "../../services/activity/activityService";
import type { ActivityFilters as ActivityFilterOptions, ActivityItem } from "../../types/rbac";

const PAGE_SIZE = 25;

const errorMessage = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message ?? fallback;
};

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "brand" | "success" | "warning";
}

function SummaryCard({ icon, label, value, hint, tone = "brand" }: SummaryCardProps) {
  const tones = {
    brand: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
    success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
    warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {label}
          </p>
          <p className="mt-1 truncate text-lg font-bold text-gray-900 dark:text-white">{value}</p>
          {hint && (
            <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ActivityLogPage() {
  const [filters, setFilters] = useState<ActivityFilterState>(EMPTY_ACTIVITY_FILTERS);
  const [options, setOptions] = useState<ActivityFilterOptions | null>(null);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    activityService.getFilters().then(setOptions).catch(() => setOptions(null));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    activityService
      .list({ page, page_size: PAGE_SIZE, lang: "az", ...toActivityQuery(filters) })
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err) => setError(errorMessage(err, "Fəaliyyət jurnalı yüklənərkən xəta baş verdi.")))
      .finally(() => setLoading(false));
  }, [page, filters]);

  /** Free text is debounced; every other filter applies immediately. */
  useEffect(() => {
    const timer = setTimeout(load, filters.q ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, filters.q]);

  const handleFilterChange = (next: ActivityFilterState) => {
    setPage(1);
    setFilters(next);
  };

  const handleReset = () => {
    setPage(1);
    setFilters(EMPTY_ACTIVITY_FILTERS);
  };

  /**
   * `admins` from /activity/filters carries `last_login_at`, so the "who was in
   * most recently" card needs no extra request.
   */
  const lastLogin = useMemo(() => {
    const admins = (options?.admins ?? []).filter((admin) => admin.last_login_at);
    if (admins.length === 0) return null;
    return admins.reduce((latest, admin) =>
      new Date(admin.last_login_at as string) > new Date(latest.last_login_at as string)
        ? admin
        : latest
    );
  }, [options]);

  const deniedOnPage = items.filter((item) => item.outcome === "denied").length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageMeta
        title="Fəaliyyət jurnalı | AzTU Admin"
        description="Admin panelində edilən bütün dəyişikliklərin qeydi"
      />
      <PageBreadcrumb pageTitle="Fəaliyyət jurnalı" />

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<LoginIcon fontSize="small" />}
            label="Son giriş"
            value={lastLogin ? lastLogin.username : "—"}
            hint={
              lastLogin
                ? formatRelative(lastLogin.last_login_at) ??
                  formatDateTime(lastLogin.last_login_at)
                : "Hələ giriş qeydə alınmayıb"
            }
            tone="success"
          />
          <SummaryCard
            icon={<PeopleAltIcon fontSize="small" />}
            label="Aktiv adminlər"
            value={String(options?.admins.length ?? 0)}
            hint="Jurnalda qeydi olan hesablar"
          />
          <SummaryCard
            icon={<HistoryIcon fontSize="small" />}
            label="Ümumi qeyd"
            value={total.toLocaleString("az-AZ")}
            hint="Cari filtrlərə uyğun"
          />
          <SummaryCard
            icon={<BlockIcon fontSize="small" />}
            label="İcazə rədd edildi"
            value={String(deniedOnPage)}
            hint="Bu səhifədə"
            tone="warning"
          />
        </div>

        <ComponentCard title="Filtrlər" desc="Nəticələri admin, tarix və əməliyyat üzrə daraldın">
          <ActivityFilters
            value={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
            options={options}
          />
        </ComponentCard>

        <ComponentCard
          title="Qeydlər"
          desc={
            total > 0
              ? `${total.toLocaleString("az-AZ")} qeyddən ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                  page * PAGE_SIZE,
                  total
                )} göstərilir`
              : "Qeyd yoxdur"
          }
        >
          {error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm font-medium text-error-500">{error}</p>
              <button
                type="button"
                onClick={load}
                className="mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
              >
                Yenidən cəhd et
              </button>
            </div>
          ) : (
            <>
              <ActivityTable items={items} loading={loading} pageSize={PAGE_SIZE} />

              {pageCount > 1 && (
                <div className="mt-5 flex justify-center">
                  <Stack spacing={2}>
                    <Pagination
                      count={pageCount}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      shape="rounded"
                      color="primary"
                    />
                  </Stack>
                </div>
              )}
            </>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
