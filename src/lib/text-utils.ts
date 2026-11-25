/**
 * منطق خالص ابزارهای متنی — بدون وابستگی به React یا DOM تا قابل آزمایش باشد.
 */

export interface TextStats {
  words: number;
  chars: number;
  charsNoSpaces: number;
  lines: number;
  paragraphs: number;
  /** زمان تقریبی مطالعه بر پایه ۲۰۰ کلمه در دقیقه */
  readingMinutes: number;
}

const WHITESPACE = /\s/u;

/** شمارش زنده مشخصات متن */
export function countTextStats(text: string): TextStats {
  const chars = Array.from(text).length;
  const charsNoSpaces = Array.from(text).filter((ch) => !WHITESPACE.test(ch)).length;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/u).length : 0;
  const lines = text.length ? text.split(/\r\n|\r|\n/u).length : 0;
  const paragraphs = trimmed
    ? trimmed.split(/(?:\r\n|\r|\n)[\t \u00A0]*(?:\r\n|\r|\n)+/u).filter((p) => p.trim()).length
    : 0;
  const readingMinutes = words ? Math.max(1, Math.ceil(words / 200)) : 0;
  return { words, chars, charsNoSpaces, lines, paragraphs, readingMinutes };
}

export interface CleanSpacesOptions {
  /** تبدیل تب به فاصله */
  tabsToSpace: boolean;
  /** حذف فاصله‌های تکراری (بیش از یک فاصله) */
  collapse: boolean;
  /** حذف فاصله ابتدا و انتهای هر خط */
  trimLines: boolean;
  /** حذف خطوط خالی */
  removeBlankLines: boolean;
  /** حذف فاصله‌های ابتدا و انتهای کل متن */
  trimText: boolean;
}

const SPACES_CLASS = "[ \u00A0\u2000-\u200A]";
const TAB = /\t/g;
const MULTI_SPACE = new RegExp(`${SPACES_CLASS}+`, "gu");
const LINE_TRIM = new RegExp(`^${SPACES_CLASS}+|${SPACES_CLASS}+$`, "gu");
const EDGES = /^[ \t\r\n\u00A0\u2000-\u200A]+|[ \t\r\n\u00A0\u2000-\u200A]+$/gu;

/** پاک‌سازی فاصله‌های اضافی بر اساس گزینه‌های کاربر */
export function cleanSpaces(text: string, opts: CleanSpacesOptions): string {
  let t = text;
  if (opts.tabsToSpace) t = t.replace(TAB, " ");
  if (opts.collapse) t = t.replace(MULTI_SPACE, " ");
  if (opts.trimLines) t = t.split("\n").map((l) => l.replace(LINE_TRIM, "")).join("\n");
  if (opts.removeBlankLines) t = t.split("\n").filter((l) => l.trim() !== "").join("\n");
  if (opts.trimText) t = t.replace(EDGES, "");
  return t;
}

export interface DuplicateLinesOptions {
  /** true = حفظ ترتیب اولیه، false = مرتب‌سازی الفبایی */
  keepOrder: boolean;
  caseInsensitive: boolean;
  /** نادیده‌گرفتن فاصله ابتدا و انتهای خط هنگام مقایسه */
  trimCompare: boolean;
}

export interface DuplicateLinesResult {
  lines: string[];
  removedCount: number;
  originalCount: number;
}

/** شناسایی و حذف خطوط تکراری */
export function removeDuplicateLines(
  text: string,
  opts: DuplicateLinesOptions
): DuplicateLinesResult {
  if (!text) return { lines: [], removedCount: 0, originalCount: 0 };
  const raw = text.split(/\r\n|\r|\n/u);
  // خط خالی انتهای فایل، خط واقعی نیست
  if (raw.length && raw[raw.length - 1] === "") raw.pop();

  const seen = new Set<string>();
  const lines: string[] = [];
  for (const line of raw) {
    let key = opts.trimCompare ? line.trim() : line;
    if (opts.caseInsensitive) key = key.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      lines.push(line);
    }
  }

  if (!opts.keepOrder) {
    const collator = new Intl.Collator("fa");
    lines.sort(collator.compare);
  }

  return { lines, removedCount: raw.length - lines.length, originalCount: raw.length };
}

/* ---------------------------------- ارقام --------------------------------- */

export const EN_DIGITS = "0123456789";
export const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹"; // U+06F0..U+06F9
export const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩"; // U+0660..U+0669

/** ارقام فارسی و عربی → انگلیسی */
export function toEnglishDigits(text: string): string {
  let out = "";
  for (const ch of text) {
    const fi = FA_DIGITS.indexOf(ch);
    if (fi >= 0) {
      out += EN_DIGITS[fi];
      continue;
    }
    const ai = AR_DIGITS.indexOf(ch);
    out += ai >= 0 ? EN_DIGITS[ai] : ch;
  }
  return out;
}

/** ارقام انگلیسی → فارسی (سایر کاراکترها دست‌نخورده می‌مانند) */
export function englishToPersianDigits(text: string): string {
  let out = "";
  for (const ch of text) {
    const i = EN_DIGITS.indexOf(ch);
    out += i >= 0 ? FA_DIGITS[i] : ch;
  }
  return out;
}

/** ارقام عربی → فارسی (ارقام انگلیسی دست‌نخورده می‌مانند) */
export function arabicToPersianDigits(text: string): string {
  let out = "";
  for (const ch of text) {
    const i = AR_DIGITS.indexOf(ch);
    out += i >= 0 ? FA_DIGITS[i] : ch;
  }
  return out;
}

/** یکسان‌سازی حروف عربی/فارسی برای جست‌وجو */
export function normalizePersianChars(text: string): string {
  return text.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/ۀ/g, "ه").replace(/ة/g, "ه");
}

/** نرمال‌سازی متن برای جست‌وجوی فارسی */
export function normalizeForSearch(text: string): string {
  return normalizePersianChars(toEnglishDigits(text))
    .toLowerCase()
    .replace(/[\u200c\u200f\u200e]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* --------------------------------- اعداد فارسی -------------------------------- */

const FA_NUM = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });
const FA_INT = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });

/** قالب‌بندی عدد با ارقام فارسی */
export function faNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return FA_NUM.format(value);
}

/** قالب‌بندی عدد صحیح با ارقام فارسی */
export function faInt(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return FA_INT.format(value);
}
