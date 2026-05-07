export type BmiStandard = "who" | "asian" | "japan";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function activityFactor(level: ActivityLevel): number {
  return ACTIVITY_FACTORS[level];
}

export function lbsToKg(lbs: number): number {
  return lbs * 0.45359237;
}

export function ftInToMeters(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return totalInches * 0.0254;
}

export function cmToMeters(cm: number): number {
  return cm / 100;
}

export function kgToLbs(kg: number): number {
  return kg / 0.45359237;
}

export function metersToCm(m: number): number {
  return m * 100;
}

export function computeBmi(weightKg: number, heightM: number): number {
  if (heightM <= 0 || weightKg <= 0) return 0;
  const raw = weightKg / (heightM * heightM);
  return Math.round(raw * 10) / 10;
}

export type BmiCategoryKey =
  | "underweight"
  | "normal"
  | "overweight"
  | "overweight_risk"
  | "obese";

export interface BmiClassification {
  key: BmiCategoryKey;
  labelKey: string;
  riskLevel: "minimal" | "moderate" | "high";
}

export function classifyBmi(bmi: number, standard: BmiStandard): BmiClassification {
  if (bmi < 18.5) {
    return {
      key: "underweight",
      labelKey: "underweight",
      riskLevel: "moderate",
    };
  }

  if (standard === "who") {
    if (bmi < 25) {
      return { key: "normal", labelKey: "normal", riskLevel: "minimal" };
    }
    if (bmi < 30) {
      return { key: "overweight", labelKey: "overweight", riskLevel: "moderate" };
    }
    return { key: "obese", labelKey: "obese", riskLevel: "high" };
  }

  // Asian & Japan use Asia-Pacific consensus cuts from PRD
  if (bmi <= 22.9) {
    return { key: "normal", labelKey: "normal", riskLevel: "minimal" };
  }
  if (bmi <= 24.9) {
    return {
      key: "overweight_risk",
      labelKey: "overweightRisk",
      riskLevel: "moderate",
    };
  }
  return { key: "obese", labelKey: "obese", riskLevel: "high" };
}

/** Mifflin–St Jeor kcal/day */
export function estimateBmr(params: {
  sex: "male" | "female";
  age: number;
  weightKg: number;
  heightCm: number;
}): number {
  const { sex, age, weightKg, heightCm } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const raw = sex === "male" ? base + 5 : base - 161;
  return Math.round(raw);
}

export function estimateTdee(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * activityFactor(activity));
}

/** Heuristic “metabolic age” for display — not clinical. */
export function estimateMetabolicAge(params: {
  age: number;
  bmi: number;
  activity: ActivityLevel;
}): number {
  const { age, bmi, activity } = params;
  const activityBonus =
    activity === "sedentary" ? 2 : activity === "light" ? 1 : 0;
  const bmiShift = (bmi - 22) * 0.7;
  const raw = age - activityBonus + bmiShift;
  return Math.max(15, Math.min(85, Math.round(raw)));
}

/** Japan “beauty weight” / model weight (common clinical cosmetic references). */
export function japanBeautyWeights(heightM: number): { beautyKg: number; modelKg: number } {
  const m = heightM;
  return {
    beautyKg: Math.round(m * m * 21 * 10) / 10,
    modelKg: Math.round(m * m * 19 * 10) / 10,
  };
}

/** Healthy BMI range in WHO normal → weight band for height */
export function healthyWeightRangeKg(heightM: number, standard: BmiStandard): { min: number; max: number } {
  const lo = standard === "who" ? 18.5 : 18.5;
  const hi = standard === "who" ? 24.9 : 22.9;
  const min = Math.round(lo * heightM * heightM * 10) / 10;
  const max = Math.round(hi * heightM * heightM * 10) / 10;
  return { min, max };
}
