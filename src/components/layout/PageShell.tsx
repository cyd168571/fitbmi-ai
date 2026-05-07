"use client";

import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Hero } from "./Hero";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type Props = {
  children: ReactNode;
  /** Full FitBMI hero (analysis-style pages). */
  showHero?: boolean;
  /** Fixed bottom tab bar (mobile reference UI). */
  showBottomNav?: boolean;
};

/**
 * Mobile: bottom nav + extra padding. Desktop: max 1200px shell.
 */
export function PageShell({
  children,
  showHero = true,
  showBottomNav = true,
}: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-on-background">
      <SiteHeader />
      <main
        className={`flex-1 ${showBottomNav ? "pb-24 lg:pb-0" : ""}`}
      >
        <div className="mx-auto w-full max-w-[1200px] px-5 lg:px-4">
          {showHero ? <Hero /> : null}
          {children}
        </div>
      </main>
      <SiteFooter />
      {showBottomNav ? <BottomNav /> : null}
    </div>
  );
}
