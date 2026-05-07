"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("footer");
  const tRoot = useTranslations();
  const year = new Date().getFullYear();

  const links = [
    { href: "/about", label: t("about") },
    { href: "/privacy", label: t("privacy") },
    { href: "/medical", label: t("medical") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <footer className="border-t border-outline-variant/40 bg-surface">
      <div className="mx-auto max-w-[1200px] px-5 py-10 text-center text-sm text-on-surface-variant lg:px-4">
        <p className="font-heading text-lg font-bold text-brand">
          {tRoot("brand")}
        </p>
        <nav className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-x-4 gap-y-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition hover:text-brand hover:underline"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-on-surface-variant">
          {t("copyright", { year })}
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-[11px] text-outline">
          FitBMI AI — informational only.
        </p>
      </div>
    </footer>
  );
}
