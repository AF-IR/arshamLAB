/**
 * رجیستری مرکزی ابزارها — تنها محل مدیریت فهرست ابزارها، دسته‌بندی‌ها و
 * اطلاعات نمایش آن‌ها. برای افزودن ابزار جدید فقط یک ورودی اینجا اضافه کنید
 * و یک مسیر در app/tools/<slug>/page.tsx بسازید.
 */

import {
  ArrowLeftRight,
  Braces,
  Cake,
  CalendarClock,
  CalendarRange,
  Calculator,
  Code2,
  Eraser,
  FileOutput,
  Globe,
  Image,
  KeyRound,
  LetterText,
  ListX,
  Percent,
  QrCode,
  Type,
  type LucideIcon,
} from "lucide-react";

export type ToolCategoryId =
  | "text"
  | "image"
  | "calculation"
  | "datetime"
  | "coding"
  | "file"
  | "internet";

export interface ToolCategory {
  id: ToolCategoryId;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Tool {
  slug: string;
  title: string;
  /** توضیح کوتاه برای کارت‌ها */
  excerpt: string;
  /** توضیح متا (۱۵۰ تا ۱۶۰ نویسه) */
  description: string;
  category: ToolCategoryId;
  icon: LucideIcon;
  keywords: string[];
  /** در بخش ابزارهای محبوب نمایش داده شود */
  popular?: boolean;
  /** در بخش ابزارهای منتخب صفحه اصلی نمایش داده شود */
  featured?: boolean;
  /** آیا پردازش کاملاً در مرورگر انجام می‌شود (هیچ داده‌ای به سرور نمی‌رود) */
  localProcessing: boolean;
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "text",
    title: "ابزارهای متنی",
    description: "شمارش، پاک‌سازی و تبدیل متن و ارقام",
    icon: Type,
  },
  {
    id: "image",
    title: "ابزارهای تصاویر",
    description: "پردازش و تبدیل تصویر",
    icon: Image,
  },
  {
    id: "calculation",
    title: "ابزارهای محاسباتی",
    description: "محاسبه درصد، تخفیف و اعداد",
    icon: Calculator,
  },
  {
    id: "datetime",
    title: "ابزارهای تاریخ و زمان",
    description: "اختلاف تاریخ، سن و تقویم شمسی",
    icon: CalendarClock,
  },
  {
    id: "coding",
    title: "ابزارهای کدنویسی",
    description: "قالب‌بندی و اعتبارسنجی JSON",
    icon: Code2,
  },
  {
    id: "file",
    title: "ابزارهای فایل و تبدیل فرمت",
    description: "تبدیل فرمت فایل‌ها",
    icon: FileOutput,
  },
  {
    id: "internet",
    title: "ابزارهای اینترنتی",
    description: "QR Code و ابزارهای وب",
    icon: Globe,
  },
];

