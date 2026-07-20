import { useState } from "react";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ForumIcon from "@mui/icons-material/Forum";
import LanIcon from "@mui/icons-material/Lan";
import ComponentCard from "../common/ComponentCard";
import ChatUsageChart from "./ChatUsageChart";
import { formatNumber } from "./chatFormat";
import type { ChatGranularity, ChatStats, ChatStatsBucket } from "../../types/chat";

const GRANULARITIES: { key: ChatGranularity; label: string; hint: string }[] = [
  { key: "daily", label: "Günlük", hint: "Son 30 gün" },
  { key: "weekly", label: "Həftəlik", hint: "Son 12 həftə" },
  { key: "monthly", label: "Aylıq", hint: "Son 12 ay" },
];

const sum = (buckets: ChatStatsBucket[], field: keyof ChatStatsBucket): number =>
  buckets.reduce((acc, bucket) => acc + (Number(bucket[field]) || 0), 0);

interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "brand" | "success" | "warning";
}

function StatTile({ icon, label, value, hint, tone = "brand" }: StatTileProps) {
  const tones = {
    brand: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
    success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
    warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {label}
          </p>
          <p className="mt-1 truncate text-lg font-bold text-gray-900 dark:text-white">{value}</p>
          {hint && <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

interface ChatStatsPanelProps {
  stats: ChatStats | null;
  loading?: boolean;
  /** The chart always plots the daily series; hide it on the compact variant. */
  showChart?: boolean;
}

export default function ChatStatsPanel({
  stats,
  loading = false,
  showChart = true,
}: ChatStatsPanelProps) {
  const [granularity, setGranularity] = useState<ChatGranularity>("daily");

  const active = GRANULARITIES.find((item) => item.key === granularity) ?? GRANULARITIES[0];
  const buckets = stats ? stats[granularity] ?? [] : [];

  const tiles = [
    {
      icon: <ChatBubbleOutlineIcon fontSize="small" />,
      label: "Söhbətlər",
      value: formatNumber(sum(buckets, "sessions")),
      hint: `${active.hint} · bütün vaxt ${formatNumber(stats?.totals.all_time.sessions)}`,
      tone: "brand" as const,
    },
    {
      icon: <ForumIcon fontSize="small" />,
      label: "Mesajlar",
      value: formatNumber(sum(buckets, "messages")),
      hint: `${active.hint} · bütün vaxt ${formatNumber(stats?.totals.all_time.messages)}`,
      tone: "success" as const,
    },
    {
      icon: <LanIcon fontSize="small" />,
      label: "Unikal IP",
      value: formatNumber(sum(buckets, "unique_ips")),
      hint: "Dövrlər üzrə cəm, təkrarlar daxil",
      tone: "warning" as const,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
        {GRANULARITIES.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setGranularity(item.key)}
            className={`rounded-md px-3 py-2 text-theme-sm font-medium transition-colors hover:text-gray-900 dark:hover:text-white ${
              granularity === item.key
                ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </div>

      {showChart && (
        <ComponentCard title="Günlük istifadə" desc="Son 30 gün üzrə söhbət, mesaj və unikal IP sayı">
          {loading && !stats ? (
            <div className="h-[240px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ) : (
            <ChatUsageChart buckets={stats?.daily ?? []} />
          )}
        </ComponentCard>
      )}
    </div>
  );
}
