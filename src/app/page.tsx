import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Search,
  ShieldCheck,
  Smartphone,
  UserX,
} from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { AdSlot } from "@/components/ad-slot";
import {
  getCategoriesWithTools,
  getFeaturedTools,
  getPopularTools,
  getToolsByCategory,
} from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ابزارهای کاربردی و رایگان آنلاین",
  description:
    "آرشام لب؛ ابزارهای ساده، سریع و رایگان برای انجام کارهای روزمره بدون نیاز به ثبت‌نام. شمارش متن، ساخت QR Code، محاسبه درصد و سن، فرمت JSON و بیش از این.",
  path: "/",
  keywords: ["ابزارهای آنلاین رایگان", "ابزارهای کاربردی", "آرشام لب"],
});

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "کاملاً رایگان",
    text: "همه ابزارها بدون هزینه و بدون محدودیت مصنوعی قابل استفاده‌اند.",
  },
  {
    icon: UserX,
    title: "بدون نیاز به ثبت‌نام",
    text: "هیچ ایمیل، رمز عبور یا حساب کاربری لازم نیست؛ باز می‌کنید و استفاده می‌کنید.",
  },
  {
    icon: Search,
    title: "استفاده آسان",
    text: "رابط کاربری ساده و فارسی؛ هر ابزار دقیقاً یک کار را خوب انجام می‌دهد.",
  },
  {
    icon: Smartphone,
    title: "سازگار با موبایل",
    text: "طراحی واکنش‌گرا برای موبایل، تبلت و دسکتاپ با سرعت بالا.",
  },
  {
    icon: ShieldCheck,
    title: "پردازش در مرورگر شما",
    text: "ابزارهای این سایت داده‌های شما را به سرور ارسال نمی‌کنند؛ همه‌چیز محلی پردازش می‌شود.",
  },
];

export default function HomePage() {
  const featured = getFeaturedTools();
  const categories = getCategoriesWithTools();
  const popular = getPopularTools();

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-card/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 text-center sm:py-20">
          <p className="mx-auto w-fit rounded-full border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            همه ابزارها رایگان و بدون ثبت‌نام هستند
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-[1.35] sm:text-[44px] sm:leading-[1.3]">
            ابزارهای کاربردی و رایگان آنلاین
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-8 text-muted-foreground sm:text-base">
            ابزارهای ساده، سریع و رایگان برای انجام کارهای روزمره؛ بدون نیاز به ثبت‌نام.
          </p>

          <form
            role="search"
            action="/tools"
            method="get"
            className="mx-auto mt-8 flex w-full max-w-xl gap-2"
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <label htmlFor="home-search" className="sr-only">
                جست‌وجوی ابزارها
              </label>
              <input
                id="home-search"
                type="search"
                name="q"
                placeholder="جست‌وجوی ابزار؛ مثلاً QR، درصد یا رمز عبور…"
                className="h-13 w-full rounded-xl border border-input bg-card ps-4 pe-11 text-[15px] shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-ring"
              />
            </div>
            <button
              type="submit"
              className="h-13 shrink-0 rounded-xl bg-primary px-5 font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-ring"
            >
              جست‌وجو
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[13px]">
            <span className="text-muted-foreground">پرطرفدارها:</span>
            {popular.slice(0, 4).map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="rounded-full border bg-card px-3 py-1.5 font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
              >
                {tool.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4">
        <AdSlot slot="homeHero" className="mt-6" minHeight={100} />

        {/* ابزارهای منتخب */}
        <section aria-labelledby="featured-title" className="mt-12 scroll-mt-24" id="featured">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="featured-title" className="text-xl font-extrabold sm:text-2xl">
                ابزارهای منتخب
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                پرکاربردترین ابزارهای آرشام لب برای شروع سریع.
              </p>
            </div>
            <Link href="/tools" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              همه ابزارها
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        {/* دسته‌بندی‌ها */}
        <section aria-labelledby="categories-title" className="mt-14 scroll-mt-24" id="categories">
          <h2 id="categories-title" className="text-xl font-extrabold sm:text-2xl">
            دسته‌بندی ابزارها
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            دسته‌هایی که در حال حاضر ابزار فعال دارند.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = getToolsByCategory(category.id).length;
              return (
                <Link
                  key={category.id}
                  href={`/tools?cat=${category.id}`}
                  className="group flex items-start gap-3.5 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
              );
            })}
          </div>
        </section>

        {/* مزایا */}
        <section aria-labelledby="why-title" className="mt-14">
          <h2 id="why-title" className="text-xl font-extrabold sm:text-2xl">
            چرا آرشام لب؟
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl border bg-card p-5 shadow-sm">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <b.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3.5 font-bold">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="my-14 rounded-3xl bg-primary px-6 py-10 text-center text-primary-foreground sm:py-12">
          <h2 className="text-xl font-extrabold sm:text-2xl">همه ابزارها را یک‌جا ببینید</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-primary-foreground/85">
            از شمارش متن تا ساخت QR Code و محاسبه سن با تقویم شمسی؛ ده ابزار آماده استفاده، همین حالا.
          </p>
          <Link
            href="/tools"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-card px-5 py-3 text-sm font-bold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
          >
            ورود به فهرست ابزارها
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}
