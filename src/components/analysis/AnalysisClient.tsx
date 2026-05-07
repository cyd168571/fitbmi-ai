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
import { COUNTRY_CODES, standardForCountry } from "@/lib/region";
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

  /* Cookie + localStorage only exist on the client; hydrate after mount to avoid SSR mismatch. */
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- client-only hydration */
    const c = readCountryCookie();
    if (c && COUNTRY_CODES.includes(c)) {
      setCountryCode(c);
      setUnits(defaultUnitsForCountry(c));
    }
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const s = JSON.parse(raw) as Partial<Snapshot>;
        if (s.countryCode) setCountryCode(s.countryCode);
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

  const standard = useMemo(
    () => standardForCountry(countryCode),
    [countryCode],
  );

  const metrics = useMemo(() => {
    const { ft, inch } = splitInches(heightInches);
    const heightMeters =
      units === "metric"
        ? cmToMeters(heightCm)
        : ftInToMeters(ft, inch);
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

  function persistAndAnalyze() {
    const snap: Snapshot = {
      countryCode,
      sex,
      age,
      activity,
      units,
      heightCm:
        units === "metric" ? heightCm : cmFromInches(heightInches),
      weightKg:
        units === "metric" ? weightKg : lbsToKg(weightLbs),
      bmi: metrics.bmi,
      standard,
      analyzedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE, JSON.stringify(snap));
      localStorage.setItem(
        "fitbmi-plan",
        JSON.stringify({ plan: metrics.plan, insight: metrics.insight, ...snap }),
      );
    } catch {
      /* ignore */
    }
    setAnalyzed(true);
  }

  const categoryLabel = tCat(metrics.classification.labelKey);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 pb-10 pt-4">
      <section className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSex("male")}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition ${
              sex === "male"
                ? "border-[#2ECC71] bg-emerald-50 text-[#1B5E20]"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            ♂ {t("form.male")}
          </button>
          <button
            type="button"
            onClick={() => setSex("female")}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition ${
              sex === "female"
                ? "border-[#2ECC71] bg-emerald-50 text-[#1B5E20]"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            ♀ {t("form.female")}
          </button>
        </div>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {t("form.country")}
        </label>
        <select
          className="mb-4 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-[#2ECC71]"
          value={countryCode}
          onChange={(e) => {
            const code = e.target.value;
            setCountryCode(code);
            setUnits(defaultUnitsForCountry(code));
          }}
        >
          {COUNTRY_CODES.map((code) => (
            <option key={code} value={code}>
              {tCountries(code)}
            </option>
          ))}
        </select>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            className={`flex-1 rounded-xl border py-2 text-sm font-semibold ${
              units === "metric"
                ? "border-[#2ECC71] bg-emerald-50 text-[#1B5E20]"
                : "border-zinc-200"
            }`}
            onClick={() => setUnits("metric")}
          >
            {t("form.unitsMetric")}
          </button>
          <button
            type="button"
            className={`flex-1 rounded-xl border py-2 text-sm font-semibold ${
              units === "imperial"
                ? "border-[#2ECC71] bg-emerald-50 text-[#1B5E20]"
                : "border-zinc-200"
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
                className="h-2 flex-1 accent-[#2196F3]"
              />
              <span className="min-w-[4rem] text-right text-xl font-bold text-[#1B5E20]">
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
                className="h-2 flex-1 accent-[#2196F3]"
              />
              <span className="min-w-[4rem] text-right text-xl font-bold text-[#1B5E20]">
                {weightKg}
              </span>
            </div>
          </>
        ) : (
          <>
            <FieldLabel>{t("form.heightFtIn")}</FieldLabel>
            <div className="mb-1 flex items-center justify-end text-xl font-bold text-[#1B5E20]">
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
                className="h-2 flex-1 accent-[#2196F3]"
              />
            </div>
            <FieldLabel>{t("form.weightLbs")}</FieldLabel>
            <div className="mb-1 flex items-center justify-end text-xl font-bold text-[#1B5E20]">
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
                className="h-2 flex-1 accent-[#2196F3]"
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
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#2ECC71]"
            />
          </div>
          <div>
            <FieldLabel>{t("form.activity")}</FieldLabel>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-2 py-2 text-sm font-semibold outline-none focus:border-[#2ECC71]"
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
          onClick={persistAndAnalyze}
          className="w-full rounded-2xl bg-[#2ECC71] py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-emerald-200/60 transition hover:bg-[#26b863]"
        >
          {t("form.analyze")}
        </button>

        <div className="mt-4 flex gap-2 rounded-xl bg-zinc-100 p-3 text-xs leading-relaxed text-zinc-600">
          <span className="text-lg leading-none text-zinc-400">ⓘ</span>
          <p>{t("infoBox")}</p>
        </div>
      </section>

      {analyzed && (
        <>
          <section className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100">
            <BmiDonut bmi={metrics.bmi} label={t("bmiCard.scoreLabel")} />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-700">
                {categoryLabel}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#1B5E20]">
                {metrics.classification.key === "normal"
                  ? t("bmiCard.healthy")
                  : categoryLabel}
              </span>
            </div>
            <div className="mt-6">
              <BmiScaleBar bmi={metrics.bmi} />
            </div>
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-zinc-100 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="absolute left-0 top-0 h-full w-1 bg-[#2196F3]" />
            <div className="pl-3">
              <p className="mb-2 flex items-center gap-2 text-sm font-bold text-[#2196F3]">
                <span aria-hidden>✦</span> {t("insight.title")}
              </p>
              <p className="text-sm leading-relaxed text-zinc-700">
                {metrics.insight}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-zinc-50 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                    {t("insight.metabolicAge")}
                  </p>
                  <p className="text-lg font-bold text-[#2196F3]">
                    {metrics.metabolicAge} {t("insight.years")}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                    {t("insight.riskFactor")}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      metrics.risk === "minimal"
                        ? "text-[#2ECC71]"
                        : metrics.risk === "moderate"
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {tRisk(metrics.risk)}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
                {t("disclaimer.ai")}
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
      {children}
    </span>
  );
}
