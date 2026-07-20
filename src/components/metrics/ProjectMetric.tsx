import AccountTreeIcon from "@mui/icons-material/AccountTree";
import MetricCard from "./MetricCard";

interface Props {
  value?: number | null;
  loading?: boolean;
}

export default function ProjectMetric({ value, loading }: Props) {
  return (
    <MetricCard
      to="/projects"
      label="Layihələr"
      value={value}
      loading={loading}
      accentBar="bg-gradient-to-r from-emerald-500 to-emerald-400"
      iconWrap="bg-emerald-50 dark:bg-emerald-900/20"
      badge="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
      icon={
        <AccountTreeIcon
          style={{ fontSize: 20 }}
          className="text-emerald-600 dark:text-emerald-400"
        />
      }
    />
  );
}
