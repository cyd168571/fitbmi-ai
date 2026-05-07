"use client";

import { useState } from "react";

type AnalyzeResponse = {
  bmi: number;
  category: string;
  analysis: string;
  error?: string;
};

/** Locale root: responsive demo calculator — mobile full-width stack, desktop centered card (Vitality Tech). */
export default function LocaleRootDemoPage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  async function handleCalculate() {
    try {
      setLoading(true);
      const response = await fetch("/api/bmi/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: Number(height),
          weight: Number(weight),
          country: "United States",
          language: "English",
          gender: "Male",
          age: 28,
        }),
      });
      const data = (await response.json()) as AnalyzeResponse;
      if (!response.ok) {
        setResult({
          bmi: 0,
          category: "",
          analysis: "",
          error:
            typeof data.error === "string"
              ? data.error
              : `Request failed (${response.status})`,
        });
        return;
      }
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-8 lg:px-4 lg:pt-12">
        <div className="mx-auto w-full max-w-2xl rounded-2xl bg-surface p-6 shadow-[var(--shadow-card)] ring-1 ring-outline-variant/25 lg:p-10">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-primary md:text-[32px] md:leading-10">
            AI BMI Calculator
          </h1>

          <div className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="vt-input"
                placeholder="175"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="vt-input"
                placeholder="70"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
            className="mt-8 min-h-12 w-full rounded-lg bg-primary px-6 py-3 text-base font-semibold text-on-primary shadow-[var(--shadow-primary-cta)] transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Calculate BMI"}
          </button>

          {result && (
            <div className="mt-8 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 ring-1 ring-outline-variant/15">
              <h2 className="font-heading text-xl font-semibold text-primary">
                Result
              </h2>
              {result.error ? (
                <p className="mt-3 text-sm text-error">{result.error}</p>
              ) : (
                <>
                  <p className="mt-3 font-data text-lg font-bold text-primary">
                    BMI: {result.bmi}
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    <span className="font-semibold text-on-surface">
                      Category:
                    </span>{" "}
                    {result.category}
                  </p>
                  <div className="relative mt-6 border-l-4 border-secondary pl-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-secondary">
                      <span aria-hidden>✦</span> AI Analysis
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                      {result.analysis}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
