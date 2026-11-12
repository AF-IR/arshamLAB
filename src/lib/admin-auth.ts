/**
 * احراز هویت پنل مدیریت — توکن HMAC-SHA256 مشتق‌شده از رمز عبور.
 * رمز از متغیر محیطی ADMIN_PASSWORD خوانده می‌شود و توکن در کوکی httpOnly
 * نگه‌داری می‌شود. با تغییر رمز، همه توکن‌های قبلی بی‌اعتبار می‌شوند.
 */

import crypto from "node:crypto";

export const ADMIN_COOKIE = "arsham_admin";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // یک هفته

const TOKEN_SCOPE = "arsham-lab/admin-session/v1";

/** رمز عبور ادمین — در استقرار حتماً با متغیر ADMIN_PASSWORD مقدار جدید بگذارید */
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "arsham1404";
}

function hmacHex(key: string, message: string): string {
  return crypto.createHmac("sha256", key).update(message).digest("hex");
}

/** توکن نشست ادمین — فقط در زمان ورود موفق تولید می‌شود */
export function createAdminToken(): string {
  return hmacHex(getAdminPassword(), TOKEN_SCOPE);
}

/** مقایسه زمان-ثابت برای جلوگیری از حملات timing */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  return safeEqual(token, createAdminToken());
}

export function checkAdminPassword(password: unknown): boolean {
  if (typeof password !== "string" || password.length === 0 || password.length > 200) return false;
  return safeEqual(password, getAdminPassword());
}

/* ------------------------- محدودسازی تلاش ورود (in-memory) ------------------------ */

interface AttemptRecord {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 6;
const WINDOW_MS = 10 * 60 * 1000; // ۱۰ دقیقه

/** آیا این IP در بازه جاری اجازه تلاش ورود دارد؟ */
export function canAttemptLogin(ip: string): boolean {
  const rec = attempts.get(ip);
  if (!rec) return true;
  if (Date.now() > rec.resetAt) {
    attempts.delete(ip);
    return true;
  }
  return rec.count < MAX_ATTEMPTS;
}

/** ثبت یک تلاش ناموفق */
export function recordFailedAttempt(ip: string): void {
  const rec = attempts.get(ip);
  if (!rec || Date.now() > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: Date.now() + WINDOW_MS });
    return;
  }
  rec.count += 1;
}

/** پاک‌سازی تلاش‌ها پس از ورود موفق */
export function clearAttempts(ip: string): void {
  attempts.delete(ip);
}

/** استخراج IP تقریبی کلاینت از هدرها */
export function clientIpFrom(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
