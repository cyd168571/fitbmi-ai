"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { COUNTRY_CODES, normalizeCountryCode } from "@/lib/region";

const FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  CA: "🇨🇦",
  AU: "🇦🇺",
  DE: "🇩🇪",
  FR: "🇫🇷",
  BR: "🇧🇷",
  PT: "🇵🇹",
  ES: "🇪🇸",
  MX: "🇲🇽",
  JP: "🇯🇵",
  KR: "🇰🇷",
  CN: "🇨🇳",
  HK: "🇭🇰",
  SG: "🇸🇬",
  IN: "🇮🇳",
  RU: "🇷🇺",
  IT: "🇮🇹",
  NL: "🇳🇱",
  SE: "🇸🇪",
  NO: "🇳🇴",
  DK: "🇩🇰",
  FI: "🇫🇮",
  PL: "🇵🇱",
  AR: "🇦🇷",
  CL: "🇨🇱",
  CO: "🇨🇴",
  AE: "🇦🇪",
  SA: "🇸🇦",
  EG: "🇪🇬",
  ZA: "🇿🇦",
  NG: "🇳🇬",
  OTHER: "🌐",
};

function readCountryCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )fitbmi-country=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Desktop header pill: flag + ISO — syncs cookie + notifies AnalysisClient */
export function RegionSwitcher() {
  const tCountries = useTranslations("countries");
  const [code, setCode] = useState("US");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate flag + ISO from cookie */
    const raw = readCountryCookie();
    const c = raw ? normalizeCountryCode(raw) : null;
    if (c && COUNTRY_CODES.includes(c)) setCode(c);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function apply(next: string) {
    setCode(next);
    document.cookie = `fitbmi-country=${encodeURIComponent(next)}; path=/; max-age=${60 * 60 * 24 * 180}; SameSite=Lax`;
    window.dispatchEvent(
      new CustomEvent("fitbmi-country-change", { detail: next }),
    );
  }

  const flag = FLAGS[code] ?? "🌐";

  return (
    <div className="relative inline-flex h-10 min-w-[5.5rem] items-center justify-center gap-1 rounded-full border border-outline-variant bg-surface px-3 text-sm font-semibold text-on-surface shadow-[var(--shadow-card)]">
      <span aria-hidden className="pointer-events-none flex items-center gap-1">
        <span>{flag}</span>
        <span>{code}</span>
      </span>
      <label className="sr-only" htmlFor="region-select">
        Region
      </label>
      <select
        id="region-select"
        className="absolute inset-0 cursor-pointer rounded-full opacity-0"
        value={code}
        onChange={(e) => apply(e.target.value)}
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c} value={c}>
            {FLAGS[c] ?? "🌐"} {c} — {tCountries(c)}
          </option>
        ))}
      </select>
    </div>
  );
}
