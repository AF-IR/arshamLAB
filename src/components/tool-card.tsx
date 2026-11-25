import Link from "next/link";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import type { Tool } from "@/lib/tools";
import { getToolCategory } from "@/lib/tools";
import { getCategoryColor } from "@/lib/category-color";
import { cn } from "@/lib/utils";

/** برچسب نمایشی کارت: اولویت با برچسب هوش مصنوعی، سپس جدید، سپس محبوب */
function Badge({ tool }: { tool: Tool }) {
  if (tool.badge === "ai") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-pink-600 to-fuchsia-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
        <Sparkles className="size-3" aria-hidden="true" />
        هوش مصنوعی
      </span>
    );
  }
  if (tool.badge === "new") {
    return (
      <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-[11px] font-bold text-green-700">
        جدید
      </span>
    );
  }
  if (tool.popular) {
    return (
      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-700">
        محبوب
      </span>
    );
  }
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      {getToolCategory(tool).title}
    </span>
  );
}

/** کارت نمایش ابزار در صفحه اصلی و فهرست ابزارها — با رنگ اختصاصی هر دسته */
export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  const category = getToolCategory(tool);
  const color = getCategoryColor(category.color);
  const external = Boolean(tool.externalUrl);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(
        "group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-ring",
        color.borderHover
      )}
      aria-label={`ورود به ابزار ${tool.title}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-xl transition-colors",
            color.tile,
            color.tileHover
          )}
        >
          <Icon className="size-5.5" aria-hidden="true" />
        </span>
        <Badge tool={tool} />
      </div>

      <h3 className="mt-4 flex items-center gap-1.5 text-base font-bold leading-6">
        {tool.title}
        {external && (
          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">{tool.excerpt}</p>

      <span className={cn("mt-4 inline-flex items-center gap-1.5 text-sm font-semibold", color.text)}>
        {external ? "مشاهده و ورود به ابزار" : "ورود به ابزار"}
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
