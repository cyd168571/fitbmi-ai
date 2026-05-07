"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const items = [
  { href: "/home", key: "home" as const, icon: "⌂" },
  { href: "/analysis", key: "analysis" as const, icon: "▦" },
  { href: "/plan", key: "plan" as const, icon: "☰" },
  { href: "/standards", key: "standards" as const, icon: "◎" },
];

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/30 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
        {items.map(({ href, key, icon }) => {
          const active =
            pathname === href ||
            (href !== "/home" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-[4rem] flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[10px] font-semibold transition ${
                active
                  ? "text-brand"
                  : "text-outline hover:text-on-surface"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg leading-none ${
                  active ? "bg-primary text-on-primary shadow-md" : "bg-surface-container-low"
                }`}
                aria-hidden
              >
                {icon}
              </span>
              <span className="max-w-[4.5rem] truncate">{t(key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
