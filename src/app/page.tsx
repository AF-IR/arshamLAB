import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserX,
} from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { SpecialHighlightCard } from "@/components/special-highlight-card";
import { SpecialToolsExtra } from "@/components/special-tools-extra";
import { AdSlot } from "@/components/ad-slot";
import {
  getCategoriesWithTools,
  getFeaturedTools,
  getPopularTools,
  getToolBySlug,
  getToolsByCategory,
  TOOLS,
} from "@/lib/tools";
import { getCategoryColor } from "@/lib/category-color";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ابزارهای کاربردی و رایگان آنلاین",
  description:
    "آرشام لب؛ ابزارهای ساده، سریع و رایگان برای انجام کارهای روزمره بدون نیاز به ثبت‌نام. تبدیل تاریخ شمسی و میلادی، مبدل واحدها، ساخت و خواندن QR Code، فشرده‌سازی عکس، ابزارهای هوش مصنوعی و بیشتر.",
  path: "/",
  keywords: ["ابزارهای آنلاین رایگان", "ابزارهای کاربردی", "آرشام لب", "ابزارهای هوش مصنوعی"],
});

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "کاملاً رایگان",
    text: "همه ابزارها بدون هزینه و بدون محدودیت مصنوعی قابل استفاده‌اند.",
    color: "green" as const,
  },
  {
    icon: UserX,
    title: "بدون نیاز به ثبت‌نام",
    text: "هیچ ایمیل، رمز عبور یا حساب کاربری لازم نیست؛ باز می‌کنید و استفاده می‌کنید.",
    color: "blue" as const,
  },
  {
    icon: Search,
    title: "استفاده آسان",
    text: "رابط کاربری ساده و فارسی؛ هر ابزار دقیقاً یک کار را خوب انجام می‌دهد.",
    color: "amber" as const,
  },
  {
    icon: Smartphone,
    title: "سازگار با موبایل",
    text: "طراحی واکنش‌گرا برای موبایل، تبلت و دسکتاپ با سرعت بالا.",
    color: "cyan" as const,
  },
  {
    icon: ShieldCheck,
    title: "پردازش در مرورگر شما",
    text: "ابزارهای محلی داده‌های شما را به سرور ارسال نمی‌کنند؛ همه‌چیز همان‌جا پردازش می‌شود.",
    color: "teal" as const,
  },
  {
    icon: Sparkles,
    title: "ابزارهای هوش مصنوعی",
    text: "از آرشام پوینت برای ساخت ارائه تا آرشام فرم برای تحلیل پاسخنامه؛ ابزارهای هوشمند متن هم در همین سایت.",
    color: "pink" as const,
  },
];

const CHIP_COLORS = ["blue", "amber", "green", "purple"] as const;

/** کلاس تأخیر مرحله‌ای افکت لود برای ورود آبشاری کارت‌ها */
function revealDelay(i: number): string {
  const n = Math.min(i + 1, 8);
  return `reveal reveal-d${n}`;
}

