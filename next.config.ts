import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    /** Avoid picking parent monorepo lockfile when multiple package-lock.json exist */
    root: path.resolve(process.cwd()),
  },
};

export default withNextIntl(nextConfig);
