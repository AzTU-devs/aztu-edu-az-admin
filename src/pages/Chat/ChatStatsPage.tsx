import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import ChatStatsPanel from "../../components/chat/ChatStatsPanel";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { errorMessage, formatBucket, formatDateTime, formatNumber } from "../../components/chat/chatFormat";
import chatAdminService from "../../services/chat/chatAdminService";
import type { ChatGranularity, ChatStats } from "../../types/chat";

const PERIODS: { key: ChatGranularity; title: string; desc: string }[] = [
  { key: "daily", title: "Günlük", desc: "Son 30 gün" },
  { key: "weekly", title: "Həftəlik", desc: "Son 12 həftə" },
  { key: "monthly", title: "Aylıq", desc: "Son 12 ay" },
];

const headerCell =
  "px-5 py-3 text-left text-theme-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400";
const bodyCell = "px-5 py-3 text-sm text-gray-600 dark:text-gray-300";

export default function ChatStatsPage() {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    chatAdminService
      .getStats()
      .then(setStats)
      .catch((err) => setError(errorMessage(err, "Statistika yüklənərkən xəta baş verdi.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  return (
    <>
      <PageMeta
        title="Çat statistikası | AzTU Admin"
        description="Çatbotun günlük, həftəlik və aylıq istifadə göstəriciləri"
      />
      <PageBreadcrumb pageTitle="Çat statistikası" />

      {error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
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
        <div className="space-y-6">
          <ChatStatsPanel stats={stats} loading={loading} />

          {PERIODS.map((period) => (
            <ComponentCard key={period.key} title={period.title} desc={period.desc}>
              <div className="max-w-full overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                    <TableRow>
                      <TableCell isHeader className={headerCell}>
                        Dövr
                      </TableCell>
                      <TableCell isHeader className={headerCell}>
                        Söhbətlər
                      </TableCell>
                      <TableCell isHeader className={headerCell}>
                        Mesajlar
                      </TableCell>
                      <TableCell isHeader className={headerCell}>
                        Unikal IP
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {(stats?.[period.key] ?? []).length === 0 && (
                      <TableRow>
                        <TableCell
                          className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500"
                          colSpan={4}
                        >
                          {loading ? "Yüklənir…" : "Məlumat yoxdur"}
                        </TableCell>
                      </TableRow>
                    )}
                    {(stats?.[period.key] ?? []).map((bucket) => (
                      <TableRow key={bucket.bucket}>
                        <TableCell className="whitespace-nowrap px-5 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                          {formatBucket(bucket.bucket)}
                        </TableCell>
                        <TableCell className={bodyCell}>{formatNumber(bucket.sessions)}</TableCell>
                        <TableCell className={bodyCell}>{formatNumber(bucket.messages)}</TableCell>
                        <TableCell className={bodyCell}>{formatNumber(bucket.unique_ips)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ComponentCard>
          ))}

          {stats?.generated_at && (
            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              Son yenilənmə: {formatDateTime(stats.generated_at)}
            </p>
          )}
        </div>
      )}
    </>
  );
}
