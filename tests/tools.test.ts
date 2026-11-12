import { describe, expect, test } from "bun:test";
import {
  TOOLS,
  TOOL_CATEGORIES,
  getCategoriesWithTools,
  getFeaturedTools,
  getPopularTools,
  getRelatedTools,
  getSpecialTools,
  getToolBySlug,
  getToolPaths,
  getToolsByCategory,
} from "../src/lib/tools";

describe("سلامت رجیستری ابزارها", () => {
  test("۱۷ ابزار در نسخه سوم (نسخه دوم + آرشام فرم)", () => {
    expect(TOOLS.length).toBe(17);
  });

  test("ابزارهای جدید نسخه دوم موجودند", () => {
    for (const slug of [
      "date-converter",
      "unit-converter",
      "qr-code-reader",
      "image-compressor",
      "text-summarizer",
      "arsham-point",
      "arsham-form",
    ]) {
      expect(getToolBySlug(slug)?.title).toBeTruthy();
    }
    expect(getToolBySlug("arsham-point")?.externalUrl).toBe("https://arshampoint.vercel.app");
    expect(getToolBySlug("arsham-form")?.externalUrl).toBe("https://afform.vercel.app");
  });

  test("ابزارهای ویژه شامل آرشام پوینت و آرشام فرم هستند", () => {
    const special = getSpecialTools();
    expect(special.length).toBe(2);
    expect(special.map((t) => t.slug).sort()).toEqual(["arsham-form", "arsham-point"]);
    for (const tool of special) {
      expect(tool.externalUrl).toBeTruthy();
      expect(tool.badge).toBe("ai");
    }
  });

  test("اسلاگ‌ها یکتا و معتبر", () => {
    const slugs = TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  test("هر ابزار دسته معتبر، توضیح متا و کلمات کلیدی دارد", () => {
    const validIds = new Set(TOOL_CATEGORIES.map((c) => c.id));
    for (const tool of TOOLS) {
      expect(validIds.has(tool.category)).toBe(true);
      expect(tool.description.length).toBeGreaterThanOrEqual(50);
      expect(tool.description.length).toBeLessThanOrEqual(180);
      expect(tool.excerpt.length).toBeGreaterThan(10);
      expect(tool.keywords.length).toBeGreaterThanOrEqual(3);
      expect(tool.title.length).toBeGreaterThan(3);
    }
  });

  test("مسیرهای ابزار یکتا هستند", () => {
    const paths = getToolPaths();
    expect(new Set(paths).size).toBe(paths.length);
    expect(getToolPaths()).toContain("/tools/text-counter");
  });

  test("دسته‌های بدون ابزار نمایش داده نمی‌شوند", () => {
    const active = getCategoriesWithTools();
    for (const cat of active) {
      expect(getToolsByCategory(cat.id).length).toBeGreaterThan(0);
    }
    // تصویر، مبدل‌ها و هوش مصنوعی اکنون ابزار دارند؛ فقط «فایل» هنوز خالی است
    expect(active.find((c) => c.id === "image")).toBeDefined();
    expect(active.find((c) => c.id === "convert")).toBeDefined();
    expect(active.find((c) => c.id === "ai")).toBeDefined();
    expect(active.find((c) => c.id === "file")).toBeUndefined();
    expect(active.length).toBe(8);
  });

  test("ابزارهای منتخب و محبوب", () => {
    expect(getFeaturedTools().length).toBeGreaterThanOrEqual(6);
    expect(getPopularTools().length).toBeGreaterThanOrEqual(4);
  });

  test("جست‌وجوی ابزار با اسلاگ", () => {
    expect(getToolBySlug("qr-code-generator")?.title).toBeTruthy();
    expect(getToolBySlug("does-not-exist")).toBeUndefined();
  });

  test("ابزارهای مرتبط شامل خود ابزار نیست", () => {
    const related = getRelatedTools("text-counter", 3);
    expect(related.length).toBe(3);
    expect(related.find((t) => t.slug === "text-counter")).toBeUndefined();
  });
});
