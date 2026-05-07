import { redirect } from "next/navigation";

/**
 * Locale root (`/en`, `/zh`, …): send users to the main shell experience.
 * Previously this file rendered a standalone demo calculator without PageShell,
 * which made production look different from `/home` and `/analysis`.
 */
export default async function LocaleRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/home`);
}
