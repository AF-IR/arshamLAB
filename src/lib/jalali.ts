/**
 * تبدیل دقیق تقویم شمسی (جلالی) ↔ میلادی بر پایه الگوریتم شناخته‌شده jalaali-js
 * (MIT) — بدون استفاده از تقریب. پیاده‌سازی متناسب با TypeScript.
 */

function div(a: number, b: number): number {
  return ~~(a / b);
}

function mod(a: number, b: number): number {
  return a - ~~(a / b) * b;
}

const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
  2262, 2324, 2394, 2456, 3178,
];

interface JalCalResult {
  leap: number;
  gy: number;
  march: number;
}

function jalCal(jy: number): JalCalResult {
  const bl = BREAKS.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jm = 0;
  let jump = 0;
  let leap = 0;

  if (jy < jp || jy >= BREAKS[bl - 1]) {
    throw new RangeError(`سال شمسی نامعتبر است: ${jy}`);
  }

  for (let i = 1; i < bl; i += 1) {
    jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }

  let n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;

  return { leap, gy, march };
}

/** روز ژولینی از تاریخ میلادی */
function g2d(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

/** تاریخ میلادی از روز ژولینی */
function d2g(jdn: number): { gy: number; gm: number; gd: number } {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

/** روز ژولینی از تاریخ شمسی */
function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

/** تاریخ شمسی از روز ژولینی */
function d2j(jdn: number): { jy: number; jm: number; jd: number } {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;

  if (k >= 0) {
    if (k <= 185) {
      return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }

  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export interface GregorianDate {
  gy: number;
  gm: number;
  gd: number;
}

/** میلادی → شمسی */
export function toJalali(gy: number, gm: number, gd: number): JalaliDate {
  return d2j(g2d(gy, gm, gd));
}

/** شمسی → میلادی */
export function toGregorian(jy: number, jm: number, jd: number): GregorianDate {
  return d2g(j2d(jy, jm, jd));
}

/** آیا سال شمسی کبیسه است؟ */
export function isLeapJalaaliYear(jy: number): boolean {
  return jalCal(jy).leap === 0;
}

/** تعداد روزهای ماه شمسی */
export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm < 1 || jm > 12) throw new RangeError(`ماه شمسی نامعتبر است: ${jm}`);
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalaaliYear(jy) ? 30 : 29;
}

export function isValidJalaliDate(jy: number, jm: number, jd: number): boolean {
  if (!Number.isInteger(jy) || !Number.isInteger(jm) || !Number.isInteger(jd)) return false;
  if (jy < 1 || jy >= 3178) return false;
  if (jm < 1 || jm > 12) return false;
  if (jd < 1) return false;
  try {
    return jd <= jalaliMonthLength(jy, jm);
  } catch {
    return false;
  }
}

/** تاریخ امروز به شمسی (بر پایه تاریخ محلی مرورگر) */
export function todayJalali(date: Date = new Date()): JalaliDate {
  return toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

/** نمایش متنی تاریخ شمسی؛ مثال: ۱۰ آبان ۱۴۰۵ */
export function formatJalaliLong(d: JalaliDate): string {
  return `${toPersianDigitsStatic(String(d.jd))} ${JALALI_MONTHS[d.jm - 1]} ${toPersianDigitsStatic(String(d.jy))}`;
}

/** نمایش عددی تاریخ شمسی با ارقام فارسی؛ مثال: ۱۴۰۵/۰۸/۱۰ */
export function formatJalaliNumeric(d: JalaliDate): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return toPersianDigitsStatic(`${d.jy}/${p(d.jm)}/${p(d.jd)}`);
}

function toPersianDigitsStatic(s: string): string {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  let out = "";
  for (const ch of s) out += ch >= "0" && ch <= "9" ? fa[Number(ch)] : ch;
  return out;
}
