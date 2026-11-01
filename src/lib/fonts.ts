import localFont from "next/font/local";

/**
 * فونت وزیرمتن (variable) به‌صورت self-hosted با next/font:
 * بدون درخواست خارجی، با display:swap و بدون Layout Shift.
 */
export const vazirmatn = localFont({
  src: "../fonts/Vazirmatn-Variable.woff2",
  display: "swap",
  variable: "--font-vazirmatn",
  weight: "100 900",
  fallback: ["Tahoma", "Segoe UI", "Arial", "sans-serif"],
});
