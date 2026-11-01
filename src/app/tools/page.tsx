import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ToolsBrowser } from "@/components/tools-browser";
import { buildPageMetadata } from "@/lib/seo";
import { getCategoriesWithTools, TOOLS } from "@/lib/tools";

export const metadata: Metadata = buildPageMetadata({
  title: "همه ابزارها",
  description:
    "فهرست کامل ابزارهای رایگان آرشام لب: ابزارهای متنی، محاسباتی، تاریخ و زمان، کدنویسی و اینترنتی؛ همه بدون ثبت‌نام و با پردازش محلی در مرورگر.",
  path: "/tools",
  keywords: ["فهرست ابزارها", "ابزارهای رایگان", "دسته‌بندی ابزارها"],
});

export default function ToolsPage() {
  const categories = getCategoriesWithTools();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { name: "خانه", href: "/" },
          { name: "ابزارها" },
        ]}
      />

      <header className="mt-5">
        <h1 className="text-2xl font-extrabold sm:text-3xl">همه ابزارها</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted-foreground">
          {new Intl.NumberFormat("fa-IR").format(TOOLS.length)} ابزار رایگان در{" "}
          {new Intl.NumberFormat("fa-IR").format(categories.length)} دسته‌بندی؛ برای استفاده
          از هیچ‌کدام به ثبت‌نام نیاز ندارید و پردازش‌ها مستقیماً در مرورگر شما انجام
          می‌شود.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border bg-muted/40" />
            ))}
          </div>
        }
      >
        <ToolsBrowser />
      </Suspense>

      <p className="mt-10 text-sm leading-7 text-muted-foreground">
        دنبال ابزار خاصی هستید که در فهرست نیست؟{" "}
        <Link href="/contact" className="font-medium text-primary underline underline-offset-4">
          پیشنهاد خود را برای ما بنویسید
        </Link>{" "}
        تا در نسخه‌های بعدی اضافه کنیم.
      </p>
    </div>
  );
}
