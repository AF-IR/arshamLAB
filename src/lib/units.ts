/**
 * منطق خالص تبدیل واحدها — بدون وابستگی به React یا DOM تا قابل آزمایش باشد.
 * همه ضریب‌ها نسبت به واحد پایه هر گروه تعریف شده‌اند؛ دما با توابع خاص خودش
 * تبدیل می‌شود (چون خطی از مبدأ نیست).
 */

export interface UnitDef {
  /** شناسه یکتا در گروه */
  id: string;
  /** نام فارسی واحد */
  name: string;
  /** نماد لاتین استاندارد */
  symbol: string;
  /** ضریب تبدیل به واحد پایه گروه */
  factor: number;
  /** برای واحدهای تقریبی مثل سال */
  approximate?: boolean;
}

export interface UnitGroup {
  id: string;
  title: string;
  /** واحد پایه برای محاسبه (فقط نمایش) */
  baseLabel: string;
  units: UnitDef[];
  /** گروه دما از فرمول خاص استفاده می‌کند */
  isTemperature?: boolean;
}

export const UNIT_GROUPS: UnitGroup[] = [
  {
    id: "length",
    title: "طول",
    baseLabel: "متر",
    units: [
      { id: "mm", name: "میلی‌متر", symbol: "mm", factor: 0.001 },
      { id: "cm", name: "سانتی‌متر", symbol: "cm", factor: 0.01 },
      { id: "m", name: "متر", symbol: "m", factor: 1 },
      { id: "km", name: "کیلومتر", symbol: "km", factor: 1000 },
      { id: "in", name: "اینچ", symbol: "in", factor: 0.0254 },
      { id: "ft", name: "فوت", symbol: "ft", factor: 0.3048 },
      { id: "yd", name: "یارد", symbol: "yd", factor: 0.9144 },
      { id: "mi", name: "مایل", symbol: "mi", factor: 1609.344 },
      { id: "nmi", name: "مایل دریایی", symbol: "nmi", factor: 1852 },
    ],
  },
  {
    id: "weight",
    title: "وزن",
    baseLabel: "کیلوگرم",
    units: [
      { id: "mg", name: "میلی‌گرم", symbol: "mg", factor: 0.000001 },
      { id: "g", name: "گرم", symbol: "g", factor: 0.001 },
      { id: "kg", name: "کیلوگرم", symbol: "kg", factor: 1 },
      { id: "t", name: "تن", symbol: "t", factor: 1000 },
      { id: "oz", name: "اونس", symbol: "oz", factor: 0.028349523125 },
      { id: "lb", name: "پوند", symbol: "lb", factor: 0.45359237 },
      { id: "carat", name: "قیراط", symbol: "ct", factor: 0.0002 },
    ],
  },
  {
    id: "temperature",
    title: "دما",
    baseLabel: "سلسیوس",
    isTemperature: true,
    units: [
      { id: "c", name: "سلسیوس", symbol: "°C", factor: 1 },
      { id: "f", name: "فارنهایت", symbol: "°F", factor: 1 },
      { id: "k", name: "کلوین", symbol: "K", factor: 1 },
    ],
  },
  {
    id: "area",
    title: "مساحت",
    baseLabel: "متر مربع",
    units: [
      { id: "m2", name: "متر مربع", symbol: "m²", factor: 1 },
      { id: "km2", name: "کیلومتر مربع", symbol: "km²", factor: 1000000 },
      { id: "hectare", name: "هکتار", symbol: "ha", factor: 10000 },
      { id: "are", name: "آر (سنج)", symbol: "are", factor: 100 },
      { id: "ft2", name: "فوت مربع", symbol: "ft²", factor: 0.09290304 },
      { id: "in2", name: "اینچ مربع", symbol: "in²", factor: 0.00064516 },
      { id: "acre", name: "آکر", symbol: "ac", factor: 4046.8564224 },
    ],
  },
  {
    id: "volume",
    title: "حجم",
    baseLabel: "لیتر",
    units: [
      { id: "ml", name: "میلی‌لیتر", symbol: "ml", factor: 0.001 },
      { id: "l", name: "لیتر", symbol: "L", factor: 1 },
      { id: "m3", name: "متر مکعب", symbol: "m³", factor: 1000 },
      { id: "cm3", name: "سانتی‌متر مکعب", symbol: "cm³", factor: 0.001 },
      { id: "ft3", name: "فوت مکعب", symbol: "ft³", factor: 28.316846592 },
      { id: "galus", name: "گالن آمریکا", symbol: "gal", factor: 3.785411784 },
      { id: "galuk", name: "گالن انگلیسی", symbol: "gal (UK)", factor: 4.54609 },
      { id: "cup", name: "پیمانه (۲۴۰ میلی‌لیتر)", symbol: "cup", factor: 0.24 },
    ],
  },
  {
    id: "speed",
    title: "سرعت",
    baseLabel: "متر بر ثانیه",
    units: [
      { id: "ms", name: "متر بر ثانیه", symbol: "m/s", factor: 1 },
      { id: "kmh", name: "کیلومتر بر ساعت", symbol: "km/h", factor: 1 / 3.6 },
      { id: "mph", name: "مایل بر ساعت", symbol: "mph", factor: 0.44704 },
      { id: "knot", name: "گره (ناتیکال)", symbol: "kn", factor: 0.514444 },
      { id: "fts", name: "فوت بر ثانیه", symbol: "ft/s", factor: 0.3048 },
    ],
  },
  {
    id: "data",
    title: "حجم داده",
    baseLabel: "بایت (مبنای ۱۰۲۴)",
    units: [
      { id: "b", name: "بایت", symbol: "B", factor: 1 },
      { id: "kb", name: "کیلوبایت", symbol: "KB", factor: 1024 },
      { id: "mb", name: "مگابایت", symbol: "MB", factor: 1048576 },
      { id: "gb", name: "گیگابایت", symbol: "GB", factor: 1073741824 },
      { id: "tb", name: "ترابایت", symbol: "TB", factor: 1099511627776 },
    ],
  },
  {
    id: "time",
    title: "زمان",
    baseLabel: "ثانیه",
    units: [
      { id: "s", name: "ثانیه", symbol: "s", factor: 1 },
      { id: "min", name: "دقیقه", symbol: "min", factor: 60 },
      { id: "h", name: "ساعت", symbol: "h", factor: 3600 },
      { id: "d", name: "روز", symbol: "d", factor: 86400 },
      { id: "w", name: "هفته", symbol: "wk", factor: 604800 },
      { id: "y", name: "سال (۳۶۵ روز)", symbol: "y", factor: 31536000, approximate: true },
    ],
  },
];

