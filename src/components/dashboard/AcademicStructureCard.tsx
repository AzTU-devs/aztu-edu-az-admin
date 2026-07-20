import { Link } from "react-router";
import ComponentCard from "../common/ComponentCard";
import type { DashboardAcademicCounts } from "../../types/stats";

const ROWS: { key: keyof DashboardAcademicCounts; label: string; to: string; dot: string }[] = [
  { key: "faculties", label: "Fakültələr", to: "/faculties", dot: "bg-purple-500" },
  { key: "cafedras", label: "Kafedralar", to: "/cafedras", dot: "bg-teal-500" },
  { key: "employees", label: "Əməkdaşlar", to: "/employees", dot: "bg-blue-500" },
  { key: "research_institutes", label: "Elmi tədqiqat institutları", to: "/research-institutes", dot: "bg-emerald-500" },
  { key: "research_laboratories", label: "Elmi laboratoriyalar", to: "/faculties", dot: "bg-amber-500" },
];

interface Props {
  academic?: DashboardAcademicCounts;
  loading?: boolean;
}

export default function AcademicStructureCard({ academic, loading }: Props) {
  return (
    <ComponentCard title="Akademik struktur" desc="Universitetin quruluş göstəriciləri">
      <ul className="divide-y divide-gray-100 dark:divide-gray-800 -my-2">
        {ROWS.map(({ key, label, to, dot }) => {
          const value = academic?.[key];
          return (
            <li key={key}>
              <Link
                to={to}
                className="flex items-center justify-between gap-3 py-3 group"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dot}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {label}
                  </span>
                </span>
                {loading ? (
                  <span className="h-5 w-10 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse flex-shrink-0" />
                ) : typeof value === "number" ? (
                  <span className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0 tabular-nums">
                    {value.toLocaleString("az-AZ")}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-gray-300 dark:text-gray-600 flex-shrink-0">
                    —
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </ComponentCard>
  );
}
