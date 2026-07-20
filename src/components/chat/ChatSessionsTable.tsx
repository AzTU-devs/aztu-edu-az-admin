import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { formatDateTime, formatNumber } from "./chatFormat";
import type { ChatSessionListItem } from "../../types/chat";

interface ChatSessionsTableProps {
  items: ChatSessionListItem[];
  loading?: boolean;
  pageSize?: number;
  onSelect: (sessionId: string) => void;
}

const headerCell =
  "px-5 py-3 text-left text-theme-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400";

export default function ChatSessionsTable({
  items,
  loading = false,
  pageSize = 25,
  onSelect,
}: ChatSessionsTableProps) {
  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-gray-800">
          <TableRow>
            <TableCell isHeader className={headerCell}>
              IP ünvanı
            </TableCell>
            <TableCell isHeader className={headerCell}>
              Başlayıb
            </TableCell>
            <TableCell isHeader className={headerCell}>
              Son aktivlik
            </TableCell>
            <TableCell isHeader className={headerCell}>
              Mesaj
            </TableCell>
            <TableCell isHeader className={headerCell}>
              İlk sual
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {loading &&
            Array.from({ length: Math.min(pageSize, 8) }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell className="px-5 py-4" colSpan={5}>
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                </TableCell>
              </TableRow>
            ))}

          {!loading && items.length === 0 && (
            <TableRow>
              <TableCell
                className="px-5 py-12 text-center text-sm text-gray-400 dark:text-gray-500"
                colSpan={5}
              >
                Uyğun söhbət tapılmadı
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            items.map((item) => (
              <TableRow
                key={item.session_id}
                onClick={() => onSelect(item.session_id)}
                className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
              >
                <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                  {item.ip_address ?? "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(item.started_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(item.last_active_at)}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <Badge size="sm" color={item.message_count > 0 ? "primary" : "light"}>
                    {formatNumber(item.message_count)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="line-clamp-2 break-words">{item.preview ?? "—"}</span>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
