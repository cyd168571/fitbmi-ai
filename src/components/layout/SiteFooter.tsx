"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const links = [
    { href: "/about", label: t("about") },
    { href: "/privacy", label: t("privacy") },
    { href: "/medical", label: t("medical") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-600">
      <nav className="mx-auto flex max-w-md flex-wrap justify-center gap-x-4 gap-y-2">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="hover:text-[#1B5E20] hover:underline"
          >
            {label}
          </Link>
        ))}
      </nav>
      <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-zinc-500">
        {t("copyright", { year })}
      </p>
      <p className="mx-auto mt-2 max-w-xl text-[11px] text-zinc-400">
        FitBMI AI — informational only.
      </p>
    </footer>
  );
}
