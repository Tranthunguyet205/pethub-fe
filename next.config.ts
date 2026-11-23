import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Đặt bởi `next upgrade --agent=security` khi nâng 16.4.2 -> 16.4.6
    // (bản 16.4.2 nằm trong một advisory bảo mật đã công bố).
    agentUpgrade: 'security',
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
