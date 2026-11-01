import { describe, expect, test } from "bun:test";
import {
  applyDiscount,
  formatFa,
  originalPrice,
  parseNumberInput,
  percentChange,
  percentOf,
} from "../src/lib/percent";

describe("parseNumberInput", () => {
  test("اعداد ساده و اعشاری", () => {
    expect(parseNumberInput("25")).toBe(25);
    expect(parseNumberInput("12.5")).toBe(12.5);
    expect(parseNumberInput("-4")).toBe(-4);
  });

  test("ارقام فارسی و ممیز فارسی", () => {
    expect(parseNumberInput("۲۵")).toBe(25);
    expect(parseNumberInput("۱۲٫۵")).toBe(12.5);
    expect(parseNumberInput("٠٤٥")).toBe(45);
  });

  test("جداکننده هزارگان و فاصله", () => {
    expect(parseNumberInput("450,000")).toBe(450000);
    expect(parseNumberInput("۴۵۰٬۰۰۰")).toBe(450000);
    expect(parseNumberInput("1 000")).toBe(1000);
  });

  test("علامت درصد حذف می‌شود", () => {
    expect(parseNumberInput("25%")).toBe(25);
    expect(parseNumberInput("۲۵٪")).toBe(25);
  });

  test("ورودی نامعتبر null می‌شود", () => {
    expect(parseNumberInput("")).toBeNull();
    expect(parseNumberInput("abc")).toBeNull();
    expect(parseNumberInput("12.3.4")).toBeNull();
    expect(parseNumberInput("--5")).toBeNull();
  });
});

describe("percentOf", () => {
  test("۲۵٪ از ۲۰۰ = ۵۰", () => {
    const r = percentOf(25, 200);
    expect(r.ok && r.value === 50).toBe(true);
  });

  test("درصد اعشاری", () => {
    const r = percentOf(12.5, 80);
    expect(r.ok && r.value === 10).toBe(true);
  });
});

describe("percentChange", () => {
  test("افزایش مثبت", () => {
    const r = percentChange(80, 100);
    expect(r.ok && r.value === 25).toBe(true);
  });

  test("کاهش منفی", () => {
    const r = percentChange(100, 75);
    expect(r.ok && r.value === -25).toBe(true);
  });

  test("مقدار اولیه صفر خطا می‌دهد", () => {
    expect(!percentChange(0, 100).ok).toBe(true);
  });
});

describe("applyDiscount", () => {
  test("۲۰٪ تخفیف روی ۴۵۰٬۰۰۰", () => {
    const r = applyDiscount(450000, 20);
    expect(r.ok && r.value === 360000 && r.extra?.saved === 90000).toBe(true);
  });

  test("تخفیف ۱۰۰٪ مجاز", () => {
    const r = applyDiscount(500, 100);
    expect(r.ok && r.value === 0).toBe(true);
  });

  test("تخفیف بیش از ۱۰۰ خطا", () => {
    expect(!applyDiscount(500, 120).ok).toBe(true);
  });
});

describe("originalPrice", () => {
  test("۳۶۰٬۰۰۰ پس از ۲۰٪ تخفیف → ۴۵۰٬۰۰۰", () => {
    const r = originalPrice(360000, 20);
    expect(r.ok && r.value === 450000 && r.extra?.saved === 90000).toBe(true);
  });

  test("تخفیف ۱۰۰٪ خطا (تقسیم بر صفر)", () => {
    expect(!originalPrice(0, 100).ok).toBe(true);
  });
});

describe("formatFa", () => {
  test("ارقام فارسی با حداکثر دو اعشار", () => {
    expect(formatFa(450000)).toBe("۴۵۰٬۰۰۰");
    expect(formatFa(12.345)).toBe("۱۲٫۳۵");
    expect(formatFa(NaN)).toBe("—");
  });
});
