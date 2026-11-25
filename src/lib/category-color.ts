/**
 * رنگ اختصاصی هر دسته‌بندی ابزار — الهام‌گرفته از سبک Google Labs.
 * کلاس‌ها به‌صورت رشته ثابت نوشته شده‌اند تا Tailwind آن‌ها را تشخیص دهد.
 */

export type CategoryColor =
  | "blue"
  | "orange"
  | "amber"
  | "teal"
  | "purple"
  | "cyan"
  | "green"
  | "pink"
  | "slate";

export interface CategoryColorStyle {
  /** پس‌زمینه ملایم + متن رنگی برای کاشی آیکون */
  tile: string;
  /** حالت hover گروهی: کاشی رنگ توپر با متن سفید */
  tileHover: string;
  /** حاشیه کارت در حالت hover */
  borderHover: string;
  /** پس‌زمینه توپر (آیکون بخش‌ها، دکمه‌ها) */
  solid: string;
  /** متن رنگی روی پس‌زمینه روشن */
  text: string;
  /** پس‌زمینه خیلی ملایم برای چیپ‌ها و نوارها */
  soft: string;
}

export const CATEGORY_COLORS: Record<CategoryColor, CategoryColorStyle> = {
  blue: {
    tile: "bg-blue-500/10 text-blue-600",
    tileHover: "group-hover:bg-blue-600 group-hover:text-white",
    borderHover: "hover:border-blue-500/40 group-hover:border-blue-500/40",
    solid: "bg-blue-600 text-white",
    text: "text-blue-600",
    soft: "bg-blue-500/10",
  },
  orange: {
    tile: "bg-orange-500/10 text-orange-600",
    tileHover: "group-hover:bg-orange-500 group-hover:text-white",
    borderHover: "hover:border-orange-500/40 group-hover:border-orange-500/40",
    solid: "bg-orange-500 text-white",
    text: "text-orange-600",
    soft: "bg-orange-500/10",
  },
  amber: {
    tile: "bg-amber-500/10 text-amber-600",
    tileHover: "group-hover:bg-amber-500 group-hover:text-white",
    borderHover: "hover:border-amber-500/40 group-hover:border-amber-500/40",
    solid: "bg-amber-500 text-white",
    text: "text-amber-600",
    soft: "bg-amber-500/10",
  },
  teal: {
    tile: "bg-teal-500/10 text-teal-600",
    tileHover: "group-hover:bg-teal-600 group-hover:text-white",
    borderHover: "hover:border-teal-500/40 group-hover:border-teal-500/40",
    solid: "bg-teal-600 text-white",
    text: "text-teal-600",
    soft: "bg-teal-500/10",
  },
  purple: {
    tile: "bg-purple-500/10 text-purple-600",
    tileHover: "group-hover:bg-purple-600 group-hover:text-white",
    borderHover: "hover:border-purple-500/40 group-hover:border-purple-500/40",
    solid: "bg-purple-600 text-white",
    text: "text-purple-600",
    soft: "bg-purple-500/10",
  },
  cyan: {
    tile: "bg-cyan-500/10 text-cyan-600",
    tileHover: "group-hover:bg-cyan-600 group-hover:text-white",
    borderHover: "hover:border-cyan-500/40 group-hover:border-cyan-500/40",
    solid: "bg-cyan-600 text-white",
    text: "text-cyan-600",
    soft: "bg-cyan-500/10",
  },
  green: {
    tile: "bg-green-500/10 text-green-600",
    tileHover: "group-hover:bg-green-600 group-hover:text-white",
    borderHover: "hover:border-green-500/40 group-hover:border-green-500/40",
    solid: "bg-green-600 text-white",
    text: "text-green-600",
    soft: "bg-green-500/10",
  },
  pink: {
    tile: "bg-pink-500/10 text-pink-600",
    tileHover: "group-hover:bg-pink-600 group-hover:text-white",
    borderHover: "hover:border-pink-500/40 group-hover:border-pink-500/40",
    solid: "bg-pink-600 text-white",
    text: "text-pink-600",
    soft: "bg-pink-500/10",
  },
  slate: {
    tile: "bg-slate-500/10 text-slate-600",
    tileHover: "group-hover:bg-slate-600 group-hover:text-white",
    borderHover: "hover:border-slate-500/40 group-hover:border-slate-500/40",
    solid: "bg-slate-600 text-white",
    text: "text-slate-600",
    soft: "bg-slate-500/10",
  },
};

export function getCategoryColor(color: CategoryColor | undefined): CategoryColorStyle {
  return CATEGORY_COLORS[color ?? "teal"];
}
