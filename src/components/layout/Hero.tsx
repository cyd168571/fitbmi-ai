"use client";

import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section className="pb-2 pt-2">
      <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-brand md:text-3xl lg:text-[32px] lg:leading-10 lg:tracking-[-0.01em]">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant md:text-base md:leading-7">
        {t("subtitle")}
      </p>
    </section>
  );
}