export function getUnitGroup(groupId: string): UnitGroup | undefined {
  return UNIT_GROUPS.find((g) => g.id === groupId);
}

export function getUnit(group: UnitGroup, unitId: string): UnitDef | undefined {
  return group.units.find((u) => u.id === unitId);
}

/* ----------------------------------- دما ----------------------------------- */

function toCelsius(value: number, unitId: string): number {
  switch (unitId) {
    case "f":
      return (value - 32) * (5 / 9);
    case "k":
      return value - 273.15;
    default:
      return value;
  }
}

function fromCelsius(celsius: number, unitId: string): number {
  switch (unitId) {
    case "f":
      return celsius * (9 / 5) + 32;
    case "k":
      return celsius + 273.15;
    default:
      return celsius;
  }
}

/** تبدیل مقدار از یک واحد به واحد دیگر در همان گروه */
export function convertUnit(value: number, groupId: string, fromId: string, toId: string): number | null {
  const group = getUnitGroup(groupId);
  if (!group) return null;
  if (group.isTemperature) {
    if (!getUnit(group, fromId) || !getUnit(group, toId)) return null;
    return fromCelsius(toCelsius(value, fromId), toId);
  }
  const from = getUnit(group, fromId);
  const to = getUnit(group, toId);
  if (!from || !to) return null;
  return (value * from.factor) / to.factor;
}

/** فرمت مناسب نمایش نتیجه: تا ۶ رقم اعشار با حذف صفرهای انتهایی */
export function formatUnitResult(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e15 || (abs < 1e-6 && abs > 0)) return value.toExponential(6).replace(/\.?0+e/, "e");
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
    useGrouping: false,
  }).format(value);
  return formatted;
}
