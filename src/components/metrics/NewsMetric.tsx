import NewspaperIcon from "@mui/icons-material/Newspaper";
import MetricCard from "./MetricCard";

interface Props {
  value?: number | null;
  loading?: boolean;
}

export default function NewsMetric({ value, loading }: Props) {
  return (
    <MetricCard
      to="/news"
      label="Xəbərlər"
      value={value}
      loading={loading}
      accentBar="bg-gradient-to-r from-blue-500 to-blue-400"
      iconWrap="bg-blue-50 dark:bg-blue-900/20"
      badge="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
      icon={
        <NewspaperIcon
          style={{ fontSize: 20 }}
          className="text-blue-600 dark:text-blue-400"
        />
      }
    />
  );
}
