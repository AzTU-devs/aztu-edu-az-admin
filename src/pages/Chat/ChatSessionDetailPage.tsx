import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Pagination, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import ChatTranscript from "../../components/chat/ChatTranscript";
import { errorMessage, formatDateTime, formatNumber } from "../../components/chat/chatFormat";
import chatAdminService from "../../services/chat/chatAdminService";
import type { ChatTranscript as ChatTranscriptData } from "../../types/chat";

const PAGE_SIZE = 50;

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium text-gray-800 dark:text-white/90">{value}</p>
    </div>
  );
}

export default function ChatSessionDetailPage() {
  const { session_id } = useParams<{ session_id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ChatTranscriptData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!session_id) return;
    setLoading(true);
    setError(null);
    chatAdminService
      .getTranscript(session_id, { page, page_size: PAGE_SIZE })
      .then(setData)
      .catch((err) => setError(errorMessage(err, "Söhbət yüklənərkən xəta baş verdi.")))
      .finally(() => setLoading(false));
  }, [session_id, page]);

  useEffect(load, [load]);

  const session = data?.session;
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageMeta
        title="Söhbət transkripti | AzTU Admin"
        description="Çatbot söhbətinin tam yazışması"
      />
      <PageBreadcrumb pageTitle="Söhbət transkripti" />

      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/chat/sessions")}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
          Söhbətlərə qayıt
        </button>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetaItem label="IP ünvanı" value={session?.ip_address ?? "—"} />
            <MetaItem label="Başlayıb" value={formatDateTime(session?.started_at)} />
            <MetaItem label="Son aktivlik" value={formatDateTime(session?.last_active_at)} />
            <MetaItem label="Mesaj sayı" value={formatNumber(session?.message_count)} />
          </div>
          <p className="mt-4 truncate border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
            Sessiya: {session?.session_id ?? session_id ?? "—"}
          </p>
        </div>

        <ComponentCard
          title="Yazışma"
          desc={total > 0 ? `${formatNumber(total)} mesaj, xronoloji sıra ilə` : "Mesaj yoxdur"}
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
              <ChatTranscript messages={data?.items ?? []} loading={loading} />

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
