import { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import type { ChatStatsBucket } from "../../types/chat";
import { formatBucket } from "./chatFormat";

interface ChatUsageChartProps {
  buckets: ChatStatsBucket[];
  height?: number;
}

/**
 * Sessions / messages / unique IPs over the daily series. Categories are
 * pre-formatted labels rather than a datetime axis, so gaps in the series (days
 * with no traffic, which the API simply omits) stay adjacent instead of
 * stretching the axis across empty space.
 */
export default function ChatUsageChart({ buckets, height = 310 }: ChatUsageChartProps) {
  const categories = useMemo(() => buckets.map((b) => formatBucket(b.bucket)), [buckets]);

  const series = useMemo(
    () => [
      { name: "Söhbətlər", data: buckets.map((b) => b.sessions) },
      { name: "Mesajlar", data: buckets.map((b) => b.messages) },
      { name: "Unikal IP", data: buckets.map((b) => b.unique_ips) },
    ],
    [buckets]
  );

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Noto Sans, sans-serif",
      labels: { colors: "#6B7280" },
      markers: { size: 6 },
    },
    colors: ["#465FFF", "#12B76A", "#F79009"],
    chart: {
      fontFamily: "Noto Sans, sans-serif",
      height,
      type: "area",
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: [2, 2, 2] },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.45, opacityTo: 0 },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 5 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    xaxis: {
      type: "category",
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      labels: {
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        style: { fontSize: "11px", colors: "#6B7280" },
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (value: number) => String(Math.round(value)),
      },
      title: { text: "", style: { fontSize: "0px" } },
    },
  };

  if (buckets.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-gray-400 dark:text-gray-500">
        Bu dövr üçün məlumat yoxdur
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[640px] xl:min-w-full">
        <Chart options={options} series={series} type="area" height={height} />
      </div>
    </div>
  );
}
