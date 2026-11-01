import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Tool } from "@/lib/tools";
import { getToolCategory } from "@/lib/tools";

/** کارت نمایش ابزار در صفحه اصلی و فهرست ابزارها */
export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  const category = getToolCategory(tool);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring"
      aria-label={`ورود به ابزار ${tool.title}`}
    >
      <div className="flex items-center justify-between">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-5.5" aria-hidden="true" />
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {category.title}
        </span>
      </div>

      <h3 className="mt-4 text-base font-bold leading-6">{tool.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">{tool.excerpt}</p>

      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        ورود به ابزار
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
