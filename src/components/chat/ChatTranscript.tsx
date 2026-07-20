import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import type { ChatTranscriptMessage } from "../../types/chat";
import { formatTime } from "./chatFormat";

interface ChatTranscriptProps {
  messages: ChatTranscriptMessage[];
  loading?: boolean;
}

/**
 * Visitor-authored text. `content` is passed as a React text child and never
 * through dangerouslySetInnerHTML, so markup in a message renders as the
 * characters the visitor typed. `whitespace-pre-wrap` keeps their line breaks
 * without needing any parsing.
 */
export default function ChatTranscript({ messages, loading = false }: ChatTranscriptProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-16 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800 ${
              index % 2 === 0 ? "ml-auto w-3/5" : "w-2/3"
            }`}
          />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
        Bu söhbətdə mesaj yoxdur
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <li
            key={message.id}
            className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                isUser
                  ? "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {isUser ? (
                <PersonOutlineIcon sx={{ fontSize: 18 }} />
              ) : (
                <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />
              )}
            </span>

            <div className={`max-w-[80%] min-w-0 ${isUser ? "text-right" : ""}`}>
              <div
                className={`inline-block rounded-2xl px-4 py-2.5 text-left text-sm ${
                  isUser
                    ? "bg-brand-500 text-white"
                    : "border border-gray-200 bg-white text-gray-800 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                {isUser ? "İstifadəçi" : "Çatbot"} · {formatTime(message.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
