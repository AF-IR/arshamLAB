import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

export interface Crumb {
  name: string;
  href?: string;
}

/** بردکرامب معنایی + داده ساختاریافته BreadcrumbList */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const ldItems = items.map((item, i) => ({
    name: item.name,
    path: ["", ...items.slice(1, i + 1).map((x) => x.href ?? "")]
      .filter(Boolean)
      .join("/") || "/",
  }));

  return (
    <nav aria-label="مسیر صفحه" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="flex items-center gap-1">
              {i > 0 && <ChevronLeft className="size-3.5 text-muted-foreground/60" aria-hidden="true" />}
              {item.href && !isLast ? (
                <Link href={item.href} className="rounded transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">
                  {item.name}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "font-medium text-foreground" : undefined}>
                  {item.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbJsonLd(ldItems)} />
    </nav>
  );
}
