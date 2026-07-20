/**
 * Mirrors /api/chat/admin/*. Every response is wrapped in the house
 * `{ status_code, data }` envelope, and every one of them carries visitor IP
 * addresses — treat the payloads as personal data and never cache them.
 */

export interface ChatApiData<T> {
  status_code: number;
  data: T;
}

export interface ChatPaginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/* ── sessions ──────────────────────────────────────────────────────────── */

export interface ChatSessionListItem {
  session_id: string;
  ip_address: string | null;
  started_at: string | null;
  last_active_at: string | null;
  message_count: number;
  /** First user message, whitespace-collapsed and truncated server side. */
  preview: string | null;
}

export type ChatSessionSortBy = "last_active_at" | "started_at";
export type ChatSortDir = "asc" | "desc";

export interface ChatSessionListQuery {
  page?: number;
  page_size?: number;
  date_from?: string;
  date_to?: string;
  q?: string;
  sort_by?: ChatSessionSortBy;
  sort_dir?: ChatSortDir;
}

export type ChatSessionListResponse = ChatApiData<ChatPaginated<ChatSessionListItem>>;

/* ── transcript ────────────────────────────────────────────────────────── */

export type ChatRole = "user" | "assistant";

export interface ChatTranscriptMessage {
  id: number;
  role: ChatRole | string;
  /** Visitor-submitted text. Render as plain text only — never as HTML. */
  content: string;
  created_at: string | null;
}

export interface ChatTranscriptSession {
  session_id: string;
  ip_address: string | null;
  started_at: string | null;
  last_active_at: string | null;
  message_count: number;
}

export interface ChatTranscript extends ChatPaginated<ChatTranscriptMessage> {
  session: ChatTranscriptSession;
}

export type ChatTranscriptResponse = ChatApiData<ChatTranscript>;

/* ── stats ─────────────────────────────────────────────────────────────── */

export interface ChatStatsBucket {
  /** ISO date of the bucket start (day, week or month). */
  bucket: string;
  sessions: number;
  messages: number;
  unique_ips: number;
}

export interface ChatStatsTotal {
  sessions: number;
  messages: number;
  unique_ips: number;
}

export type ChatStatsPeriod = "today" | "last_7_days" | "last_30_days" | "all_time";

export interface ChatStats {
  generated_at: string | null;
  totals: Record<ChatStatsPeriod, ChatStatsTotal>;
  daily: ChatStatsBucket[];
  weekly: ChatStatsBucket[];
  monthly: ChatStatsBucket[];
  /** Alias of `daily` kept by the API for older callers. */
  series: ChatStatsBucket[];
}

export type ChatStatsResponse = ChatApiData<ChatStats>;

export type ChatGranularity = "daily" | "weekly" | "monthly";
