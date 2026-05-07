import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh", "ja", "ko", "pt", "es", "fr", "de"],
  defaultLocale: "en",
  localePrefix: "always",
});
