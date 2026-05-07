import { AnalysisClient } from "@/components/analysis/AnalysisClient";
import { AnalysisFeatures } from "@/components/analysis/AnalysisFeatures";
import { AnalysisHero } from "@/components/layout/AnalysisHero";
import { PageShell } from "@/components/layout/PageShell";

export default function AnalysisPage() {
  return (
    <PageShell showHero={false}>
      <AnalysisHero />
      <AnalysisClient />
      <AnalysisFeatures />
    </PageShell>
  );
}
