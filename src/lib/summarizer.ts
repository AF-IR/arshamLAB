/**
 * خلاصه‌سازی استخراجی متن فارسی — منطق خالص بدون وابستگی به React یا DOM.
 *
 * روش: امتیازدهی به جمله‌ها بر پایه بسامد واژه‌های معنادار (بدون ایست‌واژه‌ها)
 * با نرمال‌سازی طول جمله و پاداش موقعیت؛ سپس انتخاب بهترین جمله‌ها و بازگشت
 * به ترتیب اصلی متن. این روش «استخراجی» است و جمله‌ها را تغییر نمی‌دهد.
 */

import { normalizePersianChars } from "./text-utils";

const SENTENCE_SPLIT = /(?<=[.!?؟…])\s+|\r\n|\r|\n+/u;
const WORD_SPLIT = /[^\p{L}\p{N}\u200c]+/u;

/** ایست‌واژه‌های پرتکرار فارسی و عربی که بار معنایی ندارند */
const STOPWORDS = new Set([
  "و", "در", "به", "از", "که", "این", "را", "با", "است", "برای", "آن", "یک",
  "های", "می", "تا", "هم", "بر", "یا", "اگر", "اما", "هر", "بود", "شود",
  "کرده", "شده", "بین", "دیگر", "چون", "همه", "ما", "شما", "آنها", "وی",
  "خود", "کند", "کنند", "کنند", "باشد", "هستند", "بودن", "شدن", "همچنین",
  "بنابراین", "یعنی", "مثل", "مانند", "وقتی", "هنگامی", "پس", "بعد", "قبل",
  "بالا", "پایین", "نه", "آیا", "چه", "کدام", "چند", "بسیار", "خیلی", "فقط",
  "حتی", "نیز", "چرا", "جرا", "هیچ", "دارد", "دارند", "داشت", "خواهد",
  "شده", "شوند", "داد", "دهند", "می", "برای", "روی", "درباره", "طبق", "مورد",
  "باید", "نباید", "میکنند", "است که", "بودند", "شد", "شود", "گردید", "طور",
  "بی", "مگر", "الان", "امروز", "دیروز", "فردا", "اینجا", "آنجا", "کجا",
  "چیزی", "کسی", "جایی", "یکدیگر", "همدیگر", "همین", "آنهم", "بله", "خیر",
  "the", "a", "an", "of", "to", "in", "and", "is", "are", "was", "were",
  "for", "on", "with", "as", "by", "at", "or", "be", "this", "that", "it",
]);

export interface SummaryResult {
  /** جمله‌های انتخاب‌شده به ترتیب متن اصلی */
  sentences: string[];
  /** متن خلاصه آماده کپی */
  summary: string;
  originalSentences: number;
  originalWords: number;
  summaryWords: number;
  /** درصد فشرده‌سازی (کاهش حجم واژه‌ها) */
  compression: number;
}

function tokenize(sentence: string): string[] {
  return sentence
    .split(WORD_SPLIT)
    .map((w) => normalizePersianChars(w).toLowerCase())
    .filter((w) => w.length > 1 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

function splitSentences(text: string): string[] {
  return text
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && tokenize(s).length > 0);
}

/** خلاصه‌سازی استخراجی؛ ratio بین ۰٫۱ و ۰٫۹ (نسبت جمله‌های نگه‌داشته‌شده) */
export function summarizeText(text: string, ratio: number): SummaryResult | null {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return null;

  const originalWords = text.trim().split(/\s+/u).filter(Boolean).length;
  const safeRatio = Math.min(0.9, Math.max(0.1, ratio));

  // اگر متن کوتاه است، خلاصه معنایی ندارد
  if (sentences.length <= 2) {
    const summary = sentences.join(" ");
    const summaryWords = summary.split(/\s+/u).filter(Boolean).length;
    return {
      sentences,
      summary,
      originalSentences: sentences.length,
      originalWords,
      summaryWords,
      compression: originalWords ? Math.round((1 - summaryWords / originalWords) * 100) : 0,
    };
  }

  // بسامد واژه‌ها در کل متن
  const freq = new Map<string, number>();
  for (const sentence of sentences) {
    for (const word of tokenize(sentence)) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }

  const maxFreq = Math.max(...freq.values(), 1);

  // امتیاز هر جمله: نرخ بسامد نرمال‌شده ÷ ریشه طول + پاداش موقعیت
  const scored = sentences.map((sentence, index) => {
    const words = tokenize(sentence);
    if (words.length === 0) return { sentence, index, score: 0 };
    let sum = 0;
    for (const word of words) sum += (freq.get(word) ?? 0) / maxFreq;
    const lengthNorm = Math.sqrt(words.length);
    const positionBonus = index < 2 ? 1.15 : 1;
    return { sentence, index, score: (sum / lengthNorm) * positionBonus };
  });

  const keepCount = Math.max(1, Math.min(sentences.length - 1, Math.round(sentences.length * safeRatio)));
  const chosen = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, keepCount)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence);

  const summary = chosen.join(" ");
  const summaryWords = summary.split(/\s+/u).filter(Boolean).length;
  return {
    sentences: chosen,
    summary,
    originalSentences: sentences.length,
    originalWords,
    summaryWords,
    compression: originalWords ? Math.round((1 - summaryWords / originalWords) * 100) : 0,
  };
}
