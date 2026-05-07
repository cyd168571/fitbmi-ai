"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";

const FLAGS: Record<string, string> = {
  en: "🇺🇸",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
  pt: "🇧🇷",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
};

const CODES: Record<string, string> = {
  en: "EN",
  zh: "ZH",
  ja: "JA",
  ko: "KO",
  pt: "PT",
  es: "ES",
  fr: "FR",
  de: "DE",
};

/** Pill chip with flag + ISO-style code; native select overlaid for accessibility */
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const flag = FLAGS[locale] ?? "🌐";
  const code = CODES[locale] ?? locale.toUpperCase().slice(0, 2);

  return (
    <div className="relative inline-flex h-10 min-w-[6rem] items-center justify-center gap-1.5 rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-sm font-semibold text-on-surface shadow-[var(--shadow-card)]">
      <span aria-hidden className="pointer-events-none flex items-center gap-1.5">
        <span>{flag}</span>
        <span>{code}</span>
      </span>
      <label className="sr-only" htmlFor="locale-select">
        Language
      </label>
      <select
        id="locale-select"
        className="absolute inset-0 cursor-pointer rounded-full opacity-0"
        value={locale}
        onChange={(e) => {
          const next = e.target.value;
          router.replace(pathname, { locale: next });
        }}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {FLAGS[loc] ?? "🌐"} {CODES[loc] ?? loc.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
