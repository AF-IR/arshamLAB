"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { getCategoriesWithTools } from "@/lib/tools";
import { cn } from "@/lib/utils";

/** منوی موبایل — فقط روی نمایشگرهای کوچک */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const categories = getCategoriesWithTools();

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        aria-label={open ? "بستن منو" : "بازکردن منو"}
        className="flex size-10 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
      </button>

      <div
        id="mobile-menu-panel"
        className={cn(
          "absolute inset-x-0 top-16 z-40 border-b bg-background shadow-lg transition-all",
          open ? "visible opacity-100" : "invisible -translate-y-1 opacity-0"
        )}
      >
        <nav aria-label="منوی موبایل" className="mx-auto max-w-6xl px-4 py-4">
          <ul className="space-y-1 text-[15px]">
            <li>
              <Link href="/" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-accent">
                خانه
              </Link>
            </li>
            <li>
              <Link href="/tools" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-accent">
                همه ابزارها
              </Link>
            </li>
            <li>
              <Link href="/tools?filter=popular" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-accent">
                ابزارهای محبوب
              </Link>
            </li>
            <li>
              <Link href="/about" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-accent">
                درباره ما
              </Link>
            </li>
          </ul>
          <p className="mt-4 mb-2 px-3 text-xs font-semibold text-muted-foreground">دسته‌بندی ابزارها</p>
          <ul className="grid grid-cols-2 gap-1 pb-2 text-sm">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/tools?cat=${cat.id}`}
                  onClick={() => setOpen(false)}
                  className="block truncate rounded-lg px-3 py-2 text-foreground/80 hover:bg-accent"
                >
                  {cat.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
