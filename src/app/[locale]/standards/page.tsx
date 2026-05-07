import { PageShell } from "@/components/layout/PageShell";
import { getTranslations } from "next-intl/server";

export default async function StandardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const cards = [
    { title: "WHO", body: t("standards.who") },
    { title: "Asia-Pacific", body: t("standards.asian") },
    { title: "Japan", body: t("standards.japan") },
  ] as const;

  return (
    <PageShell showHero={false}>
      <div className="space-y-4 pb-10 pt-2">
        <h2 className="font-heading text-xl font-semibold text-primary md:text-2xl">
          {t("standards.title")}
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          {cards.map(({ title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-outline-variant/25 bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-outline-variant/15 lg:col-span-4"
            >
              <h3 className="font-heading font-semibold text-on-surface">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
