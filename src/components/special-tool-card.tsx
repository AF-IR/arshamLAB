import { ArrowUpLeft, ExternalLink } from "lucide-react";
import { getCategoryColor } from "@/lib/category-color";
import type { SpecialToolDTO } from "@/lib/special-tools";

/**
 * کارت ابزار ویژه اضافه‌شده از پنل مدیریت — لینک مستقیم به آدرس خود ابزار.
 * برخلاف ابزارهای داخلی، صفحه معرفی داخلی ندارد.
 */
export function SpecialToolCard({ tool }: { tool: SpecialToolDTO }) {
  const color = getCategoryColor(tool.color);

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-ring ${color.borderHover}`}
      aria-label={`ورود به ابزار ویژه ${tool.title} (باز شدن در تب جدید)`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex size-11 items-center justify-center rounded-xl text-xl transition-colors ${color.tile} ${color.tileHover}`}
          aria-hidden="true"
        >
          {tool.emoji}
        </span>
        <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-700">
          {tool.badge}
        </span>
      </div>

      <h3 className="mt-4 flex items-center gap-1.5 text-base font-bold leading-6">
        {tool.title}
        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">{tool.excerpt}</p>

      <span
        className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${color.text}`}
      >
        ورود به ابزار
        <ArrowUpLeft className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </a>
  );
}
