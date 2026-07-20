import { ReactNode } from "react";
import { langBadgeAz, langBadgeEn } from "../formStyles";

interface LangPairProps {
  az: ReactNode;
  en: ReactNode;
  azLabel?: string;
  enLabel?: string;
}

export default function LangPair({ az, en, azLabel = "Azərbaycan dili", enLabel = "English" }: LangPairProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={langBadgeAz}>AZ</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{azLabel}</span>
        </div>
        {az}
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={langBadgeEn}>EN</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{enLabel}</span>
        </div>
        {en}
      </div>
    </div>
  );
}
