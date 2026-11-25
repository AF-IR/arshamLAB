import Link from "next/link";
import { Compass, Search } from "lucide-react";
import { getPopularTools } from "@/lib/tools";

export default function NotFound() {
  const popular = getPopularTools().slice(0, 3);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Compass className="size-8" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold sm:text-3xl">صفحه‌ای که دنبالش بودید پیدا نشد</h1>
      <p className="mt-3 leading-7 text-muted-foreground">
        آدرس اشتباه وارد شده یا این صفحه وجود ندارد. می‌توانید از جست‌وجو استفاده کنید یا یکی
        از ابزارهای پرطرفدار را امتحان کنید.
      </p>

      <form role="search" action="/tools" method="get" className="mt-6 flex w-full max-w-md gap-2">
        <label htmlFor="nf-search" className="sr-only">
          جست‌وجوی ابزارها
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="nf-search"
            type="search"
            name="q"
            placeholder="جست‌وجوی ابزار…"
            className="h-12 w-full rounded-xl border border-input bg-card ps-10 pe-4 text-[15px] shadow-sm outline-none focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-ring"
          />
        </div>
        <button
          type="submit"
          className="h-12 shrink-0 rounded-xl bg-primary px-5 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          جست‌وجو
        </button>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {popular.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="rounded-full border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
          >
            {tool.title}
          </Link>
        ))}
        <Link
          href="/tools"
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          همه ابزارها
        </Link>
      </div>
    </div>
  );
}
