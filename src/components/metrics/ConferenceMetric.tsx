import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import MetricCard from "./MetricCard";

interface Props {
  /**
   * The dashboard aggregate has no conference bucket, so callers pass null and
   * the card shows a dash. Wire this up once the API counts them.
   */
  value?: number | null;
  loading?: boolean;
}

export default function ConferenceMetric({ value = null, loading }: Props) {
  return (
    <MetricCard
      to="/conferences"
      label="Konfranslar"
      value={value}
      loading={loading}
      accentBar="bg-gradient-to-r from-rose-500 to-rose-400"
      iconWrap="bg-rose-50 dark:bg-rose-900/20"
      badge="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20"
      icon={
        <ChatBubbleIcon
          style={{ fontSize: 20 }}
          className="text-rose-600 dark:text-rose-400"
        />
      }
    />
  );
}
