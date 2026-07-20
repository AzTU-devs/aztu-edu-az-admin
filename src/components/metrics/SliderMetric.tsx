import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import MetricCard from "./MetricCard";

interface Props {
  value?: number | null;
  loading?: boolean;
}

export default function SliderMetric({ value, loading }: Props) {
  return (
    <MetricCard
      to="/sliders"
      label="Sliderlər"
      value={value}
      loading={loading}
      accentBar="bg-gradient-to-r from-indigo-500 to-indigo-400"
      iconWrap="bg-indigo-50 dark:bg-indigo-900/20"
      badge="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
      icon={
        <ViewCarouselIcon
          style={{ fontSize: 20 }}
          className="text-indigo-600 dark:text-indigo-400"
        />
      }
    />
  );
}
