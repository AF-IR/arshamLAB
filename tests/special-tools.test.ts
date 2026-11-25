import { describe, expect, test } from "bun:test";
import {
  SPECIAL_TOOL_COLORS,
  toSpecialToolDTO,
  validateSpecialToolInput,
} from "../src/lib/special-tools";
import {
  checkAdminPassword,
  createAdminToken,
  isValidAdminToken,
} from "../src/lib/admin-auth";

describe("اعتبارسنجی ابزار ویژه", () => {
  const validInput = {
    title: "آرشام چت",
    excerpt: "چت‌بات هوشمند فارسی برای پاسخ به سوال‌ها",
    description: "توضیح کامل",
    url: "https://chat.example.com",
    emoji: "🤖",
    color: "purple",
    badge: "ویژه",
    sortOrder: 2,
    visible: true,
  };

  test("ورودی کامل معتبر با مقدارهای پیش‌فرض پاس می‌شود", () => {
    const parsed = validateSpecialToolInput(validInput);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.title).toBe("آرشام چت");
      expect(parsed.data.color).toBe("purple");
    }
  });

  test("فیلدهای اختیاری مقدار پیش‌فرض می‌گیرند", () => {
    const parsed = validateSpecialToolInput({
      title: "ابزار تست",
      excerpt: "توضیح کوتاه ابزار",
      url: "https://t.example.com",
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.emoji).toBe("✨");
      expect(parsed.data.badge).toBe("ویژه");
      expect(parsed.data.color).toBe("pink");
      expect(parsed.data.sortOrder).toBe(0);
      expect(parsed.data.visible).toBe(true);
      expect(parsed.data.description).toBe("");
    }
  });

  test("لینک نامعتبر رد می‌شود", () => {
    const parsed = validateSpecialToolInput({ ...validInput, url: "not-a-url" });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.errors.url).toBeTruthy();
  });

  test("عنوان کوتاه و توضیح بلاند رد می‌شوند", () => {
    const a = validateSpecialToolInput({ ...validInput, title: "ا" });
    const b = validateSpecialToolInput({ ...validInput, excerpt: "اب" });
    expect(a.ok).toBe(false);
    expect(b.ok).toBe(false);
  });

  test("رنگ نامعتبر رد می‌شود و رنگ‌های مجاز با CategoryColor هم‌خوان است", () => {
    const parsed = validateSpecialToolInput({ ...validInput, color: "black" });
    expect(parsed.ok).toBe(false);
    expect(SPECIAL_TOOL_COLORS.length).toBe(9);
    expect(SPECIAL_TOOL_COLORS.includes("teal")).toBe(true);
    expect(SPECIAL_TOOL_COLORS.includes("black")).toBe(false);
  });

  test("به‌روزرسانی جزئی (partial) فقط فیلدهای ارسالی را می‌سنجد", () => {
    const parsed = validateSpecialToolInput({ visible: false }, { partial: true });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.visible).toBe(false);
      expect(parsed.data.title).toBeUndefined();
    }
  });

  test("تبدیل رنگ نامعتبر به pink در DTO", () => {
    const dto = toSpecialToolDTO({
      id: "x",
      title: "ت",
      excerpt: "توضیح تست",
      description: "",
      url: "https://x.example.com",
      emoji: "⭐",
      color: "unknown-color",
      badge: "ویژه",
      sortOrder: 0,
      visible: true,
    });
    expect(dto.color).toBe("pink");
  });
});

describe("احراز هویت ادمین", () => {
  test("توکن ساخته‌شده معتبر است", () => {
    const token = createAdminToken();
    expect(token.length).toBe(64);
    expect(isValidAdminToken(token)).toBe(true);
  });

  test("توکن اشتباه و خالی رد می‌شود", () => {
    expect(isValidAdminToken("0".repeat(64))).toBe(false);
    expect(isValidAdminToken("")).toBe(false);
    expect(isValidAdminToken(null)).toBe(false);
    expect(isValidAdminToken(undefined)).toBe(false);
  });

  test("رمز اشتباه رد و رمز خالی رد می‌شود", () => {
    expect(checkAdminPassword("definitely-wrong")).toBe(false);
    expect(checkAdminPassword("")).toBe(false);
    expect(checkAdminPassword(123)).toBe(false);
  });
});
