import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_SCENE_MAX_MB: process.env.VERCEL ? "4" : "60" },
  turbopack: {
    root: process.cwd(),
    resolveAlias: { "@/lib/runtime-env": "./lib/vercel-env.ts" },
  },
  webpack(config) {
    if (process.env.VERCEL) config.resolve.alias["@/lib/runtime-env"] = `${process.cwd()}/lib/vercel-env.ts`;
    return config;
  },
};

export default nextConfig;
