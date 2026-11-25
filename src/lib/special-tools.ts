/**
 * ابزارهای ویژه اضافه‌شده از پنل مدیریت — نوع مشترک کلاینت/سرور، اعتبارسنجی
 * ورودی و کمک‌تابع دریافت فهرست از API. ابزارهای ویژه داخلی (آرشام پوینت و
 * آرشام فرم) در src/lib/tools.ts تعریف شده‌اند و اینجا مدیریت می‌شوند.
 */

import type { CategoryColor } from "@/lib/category-color";

export const SPECIAL_TOOL_COLORS = [
  "blue",
  "orange",
  "amber",
  "teal",
  "purple",
  "cyan",
  "green",
  "pink",
  "slate",
] as const satisfies readonly CategoryColor[];

export const SPECIAL_TOOL_COLOR_LABELS: Record<CategoryColor, string> = {
  blue: "آبی",
  orange: "نارنجی",
  amber: "کهربایی",
  teal: "سبزآبی",
  purple: "بنفش",
  cyan: "فیروزه‌ای",
  green: "سبز",
  pink: "صورتی",
  slate: "خاکستری",
};

/** ایموجی‌های پیشنهادی برای انتخاب آیکون ابزار ویژه */
export const SPECIAL_TOOL_EMOJIS = [
  "✨",
  "⭐",
  "🎯",
  "🤖",
  "🧠",
  "📝",
  "📊",
  "🎨",
  "⚡",
  "🔥",
  "💡",
  "🧮",
  "🖼️",
  "🔗",
  "🚀",
  "🎓",
] as const;

/** شکل خروجی API — بدون فیلدهای سیستمی */
export interface SpecialToolDTO {
  id: string;
  title: string;
  /** تگ تایتل کامل برای سئو، مثل «آرشام پوینت | ابزار ساخت پاورپوینت با هوش مصنوعی فارسی رایگان» */
  seoTitle: string;
  excerpt: string;
  description: string;
  url: string;
  /** تصویر کارت — خالی یعنی فقط ایموجی */
  imageUrl: string;
  emoji: string;
  color: CategoryColor;
  badge: string;
  sortOrder: number;
  visible: boolean;
}

interface ApiShape {
  id: string;
  title: string;
  seoTitle?: string | null;
  excerpt: string;
  description: string;
  url: string;
  imageUrl?: string | null;
  emoji: string;
  color: string;
  badge: string;
  sortOrder: number;
  visible: boolean;
}

/** تبدیل خروجی خام Supabase به DTO امن (رنگ نامعتبر → pink) */
export function toSpecialToolDTO(raw: ApiShape): SpecialToolDTO {
  const color = (SPECIAL_TOOL_COLORS as readonly string[]).includes(raw.color)
    ? (raw.color as CategoryColor)
    : "pink";
  return {
    id: raw.id,
    title: raw.title,
    seoTitle: raw.seoTitle?.trim() ?? "",
    excerpt: raw.excerpt,
    description: raw.description ?? "",
    url: raw.url,
    imageUrl: raw.imageUrl?.trim() ?? "",
    emoji: raw.emoji,
    color,
    badge: raw.badge,
    sortOrder: raw.sortOrder,
    visible: raw.visible,
  };
}

export interface SpecialToolInput {
  title: string;
  seoTitle: string;
  excerpt: string;
  description: string;
  url: string;
  imageUrl: string;
  emoji: string;
  color: CategoryColor;
  badge: string;
  sortOrder: number;
  visible: boolean;
}

interface FieldErrors {
  [field: string]: string;
}

