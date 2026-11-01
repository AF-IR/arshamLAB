"use client";

/**
 * قطعات رابط مشترک ابزارها — برای یکدستی ظاهر و رفتار همه ابزارها.
 * همه کنترل‌ها بومی (Native) هستند تا حجم JavaScript حداقل و
 * دسترس‌پذیری با صفحه‌کلید و صفحه‌خوان کامل باشد.
 */

import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** کارت آماری کوچک (مثلاً تعداد کلمات) */
export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border bg-card p-3.5 text-center sm:p-4">
      <div className="text-xl font-extrabold tabular-nums sm:text-2xl" aria-hidden="true">
        {value}
      </div>
      <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-[13px]">{label}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground/70">{hint}</div>}
      <span className="sr-only">{`${label}: ${typeof value === "string" || typeof value === "number" ? value : ""}`}</span>
    </div>
  );
}

/** انتخاب حالت/زبانه با دکمه‌های رادیویی قابل دسترس */
export function ModeTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/75 hover:border-primary/40 hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** گزینه تیک‌دار بومی */
export function CheckOption({
  label,
  hint,
  checked,
  onChange,
  name,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  name?: string;
}) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-sm select-none hover:bg-accent/50" htmlFor={name}>
      <input
        id={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 shrink-0 accent-[oklch(0.6_0.106_184.704)]"
      />
      <span>
        {label}
        {hint && <span className="mr-1.5 text-xs text-muted-foreground">({hint})</span>}
      </span>
    </label>
  );
}

/** یادداشت خطای قابل فهم */
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** یادداشت اطلاع/هشدار ملایم */
export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-[13px] leading-6 text-muted-foreground">
      {children}
    </p>
  );
}

/** ناحیه نمایش نتیجه با عنوان و دکمه‌های عمل */
export function ResultBox({
  title,
  actions,
  children,
  className,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={title}
      className={cn("rounded-xl border bg-muted/30 p-3.5 sm:p-4", className)}
    >
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold">{title}</h3>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

/** سلکت بومی سبک‌شده */
export function NativeSelect({
  value,
  onChange,
  options,
  ariaLabel,
  id,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
  id?: string;
  className?: string;
}) {
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 rounded-lg border border-input bg-card px-2.5 text-sm shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring",
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** برچسب فیلد */
export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold">
      {children}
    </label>
  );
}
