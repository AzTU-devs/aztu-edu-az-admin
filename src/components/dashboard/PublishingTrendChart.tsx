import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useMemo } from "react";
import ComponentCard from "../common/ComponentCard";
import { TREND_SERIES_LABELS_AZ } from "../../types/stats";
import type { PublishingTrend } from "../../types/stats";

const MONTHS_AZ = [
  "Yan", "Fev", "Mar", "Apr", "May", "İyn",
  "İyl", "Avq", "Sen", "Okt", "Noy", "Dek",
];

/** "2026-07" → "İyl 26". */
function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  const index = Number(month) - 1;
  const name = MONTHS_AZ[index] ?? month;
  return `${name} ${year.slice(2)}`;
}

interface Props {
  trend?: PublishingTrend;
  loading?: boolean;
}

export default function PublishingTrendChart({ trend, loading }: Props) {
  const categories = useMemo(
    () => (trend?.months ?? []).map(monthLabel),
    [trend]
  );

  const series = useMemo(
    () =>
      (trend?.series ?? []).map((entry) => ({
        name: TREND_SERIES_LABELS_AZ[entry.key] ?? entry.key,
        data: entry.data,
      })),
    [trend]
  );

  const options: ApexOptions = {
    colors: ["#465fff", "#f79009", "#12b76a", "#7a5af8", "#06aed4"],
    chart: {
      fontFamily: "Noto Sans, sans-serif",
      type: "bar",
      height: 260,
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 4,
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    grid: {
      borderColor: "rgba(148, 163, 184, 0.18)",
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "11px" } },
    },
    yaxis: {
      labels: { style: { fontSize: "11px" } },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Noto Sans, sans-serif",
      markers: { size: 6 },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (value: number) => `${value}` },
    },
    fill: { opacity: 1 },
  };

  const total = (trend?.series ?? []).reduce((sum, entry) => sum + entry.total, 0);

  return (
    <ComponentCard
      title="Dərc dinamikası"
      desc="Son 12 ayda yaradılmış məzmun"
      actions={
        loading ? (
          <span className="block h-5 w-24 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ) : (
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Cəmi {total.toLocaleString("az-AZ")}
          </span>
        )
      }
    >
      {loading ? (
        <div className="h-[260px] rounded-xl bg-gray-50 dark:bg-gray-800/50 animate-pulse" />
      ) : series.length === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-gray-400 dark:text-gray-500">
          Məlumat yoxdur
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[640px]">
            <Chart options={options} series={series} type="bar" height={260} />
          </div>
        </div>
      )}
    </ComponentCard>
  );
}
