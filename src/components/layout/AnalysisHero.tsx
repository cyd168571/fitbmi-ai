"use client";

import { useTranslations } from "next-intl";

/** Mobile: left-aligned title (reference UI). Desktop Web: centered hero (reference UI). */
export function AnalysisHero() {
  const t = useTranslations("hero");

  return (
    <section className="pb-4 pt-2">
      <h1 className="font-heading text-left text-2xl font-semibold leading-tight tracking-tight text-brand lg:text-center lg:text-[32px] lg:leading-10">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-3xl text-left text-sm leading-relaxed text-on-surface-variant lg:mx-auto lg:text-center lg:text-base lg:leading-7">
        <span className="lg:hidden">{t("subtitle")}</span>
        <span className="hidden lg:inline">{t("subtitleWeb")}</span>
      </p>
    </section>
  );
}
