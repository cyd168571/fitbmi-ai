import type { BmiStandard } from "./bmi";

export interface CountryOption {
  code: string;
  nameKey: string;
}

/** ISO-like codes → UI keys + default BMI standard (PRD). */
export const COUNTRY_STANDARD: Record<string, BmiStandard> = {
  JP: "japan",
  CN: "asian",
  TW: "asian",
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

export function standardForCountry(code: string): BmiStandard {
  return COUNTRY_STANDARD[code] ?? "who";
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
  "TW",
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
