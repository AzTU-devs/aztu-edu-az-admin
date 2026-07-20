import { Link } from "react-router";
import useCountUp from "./useCountUp";

export interface MetricCardProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  /** undefined while the request is in flight, null when genuinely unavailable. */
  value?: number | null;
  loading?: boolean;
  /**
   * Full Tailwind class strings — they are written out literally at each call
   * site so the v4 scanner can see them; never build these by concatenation.
   */
  accentBar: string;
  iconWrap: string;
  badge: string;
}

export default function MetricCard({
  to,
  label,
  icon,
  value,
  loading = false,
  accentBar,
  iconWrap,
  badge,
}: MetricCardProps) {
  const count = useCountUp(loading ? undefined : value);
  const unavailable = !loading && count === null;

  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 dark:border-gray-800 dark:bg-gray-900 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 block"
    >
      <div className={`absolute inset-x-0 top-0 h-[3px] rounded-t-2xl ${accentBar}`} />

      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${iconWrap}`}>
          {icon}
        </div>
        {loading ? (
          <span className="h-4 w-12 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ) : unavailable ? (
          <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            Məlumat yoxdur
          </span>
        ) : (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge}`}>
            Aktiv
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-8 w-20 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ) : (
        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
          {unavailable ? (
            <span className="text-gray-300 dark:text-gray-600">—</span>
          ) : (
            count!.toLocaleString("az-AZ")
          )}
        </h4>
      )}

      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </p>
    </Link>
  );
}
