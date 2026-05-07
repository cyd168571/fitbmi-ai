import type { ActivityLevel, BmiClassification, BmiStandard } from "./bmi";
import {
  estimateBmr,
  estimateMetabolicAge,
  estimateTdee,
  healthyWeightRangeKg,
  japanBeautyWeights,
} from "./bmi";

export interface InsightInput {
  locale: string;
  bmi: number;
  standard: BmiStandard;
  classification: BmiClassification;
  sex: "male" | "female";
  age: number;
  weightKg: number;
  heightM: number;
  activity: ActivityLevel;
  tdee: number;
}

function isZh(locale: string) {
  return locale.startsWith("zh");
}

/** Rule-based “AI” copy (no external API) + numeric narrative. */
export function buildHealthInsight(input: InsightInput): string {
  const {
    locale,
    bmi,
    standard,
    classification,
    activity,
    tdee,
    age,
    weightKg,
    heightM,
  } = input;
  const zh = isZh(locale);
  const range = healthyWeightRangeKg(heightM, standard);
  const jpExtra =
    standard === "japan"
      ? zh
        ? ` 日本美容体重参考约为 ${japanBeautyWeights(heightM).beautyKg} kg，模特体重约为 ${japanBeautyWeights(heightM).modelKg} kg（仅供参考）。`
        : ` Japan cosmetic-weight references are often around ${japanBeautyWeights(heightM).beautyKg} kg and model-weight near ${japanBeautyWeights(heightM).modelKg} kg (informational only).`
      : "";

  if (classification.key === "normal") {
    return zh
      ? `您的 BMI 为 ${bmi}，依据所选区域标准为「正常」区间。结合年龄 ${age} 岁与「${activityLabel(activity, zh)}」活动强度，维持约 ${tdee} 千卡/日的摄入通常有助于保持当前代谢平衡。${jpExtra}`
      : `Your BMI of ${bmi} sits in the “normal” band for the selected regional standard. For your age (${age}) and ${activityLabelEn(activity)} activity, maintaining roughly ${tdee} kcal/day will likely support metabolic stability.${jpExtra}`;
  }

  if (classification.key === "underweight") {
    return zh
      ? `您的 BMI 为 ${bmi}，提示体重可能偏低。建议逐步增加营养密度（优质蛋白与复合碳水），并结合阻力训练；目标可参考身高对应的健康体重区间约 ${range.min}–${range.max} kg。`
      : `Your BMI is ${bmi}, which suggests underweight for adults. Consider gradual, nutrient-dense gains (protein + complex carbs) and strength training; a healthy reference band for your height is about ${range.min}–${range.max} kg.`;
  }

  if (
    classification.key === "overweight" ||
    classification.key === "overweight_risk"
  ) {
    const lose = Math.max(0, Math.round((weightKg - range.max) * 10) / 10);
    return zh
      ? `您的 BMI 为 ${bmi}，处于「${classification.key === "overweight_risk" ? "超重风险" : "超重"}」范围。若向健康区间靠近，约需关注 ${lose} kg 左右的体重管理空间（个体化差异较大）。建议适度热量缺口（约 300–500 千卡/日）并结合步行与力量训练。`
      : `Your BMI is ${bmi}, in the overweight range for this standard. Closing toward a healthier band may involve roughly ${lose} kg of weight change (highly individual). A modest deficit (about 300–500 kcal/day) plus walking and strength work is a sensible starting point.`;
  }

  return zh
    ? `您的 BMI 为 ${bmi}，已达肥胖范围，建议与医生讨论心血管与代谢风险，并制定可持续的饮食与运动计划。健康体重参考区间约为 ${range.min}–${range.max} kg。`
    : `Your BMI is ${bmi}, in the obesity range. Discuss cardiometabolic risks with a clinician and plan sustainable nutrition and movement. A reference healthy-weight band for your height is about ${range.min}–${range.max} kg.`;
}

function activityLabel(level: ActivityLevel, zh: boolean): string {
  if (!zh) return activityLabelEn(level);
  const map: Record<ActivityLevel, string> = {
    sedentary: "久坐",
    light: "轻度",
    moderate: "中等",
    active: "活跃",
    very_active: "极高",
  };
  return map[level];
}

function activityLabelEn(level: ActivityLevel): string {
  const map: Record<ActivityLevel, string> = {
    sedentary: "sedentary",
    light: "light",
    moderate: "moderate",
    active: "active",
    very_active: "very active",
  };
  return map[level];
}

export function buildActionPlan(input: InsightInput): string {
  const { locale, bmi, classification, tdee, activity, weightKg, heightM } =
    input;
  const zh = isZh(locale);
  const deficit = 400;
  const targetKcal = Math.max(1200, tdee - deficit);
  const weeks = Math.min(
    24,
    Math.max(
      6,
      Math.round(
        ((weightKg - healthyWeightRangeKg(heightM, input.standard).max) /
          0.5) *
          2,
      ),
    ),
  );

  if (classification.key === "normal") {
  return zh
    ? `维持策略：优先睡眠 7–8 小时、蛋白质均衡摄入，并保持当前活动水平（${activityLabel(activity, zh)}）。估算维持热量约 ${tdee} 千卡/日。`
      : `Maintenance focus: 7–8h sleep, balanced protein, and keep your current activity (${activityLabelEn(activity)}). Estimated maintenance is ~${tdee} kcal/day.`;
  }

  if (classification.key === "underweight") {
    return zh
      ? `增重策略：每周小幅热量盈余（约 +200–300 千卡），优先力量训练 2–3 次/周，并跟踪体重趋势而非单日波动。`
      : `Gain plan: small surplus (+200–300 kcal/day), strength training 2–3×/week, track weekly trends—not single-day swings.`;
  }

  return zh
    ? `减脂路径（示例）：目标摄入约 ${targetKcal} 千卡/日（相对估算 TDEE ${tdee}），每日步行 8000+ 步，力量训练每周 3 次；预估周期约 ${weeks} 周（因人而异）。当前 BMI ${bmi}。`
    : `Fat-loss path (example): aim ~${targetKcal} kcal/day vs estimated TDEE ${tdee}, 8k+ steps/day, strength 3×/week; rough horizon ~${weeks} weeks (individual). Current BMI ${bmi}.`;
}

export function buildInsightMetrics(input: InsightInput) {
  const bmr = estimateBmr({
    sex: input.sex,
    age: input.age,
    weightKg: input.weightKg,
    heightCm: input.heightM * 100,
  });
  return {
    metabolicAge: estimateMetabolicAge({
      age: input.age,
      bmi: input.bmi,
      activity: input.activity,
    }),
    tdee: estimateTdee(bmr, input.activity),
    bmr,
  };
}
