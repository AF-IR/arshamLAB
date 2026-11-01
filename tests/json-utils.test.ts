import { describe, expect, test } from "bun:test";
import { formatJson, minifyJson, toPersianMessage } from "../src/lib/json-utils";

describe("formatJson", () => {
  test("زیباسازی ساده", () => {
    const r = formatJson('{"b":1,"a":[1,2]}', { indent: 2, sortKeys: false });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.result).toContain('"b": 1');
    expect(r.result.split("\n").length).toBeGreaterThan(2);
  });

  test("مرتب‌سازی بازگشتی کلیدها", () => {
    const r = formatJson('{"b":{"d":1,"c":2},"a":3}', { indent: 2, sortKeys: true });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.result.indexOf('"a"')).toBeLessThan(r.result.indexOf('"b"'));
    expect(r.result.indexOf('"c"')).toBeLessThan(r.result.indexOf('"d"'));
  });

  test("فشرده‌سازی", () => {
    const r = minifyJson('{\n  "a" : 1 ,\n  "b": [1, 2]\n}');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.result).toBe('{"a":1,"b":[1,2]}');
    expect(r.outBytes).toBeLessThan(r.inBytes);
  });

  test("ورودی خالی", () => {
    const r = formatJson("   ", { indent: 2, sortKeys: false });
    expect(!r.ok && r.error.message.length > 0).toBe(true);
  });

  test("JSON ناقص پیام فارسی می‌دهد", () => {
    const r = formatJson('{"a": 1', { indent: 2, sortKeys: false });
    expect(!r.ok).toBe(true);
    if (r.ok) return;
    expect(r.error.message.includes("JSON Parse error")).toBe(false);
    expect(r.error.message.includes("ناقص") || r.error.message.includes("ساختار")).toBe(true);
  });

  test("کاراکتر غیرمنتظره پیام فارسی می‌دهد", () => {
    const r = formatJson('{a: 1}', { indent: 2, sortKeys: false });
    expect(!r.ok).toBe(true);
    if (r.ok) return;
    expect(r.error.message.includes("JSON Parse error")).toBe(false);
    expect(r.error.message.includes("غیرمنتظره") || r.error.message.includes("ساختار")).toBe(true);
  });

  test("تبدیل پیام‌های موتورهای مختلف به فارسی", () => {
    // V8 (مرورگرها)
    expect(toPersianMessage("Unexpected end of JSON input").includes("ناقص")).toBe(true);
    expect(toPersianMessage("Unexpected token 'a', ...\"{a: 1}\" is not valid JSON").includes("غیرمنتظره")).toBe(true);
    // JSC (Bun/Safari)
    expect(toPersianMessage("JSON Parse error: Expected '}'").includes("ساختار")).toBe(true);
    // موقعیت خطا
    const r = formatJson('{\n  "a": 1,\n  "b": ]\n}', { indent: 2, sortKeys: false });
    expect(!r.ok).toBe(true);
  });

  test("کامای اضافی خطا می‌دهد", () => {
    const r = formatJson('[1, 2, 3,]', { indent: 2, sortKeys: false });
    expect(!r.ok).toBe(true);
  });

  test("ورودی معتبر بزرگ کار می‌کند", () => {
    const big = JSON.stringify({ items: Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `n${i}` })) });
    const r = formatJson(big, { indent: 2, sortKeys: false });
    expect(r.ok).toBe(true);
  });

  test("مقادیر تهی، عدد و رشته خالص", () => {
    expect(formatJson("null", { indent: 2, sortKeys: false }).ok).toBe(true);
    expect(formatJson("42", { indent: 2, sortKeys: false }).ok).toBe(true);
    expect(formatJson('"text"', { indent: 2, sortKeys: false }).ok).toBe(true);
  });
});
