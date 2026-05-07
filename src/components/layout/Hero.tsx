"use client";

import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section className="px-4 pb-2 pt-2">
      <h1 className="text-2xl font-bold leading-tight text-[#1B5E20] sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
        {t("subtitle")}
      </p>
    </section>
  );
}
