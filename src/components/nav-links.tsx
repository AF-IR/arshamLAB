"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavLinkItem {
  href: string;
  label: string;
  /** مسیر پایه برای تشخیص صفحه فعال */
  basePath: string;
  /** مقدار پارامتر filter که باید برای فعال بودن لینک برابر باشد */
  filter?: string;
}

const LINKS: NavLinkItem[] = [
  { href: "/", label: "خانه", basePath: "/" },
  { href: "/tools", label: "دسته‌بندی ابزارها", basePath: "/tools" },
  { href: "/tools?filter=special", label: "تب ویژه ⭐", basePath: "/tools", filter: "special" },
  { href: "/tools?filter=popular", label: "ابزارهای محبوب", basePath: "/tools", filter: "popular" },
  { href: "/about", label: "درباره ما", basePath: "/about" },
  { href: "/support", label: "حمایت مالی", basePath: "/support" },
];

function NavLinksInner() {
  const pathname = usePathname();
  const params = useSearchParams();
  const filter = params.get("filter") ?? "";

  return (
    <nav aria-label="ناوبری اصلی" className="hidden items-center gap-1 lg:flex">
      {LINKS.map((link) => {
        const active =
          pathname === link.basePath && (link.filter ? filter === link.filter : !filter);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring",
              active ? "text-primary" : "text-foreground/80"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavLinks() {
  return (
    <Suspense fallback={<div className="hidden lg:block" aria-hidden="true" />}>
      <NavLinksInner />
    </Suspense>
  );
}