export default function HomePage() {
  const featured = getFeaturedTools();
  const categories = getCategoriesWithTools();
  const popular = getPopularTools();
  const arshamPoint = getToolBySlug("arsham-point")!;
  const arshamForm = getToolBySlug("arsham-form")!;

  return (
    <div>
      {/* Hero با پس‌زمینه لکه‌های رنگی به سبک Google Labs */}
      <section className="relative overflow-hidden border-b bg-card/50">
        <div
          aria-hidden="true"
          className="hero-blob right-[-60px] top-[-40px] size-72 bg-blue-400"
          style={{ animationDelay: "0s" }}
        />
        <div
          aria-hidden="true"
          className="hero-blob left-[8%] top-[30%] size-64 bg-fuchsia-400"
          style={{ animationDelay: "2.5s" }}
        />
        <div
          aria-hidden="true"
          className="hero-blob right-[24%] bottom-[-70px] size-72 bg-amber-300"
          style={{ animationDelay: "1.2s" }}
        />
        <div
          aria-hidden="true"
          className="hero-blob left-[30%] top-[-50px] size-56 bg-teal-400"
          style={{ animationDelay: "3.4s" }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 text-center sm:py-24">
          <div className="reveal mx-auto w-fit">
            <p className="float-soft inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3.5 py-1.5 text-xs font-bold text-foreground/80 shadow-sm backdrop-blur">
            <Sparkles className="size-3.5 text-fuchsia-500" aria-hidden="true" />
            {new Intl.NumberFormat("fa-IR").format(TOOLS.length)} ابزار رایگان + ابزارهای هوش مصنوعی
            </p>
          </div>

          <h1 className="reveal reveal-d1 mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.4] sm:text-[52px] sm:leading-[1.35]">
            <span className="gradient-hero-text">ابزارهای کاربردی</span>
            <span className="block text-foreground/90">و رایگان آنلاین</span>
          </h1>
          <p className="reveal reveal-d2 mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-muted-foreground sm:text-lg sm:leading-9">
            از تبدیل تاریخ شمسی و مبدل واحدها تا ساخت و خواندن QR Code و فشرده‌سازی عکس؛
            بدون ثبت‌نام، بدون آپلود داده و اغلب کاملاً در مرورگر شما.
          </p>

          <form
            role="search"
            action="/tools"
            method="get"
            className="reveal reveal-d3 relative mx-auto mt-9 flex w-full max-w-xl gap-2"
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <label htmlFor="home-search" className="sr-only">
                جست‌وجوی ابزارها
              </label>
              <input
                id="home-search"
                type="search"
                name="q"
                placeholder="جست‌وجوی ابزار؛ مثلاً QR، تاریخ، واحد یا عکس…"
                className="h-14 w-full rounded-2xl border border-input bg-card ps-11 pe-4 text-[15px] shadow-md outline-none transition-all placeholder:text-muted-foreground focus-visible:border-primary focus-visible:shadow-lg focus-visible:outline-2 focus-visible:outline-ring"
              />
            </div>
            <button
              type="submit"
              className="h-14 shrink-0 rounded-2xl bg-primary px-6 font-bold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-ring"
            >
              جست‌وجو
            </button>
          </form>

          <div className="reveal reveal-d4 mt-6 flex flex-wrap items-center justify-center gap-2 text-[13px]">
            <span className="text-muted-foreground">پرطرفدارها:</span>
            {popular.slice(0, 4).map((tool, i) => {
              const dot = getCategoryColor(CHIP_COLORS[i % CHIP_COLORS.length]);
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 font-medium text-foreground/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className={`size-2 rounded-full ${dot.solid}`} aria-hidden="true" />
                  {tool.title}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4">
        <AdSlot slot="homeHero" className="mt-6" minHeight={100} />

        {/* تب ویژه — ابزارهای ستاره‌دار آرشام */}
        <section aria-labelledby="special-title" className="mt-12 scroll-mt-24" id="special">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="special-title" className="text-xl font-extrabold sm:text-2xl">
                تب ویژه — ابزارهای ستاره‌دار آرشام
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                ابزارهای شاخص و هوش مصنوعی آرشام که روی سایت‌های اختصاصی خودشان اجرا می‌شوند.
              </p>
            </div>
            <Link
              href="/tools?filter=special"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              مشاهده تب ویژه
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="reveal reveal-d3 special-glow">
              <SpecialHighlightCard
                tool={arshamPoint}
                gradient="from-pink-600 via-fuchsia-600 to-violet-700"
                hostname="arshampoint.vercel.app"
                blurb="فقط موضوع را بنویسید تا اسلایدهای کامل ارائه با طراحی آماده و راست‌چین ساخته شود؛ خروجی HTML قابل اجرا و دانلود."
                ctaLabel="شناخت آرشام پوینت"
                ctaTextClass="text-fuchsia-700"
              />
            </div>
            <div className="reveal reveal-side reveal-d4">
              <SpecialHighlightCard
                tool={arshamForm}
                gradient="from-emerald-600 via-teal-600 to-cyan-700"
                hostname="afform.vercel.app"
                blurb="فرم و آزمون آنلاین بسازید و پاسخنامه‌ها را با تحلیل هوش مصنوعی بررسی کنید؛ سریع، فارسی و بدون نصب."
                ctaLabel="شناخت آرشام فرم"
                ctaTextClass="text-teal-700"
              />
            </div>
          </div>
          <SpecialToolsExtra />
        </section>

        {/* ابزارهای منتخب */}
        <section aria-labelledby="featured-title" className="mt-14 scroll-mt-24" id="featured">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="featured-title" className="text-xl font-extrabold sm:text-2xl">
                ابزارهای منتخب
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                پرکاربردترین و تازه‌ترین ابزارهای آرشام لب برای شروع سریع.
              </p>
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              همه ابزارها
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((tool, i) => (
              <div key={tool.slug} className={revealDelay(i)}>
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        </section>

        {/* دسته‌بندی‌ها */}
        <section aria-labelledby="categories-title" className="mt-16 scroll-mt-24" id="categories">
          <h2 id="categories-title" className="text-xl font-extrabold sm:text-2xl">
            دسته‌بندی ابزارها
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            هر دسته رنگ خودش را دارد؛ ابزار موردنظرت را سریع پیدا کن.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => {
              const Icon = category.icon;
              const color = getCategoryColor(category.color);
              const count = getToolsByCategory(category.id).length;
              return (
                <div key={category.id} className={revealDelay(i)}>
                <Link
                  href={`/tools?cat=${category.id}`}
                  className={`group flex h-full items-start gap-3.5 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-ring ${color.borderHover}`}
                >
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors ${color.tile} ${color.tileHover}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-bold">
                      {category.title}
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {new Intl.NumberFormat("fa-IR").format(count)} ابزار
                      </span>
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                      {category.description}
                    </span>
                  </span>
                </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* مزایا */}
        <section aria-labelledby="why-title" className="mt-16">
          <h2 id="why-title" className="text-xl font-extrabold sm:text-2xl">
            چرا آرشام لب؟
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => {
              const color = getCategoryColor(b.color);
              return (
                <div
                  key={b.title}
                  className="rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className={`flex size-10 items-center justify-center rounded-xl ${color.tile}`}>
                    <b.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3.5 font-bold">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{b.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="relative my-16 overflow-hidden rounded-3xl bg-gradient-to-l from-teal-600 via-teal-500 to-cyan-500 px-6 py-10 text-center text-white shadow-lg sm:py-12">
          <div
            aria-hidden="true"
            className="hero-blob right-[10%] top-[-30px] size-40 bg-white opacity-20"
          />
          <h2 className="text-xl font-extrabold sm:text-2xl">همه ابزارها را یک‌جا ببینید</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-white/85">
            از شمارش متن تا تبدیل تاریخ شمسی و میلادی، مبدل واحدها و ابزارهای هوش مصنوعی؛
            {new Intl.NumberFormat("fa-IR").format(TOOLS.length)} ابزار آماده استفاده، همین حالا.
          </p>
          <Link
            href="/tools"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-card px-5 py-3 text-sm font-bold text-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-white"
          >
            ورود به فهرست ابزارها
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}
