import { describe, expect, test } from "bun:test";
import {
  computeAge,
  diffInDays,
  diffYMD,
  gregorianMonthLength,
  isValidGregorian,
  parseISODate,
  toISOInputValue,
} from "../src/lib/date-utils";

describe("parseISODate", () => {
  test("تاریخ معتبر", () => {
    expect(parseISODate("2026-11-01")).toEqual({ y: 2026, m: 11, d: 1 });
  });

  test("تاریخ نامعتبر", () => {
    expect(parseISODate("2026-02-30")).toBeNull();
    expect(parseISODate("2026-13-01")).toBeNull();
    expect(parseISODate("abc")).toBeNull();
    expect(parseISODate("")).toBeNull();
    expect(parseISODate("2026-11-01T10:00")).toBeNull();
  });
});

describe("diffInDays", () => {
  test("اختلاف ساده", () => {
    expect(diffInDays({ y: 2026, m: 11, d: 1 }, { y: 2026, m: 11, d: 10 })).toBe(9);
  });

  test("عبور از پایان ماه و سال کبیسه", () => {
    expect(diffInDays({ y: 2026, m: 2, d: 27 }, { y: 2026, m: 3, d: 2 })).toBe(3);
    expect(diffInDays({ y: 2024, m: 2, d: 28 }, { y: 2024, m: 3, d: 1 })).toBe(2); // ۲۰۲۴ کبیسه
    expect(diffInDays({ y: 2023, m: 2, d: 28 }, { y: 2023, m: 3, d: 1 })).toBe(1); // غیرکبیسه
    expect(diffInDays({ y: 2025, m: 12, d: 31 }, { y: 2026, m: 1, d: 1 })).toBe(1);
  });

  test("ترتیب معکوس منفی می‌شود", () => {
    expect(diffInDays({ y: 2026, m: 11, d: 10 }, { y: 2026, m: 11, d: 1 })).toBe(-9);
  });
});

describe("diffYMD", () => {
  test("سن دقیق با طول واقعی ماه‌ها", () => {
    // از ۳۱ ژانویه تا ۱ مارس: یک ماه و یک روز (فوریه ۲۸ روزه)
    expect(diffYMD({ y: 2026, m: 1, d: 31 }, { y: 2026, m: 3, d: 1 })).toEqual({
      years: 0, months: 1, days: 1,
    });
  });

  test("همان روز صفر", () => {
    expect(diffYMD({ y: 2000, m: 5, d: 10 }, { y: 2000, m: 5, d: 10 })).toEqual({
      years: 0, months: 0, days: 0,
    });
  });

  test("چند سال با احتساب کبیسه", () => {
    const r = diffYMD({ y: 2000, m: 2, d: 29 }, { y: 2024, m: 2, d: 29 });
    expect(r.years).toBe(24);
    expect(r.months).toBe(0);
    expect(r.days).toBe(0);
  });

  test("اختلاف فقط روزها", () => {
    expect(diffYMD({ y: 2026, m: 11, d: 1 }, { y: 2026, m: 11, d: 15 })).toEqual({
      years: 0, months: 0, days: 14,
    });
  });
});

describe("computeAge", () => {
  const today = { y: 2026, m: 11, d: 1 };

  test("سن معمولی", () => {
    const r = computeAge({ y: 1998, m: 11, d: 1 }, today);
    expect(r.ok && r.age.years === 28 && r.age.months === 0 && r.age.days === 0).toBe(true);
  });

  test("تاریخ آینده رد می‌شود", () => {
    const r = computeAge({ y: 2027, m: 1, d: 1 }, today);
    expect(!r.ok && r.error === "future").toBe(true);
  });

  test("تاریخ نامعتبر رد می‌شود", () => {
    const r = computeAge({ y: 2026, m: 2, d: 31 }, today);
    expect(!r.ok && r.error === "invalid").toBe(true);
  });

  test("ورودی خالی", () => {
    const r = computeAge(null, today);
    expect(!r.ok && r.error === "empty").toBe(true);
  });
});

describe("ابزارهای کمکی", () => {
  test("isValidGregorian", () => {
    expect(isValidGregorian(2024, 2, 29)).toBe(true);
    expect(isValidGregorian(2023, 2, 29)).toBe(false);
    expect(isValidGregorian(2026, 4, 31)).toBe(false);
  });

  test("gregorianMonthLength", () => {
    expect(gregorianMonthLength(2024, 2)).toBe(29);
    expect(gregorianMonthLength(2023, 2)).toBe(28);
    expect(gregorianMonthLength(2026, 7)).toBe(31);
  });

  test("toISOInputValue", () => {
    expect(toISOInputValue({ y: 2026, m: 1, d: 5 })).toBe("2026-01-05");
  });
});
