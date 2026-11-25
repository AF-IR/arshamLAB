"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SearchX } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { SpecialToolCard } from "@/components/special-tool-card";
import { getCategoryColor } from "@/lib/category-color";
import {
  TOOLS,
  getCategoriesWithTools,
  getPopularTools,
  getSpecialTools,
  getToolCategory,
  getToolsByCategory,
} from "@/lib/tools";
import { fetchSpecialTools, type SpecialToolDTO } from "@/lib/special-tools";
import { normalizeForSearch } from "@/lib/text-utils";
import { cn } from "@/lib/utils";

/** کلاس تأخیر مرحله‌ای افکت لود برای ورود آبشاری کارت‌ها */
function revealDelay(i: number): string {
  const n = Math.min(i + 1, 8);
  return `reveal reveal-d${n}`;
}

/**
 * مرور و جست‌وجوی ابزارها در صفحه /tools.
 * وضعیت از پارامترهای URL (q، cat، filter) خوانده می‌شود تا جست‌وجوی
 * سایت برای SearchAction و اشتراک‌گذاری لینک قابل استفاده باشد.
 * فیلتر «special» = تب ویژه: ابزارهای ستاره‌دار داخلی + ابزارهای اضافه‌شده
 * از پنل مدیریت که از /api/special-tools خوانده می‌شوند.
 */
