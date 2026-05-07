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

const LABELS: Record<string, string> = {
  en: "EN",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  pt: "PT",
  es: "ES",
  fr: "FR",
  de: "DE",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="locale-select">
        Language
      </label>
      <select
        id="locale-select"
        className="flex cursor-pointer items-center gap-1 rounded-full border border-zinc-200 bg-white py-1.5 pl-2 pr-7 text-sm font-medium text-zinc-800 shadow-sm outline-none transition hover:border-[#2ECC71]"
        value={locale}
        onChange={(e) => {
          const next = e.target.value;
          router.replace(pathname, { locale: next });
        }}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {FLAGS[loc] ?? "🌐"} {LABELS[loc] ?? loc.toUpperCase()}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
        ▾
      </span>
    </div>
  );
}
