import {
  classifyBmi,
  cmToMeters,
  computeBmi,
  type ActivityLevel,
  type BmiCategoryKey,
} from "@/lib/bmi";
import {
  BMI_ANALYSIS_MAX_CHARS,
  generateBMIAnalysis,
  isDeepseekConfigured,
} from "@/lib/ai/deepseek";
import { normalizeCountryCode, standardForCountry } from "@/lib/region";

const CATEGORY_EN: Record<BmiCategoryKey, string> = {
  underweight: "Underweight",
  normal: "Normal",
  overweight: "Overweight",
  overweight_risk: "Overweight risk",
  obese: "Obese",
};

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "united states": "US",
  usa: "US",
  "united kingdom": "GB",
  uk: "GB",
  japan: "JP",
  china: "CN",
  "south korea": "KR",
  korea: "KR",
  germany: "DE",
  france: "FR",
  brazil: "BR",
  spain: "ES",
  mexico: "MX",
  india: "IN",
  italy: "IT",
  canada: "CA",
  australia: "AU",
};

function resolveCountryCode(input: unknown): string {
  if (typeof input !== "string") return "US";
  const t = input.trim();
  let code: string;
  if (/^[A-Za-z]{2}$/.test(t)) code = t.toUpperCase();
  else code = COUNTRY_NAME_TO_CODE[t.toLowerCase()] ?? "US";
  return normalizeCountryCode(code);
}

function resolveCountryLabel(body: Record<string, unknown>, code: string): string {
  if (typeof body.countryLabel === "string" && body.countryLabel.trim()) {
    return body.countryLabel.trim();
  }
  if (typeof body.country === "string" && body.country.trim().length > 2) {
    return body.country.trim();
  }
  return code;
}

function parseActivity(input: unknown): ActivityLevel {
  const s = typeof input === "string" ? input : "";
  const levels: ActivityLevel[] = [
    "sedentary",
    "light",
    "moderate",
    "active",
    "very_active",
  ];
  return levels.includes(s as ActivityLevel) ? (s as ActivityLevel) : "moderate";
}

function parseSex(input: unknown): "male" | "female" {
  return input === "female" ? "female" : "male";
}

function parseAge(input: unknown): number {
  const n = typeof input === "number" ? input : Number(input);
  if (!Number.isFinite(n)) return 30;
  return Math.min(100, Math.max(12, Math.round(n)));
}

/** Infer UI locale when only `language` string is sent (legacy demo form). */
function resolveLocale(body: Record<string, unknown>): string {
  if (typeof body.locale === "string" && body.locale.trim()) {
    return body.locale.trim();
  }
  const lang = typeof body.language === "string" ? body.language.toLowerCase() : "";
  if (lang.includes("中文") || lang.includes("chinese")) return "zh";
  if (lang.includes("日本語") || lang.includes("japanese")) return "ja";
  if (lang.includes("한국") || lang.includes("korean")) return "ko";
  if (lang.includes("português") || lang.includes("portuguese")) return "pt";
  if (lang.includes("español") || lang.includes("spanish")) return "es";
  if (lang.includes("français") || lang.includes("french")) return "fr";
  if (lang.includes("deutsch") || lang.includes("german")) return "de";
  return "en";
}

export async function POST(req: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const heightCm = Number(body.height);
    const weightKg = Number(body.weight);
    if (
      !Number.isFinite(heightCm) ||
      !Number.isFinite(weightKg) ||
      heightCm <= 0 ||
      weightKg <= 0
    ) {
      return Response.json(
        { error: "Valid positive height (cm) and weight (kg) are required" },
        { status: 400 },
      );
    }

    const countryCode = resolveCountryCode(body.countryCode ?? body.country);
    const standard = standardForCountry(countryCode);
    const heightM = cmToMeters(heightCm);
    const bmi = computeBmi(weightKg, heightM);
    const classification = classifyBmi(bmi, standard);
    const category = CATEGORY_EN[classification.key];

    const countryLabel = resolveCountryLabel(body, countryCode);
    const locale = resolveLocale(body);

    let analysis: string;
    if (isDeepseekConfigured()) {
      try {
        analysis = await generateBMIAnalysis({
          bmi,
          categoryKey: classification.key,
          categoryLabelEn: category,
          bmiStandard: standard,
          countryCode,
          countryLabel,
          locale,
          sex: parseSex(body.sex),
          age: parseAge(body.age),
          activity: parseActivity(body.activity),
        });
      } catch (e) {
        console.error("Deepseek error:", e);
        const errText = e instanceof Error ? e.message : String(e);
        const noBalance =
          errText.includes("402") || /insufficient balance/i.test(errText);
        if (noBalance) {
          analysis = locale.startsWith("zh")
            ? `BMI 为 ${bmi}（${category}）。Deepseek 返回账户余额不足，请在 Deepseek 控制台充值后再试。非医疗诊断。`
            : `BMI ${bmi} (${category}). Deepseek returned insufficient account balance—add credits in the Deepseek console, then try again. Informational only.`;
        } else {
          analysis = "";
        }
      }
    } else {
      analysis = "";
    }

    if (!analysis) {
      if (isDeepseekConfigured()) {
        analysis = locale.startsWith("zh")
          ? `BMI 为 ${bmi}（${category}）。AI 分析暂不可用，请稍后重试。非医疗诊断，仅供参考。`
          : `BMI ${bmi} (${category}). AI analysis is temporarily unavailable. Not medical advice.`;
      } else {
        analysis = locale.startsWith("zh")
          ? `BMI 为 ${bmi}（${category}）。当前无法连接 AI 分析服务，请在 .env.local 中配置 DEEPSEEK_API_KEY 或 Deepseek_api_key 后重试。非医疗诊断，仅供参考。`
          : `BMI ${bmi} (${category}). AI analysis unavailable — set DEEPSEEK_API_KEY or Deepseek_api_key in .env.local. Informational only, not medical advice.`;
      }
    }

    return Response.json({
      bmi,
      category,
      analysis,
      maxChars: BMI_ANALYSIS_MAX_CHARS,
    });
  } catch (error) {
    console.error("API ERROR:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
