import { describe, expect, test } from "bun:test";
import {
  arabicToPersianDigits,
  cleanSpaces,
  countTextStats,
  englishToPersianDigits,
  normalizeForSearch,
  removeDuplicateLines,
  toEnglishDigits,
} from "../src/lib/text-utils";

describe("countTextStats", () => {
  test("ورودی خالی", () => {
    const s = countTextStats("");
    expect(s.words).toBe(0);
    expect(s.chars).toBe(0);
    expect(s.charsNoSpaces).toBe(0);
    expect(s.lines).toBe(0);
    expect(s.paragraphs).toBe(0);
    expect(s.readingMinutes).toBe(0);
  });

  test("متن فارسی ساده با نیم‌فاصله", () => {
    const s = countTextStats("سلام دنیا! می‌روم بازار.");
    expect(s.words).toBe(4); // سلام، دنیا!، می‌روم، بازار.
    expect(s.chars).toBe(s.charsNoSpaces + 3); // سه فاصله
    expect(s.lines).toBe(1);
    expect(s.paragraphs).toBe(1);
  });

  test("خطوط و پاراگراف‌ها", () => {
    const s = countTextStats("خط اول\nخط دوم\n\nخط سوم");
    expect(s.lines).toBe(4);
    expect(s.paragraphs).toBe(2);
    expect(s.words).toBe(6);
  });

  test("کاراکترهای چندبایتی (اموجی) یک واحد شمرده می‌شوند", () => {
    const s = countTextStats("سلام 😀");
    expect(s.chars).toBe(6); // 4 حرف + فاصله + اموجی
  });
});

describe("cleanSpaces", () => {
  const all = {
    tabsToSpace: true,
    collapse: true,
    trimLines: true,
    removeBlankLines: true,
    trimText: true,
  };

  test("حذف فاصله‌های تکراری", () => {
    expect(cleanSpaces("سلام    دنیا", { ...all, removeBlankLines: false })).toBe("سلام دنیا");
  });

  test("تب به فاصله", () => {
    expect(cleanSpaces("a\tb", { ...all, removeBlankLines: false })).toBe("a b");
  });

  test("تریم خطوط", () => {
    expect(cleanSpaces("  x  \n   y  ", { ...all, removeBlankLines: false })).toBe("x\ny");
  });

  test("حذف خطوط خالی", () => {
    expect(cleanSpaces("a\n\n\nb", all)).toBe("a\nb");
  });

  test("تریم کل متن", () => {
    expect(cleanSpaces("\n\n hello world \n", { ...all, removeBlankLines: false })).toBe("hello world");
  });

  test("نیم‌فاصله فارسی حفظ می‌شود", () => {
    expect(cleanSpaces("می‌روم  خانه", { ...all, removeBlankLines: false })).toBe("می‌روم خانه");
  });

  test("بدون هیچ گزینه‌ای متن دست‌نخورده می‌ماند", () => {
    const t = "  a   b  ";
    expect(cleanSpaces(t, {
      tabsToSpace: false, collapse: false, trimLines: false, removeBlankLines: false, trimText: false,
    })).toBe(t);
  });
});

describe("removeDuplicateLines", () => {
  test("حفظ ترتیب اولیه", () => {
    const r = removeDuplicateLines("b\na\nb\nc\na", { keepOrder: true, caseInsensitive: false, trimCompare: false });
    expect(r.lines).toEqual(["b", "a", "c"]);
    expect(r.removedCount).toBe(2);
    expect(r.originalCount).toBe(5);
  });

  test("مرتب‌سازی الفبایی", () => {
    const r = removeDuplicateLines("موز\nسیب\nسیب", { keepOrder: false, caseInsensitive: false, trimCompare: false });
    expect(r.lines).toEqual(["سیب", "موز"]);
    expect(r.removedCount).toBe(1);
  });

  test("بدون حساسیت به بزرگی و کوچکی", () => {
    const r = removeDuplicateLines("Ali\nali\nALI", { keepOrder: true, caseInsensitive: true, trimCompare: false });
    expect(r.lines).toEqual(["Ali"]);
  });

  test("نادیده‌گرفتن فاصله‌های ابتدا و انتها در مقایسه", () => {
    const r = removeDuplicateLines("x\n  x \nx", { keepOrder: true, caseInsensitive: false, trimCompare: true });
    expect(r.lines).toEqual(["x"]);
  });

  test("خط خالی انتهای ورودی به‌عنوان خط حساب نمی‌شود", () => {
    const r = removeDuplicateLines("a\nb\n", { keepOrder: true, caseInsensitive: false, trimCompare: false });
    expect(r.originalCount).toBe(2);
  });

  test("ورودی خالی", () => {
    const r = removeDuplicateLines("", { keepOrder: true, caseInsensitive: false, trimCompare: false });
    expect(r.lines).toEqual([]);
    expect(r.removedCount).toBe(0);
  });
});

describe("تبدیل ارقام", () => {
  test("فارسی و عربی → انگلیسی", () => {
    expect(toEnglishDigits("۱۴۰۵/۰۸/۱۰")).toBe("1405/08/10");
    expect(toEnglishDigits("٠١٢٣")).toBe("0123");
    expect(toEnglishDigits("سفارش ۱۲۳۴ ثبت شد")).toBe("سفارش 1234 ثبت شد");
  });

  test("انگلیسی → فارسی با حفظ سایر کاراکترها", () => {
    expect(englishToPersianDigits("Order 1234 OK!")).toBe("Order ۱۲۳۴ OK!");
  });

  test("عربی → فارسی و دست‌نخوردن ارقام انگلیسی", () => {
    expect(arabicToPersianDigits("٠١٢٣ و 456")).toBe("۰۱۲۳ و 456");
  });
});

describe("normalizeForSearch", () => {
  test("ی/ك عربی و ارقام و حروف بزرگ", () => {
    expect(normalizeForSearch("كتاب يزد ۱۲۳")).toBe(normalizeForSearch("کتاب یزد 123"));
    expect(normalizeForSearch("ABC")).toBe("abc");
  });
});
