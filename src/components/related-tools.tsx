import type { Tool } from "@/lib/tools";
import { getRelatedTools } from "@/lib/tools";
import { ToolCard } from "@/components/tool-card";

/** لینک‌سازی داخلی میان ابزارهای مرتبط */
export function RelatedTools({ tool, count = 3 }: { tool: Tool; count?: number }) {
  const related = getRelatedTools(tool.slug, count);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-tools-title" className="mt-12">
      <h2 id="related-tools-title" className="text-lg font-bold">
        ابزارهای مرتبط
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        شاید این ابزارها هم برای کارتان مفید باشند.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </section>
  );
}
