import type { ReactNode } from "react";
import type { Tool } from "@/lib/tools";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdSlot } from "@/components/ad-slot";
import { RelatedTools } from "@/components/related-tools";

/**
 * قالب یکسان صفحات ابزار:
 * بردکرامب + عنوان و توضیح + خود ابزار + جایگاه تبلیغاتی + راهنمای محتوایی + ابزارهای مرتبط.
 * toolUi = رابط تعاملی ابزار (کلاینت) و children = محتوای راهنمای سئو (سرور).
 */
export function ToolPageShell({
  tool,
  intro,
  toolUi,
  children,
}: {
  tool: Tool;
  intro: string;
  toolUi: ReactNode;
  children: ReactNode;
}) {
  const Icon = tool.icon;
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { name: "خانه", href: "/" },
          { name: "ابزارها", href: "/tools" },
          { name: tool.title },
        ]}
      />

      <article>
        <header className="mt-5">
          <div className="flex items-start gap-3.5">
            <span className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold leading-snug sm:text-3xl">{tool.title}</h1>
              <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{intro}</p>
            </div>
          </div>
        </header>

        <section aria-label={tool.title} className="mt-7 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
          {toolUi}
        </section>

        <AdSlot slot="toolInContent" className="my-8" minHeight={100} />

        <section aria-label="راهنما و توضیحات" className="guide-content mt-8 space-y-5 text-[15px] leading-8">
          {children}
        </section>
      </article>

      <RelatedTools tool={tool} />
    </div>
  );
}
