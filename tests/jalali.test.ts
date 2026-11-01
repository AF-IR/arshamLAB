import { describe, expect, test } from "bun:test";
import {
  formatJalaliLong,
  isLeapJalaaliYear,
  isValidJalaliDate,
  jalaliMonthLength,
  toGregorian,
  toJalali,
} from "../src/lib/jalali";

describe("تبدیل میلادی ↔ شمسی", () => {
  test("نوروز ۱۴۰۵ = ۲۱ مارس ۲۰۲۶", () => {
    expect(toJalali(2026, 3, 21)).toEqual({ jy: 1405, jm: 1, jd: 1 });
    expect(toGregorian(1405, 1, 1)).toEqual({ gy: 2026, gm: 3, gd: 21 });
  });

  test("۱ آبان ۱۴۰۵ = ۱ نوامبر ۲۰۲۶", () => {
    expect(toJalali(2026, 11, 1)).toEqual({ jy: 1405, jm: 8, jd: 10 });
    expect(toGregorian(1405, 8, 10)).toEqual({ gy: 2026, gm: 11, gd: 1 });
  });

  test("نوروز ۱۴۰۳ = ۲۰ مارس ۲۰۲۴", () => {
    expect(toJalali(2024, 3, 20)).toEqual({ jy: 1403, jm: 1, jd: 1 });
  });

  test("۳۰ اسفند سال کبیسه ۱۴۰۳ = ۲۰ مارس ۲۰۲۵", () => {
    expect(toGregorian(1403, 12, 30)).toEqual({ gy: 2025, gm: 3, gd: 20 });
  });

  test("رفت‌وبرگشت در بازه گسترده", () => {
    for (let gy = 1990; gy <= 2050; gy += 1) {
      const j = toJalali(gy, 6, 15);
      const g = toGregorian(j.jy, j.jm, j.jd);
      expect(g).toEqual({ gy, gm: 6, gd: 15 });
    }
  });
});

describe("سال کبیسه و طول ماه", () => {
  test("سال‌های کبیسه شناخته‌شده", () => {
    expect(isLeapJalaaliYear(1399)).toBe(true);
    expect(isLeapJalaaliYear(1403)).toBe(true);
    expect(isLeapJalaaliYear(1408)).toBe(true);
    expect(isLeapJalaaliYear(1404)).toBe(false);
    expect(isLeapJalaaliYear(1405)).toBe(false);
  });

  test("طول ماه‌ها", () => {
    expect(jalaliMonthLength(1405, 1)).toBe(31);
    expect(jalaliMonthLength(1405, 6)).toBe(31);
    expect(jalaliMonthLength(1405, 7)).toBe(30);
    expect(jalaliMonthLength(1405, 11)).toBe(30);
    expect(jalaliMonthLength(1405, 12)).toBe(29); // ۱۴۰۵ کبیسه نیست
    expect(jalaliMonthLength(1403, 12)).toBe(30); // ۱۴۰۳ کبیسه است
  });

  test("اعتبارسنجی تاریخ شمسی", () => {
    expect(isValidJalaliDate(1405, 8, 10)).toBe(true);
    expect(isValidJalaliDate(1404, 12, 30)).toBe(false);
    expect(isValidJalaliDate(1403, 12, 30)).toBe(true);
    expect(isValidJalaliDate(1405, 13, 1)).toBe(false);
    expect(isValidJalaliDate(1405, 0, 1)).toBe(false);
  });

  test("نمایش متنی", () => {
    expect(formatJalaliLong({ jy: 1405, jm: 8, jd: 10 })).toBe("۱۰ آبان ۱۴۰۵");
  });
});