export function ToolsBrowser() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const cat = params.get("cat") ?? "";
  const filter = params.get("filter") ?? "";

  const [managedTools, setManagedTools] = useState<SpecialToolDTO[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchSpecialTools().then((list) => {
      if (!cancelled) setManagedTools(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => getCategoriesWithTools(), []);
  const popularOnly = filter === "popular";
  const specialOnly = filter === "special";

  /** جست‌وجو در ابزارهای مدیریتی (فارسی/انگلیسی، مثل بقیه ابزارها) */
  const matchedManaged = useMemo(() => {
    const nq = normalizeForSearch(q);
    if (!nq) return managedTools;
    return managedTools.filter((tool) =>
      normalizeForSearch(`${tool.title} ${tool.excerpt} ${tool.badge}`).includes(nq)
    );
  }, [q, managedTools]);

  const filtered = useMemo(() => {
    const nq = normalizeForSearch(q);
    return TOOLS.filter((tool) => {
      if (specialOnly && !tool.special) return false;
      if (popularOnly && !tool.popular) return false;
      if (cat && tool.category !== cat) return false;
      if (!nq) return true;
      return normalizeForSearch(
        `${tool.title} ${tool.excerpt} ${tool.keywords.join(" ")} ${getToolCategory(tool).title}`
      ).includes(nq);
    });
  }, [q, cat, popularOnly, specialOnly]);

  const totalFound = filtered.length + (q.trim() || specialOnly ? matchedManaged.length : 0);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `/tools?${qs}` : "/tools", { scroll: false });
  };

  const activeFilter = popularOnly ? "popular" : specialOnly ? "special" : cat || "all";

  return (
    <div>
      {/* جست‌وجو و فیلترها */}
      <div className="sticky top-16 z-30 -mx-4 border-b bg-background/90 px-4 py-3 backdrop-blur">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mx-auto w-full max-w-6xl">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="جست‌وجو در ابزارها؛ مثلاً «QR» یا «درصد»…"
              aria-label="جست‌وجوی ابزارها"
              className="h-11 w-full rounded-xl border border-input bg-card ps-10 pe-4 text-[15px] shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-ring"
            />
          </div>
        </form>
        <div className="mx-auto mt-2.5 flex w-full max-w-6xl gap-1.5 overflow-x-auto pb-1 thin-scrollbar" role="group" aria-label="فیلتر دسته‌بندی">
          <Chip active={activeFilter === "all"} onClick={() => { setParam("cat", ""); setParam("filter", ""); }}>
            همه ({TOOLS.length})
          </Chip>
          <Chip active={activeFilter === "special"} onClick={() => { setParam("filter", activeFilter === "special" ? "" : "special"); setParam("cat", ""); }}>
            ⭐ ویژه
          </Chip>
          <Chip active={activeFilter === "popular"} onClick={() => { setParam("filter", "popular"); setParam("cat", ""); }}>
            محبوب‌ترین‌ها
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.id}
              active={activeFilter === c.id}
              onClick={() => { setParam("cat", activeFilter === c.id ? "" : c.id); setParam("filter", ""); }}
            >
              {c.title} ({getToolsByCategory(c.id).length})
            </Chip>
          ))}
        </div>
      </div>

      {/* محتوا */}
      <div className="mt-6">
        {q.trim() || cat || popularOnly || specialOnly ? (
          <section aria-label="نتایج">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {totalFound > 0
                ? `${new Intl.NumberFormat("fa-IR").format(totalFound)} ابزار پیدا شد.`
                : null}
            </p>

            {totalFound === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center">
                <SearchX className="size-9 text-muted-foreground/60" aria-hidden="true" />
                <p className="font-semibold">ابزاری مطابق جست‌وجوی شما پیدا نشد.</p>
                <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                  عبارت کوتاه‌تری بنویسید یا{" "}
                  <button
                    type="button"
                    onClick={() => { setParam("q", ""); setParam("cat", ""); setParam("filter", ""); }}
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    نمایش همه ابزارها
                  </button>
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((tool, i) => (
                    <div key={tool.slug} className={revealDelay(i)}>
                      <ToolCard tool={tool} />
                    </div>
                  ))}
                  {(q.trim() || specialOnly) &&
                    matchedManaged.map((tool, i) => (
                      <div key={tool.id} className={revealDelay(i)}>
                        <SpecialToolCard tool={tool} />
                      </div>
                    ))}
                </div>
                {specialOnly && managedTools.length > 0 ? (
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    کارت‌های ستاره‌دار «{new Intl.NumberFormat("fa-IR").format(managedTools.length)} ابزار ویژه» از
                    پنل مدیریت به این تب اضافه شده‌اند و مستقیم به سایت خودشان باز می‌شوند.
                  </p>
                ) : null}
              </>
            )}
          </section>
        ) : (
          <>
            {/* ابزارهای محبوب */}
            <section aria-labelledby="popular-tools-title" className="mt-2">
              <h2 id="popular-tools-title" className="text-lg font-bold">
                ابزارهای محبوب
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {getPopularTools().map((tool, i) => (
                  <div key={tool.slug} className={revealDelay(i)}>
                    <ToolCard tool={tool} />
                  </div>
                ))}
              </div>
            </section>

            {/* بخش‌های دسته‌بندی */}
            {categories.map((category) => {
              const tools = getToolsByCategory(category.id);
              const Icon = category.icon;
              const color = getCategoryColor(category.color);
              return (
                <section
                  key={category.id}
                  id={`cat-${category.id}`}
                  aria-labelledby={`cat-title-${category.id}`}
                  className="mt-10 scroll-mt-36"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`flex size-9 items-center justify-center rounded-lg ${color.tile}`}>
                      <Icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <h2 id={`cat-title-${category.id}`} className="text-lg font-bold">
                      {category.title}
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool, i) => (
                      <div key={tool.slug} className={revealDelay(i)}>
                        <ToolCard tool={tool} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* تب ویژه در نمای پیش‌فرض */}
            <section id="cat-special" aria-labelledby="cat-special-title" className="mt-10 scroll-mt-36">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  ⭐
                </span>
                <h2 id="cat-special-title" className="text-lg font-bold">تب ویژه</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                ابزارهای ستاره‌دار آرشام روی دامنه‌های اختصاصی خودشان اجرا می‌شوند.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {getSpecialTools().map((tool, i) => (
                  <div key={tool.slug} className={revealDelay(i)}>
                    <ToolCard tool={tool} />
                  </div>
                ))}
                {managedTools.map((tool, i) => (
                  <div key={tool.id} className={revealDelay(i)}>
                    <SpecialToolCard tool={tool} />
                  </div>
                ))}
              </div>
              <Link
                href="/tools?filter=special"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                مشاهده فقط ابزارهای ویژه
              </Link>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground/75 hover:border-primary/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
