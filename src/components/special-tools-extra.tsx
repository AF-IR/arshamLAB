"use client";

import { useEffect, useState } from "react";
import { SpecialToolCard } from "@/components/special-tool-card";
import { fetchSpecialTools, type SpecialToolDTO } from "@/lib/special-tools";

/**
 * ابزارهای ویژه اضافه‌شده از پنل مدیریت — در بخش ویژه صفحه اصلی زیر
 * کارت‌های ثابت (آرشام پوینت و آرشام فرم) نمایش داده می‌شوند.
 */
export function SpecialToolsExtra() {
  const [tools, setTools] = useState<SpecialToolDTO[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSpecialTools().then((list) => {
      if (!cancelled) setTools(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (tools === null || tools.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-foreground/70">ابزارهای ویژه بیشتر</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <SpecialToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
