"use client";

import { useTranslations } from "next-intl";

type Props = {
  bmi: number;
  /** Mobile reference: numeric thresholds. Desktop reference: zone labels. */
  variant?: "ticks" | "zones";
};

const MIN = 15;
const MAX = 40;

export function BmiScaleBar({ bmi, variant = "ticks" }: Props) {
  const t = useTranslations("bmiCard");
  const pct = Math.min(100, Math.max(0, ((bmi - MIN) / (MAX - MIN)) * 100));
  const ticks = [15, 18.5, 25, 30, 40];

  return (
    <div className="w-full">
      <div
        className="relative h-3 w-full overflow-hidden rounded-full lg:h-4"
        style={{
          background:
            "linear-gradient(90deg, #93c5fd 0%, #22c55e 28%, #22c55e 48%, #fbbf24 62%, #f97316 78%, #ef4444 100%)",
        }}
      >
        <div
          className="absolute top-0 h-full w-1.5 -translate-x-1/2 rounded-full bg-white shadow-lg ring-2 ring-brand"
          style={{ left: `${pct}%` }}
        />
      </div>
      {variant === "zones" ? (
        <div className="mt-2 flex justify-between font-sans text-[10px] font-semibold uppercase tracking-wide text-outline lg:text-xs">
          <span>{t("zoneUnder")}</span>
          <span className="text-primary">{t("zoneHealthy")}</span>
          <span>{t("zoneOver")}</span>
          <span>{t("zoneObese")}</span>
        </div>
      ) : (
        <div className="mt-1 flex justify-between font-sans text-[10px] text-outline">
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      )}
    </div>
  );
}