export const TOOLS: Tool[] = [
  {
    slug: "text-counter",
    title: "شمارش کلمات و کاراکترها",
    excerpt: "شمارش زنده کلمه، کاراکتر، خط و پاراگراف متن شما",
    description:
      "شمارش کلمات و کاراکترهای متن به‌صورت زنده و رایگان؛ تعداد کاراکتر با و بدون فاصله، تعداد خطوط و پاراگراف‌ها و زمان مطالعه را همین‌جا ببینید.",
    category: "text",
    icon: LetterText,
    keywords: ["شمارش کلمات", "تعداد کاراکتر", "شمارش حروف", "word counter", "شمارش متن"],
    popular: true,
    featured: true,
    localProcessing: true,
  },
  {
    slug: "remove-extra-spaces",
    title: "حذف فاصله‌های اضافی متن",
    excerpt: "پاک‌سازی فاصله‌های تکراری، تب و خطوط خالی در یک کلیک",
    description:
      "حذف فاصله‌های تکراری ابتدا و انتهای متن و خطوط، تبدیل تب به فاصله و حذف خطوط خالی؛ آنلاین و رایگان با پیش‌نمایش زنده خروجی.",
    category: "text",
    icon: Eraser,
    keywords: ["حذف فاصله اضافی", "پاکسازی متن", "حذف تب", "remove extra spaces"],
    featured: false,
    localProcessing: true,
  },
  {
    slug: "remove-duplicate-lines",
    title: "حذف خطوط تکراری",
    excerpt: "حذف خطوط تکراری لیست با حفظ ترتیب یا مرتب‌سازی الفبایی",
    description:
      "حذف خطوط تکراری از لیست‌ها و متن‌ها به‌صورت آنلاین؛ با امکان حفظ ترتیب اولیه یا مرتب‌سازی الفبایی، نمایش تعداد خطوط حذف‌شده و کپی خروجی.",
    category: "text",
    icon: ListX,
    keywords: ["حذف خط تکراری", "لیست یکتا", "unique lines", "remove duplicate lines"],
    localProcessing: true,
  },
  {
    slug: "number-converter",
    title: "تبدیل اعداد فارسی و انگلیسی",
    excerpt: "تبدیل ارقام فارسی، انگلیسی و عربی به یکدیگر بدون تغییر متن",
    description:
      "تبدیل آنلاین ارقام فارسی به انگلیسی، انگلیسی به فارسی و عربی به فارسی؛ سایر بخش‌های متن حفظ می‌شود و خروجی قابل کپی است.",
    category: "text",
    icon: ArrowLeftRight,
    keywords: ["تبدیل اعداد فارسی", "اعداد انگلیسی", "ارقام عربی", "convert numbers"],
    localProcessing: true,
  },
  {
    slug: "percentage-calculator",
    title: "محاسبه درصد",
    excerpt: "درصد یک عدد، درصد تغییر و محاسبه قیمت قبل و بعد از تخفیف",
    description:
      "محاسبه آنلاین درصد یک عدد، درصد افزایش و کاهش، قیمت بعد از تخفیف و قیمت اصلی قبل از تخفیف؛ همراه با نمایش مراحل محاسبه و اعتبارسنجی ورودی.",
    category: "calculation",
    icon: Percent,
    keywords: ["محاسبه درصد", "درصد تخفیف", "درصد تغییر", "percentage calculator"],
    popular: true,
    featured: true,
    localProcessing: true,
  },
  {
    slug: "qr-code-generator",
    title: "ساخت QR Code",
    excerpt: "ساخت کد QR برای متن و لینک با انتخاب اندازه و رنگ + دانلود PNG",
    description:
      "ساخت QR Code آنلاین برای متن و لینک؛ انتخاب اندازه و رنگ در محدوده قابل اسکن، پیش‌نمایش زنده و دانلود تصویر PNG با کیفیت بالا.",
    category: "internet",
    icon: QrCode,
    keywords: ["QR Code", "بارکد خوان", "ساخت کیوآر", "qr code generator"],
    popular: true,
    featured: true,
    localProcessing: true,
  },
  {
    slug: "date-difference",
    title: "محاسبه اختلاف دو تاریخ",
    excerpt: "فاصله روز بین دو تاریخ میلادی با نمایش معادل شمسی",
    description:
      "محاسبه آنلاین تعداد روز بین دو تاریخ با گزینه احتساب یا بدون احتساب روز پایانی؛ نمایش معادل شمسی تاریخ‌ها و تفکیک هفته و روز.",
    category: "datetime",
    icon: CalendarRange,
    keywords: ["اختلاف تاریخ", "فاصله دو تاریخ", "تعداد روز", "date difference"],
    localProcessing: true,
  },
  {
    slug: "age-calculator",
    title: "محاسبه سن",
    excerpt: "سن دقیق به سال، ماه و روز با تقویم شمسی یا میلادی",
    description:
      "محاسبه آنلاین سن از تاریخ تولد به سال، ماه و روز؛ با پشتیبانی کامل از تقویم شمسی و میلادی، مدیریت تاریخ آینده و نمایش مجموع روزهای زندگی.",
    category: "datetime",
    icon: Cake,
    keywords: ["محاسبه سن", "تاریخ تولد", "چند سال دارم", "age calculator", "تقویم شمسی"],
    popular: true,
    featured: true,
    localProcessing: true,
  },
  {
    slug: "json-formatter",
    title: "فرمت‌کننده JSON",
    excerpt: "زیباسازی، فشرده‌سازی و اعتبارسنجی JSON با پیام خطای فارسی",
    description:
      "قالب‌بندی و زیباسازی JSON آنلاین، فشرده‌سازی، مرتب‌سازی کلیدها و نمایش خطاهای ساختاری به زبان فارسی با شماره خط و ستون.",
    category: "coding",
    icon: Braces,
    keywords: ["JSON", "فرمت JSON", "beautify json", "minify json", "اعتبارسنجی JSON"],
    featured: true,
    localProcessing: true,
  },
  {
    slug: "password-generator",
    title: "ساخت رمز عبور قوی",
    excerpt: "تولید رمز امن با Web Crypto API و انتخاب طول و نوع کاراکترها",
    description:
      "تولید رمز عبور قوی و تصادفی در مرورگر با Web Crypto API؛ انتخاب طول، حروف بزرگ و کوچک، اعداد و نمادها، سنجش قدرت رمز و کپی فوری.",
    category: "text",
    icon: KeyRound,
    keywords: ["رمز عبور قوی", "ساخت پسورد", "password generator", "رمز تصادفی"],
    popular: true,
    featured: true,
    localProcessing: true,
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategoryId): Tool[] {
  return TOOLS.filter((t) => t.category === category);
}

/** فقط دسته‌هایی که حداقل یک ابزار واقعی دارند */
export function getCategoriesWithTools(): ToolCategory[] {
  return TOOL_CATEGORIES.filter((c) => getToolsByCategory(c.id).length > 0);
}

export function getFeaturedTools(): Tool[] {
  const featured = TOOLS.filter((t) => t.featured);
  return featured.length > 0 ? featured : TOOLS.slice(0, 6);
}

export function getPopularTools(): Tool[] {
  const popular = TOOLS.filter((t) => t.popular);
  return popular.length > 0 ? popular : TOOLS.slice(0, 4);
}

export function getToolCategory(tool: Tool): ToolCategory {
  const cat = TOOL_CATEGORIES.find((c) => c.id === tool.category);
  if (!cat) throw new Error(`دسته‌بندی ناشناخته: ${tool.category}`);
  return cat;
}

/** ابزارهای مرتبط: ابتدا هم‌دسته‌ها، سپس محبوب‌ها */
export function getRelatedTools(slug: string, count = 3): Tool[] {
  const tool = getToolBySlug(slug);
  if (!tool) return getPopularTools().slice(0, count);
  const sameCategory = TOOLS.filter((t) => t.slug !== slug && t.category === tool.category);
  const popular = TOOLS.filter(
    (t) => t.slug !== slug && t.category !== tool.category && t.popular
  );
  const rest = TOOLS.filter((t) => t.slug !== slug && !sameCategory.includes(t) && !popular.includes(t));
  return [...sameCategory, ...popular, ...rest].slice(0, count);
}

/** همه مسیرهای ابزارها (برای sitemap و لینک‌سازی داخلی) */
export function getToolPaths(): string[] {
  return TOOLS.map((t) => `/tools/${t.slug}`);
}
