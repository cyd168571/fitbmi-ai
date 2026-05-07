"use client";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-[#F8F9FA]/90 px-4 py-3 backdrop-blur">
      <Link href="/home" className="text-lg font-bold tracking-tight text-[#1B5E20]">
        {t("brand")}
      </Link>
      <LanguageSwitcher />
    </header>
  );
}
