const MONTHS_AZ = [
  "yan",
  "fev",
  "mar",
  "apr",
  "may",
  "iyn",
  "iyl",
  "avq",
  "sen",
  "okt",
  "noy",
  "dek",
];

const pad = (value: number) => String(value).padStart(2, "0");

const parse = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** 20 iyl 2026, 09:12 */
export const formatDateTime = (value: string | null | undefined): string => {
  const date = parse(value);
  if (!date) return "—";
  return `${date.getDate()} ${MONTHS_AZ[date.getMonth()]} ${date.getFullYear()}, ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

export const formatTime = (value: string | null | undefined): string => {
  const date = parse(value);
  if (!date) return "—";
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const formatRelative = (value: string | null | undefined): string | null => {
  const date = parse(value);
  if (!date) return null;

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 0) return null;
  if (seconds < 60) return "indicə";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dəq əvvəl`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat əvvəl`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} gün əvvəl`;
  return null;
};

interface LastLoginCellProps {
  value: string | null;
  className?: string;
}

/**
 * "Son giriş". A never-signed-in account reads as an explicit state rather than
 * an empty cell — a dormant admin account is the thing worth noticing here.
 */
export default function LastLoginCell({ value, className = "" }: LastLoginCellProps) {
  if (!value) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-400 dark:bg-white/5 dark:text-gray-500 ${className}`}
      >
        Heç vaxt
      </span>
    );
  }

  const relative = formatRelative(value);

  return (
    <div className={className}>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {formatDateTime(value)}
      </p>
      {relative && (
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{relative}</p>
      )}
    </div>
  );
}
