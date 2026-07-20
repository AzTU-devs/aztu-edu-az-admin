import { Link } from "react-router";
import ComponentCard from "../common/ComponentCard";
import { formatDateTime, formatRelative } from "../settings/LastLoginCell";
import type { ActivityItem } from "../../types/rbac";

interface Props {
  items?: ActivityItem[];
  loading?: boolean;
  /** The server could not read the activity log at all (e.g. table not migrated). */
  unavailable?: boolean;
}

export default function RecentActivityPanel({ items, loading, unavailable }: Props) {
  return (
    <ComponentCard
      title="Son admin fəaliyyəti"
      desc="Panel üzərində aparılan son əməliyyatlar"
      actions={
        <Link
          to="/settings/activity"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Hamısına bax
        </Link>
      }
    >
      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
              <span className="flex-1 space-y-1.5">
                <span className="block h-3.5 w-3/4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <span className="block h-3 w-2/5 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              </span>
            </li>
          ))}
        </ul>
      ) : unavailable ? (
        <div className="py-8 text-center text-sm text-amber-600 dark:text-amber-400">
          Fəaliyyət jurnalı hazırda əlçatan deyil
          <span className="mt-1 block text-xs text-gray-400 dark:text-gray-500">
            Verilənlər bazası miqrasiyası tamamlanmayıb
          </span>
        </div>
      ) : !items?.length ? (
        <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          Hələ heç bir fəaliyyət qeydə alınmayıb
        </div>
      ) : (
        <ul className="space-y-3.5">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span
                className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                  item.outcome === "denied" ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug">
                  {item.message_az}
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    {item.admin_username}
                  </span>
                  {" · "}
                  <span title={formatDateTime(item.created_at)}>
                    {formatRelative(item.created_at) ?? formatDateTime(item.created_at)}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ComponentCard>
  );
}