/** اعتبارسنجی دستی با پیام‌های فارسی — خروجی: داده تمیز یا خطای هر فیلد */
export function validateSpecialToolInput(
  input: unknown,
  { partial = false }: { partial?: boolean } = {}
): { ok: true; data: Partial<SpecialToolInput> } | { ok: false; errors: FieldErrors } {
  const src = (input ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};
  const data: Partial<SpecialToolInput> = {};

  const has = (key: string) => Object.prototype.hasOwnProperty.call(src, key);

  // عنوان
  if (!partial || has("title")) {
    const v = typeof src.title === "string" ? src.title.trim() : "";
    if (v.length < 2 || v.length > 60) errors.title = "عنوان باید بین ۲ تا ۶۰ نویسه باشد.";
    else data.title = v;
  }

  // تگ تایتل کامل سئو (اختیاری) — مثال: «آرشام پوینت | ابزار ساخت پاورپوینت با هوش مصنوعی فارسی رایگان»
  if (!partial || has("seoTitle")) {
    const v = typeof src.seoTitle === "string" ? src.seoTitle.trim() : "";
    if (v.length > 120) errors.seoTitle = "تگ تایتل حداکثر ۱۲۰ نویسه است.";
    else data.seoTitle = v;
  }

  // توضیح کوتاه
  if (!partial || has("excerpt")) {
    const v = typeof src.excerpt === "string" ? src.excerpt.trim() : "";
    if (v.length < 4 || v.length > 160) errors.excerpt = "توضیح کوتاه باید بین ۴ تا ۱۶۰ نویسه باشد.";
    else data.excerpt = v;
  }

  // توضیح کامل (اختیاری)
  if (!partial || has("description")) {
    const v = typeof src.description === "string" ? src.description.trim() : "";
    if (v.length > 2000) errors.description = "توضیح کامل حداکثر ۲۰۰۰ نویسه است.";
    else data.description = v;
  }

  // لینک
  if (!partial || has("url")) {
    const v = typeof src.url === "string" ? src.url.trim() : "";
    if (!/^https?:\/\/[^\s]+\.[^\s]{2,}$/i.test(v) || v.length > 300)
      errors.url = "لینک باید یک آدرس معتبر http یا https باشد.";
    else data.url = v;
  }

  // تصویر کارت (اختیاری) — آدرس کامل تصویر
  if (!partial || has("imageUrl")) {
    const v = typeof src.imageUrl === "string" ? src.imageUrl.trim() : "";
    if (v && (!/^https?:\/\/[^\s]+\.[^\s]{2,}$/i.test(v) || v.length > 500))
      errors.imageUrl = "آدرس تصویر باید یک لینک معتبر http یا https باشد (خالی هم می‌تواند بماند).";
    else data.imageUrl = v;
  }

  // ایموجی
  if (!partial || has("emoji")) {
    const v = typeof src.emoji === "string" && src.emoji.trim() ? src.emoji.trim() : "✨";
    if (Array.from(v).length > 4) errors.emoji = "ایموجی حداکثر ۴ نویسه است.";
    else data.emoji = v;
  }

  // رنگ
  if (!partial || has("color")) {
    const v = typeof src.color === "string" ? src.color : "pink";
    if (!(SPECIAL_TOOL_COLORS as readonly string[]).includes(v)) errors.color = "رنگ انتخابی معتبر نیست.";
    else data.color = v as CategoryColor;
  }

  // برچسب
  if (!partial || has("badge")) {
    const v = typeof src.badge === "string" && src.badge.trim() ? src.badge.trim() : "ویژه";
    if (v.length > 20) errors.badge = "برچسب حداکثر ۲۰ نویسه است.";
    else data.badge = v;
  }

  // ترتیب نمایش
  if (!partial || has("sortOrder")) {
    if (!has("sortOrder")) {
      data.sortOrder = 0;
    } else {
      const n =
        typeof src.sortOrder === "number" ? Math.floor(src.sortOrder) : Number(src.sortOrder);
      if (!Number.isFinite(n) || n < 0 || n > 999)
        errors.sortOrder = "ترتیب نمایش باید عددی بین ۰ تا ۹۹۹ باشد.";
      else data.sortOrder = n;
    }
  }

  // نمایش/مخفی
  if (!partial || has("visible")) {
    data.visible = typeof src.visible === "boolean" ? src.visible : true;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data };
}

/** دریافت فهرست ابزارهای ویژه مدیریت‌شده از API (سمت کلاینت) */
export async function fetchSpecialTools(): Promise<SpecialToolDTO[]> {
  try {
    const res = await fetch("/api/special-tools", { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as { tools?: ApiShape[] };
    return (json.tools ?? []).map(toSpecialToolDTO);
  } catch {
    return [];
  }
}

/** دریافت کامل (شامل مخفی‌ها) برای پنل مدیریت — نیازمند کوکی ادمین */
export async function fetchAllSpecialTools(): Promise<SpecialToolDTO[]> {
  try {
    const res = await fetch("/api/special-tools?all=1", { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as { tools?: ApiShape[] };
    return (json.tools ?? []).map(toSpecialToolDTO);
  } catch {
    return [];
  }
}
