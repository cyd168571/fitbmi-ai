"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations();
  return (
    <PageShell showHero>
      <div className="px-4 pb-8">
        <p className="text-sm leading-relaxed text-zinc-700">
          {t("pages.about.body")}
        </p>
        <Link
          href="/analysis"
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#2ECC71] py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-emerald-200/60 transition hover:bg-[#26b863]"
        >
          {t("nav.analysis")}
        </Link>
      </div>
    </PageShell>
  );
}
