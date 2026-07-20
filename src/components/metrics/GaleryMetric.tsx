import CollectionsIcon from "@mui/icons-material/Collections";
import MetricCard from "./MetricCard";

interface Props {
  value?: number | null;
  loading?: boolean;
}

export default function GaleryMetric({ value, loading }: Props) {
  return (
    <MetricCard
      to="/galery"
      label="Qalereya"
      value={value}
      loading={loading}
      accentBar="bg-gradient-to-r from-amber-500 to-amber-400"
      iconWrap="bg-amber-50 dark:bg-amber-900/20"
      badge="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
      icon={
        <CollectionsIcon
          style={{ fontSize: 20 }}
          className="text-amber-600 dark:text-amber-400"
        />
      }
    />
  );
}
