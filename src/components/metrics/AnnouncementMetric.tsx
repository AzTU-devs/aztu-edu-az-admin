import CampaignIcon from "@mui/icons-material/Campaign";
import MetricCard from "./MetricCard";

interface Props {
  value?: number | null;
  loading?: boolean;
}

export default function AnnouncementMetric({ value, loading }: Props) {
  return (
    <MetricCard
      to="/announcements"
      label="Elanlar"
      value={value}
      loading={loading}
      accentBar="bg-gradient-to-r from-orange-500 to-orange-400"
      iconWrap="bg-orange-50 dark:bg-orange-900/20"
      badge="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
      icon={
        <CampaignIcon
          style={{ fontSize: 20 }}
          className="text-orange-600 dark:text-orange-400"
        />
      }
    />
  );
}
