"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "خانه" },
  { href: "/tools", label: "دسته‌بندی ابزارها" },
  { href: "/tools?filter=popular", label: "ابزارهای محبوب", match: "/tools" },
  { href: "/about", label: "درباره ما" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="ناوبری اصلی" className="hidden items-center gap-1 md:flex">
      {LINKS.map((link) => {
        const active =
          link.match ? pathname === link.match : pathname === link.href;
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
