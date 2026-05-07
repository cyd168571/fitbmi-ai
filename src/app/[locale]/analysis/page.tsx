import { AnalysisClient } from "@/components/analysis/AnalysisClient";
import { PageShell } from "@/components/layout/PageShell";

export default function AnalysisPage() {
  return (
    <PageShell showHero>
      <AnalysisClient />
    </PageShell>
  );
}
