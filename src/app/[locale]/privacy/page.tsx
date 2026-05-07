import { PageShell } from "@/components/layout/PageShell";
import { getTranslations } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <PageShell showHero={false}>
      <div className="pb-10 pt-4">
        <h1 className="font-heading text-xl font-semibold text-primary md:text-2xl">
          {t("pages.privacy.title")}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-on-surface-variant md:text-base md:leading-7">
          {t("pages.privacy.body")}
        </p>
      </div>
    </PageShell>
  );
}
