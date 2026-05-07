import { PageShell } from "@/components/layout/PageShell";
import { getTranslations } from "next-intl/server";

export default async function StandardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <PageShell showHero={false}>
      <div className="space-y-4 px-4 pb-10 pt-2">
        <h2 className="text-xl font-bold text-[#1B5E20]">
          {t("standards.title")}
        </h2>
        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
          <h3 className="font-semibold text-zinc-800">WHO</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            {t("standards.who")}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
          <h3 className="font-semibold text-zinc-800">Asia-Pacific</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            {t("standards.asian")}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
          <h3 className="font-semibold text-zinc-800">Japan</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            {t("standards.japan")}
          </p>
        </article>
      </div>
    </PageShell>
  );
}
