import ComponentCard from "../common/ComponentCard";
import type { DashboardVisitors, VisitorWindow } from "../../types/stats";

const WINDOWS: { key: keyof Omit<DashboardVisitors, "daily">; label: string }[] = [
  { key: "today", label: "Bu gün" },
  { key: "last_7_days", label: "Son 7 gün" },
  { key: "last_30_days", label: "Son 30 gün" },
];

function Figure({
  value,
  loading,
  tone,
}: {
  value?: number;
  loading?: boolean;
  tone: string;
}) {
  if (loading) {
    return <span className="block h-6 w-14 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  }
  if (typeof value !== "number") {
    return <span className="text-xl font-bold text-gray-300 dark:text-gray-600">—</span>;
  }
  return (
    <span className={`text-xl font-bold tabular-nums ${tone}`}>
      {value.toLocaleString("az-AZ")}
    </span>
  );
}

interface Props {
  visitors?: DashboardVisitors;
  loading?: boolean;
}

export default function VisitorsCard({ visitors, loading }: Props) {
  return (
    <ComponentCard title="Saytın ziyarətçiləri" desc="Baxış sayı və unikal ziyarətçilər">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {WINDOWS.map(({ key, label }) => {
          const window: VisitorWindow | undefined = visitors?.[key];
          return (
            <div
              key={key}
              className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 p-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {label}
              </p>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Baxış</span>
                  <Figure
                    value={window?.views}
                    loading={loading}
                    tone="text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Unikal ziyarətçi
                  </span>
                  <Figure
                    value={window?.uniques}
                    loading={loading}
                    tone="text-brand-600 dark:text-brand-400"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ComponentCard>
  );
}
