"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  type ActivityLevel,
  classifyBmi,
  computeBmi,
  cmToMeters,
  ftInToMeters,
  lbsToKg,
  type BmiStandard,
} from "@/lib/bmi";
import {
  buildActionPlan,
  buildHealthInsight,
  buildInsightMetrics,
} from "@/lib/ai-templates";
import {
  COUNTRY_CODES,
  normalizeCountryCode,
  standardForCountry,
} from "@/lib/region";
import { BmiDonut } from "./BmiDonut";
import { BmiScaleBar } from "./BmiScaleBar";

const STORAGE = "fitbmi-snapshot";

export type UnitMode = "metric" | "imperial";

export type Snapshot = {
  countryCode: string;
  sex: "male" | "female";
  age: number;
  activity: ActivityLevel;
  units: UnitMode;
  heightCm: number;
  weightKg: number;
  bmi: number;
  standard: BmiStandard;
  analyzedAt: string;
};

function readCountryCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )fitbmi-country=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function inchesFromCm(cm: number): number {
  return Math.round(cm / 2.54);
}

function cmFromInches(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

function splitInches(total: number): { ft: number; inch: number } {
  let ft = Math.floor(total / 12);
  let inch = Math.round(total - ft * 12);
  if (inch >= 12) {
    ft += 1;
    inch = 0;
  }
  return { ft, inch };
}

function defaultUnitsForCountry(code: string): UnitMode {
  return code === "US" || code === "LR" ? "imperial" : "metric";
}

const inactiveToggle =
  "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300";

export function AnalysisClient() {
  const t = useTranslations();
  const tCat = useTranslations("categories");
  const tRisk = useTranslations("risk");
  const tAct = useTranslations("activityLevels");
  const tCountries = useTranslations("countries");
  const locale = useLocale();

  const [countryCode, setCountryCode] = useState("US");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState(28);
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [units, setUnits] = useState<UnitMode>("imperial");

  const [heightCm, setHeightCm] = useState(178);
  const [weightKg, setWeightKg] = useState(75);

  const [heightInches, setHeightInches] = useState(70);
  const [weightLbs, setWeightLbs] = useState(165);

  const [analyzed, setAnalyzed] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- client-only hydration */
    const rawCookie = readCountryCookie();
    if (rawCookie) {
      const c = normalizeCountryCode(rawCookie);
      if (COUNTRY_CODES.includes(c)) {
        setCountryCode(c);
        setUnits(defaultUnitsForCountry(c));
      }
    }
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const s = JSON.parse(raw) as Partial<Snapshot>;
        if (s.countryCode)
          setCountryCode(normalizeCountryCode(s.countryCode));
        if (s.sex) setSex(s.sex);
        if (typeof s.age === "number") setAge(s.age);
        if (s.activity) setActivity(s.activity);
        if (s.units) setUnits(s.units);
        if (typeof s.heightCm === "number") setHeightCm(s.heightCm);
        if (typeof s.weightKg === "number") setWeightKg(s.weightKg);
        if (typeof s.heightCm === "number")
          setHeightInches(inchesFromCm(s.heightCm));
        if (typeof s.weightKg === "number")
          setWeightLbs(Math.round(s.weightKg / 0.45359237));
      }
    } catch {
      /* ignore */
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    function onCountry(e: Event) {
      const d = (e as CustomEvent<string>).detail;
      if (typeof d === "string" && COUNTRY_CODES.includes(d)) {
        setCountryCode(d);
        setUnits(defaultUnitsForCountry(d));
      }
    }
    window.addEventListener("fitbmi-country-change", onCountry);
    return () =>
      window.removeEventListener("fitbmi-country-change", onCountry);
  }, []);

  const standard = useMemo(
    () => standardForCountry(countryCode),
    [countryCode],
  );

  const metrics = useMemo(() => {
    const { ft, inch } = splitInches(heightInches);
    const heightMeters =
      units === "metric" ? cmToMeters(heightCm) : ftInToMeters(ft, inch);
    const weightKgVal =
      units === "metric" ? weightKg : lbsToKg(weightLbs);
    const bmi = computeBmi(weightKgVal, heightMeters);
    const classification = classifyBmi(bmi, standard);
    const insightInput = {
      locale,
      bmi,
      standard,
      classification,
      sex,
      age,
      weightKg: weightKgVal,
      heightM: heightMeters,
      activity,
      tdee: 0,
    };
    const m = buildInsightMetrics(insightInput);
    const fullInput = { ...insightInput, tdee: m.tdee };
    return {
      weightKg: weightKgVal,
      bmi,
      classification,
      insight: buildHealthInsight(fullInput),
      plan: buildActionPlan(fullInput),
      metabolicAge: m.metabolicAge,
      tdee: m.tdee,
      risk: classification.riskLevel,
    };
  }, [
    activity,
    age,
    heightCm,
    heightInches,
    locale,
    sex,
    standard,
    units,
    weightKg,
    weightLbs,
  ]);

  const { ft: dispFt, inch: dispIn } = splitInches(heightInches);

  async function persistAndAnalyze() {
    const heightSnap =
      units === "metric" ? heightCm : cmFromInches(heightInches);
    const weightSnap =
      units === "metric" ? weightKg : lbsToKg(weightLbs);

    const snap: Snapshot = {
      countryCode,
      sex,
      age,
      activity,
      units,
      heightCm: heightSnap,
      weightKg: weightSnap,
      bmi: metrics.bmi,
      standard,
      analyzedAt: new Date().toISOString(),
    };

    setAiInsight(null);
    setAnalyzed(true);
    setAiLoading(true);

    try {
      localStorage.setItem(STORAGE, JSON.stringify(snap));
      localStorage.setItem(
        "fitbmi-plan",
        JSON.stringify({
          plan: metrics.plan,
          insight: metrics.insight,
          ...snap,
        }),
      );
    } catch {
      /* ignore */
    }

    try {
      const res = await fetch("/api/bmi/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: heightSnap,
          weight: weightSnap,
          countryCode,
          countryLabel: tCountries(countryCode),
          locale,
          sex,
          age,
          activity,
        }),
      });
      const data = (await res.json()) as {
        analysis?: string;
        error?: string;
      };
      if (!res.ok) {
        setAiInsight(null);
        return;
      }
      const text =
        typeof data.analysis === "string" ? data.analysis.trim() : "";
      setAiInsight(text || null);
      try {
        const planRaw = localStorage.getItem("fitbmi-plan");
        const planPrev = planRaw ? (JSON.parse(planRaw) as object) : {};
        localStorage.setItem(
          "fitbmi-plan",
          JSON.stringify({
            ...planPrev,
            insight: text || metrics.insight,
            aiInsight: text,
            ...snap,
          }),
        );
      } catch {
        /* ignore */
      }
    } catch {
      setAiInsight(null);
    } finally {
      setAiLoading(false);
    }
  }

  const categoryLabel = tCat(metrics.classification.labelKey);

  const insightInner = (
    <>
      <p className="mb-2 flex min-w-0 flex-wrap items-center gap-2 text-sm font-bold text-secondary">
        <span aria-hidden className="shrink-0 text-secondary">
          ✦
        </span>
        <span className="min-w-0">{t("insight.title")}</span>
      </p>
      <div className="min-w-0 max-w-full rounded-xl bg-zinc-50 p-4 lg:bg-white lg:p-0 lg:shadow-none">
        {aiLoading ? (
          <p className="animate-pulse text-sm leading-relaxed text-outline">
            {t("insight.aiLoading")}
          </p>
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-on-surface-variant [overflow-wrap:anywhere]">
            {aiInsight ?? metrics.insight}
          </p>
        )}
      </div>
      <div className="mt-4 grid min-w-0 grid-cols-2 gap-3">
        <div className="min-w-0 rounded-lg bg-surface-container-low p-3 text-center ring-1 ring-outline-variant/20">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-outline">
            {t("insight.metabolicAge")}
          </p>
          <p className="break-words font-data text-lg font-bold text-secondary">
            {metrics.metabolicAge} {t("insight.years")}
          </p>
        </div>
        <div className="min-w-0 rounded-lg bg-surface-container-low p-3 text-center ring-1 ring-outline-variant/20">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-outline">
            {t("insight.riskFactor")}
          </p>
          <p
            className={`break-words font-data text-lg font-bold ${
              metrics.risk === "minimal"
                ? "text-primary"
                : metrics.risk === "moderate"
                  ? "text-tertiary-container"
                  : "text-error"
            }`}
          >
            {tRisk(metrics.risk)}
          </p>
        </div>
      </div>
      <p className="mt-4 break-words text-[11px] leading-relaxed text-outline italic lg:text-xs [overflow-wrap:anywhere]">
        {t("disclaimer.ai")}
      </p>
    </>
  );

  return (
    <div className="min-w-0 pb-6 pt-2">
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-10">
        <section className="min-w-0 rounded-2xl bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-outline-variant/25">
          <div className="mb-5 hidden items-center gap-2 lg:flex">
            <span className="text-xl" aria-hidden>
              📋
            </span>
            <h2 className="font-heading text-lg font-semibold text-brand">
              {t("form.enterDetails")}
            </h2>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSex("male")}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-semibold transition ${
                sex === "male"
                  ? "border-primary bg-primary text-on-primary shadow-[var(--shadow-primary-cta)]"
                  : inactiveToggle
              }`}
            >
              ♂ {t("form.male")}
            </button>
            <button
              type="button"
              onClick={() => setSex("female")}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-semibold transition ${
                sex === "female"
                  ? "border-primary bg-primary text-on-primary shadow-[var(--shadow-primary-cta)]"
                  : inactiveToggle
              }`}
            >
              ♀ {t("form.female")}
            </button>
          </div>

          <div className="lg:hidden">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
              {t("form.country")}
            </label>
            <select
              className="vt-input mb-4"
              value={countryCode}
              onChange={(e) => {
                const code = e.target.value;
                setCountryCode(code);
                setUnits(defaultUnitsForCountry(code));
                document.cookie = `fitbmi-country=${encodeURIComponent(code)}; path=/; max-age=${60 * 60 * 24 * 180}; SameSite=Lax`;
                window.dispatchEvent(
                  new CustomEvent("fitbmi-country-change", {
                    detail: code,
                  }),
                );
              }}
            >
              {COUNTRY_CODES.map((code) => (
                <option key={code} value={code}>
                  {tCountries(code)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 flex gap-2">
            <button
              type="button"
              className={`min-h-11 flex-1 rounded-lg border-2 py-2 text-sm font-semibold transition ${
                units === "metric"
                  ? "border-primary bg-primary text-on-primary shadow-[var(--shadow-primary-cta)]"
                  : inactiveToggle
              }`}
              onClick={() => setUnits("metric")}
            >
              {t("form.unitsMetric")}
            </button>
            <button
              type="button"
              className={`min-h-11 flex-1 rounded-lg border-2 py-2 text-sm font-semibold transition ${
                units === "imperial"
                  ? "border-primary bg-primary text-on-primary shadow-[var(--shadow-primary-cta)]"
                  : inactiveToggle
              }`}
              onClick={() => setUnits("imperial")}
            >
              {t("form.unitsImperial")}
            </button>
          </div>

          {units === "metric" ? (
            <>
              <FieldLabel>{t("form.heightCm")}</FieldLabel>
              <div className="mb-4 flex items-center gap-3">
                <input
                  type="range"
                  min={140}
                  max={220}
                  step={1}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="vt-range flex-1"
                />
                <span className="font-data min-w-[4rem] text-right text-xl font-bold text-brand">
                  {heightCm}
                </span>
              </div>
              <FieldLabel>{t("form.weightKg")}</FieldLabel>
              <div className="mb-4 flex items-center gap-3">
                <input
                  type="range"
                  min={40}
                  max={150}
                  step={0.5}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="vt-range flex-1"
                />
                <span className="font-data min-w-[4rem] text-right text-xl font-bold text-brand">
                  {weightKg}
                </span>
              </div>
            </>
          ) : (
            <>
              <FieldLabel>{t("form.heightFtIn")}</FieldLabel>
              <div className="font-data mb-1 flex items-center justify-end text-xl font-bold text-brand">
                {dispFt}&apos; {dispIn}&quot;
              </div>
              <div className="mb-4 flex items-center gap-3">
                <input
                  type="range"
                  min={56}
                  max={90}
                  step={1}
                  value={heightInches}
                  onChange={(e) => setHeightInches(Number(e.target.value))}
                  className="vt-range flex-1"
                />
              </div>
              <FieldLabel>{t("form.weightLbs")}</FieldLabel>
              <div className="font-data mb-1 flex items-center justify-end text-xl font-bold text-brand">
                {weightLbs}
              </div>
              <div className="mb-4 flex items-center gap-3">
                <input
                  type="range"
                  min={90}
                  max={400}
                  step={1}
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(Number(e.target.value))}
                  className="vt-range flex-1"
                />
              </div>
            </>
          )}

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>{t("form.age")}</FieldLabel>
              <input
                type="number"
                min={12}
                max={100}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="vt-input"
              />
            </div>
            <div>
              <FieldLabel>{t("form.activity")}</FieldLabel>
              <select
                className="vt-input px-2"
                value={activity}
                onChange={(e) =>
                  setActivity(e.target.value as ActivityLevel)
                }
              >
                {(
                  [
                    "sedentary",
                    "light",
                    "moderate",
                    "active",
                    "very_active",
                  ] as ActivityLevel[]
                ).map((k) => (
                  <option key={k} value={k}>
                    {tAct(k)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void persistAndAnalyze()}
            disabled={aiLoading}
            className="min-h-12 w-full rounded-lg bg-primary py-3.5 text-center text-base font-semibold text-on-primary shadow-[var(--shadow-primary-cta)] transition hover:brightness-105 disabled:opacity-60"
          >
            {aiLoading ? t("form.analyzing") : t("form.analyze")}
          </button>

          <div className="mt-4 hidden gap-2 rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs leading-relaxed text-sky-950 lg:flex">
            <span aria-hidden>📍</span>
            <p>{t("form.infoBoxWeb")}</p>
          </div>
          <div className="mt-4 flex gap-2 rounded-lg bg-surface-container-low p-3 text-xs leading-relaxed text-on-surface-variant lg:hidden">
            <span className="text-lg leading-none text-secondary">ⓘ</span>
            <p>{t("infoBox")}</p>
          </div>
        </section>

        <aside className="hidden min-w-0 lg:flex lg:flex-col lg:gap-6">
          {!analyzed ? (
            <div className="flex min-h-[300px] flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/45 bg-surface-container-low/50 p-8 text-center text-sm leading-relaxed text-outline">
              {t("analysis.emptyDesktop")}
            </div>
          ) : (
            <>
              <section className="rounded-2xl border border-outline-variant/25 bg-surface p-6 shadow-[var(--shadow-card)]">
                <p className="font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-outline">
                  {t("analysis.scoreTitle")}
                </p>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <span className="font-data text-5xl font-bold leading-none text-brand lg:text-6xl">
                    {metrics.bmi}
                  </span>
                  <span className="shrink-0 rounded-full bg-primary-container px-4 py-2 text-sm font-bold text-brand">
                    {metrics.classification.key === "normal"
                      ? t("bmiCard.healthy")
                      : categoryLabel}
                  </span>
                </div>
                <div className="mt-8">
                  <BmiScaleBar bmi={metrics.bmi} variant="zones" />
                </div>
              </section>

              <section className="relative min-w-0 rounded-2xl border border-outline-variant/25 bg-surface p-6 shadow-[var(--shadow-card)]">
                <div
                  className="absolute bottom-0 left-0 top-0 w-1 rounded-l-2xl bg-secondary"
                  aria-hidden
                />
                <div className="min-w-0 pl-4">{insightInner}</div>
              </section>
            </>
          )}
        </aside>
      </div>

      {analyzed && (
        <div className="mt-6 flex min-w-0 flex-col gap-4 lg:hidden">
          <section className="-mx-5 min-w-0 border-y border-outline-variant/30 bg-surface px-5 py-6 shadow-[var(--shadow-card)]">
            <BmiDonut bmi={metrics.bmi} label={t("bmiCard.scoreLabel")} />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-on-surface">
                {categoryLabel}
              </span>
              <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-brand">
                {metrics.classification.key === "normal"
                  ? t("bmiCard.healthy")
                  : categoryLabel}
              </span>
            </div>
            <div className="mt-6">
              <BmiScaleBar bmi={metrics.bmi} variant="ticks" />
            </div>
          </section>

          <section className="relative -mx-5 min-w-0 border-y border-outline-variant/30 bg-surface px-5 py-6 shadow-[var(--shadow-card)]">
            <div
              className="absolute bottom-0 left-0 top-0 w-1 bg-secondary"
              aria-hidden
            />
            <div className="min-w-0 pl-4">{insightInner}</div>
          </section>
        </div>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-outline">
      {children}
    </span>
  );
}
