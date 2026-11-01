/**
 * تنظیمات سراسری سایت — تنها محل مدیریت نام برند و آدرس پایه.
 * آدرس پایه از متغیر محیطی NEXT_PUBLIC_SITE_URL خوانده می‌شود تا پس از
 * اتصال دامنه اختصاصی، URLهای Canonical و Sitemap به‌درستی ساخته شوند.
 * در نبود این متغیر (محیط توسعه/پیش‌نمایش) از localhost استفاده می‌شود.
 */

export const SITE_NAME = "Arsham Lab";
export const SITE_NAME_FA = "آرشام لب";
export const SITE_TAGLINE = "ابزارهای کاربردی آرشام";
export const SITE_DESCRIPTION =
  "ابزارهای ساده، سریع و رایگان برای انجام کارهای روزمره؛ بدون نیاز به ثبت‌نام.";
export const SITE_LOCALE = "fa_IR";

const FALLBACK_SITE_URL = "http://localhost:3000";

/** آدرس پایه سایت (بدون اسلش انتهایی) */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

/** ساخت URL مطلق برای صفحات داخلی */
export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return p === "/" ? base : `${base}${p}`;
}

/** ایمیل تماس — فقط در صورت تنظیم توسط مالک سایت نمایش داده می‌شود */
export function getContactEmail(): string | null {
  const raw = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return raw ? raw : null;
}

/**
 * تنظیمات تبلیغات.
 * تا وقتی NEXT_PUBLIC_ADS_ENABLED برابر "true" نباشد هیچ جایگاهی رندر نمی‌شود
 * و هیچ کد یا آمار ساختگی تبلیغاتی نمایش داده نمی‌شود.
 */
export const ADS = {
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === "true",
  slots: {
    homeHero: process.env.NEXT_PUBLIC_AD_HOME_HERO_CODE?.trim() ?? "",
    toolInContent: process.env.NEXT_PUBLIC_AD_TOOL_IN_CONTENT_CODE?.trim() ?? "",
  },
} as const;

export type AdSlotId = keyof typeof ADS.slots;
