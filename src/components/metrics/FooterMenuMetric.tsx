import MenuIcon from "@mui/icons-material/Menu";
import MetricCard from "./MetricCard";

interface Props {
  value?: number | null;
  loading?: boolean;
}

export default function FooterMenuMetric({ value, loading }: Props) {
  return (
    <MetricCard
      to="/menu-footer"
      label="Menyu sayı (footer)"
      value={value}
      loading={loading}
      accentBar="bg-gradient-to-r from-teal-500 to-teal-400"
      iconWrap="bg-teal-50 dark:bg-teal-900/20"
      badge="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
      icon={
        <MenuIcon
          style={{ fontSize: 20 }}
          className="text-teal-600 dark:text-teal-400"
        />
      }
    />
  );
}
