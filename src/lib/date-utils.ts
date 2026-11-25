/**
 * ابزارهای تاریخ خالص (بدون وابستگی) — همه محاسبات بر پایه UTC انجام می‌شود
 * تا نتایج روی هر دستگاه و هر منطقه زمانی یکسان باشد.
 */

export interface DateParts {
  y: number;
  m: number;
  d: number;
}

/** بررسی معتبر بودن تاریخ میلادی */
export function isValidGregorian(y: number, m: number, d: number): boolean {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
  if (y < 1 || y > 9999) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1) return false;
  return d <= gregorianMonthLength(y, m);
}

export function isLeapGregorianYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function gregorianMonthLength(y: number, m: number): number {
  const lengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (m === 2 && isLeapGregorianYear(y)) return 29;
  return lengths[m - 1] ?? 0;
}

/** تجزیه رشته input[type=date] به بخش‌های تاریخ؛ در صورت نامعتبر بودن null */
export function parseISODate(s: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (!isValidGregorian(y, m, d)) return null;
  return { y, m, d };
}

export function toUTC(parts: DateParts): Date {
  return new Date(Date.UTC(parts.y, parts.m - 1, parts.d));
}

/** اختلاف روز کامل بین دو تاریخ (b − a) */
export function diffInDays(a: DateParts, b: DateParts): number {
  return Math.round((toUTC(b).getTime() - toUTC(a).getTime()) / 86_400_000);
}

function compareParts(a: DateParts, b: DateParts): number {
  return toUTC(a).getTime() - toUTC(b).getTime();
}

function clampDay(y: number, m: number, d: number): DateParts {
  const max = gregorianMonthLength(y, m);
  return { y, m, d: Math.min(d, max) };
}

function addYears(from: DateParts, years: number): DateParts {
  return clampDay(from.y + years, from.m, from.d);
}

function addMonths(from: DateParts, months: number): DateParts {
  const total = (from.y * 12 + (from.m - 1)) + months;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return clampDay(y, m, from.d);
}

export interface YMD {
  years: number;
  months: number;
  days: number;
}

/**
 * اختلاف تقویمی کامل بین دو تاریخ (from ≤ to) به صورت سال/ماه/روز
 * با احتساب صحیح طول ماه‌ها و سال کبیسه.
 */
export function diffYMD(from: DateParts, to: DateParts): YMD {
  if (compareParts(from, to) > 0) return { years: 0, months: 0, days: 0 };

  let years = to.y - from.y;
  let anchor = addYears(from, years);
  if (compareParts(anchor, to) > 0) {
    years -= 1;
    anchor = addYears(from, years);
  }

  let months =
    (to.y - anchor.y) * 12 + (to.m - anchor.m) - (to.d < anchor.m && to.d < anchor.d ? 1 : 0);
  let anchor2 = addMonths(anchor, months);
  if (compareParts(anchor2, to) > 0) {
    months -= 1;
    anchor2 = addMonths(anchor, months);
  }

  const days = diffInDays(anchor2, to);
  return { years, months, days };
}

export type AgeResult =
  | { ok: true; age: YMD; totalDays: number; totalMonths: number }
  | { ok: false; error: "empty" | "invalid" | "future" };

/** محاسبه سن از تاریخ تولد تا امروز */
export function computeAge(
  birth: DateParts | null,
  today: DateParts
): AgeResult {
  if (!birth) return { ok: false, error: "empty" };
  if (!isValidGregorian(birth.y, birth.m, birth.d)) return { ok: false, error: "invalid" };
  if (compareParts(birth, today) > 0) return { ok: false, error: "future" };
  const age = diffYMD(birth, today);
  const totalDays = diffInDays(birth, today);
  const totalMonths = age.years * 12 + age.months;
  return { ok: true, age, totalDays, totalMonths };
}

/** بخش‌های تاریخ امروز به وقت محلی دستگاه (برای استفاده سمت کاربر) */
export function todayParts(now: Date = new Date()): DateParts {
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

/** رشته ISO برای input[type=date] */
export function toISOInputValue(p: DateParts): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}
