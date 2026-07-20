import { ReactNode, useState } from "react";
import { rowCard } from "../formStyles";

interface CollapsibleRowProps {
  index: number;
  title: string;
  fallbackTitle?: string;
  subtitle?: string;
  thumbUrl?: string;
  badge?: string;
  onRemove?: () => void;
  removeLabel?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function CollapsibleRow({
  index,
  title,
  fallbackTitle = "Adsız maddə",
  subtitle,
  thumbUrl,
  badge,
  onRemove,
  removeLabel = "Sil",
  defaultOpen = false,
  children,
}: CollapsibleRowProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={rowCard}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <svg
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="w-6 shrink-0 text-xs font-medium text-gray-400">{index + 1}.</span>
          {thumbUrl ? (
            <img src={thumbUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 object-cover" />
          ) : null}
          <span className="min-w-0 flex-1">
            <span className={`block truncate text-sm font-semibold ${title.trim() ? "text-gray-700 dark:text-gray-200" : "text-gray-400 italic"}`}>
              {title.trim() || fallbackTitle}
            </span>
            {subtitle ? <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{subtitle}</span> : null}
          </span>
          {badge ? (
            <span className="shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
              {badge}
            </span>
          ) : null}
        </button>
        {onRemove ? (
          <button type="button" className="shrink-0 text-sm text-red-500 hover:underline" onClick={onRemove}>
            {removeLabel}
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 px-4 py-4">{children}</div>
      ) : null}
    </div>
  );
}
