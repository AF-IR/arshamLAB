import type { NextConfig } from "next";

/**
 * distDir به‌صورت پیش‌فرض .next است؛ برای «بررسی Build تولیدی» بدون دست‌زدن به
 * سرور توسعه می‌توان با متغیر NEXT_DIST_DIR مسیر جدا گذاشت:
 *   NEXT_DIST_DIR=.next-prod bunx next build
 */
const nextConfig: NextConfig = {
  output: "standalone",
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
