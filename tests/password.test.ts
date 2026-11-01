import { describe, expect, test } from "bun:test";
import {
  CHARSETS,
  DEFAULT_PASSWORD_OPTIONS,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  buildPool,
  generatePassword,
  passwordEntropyBits,
  randomInt,
  secureShuffle,
  strengthLabel,
} from "../src/lib/password";

describe("randomInt", () => {
  test("همیشه در بازه [0, max) می‌ماند", () => {
    for (let i = 0; i < 2000; i += 1) {
      const v = randomInt(7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  test("توزیع تقریباً یکنواخت (بدون سوگیری واضح)", () => {
    const counts = new Array(5).fill(0);
    for (let i = 0; i < 10000; i += 1) counts[randomInt(5)]! += 1;
    for (const c of counts) expect(c).toBeGreaterThan(1700);
    for (const c of counts) expect(c).toBeLessThan(2300);
  });

  test("max نامعتبر خطا می‌دهد", () => {
    expect(() => randomInt(0)).toThrow();
    expect(() => randomInt(-1)).toThrow();
    expect(() => randomInt(1.5)).toThrow();
  });
});

describe("generatePassword", () => {
  test("طول و حضور همه مجموعه‌ها", () => {
    const r = generatePassword(DEFAULT_PASSWORD_OPTIONS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.password.length).toBe(16);
    expect(/[a-z]/.test(r.password)).toBe(true);
    expect(/[A-Z]/.test(r.password)).toBe(true);
    expect(/[0-9]/.test(r.password)).toBe(true);
    expect(r.password.split("").some((c) => CHARSETS.symbols.includes(c))).toBe(true);
  });

  test("خروجی‌ها تصادفی‌اند", () => {
    const a = generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, length: 32 });
    const b = generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, length: 32 });
    expect(a.ok && b.ok && a.password !== b.password).toBe(true);
  });

  test("فقط اعداد", () => {
    const r = generatePassword({ length: 12, lower: false, upper: false, digits: true, symbols: false, excludeAmbiguous: false });
    expect(r.ok && /^[0-9]{12}$/.test(r.password)).toBe(true);
  });

  test("حذف کاراکترهای مبهم", () => {
    for (let i = 0; i < 30; i += 1) {
      const r = generatePassword({ length: 24, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: true });
      if (!r.ok) throw new Error("نباید خطا بدهد");
      expect(r.password.split("").some((c) => "Il1O0o".includes(c))).toBe(false);
    }
  });

  test("خطا: بدون هیچ مجموعه‌ای", () => {
    const r = generatePassword({ length: 12, lower: false, upper: false, digits: false, symbols: false, excludeAmbiguous: false });
    expect(!r.ok).toBe(true);
  });

  test("خطا: طول خارج از محدوده", () => {
    const r = generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, length: 2 });
    expect(!r.ok).toBe(true);
    expect(MIN_PASSWORD_LENGTH).toBe(6);
    expect(MAX_PASSWORD_LENGTH).toBe(64);
  });
});

describe("secureShuffle", () => {
  test("عناصر حفظ می‌شوند (فقط جابه‌جایی)", () => {
    const src = ["a", "b", "c", "d", "e", "f", "g"];
    const out = secureShuffle(src);
    expect([...out].sort().join("")).toBe([...src].sort().join(""));
    expect(src.join("")).toBe("abcdefg"); // ورودی تغییر نکند
  });
});

describe("آنتروپی و قدرت", () => {
  test("فرمول آنتروپی", () => {
    // ۹۴ کاراکتر، ۱۶ طول → log2(94) ≈ 6.55 → 105 بیت
    expect(passwordEntropyBits(94, 16)).toBe(105);
    expect(passwordEntropyBits(0, 16)).toBe(0);
  });

  test("برچسب قدرت", () => {
    expect(strengthLabel(30).label).toBe("ضعیف");
    expect(strengthLabel(55).label).toBe("متوسط");
    expect(strengthLabel(80).label).toBe("قوی");
    expect(strengthLabel(120).label).toBe("بسیار قوی");
  });

  test("buildPool جمع مجموعه‌های انتخابی", () => {
    expect(buildPool({ length: 8, lower: true, upper: false, digits: true, symbols: false, excludeAmbiguous: false }).length).toBe(36);
  });
});
