/**
 * منطق خالص محاسبات درصدی + تجزیه ورودی کاربر با پشتیبانی از ارقام فارسی/عربی.
 */

import { toEnglishDigits } from "./text-utils";

/** تبدیل ورودی کاربر به عدد؛ ورودی نامعتبر → null */
export function parseNumberInput(raw: string): number | null {
  if (!raw) return null;
  let s = toEnglishDigits(raw).trim();
  s = s.replace(/[٬,\s_]/g, ""); // جداکننده هزارگان و فاصله‌ها
  s = s.replace(/[٫]/g, "."); // ممیز فارسی/عربی
  s = s.replace(/٪|%/g, ""); // علامت درصد در صورت تایپ
  if (!/^-?\d*\.?\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** قالب‌بندی عدد برای نمایش با ارقام فارسی */
export function formatFa(value: number, maxFractionDigits = 2): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Number(value.toFixed(maxFractionDigits));
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: maxFractionDigits }).format(
    rounded
  );
}

export type CalcResult =
  | { ok: true; value: number; extra?: Record<string, number> }
  | { ok: false; error: string };

type OkCalc = Extract<CalcResult, { ok: true }>;

/** درصدی از یک عدد: (p ÷ ۱۰۰) × number — همیشه موفق */
export function percentOf(p: number, number: number): OkCalc {
  return { ok: true, value: (p / 100) * number };
}

/** درصد تغییر از a به b؛ وقتی a صفر باشد تعریف‌نشده است */
export function percentChange(from: number, to: number): CalcResult {
  if (from === 0) {
    return {
      ok: false,
      error: "وقتی مقدار اولیه صفر باشد، درصد تغییر تعریف نمی‌شود. مقدار اولیه را عددی غیر از صفر وارد کنید.",
    };
  }
  return { ok: true, value: ((to - from) / Math.abs(from)) * 100 };
}

/** قیمت پس از تخفیف: قیمت نهایی و مبلغ صرفه‌جویی */
export function applyDiscount(price: number, discountPercent: number): CalcResult {
  if (discountPercent < 0 || discountPercent > 100) {
    return { ok: false, error: "درصد تخفیف باید بین ۰ تا ۱۰۰ باشد." };
  }
  const saved = (price * discountPercent) / 100;
  return { ok: true, value: price - saved, extra: { saved } };
}

/** بازیابی قیمت اصلی از قیمت پس از تخفیف */
export function originalPrice(finalPrice: number, discountPercent: number): CalcResult {
  if (discountPercent < 0 || discountPercent >= 100) {
    return { ok: false, error: "برای محاسبه قیمت اصلی، درصد تخفیف باید کمتر از ۱۰۰ باشد." };
  }
  const original = finalPrice / (1 - discountPercent / 100);
  return { ok: true, value: original, extra: { saved: original - finalPrice } };
}
