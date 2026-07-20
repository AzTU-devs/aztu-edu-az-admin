import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BlockIcon from "@mui/icons-material/Block";
import Badge from "../ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { formatDateTime, formatTime } from "./LastLoginCell";
import type { ActivityItem } from "../../types/rbac";

const headClass =
  "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500";

const statusColor = (item: ActivityItem) => {
  if (item.outcome === "denied") return "warning" as const;
  if (item.status_code >= 500) return "error" as const;
  if (item.status_code >= 400) return "error" as const;
  return "success" as const;
};

const initials = (username: string) => username.slice(0, 2).toLocaleUpperCase("az");

interface ActivityTableProps {
  items: ActivityItem[];
  loading?: boolean;
  pageSize?: number;
}

/**
 * `message_az` is rendered server side from the action key plus the target label,
 * so the row reads as a sentence. The raw `meta` stays behind the expander — it is
 * a whitelisted field snapshot, never a request body.
 */
export default function ActivityTable({
  items,
  loading = false,
  pageSize = 25,
}: ActivityTableProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (id: number) => setExpanded((current) => (current === id ? null : id));

  if (loading) {
    return (
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {[...Array(Math.min(pageSize, 10))].map((_, index) => (
          <div key={index} className="flex animate-pulse items-center gap-4 px-5 py-4">
            <div className="h-9 w-9 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 flex-1 rounded-lg bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-24 rounded-lg bg-gray-100 dark:bg-gray-800" />
            <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <BlockIcon className="text-gray-400" fontSize="small" />
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Qeyd tapılmadı</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Seçilmiş filtrlərə uyğun fəaliyyət yoxdur
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/50">
          <TableRow>
            <TableCell isHeader className={`${headClass} w-40`}>
              Tarix
            </TableCell>
            <TableCell isHeader className={`${headClass} w-44`}>
              Admin
            </TableCell>
            <TableCell isHeader className={headClass}>
              Əməliyyat
            </TableCell>
            <TableCell isHeader className={`${headClass} w-56`}>
              Obyekt
            </TableCell>
            <TableCell isHeader className={`${headClass} w-32`}>
              IP
            </TableCell>
            <TableCell isHeader className={`${headClass} w-32`}>
              Status
            </TableCell>
            <TableCell isHeader className={`${headClass} w-12`}>
              <span className="sr-only">Detallar</span>
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => {
            const isOpen = expanded === item.id;
            const denied = item.outcome === "denied";

            return [
              <TableRow
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`cursor-pointer border-b border-gray-50 transition-colors last:border-b-0 hover:bg-gray-50/60 dark:border-gray-800 dark:hover:bg-gray-800/40 ${
                  isOpen ? "bg-gray-50/80 dark:bg-gray-800/50" : ""
                }`}
              >
                <TableCell className="px-5 py-3.5 align-top">
                  <p className="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200">
                    {formatDateTime(item.created_at)}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-gray-400 dark:text-gray-500">
                    {formatTime(item.created_at)}
                  </p>
                </TableCell>

                <TableCell className="px-5 py-3.5 align-top">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                      {initials(item.admin_username)}
                    </span>
                    <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                      {item.admin_username}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-3.5 align-top">
                  <p className="text-sm text-gray-700 dark:text-gray-200">{item.message_az}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-gray-400 dark:text-gray-500">
                    {item.action_key}
                  </p>
                </TableCell>

                <TableCell className="px-5 py-3.5 align-top">
                  {item.target_label || item.target_id ? (
                    <>
                      <p className="truncate text-sm text-gray-600 dark:text-gray-300">
                        {item.target_label ?? "—"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-gray-400 dark:text-gray-500">
                        {item.target_type}
                        {item.target_id ? `#${item.target_id}` : ""}
                      </p>
                    </>
                  ) : (
                    <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
                  )}
                </TableCell>

                <TableCell className="px-5 py-3.5 align-top">
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    {item.ip ?? "—"}
                  </span>
                </TableCell>

                <TableCell className="px-5 py-3.5 align-top">
                  <Badge size="sm" color={statusColor(item)}>
                    {denied ? "İcazə yox" : item.status_code}
                  </Badge>
                </TableCell>

                <TableCell className="px-5 py-3.5 align-top">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-label="Detalları göstər"
                    className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-200"
                  >
                    <ExpandMoreIcon
                      fontSize="small"
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </TableCell>
              </TableRow>,

              isOpen ? (
                <TableRow
                  key={`${item.id}-meta`}
                  className="border-b border-gray-50 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-800/30"
                >
                  <TableCell colSpan={7} className="px-5 pb-5 pt-0">
                    <div className="grid grid-cols-1 gap-4 pt-4 lg:grid-cols-3">
                      <dl className="space-y-2 text-xs">
                        <div className="flex gap-2">
                          <dt className="w-24 shrink-0 text-gray-400 dark:text-gray-500">Metod</dt>
                          <dd className="font-mono text-gray-700 dark:text-gray-200">
                            {item.method}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="w-24 shrink-0 text-gray-400 dark:text-gray-500">Ünvan</dt>
                          <dd className="break-all font-mono text-gray-700 dark:text-gray-200">
                            {item.path}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="w-24 shrink-0 text-gray-400 dark:text-gray-500">Bölmə</dt>
                          <dd className="font-mono text-gray-700 dark:text-gray-200">
                            {item.domain}
                          </dd>
                        </div>
                      </dl>

                      <dl className="space-y-2 text-xs">
                        <div className="flex gap-2">
                          <dt className="w-24 shrink-0 text-gray-400 dark:text-gray-500">Nəticə</dt>
                          <dd className="text-gray-700 dark:text-gray-200">
                            {denied ? "İcazə verilmədi" : "Uğurlu"} ({item.status_code})
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="w-24 shrink-0 text-gray-400 dark:text-gray-500">Brauzer</dt>
                          <dd className="break-all text-gray-600 dark:text-gray-300">
                            {item.user_agent ?? "—"}
                          </dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="w-24 shrink-0 text-gray-400 dark:text-gray-500">EN</dt>
                          <dd className="text-gray-600 dark:text-gray-300">{item.message_en}</dd>
                        </div>
                      </dl>

                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                          Əlavə məlumat
                        </p>
                        <pre className="max-h-52 overflow-auto rounded-xl border border-gray-100 bg-white p-3 font-mono text-[11px] leading-relaxed text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                          {item.meta ? JSON.stringify(item.meta, null, 2) : "—"}
                        </pre>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null,
            ];
          })}
        </TableBody>
      </Table>
    </div>
  );
}
