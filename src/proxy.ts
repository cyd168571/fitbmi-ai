import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { normalizeCountryCode } from "./lib/region";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const geoRaw =
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-vercel-ip-country") ??
    "US";
  const geo = normalizeCountryCode(geoRaw);
  const response = intlMiddleware(request);
  response.cookies.set("fitbmi-country", geo, {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
