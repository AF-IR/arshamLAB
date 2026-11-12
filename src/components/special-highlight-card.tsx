import Link from "next/link";
import { ArrowUpLeft, Star } from "lucide-react";
import type { Tool } from "@/lib/tools";

/**
 * کارت بزرگ گرادیانی معرفی ابزارهای ویژه داخلی (آرشام پوینت و آرشام فرم)
 * در بخش «تب ویژه» صفحه اصلی — به سبک رنگارنگ Google Labs.
 */
export function SpecialHighlightCard({
  tool,
  gradient,
  hostname,
  blurb,
  ctaLabel,
  ctaTextClass,
}: {
  tool: Tool;
  /** کلاس گرادیان پس‌زمینه، مثل from-pink-600 via-fuchsia-600 to-violet-700 */
  gradient: string;
  /** دامنه ابزار برای نمایش زیر دکمه */
  hostname: string;
  blurb: string;
  ctaLabel: string;
  /** رنگ متن دکمه سفید — هماهنگ با گرادیان کارت */
  ctaTextClass: string;
}) {
  const Icon = tool.icon;

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-bl ${gradient} p-6 text-white shadow-lg sm:p-7`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-14 -top-14 size-48 rounded-full bg-white/15 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-8 size-56 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
            <Star className="size-3.5 fill-current" aria-hidden="true" />
            ابزار ویژه
          </span>
          <span
            className="flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"
            aria-hidden="true"
          >
            <Icon className="size-5.5" />
          </span>
        </div>

        <h3 className="mt-4 text-lg font-extrabold sm:text-xl">{tool.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-7 text-white/90">{blurb}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={`/tools/${tool.slug}`}
            className={`inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-white ${ctaTextClass}`}
          >
            {ctaLabel}
            <ArrowUpLeft className="size-4" aria-hidden="true" />
          </Link>
          <span className="text-xs text-white/75" dir="ltr">
            {hostname}
          </span>
        </div>
      </div>
    </div>
  );
}
