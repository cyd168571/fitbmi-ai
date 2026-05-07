"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations();
  return (
    <PageShell showHero>
      <div className="pb-10 pt-2">
        <p className="max-w-3xl text-sm leading-relaxed text-on-surface-variant md:text-base md:leading-7">
          {t("pages.about.body")}
        </p>
        <Link
          href="/analysis"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-center text-base font-semibold text-on-primary shadow-[var(--shadow-primary-cta)] transition hover:brightness-110 lg:max-w-md"
        >
          {t("nav.analysis")}
        </Link>
      </div>
    </PageShell>
  );
}
