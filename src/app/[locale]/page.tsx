import { redirect } from "next/navigation";

/**
 * Locale root (`/en`, `/zh`, …): default entry is the analysis flow.
 */
export default async function LocaleRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/analysis`);
}
