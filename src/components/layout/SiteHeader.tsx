"use client";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { RegionSwitcher } from "./RegionSwitcher";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant/25 bg-background/90 backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-5 py-3 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-4 lg:py-4">
        <Link
          href="/home"
          className="font-heading shrink-0 text-lg font-bold tracking-tight text-brand"
        >
          {t("brand")}
        </Link>

        <nav className="hidden items-center justify-center gap-8 text-sm font-semibold text-on-surface lg:flex">
          <Link
            href="/analysis"
            className="transition hover:text-brand hover:underline"
          >
            {t("nav.analysis")}
          </Link>
          <Link
            href="/analysis#features"
            className="transition hover:text-brand hover:underline"
          >
            {t("nav.features")}
          </Link>
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2 lg:gap-3">
          <LanguageSwitcher />
          <div className="hidden lg:block">
            <RegionSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
