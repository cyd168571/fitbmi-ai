import OpenAI from "openai";
import type { ActivityLevel, BmiStandard } from "@/lib/bmi";
import { truncateCodePoints } from "@/lib/text/truncate";

/** Supports `DEEPSEEK_API_KEY` (recommended) or `Deepseek_api_key` from .env.local */
export function getDeepseekApiKey(): string | undefined {
  const a = process.env.DEEPSEEK_API_KEY?.trim();
  const b = process.env.Deepseek_api_key?.trim();
  return a || b || undefined;
}

export function isDeepseekConfigured(): boolean {
  return Boolean(getDeepseekApiKey());
}

function createDeepseekClient() {
  const apiKey = getDeepseekApiKey();
  if (!apiKey) {
    throw new Error("Deepseek API key not configured");
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });
}

/** Max analysis length (characters / 字) */
export const BMI_ANALYSIS_MAX_CHARS = 220;

const LOCALE_OUTPUT_LANGUAGE: Record<string, string> = {
  en: "English",
  zh: "Simplified Chinese (简体中文)",
  ja: "Japanese (日本語)",
  ko: "Korean (한국어)",
  pt: "Portuguese (Brazilian Portuguese where relevant)",
  es: "Spanish",
  fr: "French",
  de: "German",
};

const ACTIVITY_EN: Record<ActivityLevel, string> = {
  sedentary: "Sedentary — little or no structured exercise",
  light: "Light — light exercise 1–3 days/week",
  moderate: "Moderate — moderate exercise 3–5 days/week",
  active: "Active — hard exercise 6–7 days/week",
  very_active: "Very active — intense daily exercise or physical job",
};

function standardNarrative(standard: BmiStandard): string {
  switch (standard) {
    case "who":
      return "WHO international adult cut-offs (e.g. normal weight often 18.5–24.9 kg/m² for global reference).";
    case "asian":
      return "Asia-Pacific consensus — normal weight upper bound often ≤22.9 kg/m²; different overweight/obesity thresholds than WHO for many Asian populations.";
    case "japan":
      return "Japan clinical practice aligns with Asia-Pacific BMI thresholds; cosmetic weight references may appear in local contexts but are not diagnostic.";
    default:
      return "Regional BMI standard selected from user country.";
  }
}

export type BmiAnalysisParams = {
  bmi: number;
  categoryKey: string;
  categoryLabelEn: string;
  bmiStandard: BmiStandard;
  countryCode: string;
  /** Localized country name as shown to the user (e.g. 中国 / Japan) */
  countryLabel: string;
  locale: string;
  sex: "male" | "female";
  age: number;
  activity: ActivityLevel;
};

export async function generateBMIAnalysis(
  data: BmiAnalysisParams,
): Promise<string> {
  const outputLang =
    LOCALE_OUTPUT_LANGUAGE[data.locale] ??
    LOCALE_OUTPUT_LANGUAGE.en ??
    "English";

  const activityDesc =
    ACTIVITY_EN[data.activity] ?? ACTIVITY_EN.moderate;

  const prompt = `You are a supportive health-information assistant (not a doctor).

Write exactly ONE compact paragraph in ${outputLang} only.

User & measurement context:
- BMI: ${data.bmi} kg/m²
- Classification under this app's regional standard (${data.bmiStandard.toUpperCase()}): ${data.categoryLabelEn} [internal key: ${data.categoryKey}]
- How this standard works (for your reasoning only): ${standardNarrative(data.bmiStandard)}
- Country/region (localize examples to this context — typical foods, activity norms, climate, urban vs rural cues where helpful; avoid stereotypes): ${data.countryLabel} (ISO: ${data.countryCode})
- Age: ${data.age}, Sex: ${data.sex}, Activity: ${activityDesc}

Your paragraph MUST include both:
(1) A brief interpretation of what this BMI means under the regional standard above (not a diagnosis).
(2) One or two concrete, personalized lifestyle suggestions tailored to this person's age, sex, activity level, AND country context.

Hard limits:
- Maximum ${BMI_ANALYSIS_MAX_CHARS} Unicode characters total (each Chinese/Japanese/Korean character counts as one).
- Plain text only — no markdown, no bullet symbols, no title line.
- Safe tone; no disease claims; encourage professional care when relevant in one short clause if space allows.

If a short disclaimer fits within the character budget in ${outputLang}, end with a brief note that this is AI-generated information and not medical advice; otherwise omit disclaimer to stay within ${BMI_ANALYSIS_MAX_CHARS} characters.`;

  const client = createDeepseekClient();
  const completion = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content:
          "You output only the requested paragraph in the user's language. Respect character limits strictly.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.65,
    max_tokens: 900,
  });

  const raw = completion.choices[0].message.content?.trim() ?? "";
  return truncateCodePoints(raw, BMI_ANALYSIS_MAX_CHARS);
}
