import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

async function loadMessages(locale: string) {
  try {
    const mod = await import(`../messages/${locale}.json`);
    return mod.default;
  } catch {
    const fallback = await import(`../messages/en.json`);
    return fallback.default;
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: await loadMessages(locale),
  };
});
