"use client";

import type { ReactNode } from "react";
import { Hero } from "./Hero";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type Props = {
  children: ReactNode;
  /** Full FitBMI hero (analysis-style pages). */
  showHero?: boolean;
};

export function PageShell({ children, showHero = true }: Props) {
  return (
    <div className="mx-auto min-h-screen max-w-lg">
      <SiteHeader />
      {showHero ? <Hero /> : null}
      {children}
      <SiteFooter />
    </div>
  );
}
