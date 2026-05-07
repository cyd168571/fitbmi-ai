import { PageShell } from "@/components/layout/PageShell";
import { getTranslations } from "next-intl/server";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <PageShell showHero={false}>
      <div className="px-4 pb-10 pt-4">
        <h1 className="text-xl font-bold text-[#1B5E20]">
          {t("pages.contact.title")}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-700">
          {t("pages.contact.body")}
        </p>
      </div>
    </PageShell>
  );
}
