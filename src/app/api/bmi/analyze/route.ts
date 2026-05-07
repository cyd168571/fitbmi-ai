import {
  classifyBmi,
  cmToMeters,
  computeBmi,
  type BmiCategoryKey,
} from "@/lib/bmi";
import { generateBMIAnalysis } from "@/lib/ai/deepseek";
import { standardForCountry } from "@/lib/region";

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
  if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase();
  const code = COUNTRY_NAME_TO_CODE[t.toLowerCase()];
  return code ?? "US";
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

    const standard = standardForCountry(
      resolveCountryCode(body.country ?? body.countryCode),
    );
    const heightM = cmToMeters(heightCm);
    const bmi = computeBmi(weightKg, heightM);
    const classification = classifyBmi(bmi, standard);
    const category = CATEGORY_EN[classification.key];

    const countryLabel =
      typeof body.country === "string" && body.country.trim()
        ? body.country.trim()
        : "Unknown";
    const language =
      typeof body.language === "string" && body.language.trim()
        ? body.language.trim()
        : "English";
    const gender =
      typeof body.gender === "string" ? body.gender : undefined;
    const age = typeof body.age === "number" ? body.age : undefined;

    let analysis: string;
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const text = await generateBMIAnalysis({
          bmi,
          category,
          country: countryLabel,
          language,
          gender,
          age,
        });
        analysis = text?.trim() || "";
      } catch (e) {
        console.error("Deepseek error:", e);
        analysis = "";
      }
    } else {
      analysis = "";
    }

    if (!analysis) {
      analysis = `BMI is ${bmi} (${category}). This is a short summary when the AI service is unavailable. For personalized guidance, set DEEPSEEK_API_KEY and try again. Not a medical diagnosis.`;
    }

    return Response.json({ bmi, category, analysis });
  } catch (error) {
    console.error("API ERROR:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
