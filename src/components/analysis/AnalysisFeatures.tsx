"use client";

import { useTranslations } from "next-intl";

export function AnalysisFeatures() {
  const t = useTranslations("features");

  const cols = [
    { titleKey: "col1Title" as const, bodyKey: "col1Body" as const },
    { titleKey: "col2Title" as const, bodyKey: "col2Body" as const },
    { titleKey: "col3Title" as const, bodyKey: "col3Body" as const },
  ];

  return (
    <section
      id="features"
      className="mt-14 hidden scroll-mt-24 border-t border-outline-variant/25 pt-12 lg:block"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
        {cols.map(({ titleKey, bodyKey }) => (
          <div key={titleKey} className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-xl text-brand">
              ✦
            </div>
            <h3 className="font-heading text-base font-semibold text-brand">
              {t(titleKey)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {t(bodyKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
