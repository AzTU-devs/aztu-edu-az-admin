import apiClient from "../../util/apiClient";
import type {
  ChatSessionListQuery,
  ChatSessionListItem,
  ChatSessionListResponse,
  ChatPaginated,
  ChatStats,
  ChatStatsResponse,
  ChatTranscript,
  ChatTranscriptResponse,
} from "../../types/chat";

/** Blank fields are dropped — the API reads absent as "no filter". */
const clean = (query: ChatSessionListQuery): ChatSessionListQuery => {
  const params: ChatSessionListQuery = {};
  if (query.page) params.page = query.page;
  if (query.page_size) params.page_size = query.page_size;
  if (query.date_from) params.date_from = query.date_from;
  if (query.date_to) params.date_to = query.date_to;
  if (query.q && query.q.trim()) params.q = query.q.trim();
  if (query.sort_by) params.sort_by = query.sort_by;
  if (query.sort_dir) params.sort_dir = query.sort_dir;
  return params;
};

/**
 * Read-only monitoring endpoints, all gated on `chat.read`. Responses carry
 * visitor IPs, so nothing here is persisted client side beyond component state.
 */
const chatAdminService = {
  listSessions: async (
    query: ChatSessionListQuery = {}
  ): Promise<ChatPaginated<ChatSessionListItem>> => {
    const response = await apiClient.get<ChatSessionListResponse>(
      "/api/chat/admin/sessions",
      { params: clean(query) }
    );
    return response.data.data;
  },

  getTranscript: async (
    sessionId: string,
    query: { page?: number; page_size?: number } = {}
  ): Promise<ChatTranscript> => {
    const response = await apiClient.get<ChatTranscriptResponse>(
      `/api/chat/admin/sessions/${encodeURIComponent(sessionId)}/messages`,
      { params: query }
    );
    return response.data.data;
  },

  getStats: async (): Promise<ChatStats> => {
    const response = await apiClient.get<ChatStatsResponse>("/api/chat/admin/stats");
    return response.data.data;
  },
};

export default chatAdminService;
