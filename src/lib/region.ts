import type { BmiStandard } from "./bmi";

export interface CountryOption {
  code: string;
  nameKey: string;
}

/** ISO-like codes → UI keys + default BMI standard (PRD). */
export const COUNTRY_STANDARD: Record<string, BmiStandard> = {
  JP: "japan",
  CN: "asian",
  HK: "asian",
  SG: "asian",
  IN: "asian",
  KR: "asian",
  MY: "asian",
  TH: "asian",
  VN: "asian",
  PH: "asian",
  ID: "asian",
  BD: "asian",
  PK: "asian",
};

/** Taiwan is not a selectable region; TW geo/cookie maps to CN for standards. */
export function normalizeCountryCode(code: string): string {
  return code === "TW" ? "CN" : code;
}

export function standardForCountry(code: string): BmiStandard {
  const key = normalizeCountryCode(code);
  return COUNTRY_STANDARD[key] ?? "who";
}

export const COUNTRY_CODES: string[] = [
  "US",
  "GB",
  "CA",
  "AU",
  "DE",
  "FR",
  "BR",
  "PT",
  "ES",
  "MX",
  "JP",
  "KR",
  "CN",
  "HK",
  "SG",
  "IN",
  "RU",
  "IT",
  "NL",
  "SE",
  "NO",
  "DK",
  "FI",
  "PL",
  "AR",
  "CL",
  "CO",
  "AE",
  "SA",
  "EG",
  "ZA",
  "NG",
  "OTHER",
];
