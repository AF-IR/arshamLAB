import { describe, expect, test } from "bun:test";
import { summarizeText } from "../src/lib/summarizer";

const LONG_TEXT = [
  "هوش مصنوعی در سال‌های اخیر به بخش جدایی‌ناپذیر زندگی روزمره تبدیل شده است.",
  "از دستیارهای صوتی گرفته تا ابزارهای تولید محتوا، کاربردهای این فناوری هر روز بیشتر می‌شود.",
  "شرکت‌های بزرگ فناوری میلیاردها دلار سرمایه‌گذاری در توسعه مدل‌های زبانی کرده‌اند.",
  "این مدل‌ها توانایی نوشتن متن، ترجمه و پاسخ به پرسش‌ها را دارند.",
  "با این حال نگرانی‌هایی درباره حریم خصوصی و صحت اطلاعات وجود دارد.",
  "کارشناسان توصیه می‌کنند کاربران خروجی هوش مصنوعی را همیشه بررسی کنند.",
  "در آموزش نیز ابزارهای هوشمند به دانش‌آموزان کمک می‌کنند تا سریع‌تر یاد بگیرند.",
  "آینده هوش مصنوعی روشن به نظر می‌رسد اما نیازمند قواعد و اخلاق مشخص است.",
].join(" ");

describe("خلاصه‌ساز متن", () => {
  test("متن خالی و بدون جمله معنادار null می‌دهد", () => {
    expect(summarizeText("", 0.4)).toBeNull();
    expect(summarizeText("   \n  ", 0.4)).toBeNull();
  });

  test("متن خیلی کوتاه بی‌تغییر برمی‌گردد", () => {
    const r = summarizeText("این یک جمله کوتاه آزمایشی است.", 0.4);
    expect(r).not.toBeNull();
    expect(r!.sentences.length).toBe(1);
    expect(r!.summary).toBe("این یک جمله کوتاه آزمایشی است.");
  });

  test("نسبت خلاصه رعایت می‌شود و ترتیب حفظ است", () => {
    const r = summarizeText(LONG_TEXT, 0.4)!;
    // ۸ جمله × ۰٫۴ ≈ ۳ جمله
    expect(r.sentences.length).toBe(3);
    expect(r.originalSentences).toBe(8);
    // ترتیب اصلی: جمله‌های خروجی باید به ترتیب ورودی باشند
    const positions = r.sentences.map((s) => LONG_TEXT.indexOf(s));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(r.compression).toBeGreaterThan(0);
    expect(r.summaryWords).toBeLessThan(r.originalWords);
  });

  test("نسبت‌های مختلف تعداد متفاوت می‌دهند", () => {
    const short = summarizeText(LONG_TEXT, 0.25)!;
    const detailed = summarizeText(LONG_TEXT, 0.6)!;
    expect(short.sentences.length).toBeLessThan(detailed.sentences.length);
  });

  test("جمله‌های خروجی زیرمجموعه متن اصلی‌اند (استخراجی، بدون بازنویسی)", () => {
    const r = summarizeText(LONG_TEXT, 0.4)!;
    for (const s of r.sentences) {
      expect(LONG_TEXT).toContain(s);
    }
  });

  test("حروف عربی و ارقام مشکلی ایجاد نمی‌کنند", () => {
    const text = "يكي از مسايل مهم هوش مصنوعي آموزش مدل‌هاست. داده‌ها نقش كليدي دارند. پژوهشگران روي كارايي تمركز كرده‌اند.";
    const r = summarizeText(text, 0.4)!;
    expect(r.sentences.length).toBeGreaterThan(0);
    expect(r.summary.length).toBeGreaterThan(0);
  });
});
