"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { TOOLS, getToolCategory } from "@/lib/tools";
import { normalizeForSearch } from "@/lib/text-utils";
import { cn } from "@/lib/utils";

/** جست‌وجوی زنده ابزارها در هدر (Ctrl+K) */
export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = normalizeForSearch(query);
    if (!q) return [];
    return TOOLS.filter((tool) =>
      normalizeForSearch(
        `${tool.title} ${tool.excerpt} ${tool.keywords.join(" ")} ${getToolCategory(tool).title}`
      ).includes(q)
    ).slice(0, 8);
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const go = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="جست‌وجوی ابزارها"
        aria-haspopup="dialog"
        className="flex size-10 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Search className="size-5" aria-hidden="true" />
        <span className="sr-only">جست‌وجو (Ctrl+K)</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-foreground/25 p-4 pt-[10vh] backdrop-blur-sm"
          onClick={close}
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="جست‌وجوی ابزارها"
            className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                if (results[0]) go(`/tools/${results[0].slug}`);
                else if (query.trim()) go(`/tools?q=${encodeURIComponent(query.trim())}`);
              }}
            >
              <div className="flex items-center gap-2 border-b px-4">
                <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="نام ابزار را بنویسید؛ مثلاً QR یا درصد…"
                  aria-label="عبارت جست‌وجو"
                  className="h-13 w-full bg-transparent py-4 text-[15px] outline-none placeholder:text-muted-foreground"
                />
                <kbd className="hidden shrink-0 rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:block" dir="ltr">
                  Esc
                </kbd>
              </div>
            </form>

            <div className="max-h-80 overflow-y-auto thin-scrollbar" role="listbox" aria-label="نتایج جست‌وجو">
              {query.trim() && results.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  ابزاری با این نام پیدا نشد؛ می‌توانید{" "}
                  <Link href="/tools" onClick={close} className="text-primary underline underline-offset-4">
                    همه ابزارها
                  </Link>{" "}
                  را ببینید.
                </p>
              )}
              {results.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    role="option"
                    aria-label={tool.title}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{tool.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{tool.excerpt}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      {getToolCategory(tool).title}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
              <span>Enter برای رفتن به اولین نتیجه</span>
              <Link href="/tools" onClick={close} className="font-medium text-primary hover:underline">
                مشاهده همه ابزارها
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
