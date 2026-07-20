import HandshakeIcon from "@mui/icons-material/Handshake";
import MetricCard from "./MetricCard";

interface Props {
  value?: number | null;
  loading?: boolean;
}

export default function CollaboratorMetric({ value, loading }: Props) {
  return (
    <MetricCard
      to="/collaborations"
      label="Əməkdaşlıqlar"
      value={value}
      loading={loading}
      accentBar="bg-gradient-to-r from-cyan-500 to-cyan-400"
      iconWrap="bg-cyan-50 dark:bg-cyan-900/20"
      badge="text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20"
      icon={
        <HandshakeIcon
          style={{ fontSize: 20 }}
          className="text-cyan-600 dark:text-cyan-400"
        />
      }
    />
  );
}
