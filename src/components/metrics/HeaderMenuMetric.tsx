import MenuIcon from "@mui/icons-material/Menu";
import MetricCard from "./MetricCard";

interface Props {
  value?: number | null;
  loading?: boolean;
}

export default function HeaderMenuMetric({ value, loading }: Props) {
  return (
    <MetricCard
      to="/menu-header"
      label="Menyu sayı (header)"
      value={value}
      loading={loading}
      accentBar="bg-gradient-to-r from-purple-500 to-purple-400"
      iconWrap="bg-purple-50 dark:bg-purple-900/20"
      badge="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
      icon={
        <MenuIcon
          style={{ fontSize: 20 }}
          className="text-purple-600 dark:text-purple-400"
        />
      }
    />
  );
}
