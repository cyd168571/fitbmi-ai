"use client";

import { PageShell } from "@/components/layout/PageShell";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type PlanPayload = {
  plan?: string;
  insight?: string;
};

export default function PlanPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- client-only localStorage */
    try {
      const raw = localStorage.getItem("fitbmi-plan");
      if (raw) {
        const p = JSON.parse(raw) as PlanPayload;
        setText(p.plan ?? null);
      } else {
        setText(null);
      }
    } catch {
      setText(null);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname]);

  return (
    <PageShell showHero={false}>
      <div className="px-4 pb-10 pt-2">
        <h2 className="text-xl font-bold text-[#1B5E20]">{t("plan.title")}</h2>
        <div className="mt-4 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
          {text ? (
            <p className="text-sm leading-relaxed text-zinc-700">{text}</p>
          ) : (
            <p className="text-sm text-zinc-500">{t("plan.empty")}</p>
          )}
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          {t("plan.disclaimerTitle")}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          {t("disclaimer.ai")}
        </p>
      </div>
    </PageShell>
  );
}
