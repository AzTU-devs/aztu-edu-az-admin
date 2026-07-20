import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Pagination, Stack } from "@mui/material";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import ChatSessionFilters, {
  EMPTY_CHAT_FILTERS,
  toChatSessionQuery,
  type ChatSessionFilterState,
} from "../../components/chat/ChatSessionFilters";
import ChatSessionsTable from "../../components/chat/ChatSessionsTable";
import ChatStatsPanel from "../../components/chat/ChatStatsPanel";
import { errorMessage } from "../../components/chat/chatFormat";
import chatAdminService from "../../services/chat/chatAdminService";
import type { ChatSessionListItem, ChatStats } from "../../types/chat";

const PAGE_SIZE = 25;

export default function ChatSessionsPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ChatSessionFilterState>(EMPTY_CHAT_FILTERS);
  const [items, setItems] = useState<ChatSessionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ChatStats | null>(null);

  useEffect(() => {
    chatAdminService.getStats().then(setStats).catch(() => setStats(null));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    chatAdminService
      .listSessions({ page, page_size: PAGE_SIZE, ...toChatSessionQuery(filters) })
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err) => setError(errorMessage(err, "Söhbətlər yüklənərkən xəta baş verdi.")))
      .finally(() => setLoading(false));
  }, [page, filters]);

  /** Free text is debounced; dates and sort apply immediately. */
  useEffect(() => {
    const timer = setTimeout(load, filters.q ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, filters.q]);

  const handleFilterChange = (next: ChatSessionFilterState) => {
    setPage(1);
    setFilters(next);
  };

  const handleReset = () => {
    setPage(1);
    setFilters(EMPTY_CHAT_FILTERS);
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageMeta
        title="Çat monitorinqi | AzTU Admin"
        description="Çatbot söhbətlərinin və istifadə statistikasının izlənməsi"
      />
      <PageBreadcrumb pageTitle="Çat monitorinqi" />

      <div className="space-y-6">
        <ChatStatsPanel stats={stats} loading={stats === null} />

        <ComponentCard title="Filtrlər" desc="Nəticələri tarix aralığı və mesaj mətni üzrə daraldın">
          <ChatSessionFilters
            value={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />
        </ComponentCard>

        <ComponentCard
          title="Söhbətlər"
          desc={
            total > 0
              ? `${total.toLocaleString("az-AZ")} söhbətdən ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                  page * PAGE_SIZE,
                  total
                )} göstərilir`
              : "Söhbət yoxdur"
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
              <ChatSessionsTable
                items={items}
                loading={loading}
                pageSize={PAGE_SIZE}
                onSelect={(sessionId) => navigate(`/chat/sessions/${encodeURIComponent(sessionId)}`)}
              />

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
