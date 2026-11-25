import { describe, expect, test } from "bun:test";
import {
  UNIT_GROUPS,
  convertUnit,
  formatUnitResult,
  getUnitGroup,
} from "../src/lib/units";

describe("تبدیل واحدها", () => {
  test("ساختار گروه‌ها معتبر است", () => {
    expect(UNIT_GROUPS.length).toBe(8);
    for (const g of UNIT_GROUPS) {
      expect(g.units.length).toBeGreaterThanOrEqual(3);
      const ids = g.units.map((u) => u.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  test("طول: اینچ ↔ سانتی‌متر", () => {
    expect(convertUnit(1, "length", "in", "cm")).toBeCloseTo(2.54, 10);
    expect(convertUnit(25, "length", "in", "cm")).toBeCloseTo(63.5, 10);
    expect(convertUnit(100, "length", "cm", "in")).toBeCloseTo(39.3700787, 6);
  });

  test("طول: کیلومتر ↔ مایل", () => {
    expect(convertUnit(1, "length", "mi", "km")).toBeCloseTo(1.609344, 10);
    expect(convertUnit(10, "length", "km", "mi")).toBeCloseTo(6.2137119, 6);
  });

  test("وزن: کیلوگرم ↔ پوند", () => {
    expect(convertUnit(1, "weight", "kg", "lb")).toBeCloseTo(2.20462262, 6);
    expect(convertUnit(70, "weight", "kg", "lb")).toBeCloseTo(154.323584, 5);
  });

  test("دما: فرمول دقیق سلسیوس ↔ فارنهایت ↔ کلوین", () => {
    expect(convertUnit(0, "temperature", "c", "f")).toBeCloseTo(32, 10);
    expect(convertUnit(37, "temperature", "c", "f")).toBeCloseTo(98.6, 10);
    expect(convertUnit(100, "temperature", "c", "f")).toBeCloseTo(212, 10);
    expect(convertUnit(0, "temperature", "c", "k")).toBeCloseTo(273.15, 10);
    expect(convertUnit(32, "temperature", "f", "c")).toBeCloseTo(0, 10);
    expect(convertUnit(300, "temperature", "k", "c")).toBeCloseTo(26.85, 10);
  });

  test("داده با مبنای ۱۰۲۴", () => {
    expect(convertUnit(1, "data", "gb", "mb")).toBeCloseTo(1024, 10);
    expect(convertUnit(2048, "data", "mb", "gb")).toBeCloseTo(2, 10);
    expect(convertUnit(1, "data", "tb", "kb")).toBeCloseTo(1073741824, 0);
  });

  test("سرعت: کیلومتر بر ساعت ↔ متر بر ثانیه", () => {
    expect(convertUnit(36, "speed", "kmh", "ms")).toBeCloseTo(10, 10);
    expect(convertUnit(3.6, "speed", "kmh", "ms")).toBeCloseTo(1, 10);
  });

  test("حجم: گالن آمریکا ↔ لیتر", () => {
    expect(convertUnit(1, "volume", "galus", "l")).toBeCloseTo(3.785411784, 10);
  });

  test("زمان: ساعت ↔ دقیقه", () => {
    expect(convertUnit(2.5, "time", "h", "min")).toBeCloseTo(150, 10);
  });

  test("ورودی نامعتبر null برمی‌گرداند", () => {
    expect(convertUnit(1, "nope", "m", "cm")).toBeNull();
    expect(convertUnit(1, "length", "nope", "cm")).toBeNull();
    expect(convertUnit(1, "length", "m", "kg")).toBeNull();
  });

  test("فرمت نتیجه: حذف صفرهای اضافی و نگه‌داشتن دقت", () => {
    expect(formatUnitResult(63.5)).toBe("63.5");
    expect(formatUnitResult(0)).toBe("0");
    expect(formatUnitResult(1e-10)).toContain("e");
    expect(formatUnitResult(NaN)).toBe("—");
  });

  test("گروه دما با isTemperature مشخص شده است", () => {
    expect(getUnitGroup("temperature")?.isTemperature).toBe(true);
    expect(getUnitGroup("length")?.isTemperature).toBeUndefined();
  });
});
