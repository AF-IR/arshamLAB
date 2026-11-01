"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import { ErrorNote, FieldLabel, InfoNote, ModeTabs, ResultBox } from "@/components/tool-ui";
import {
  applyDiscount,
  formatFa,
  originalPrice,
  parseNumberInput,
  percentChange,
  percentOf,
} from "@/lib/percent";

type Mode = "percent-of" | "change" | "discount" | "original";

const MODES: { value: Mode; label: string }[] = [
  { value: "percent-of", label: "درصدِ یک عدد" },
  { value: "change", label: "درصد تغییر" },
  { value: "discount", label: "قیمت بعد از تخفیف" },
  { value: "original", label: "قیمت قبل از تخفیف" },
];

function NumField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        inputMode="decimal"
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 30))}
        placeholder={placeholder}
        className="h-11 text-left text-[15px]"
      />
    </div>
  );
}

/** ابزار ۵: محاسبه درصد با نمایش مراحل و اعتبارسنجی کامل ورودی */
export function PercentageCalculatorClient() {
  const [mode, setMode] = useState<Mode>("percent-of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const reset = () => {
    setA("");
    setB("");
  };

  const result = useMemo(() => {
    const x = parseNumberInput(a);
    const y = parseNumberInput(b);

    if (mode === "percent-of") {
      if (a.trim() === "" || b.trim() === "") return { state: "empty" as const };
      if (x === null) return { state: "error" as const, message: `«${a}» عدد معتبری نیست؛ مثلاً ۲۵ یا 12.5 وارد کنید.` };
      if (y === null) return { state: "error" as const, message: `«${b}» عدد معتبری نیست؛ مثلاً ۲۰۰ وارد کنید.` };
      const r = percentOf(x, y);
      return {
        state: "ok" as const,
        headline: `${formatFa(r.value)}`,
        steps: [
          `فرمول: (درصد ÷ ۱۰۰) × عدد`,
          `${formatFa(x)} ÷ ۱۰۰ = ${formatFa(x / 100)}`,
          `${formatFa(x / 100)} × ${formatFa(y)} = ${formatFa(r.value)}`,
        ],
        note: `یعنی ${formatFa(x)} درصدِ عدد ${formatFa(y)} برابر است با ${formatFa(r.value)}.`,
        copy: `${formatFa(x)}٪ از ${formatFa(y)} = ${formatFa(r.value)}`,
      };
    }

    if (mode === "change") {
      if (a.trim() === "" || b.trim() === "") return { state: "empty" as const };
      if (x === null) return { state: "error" as const, message: `مقدار اولیه «${a}» عدد معتبری نیست.` };
      if (y === null) return { state: "error" as const, message: `مقدار جدید «${b}» عدد معتبری نیست.` };
      const r = percentChange(x, y);
      if (!r.ok) return { state: "error" as const, message: r.error };
      const direction = r.value >= 0 ? "افزایش" : "کاهش";
      return {
        state: "ok" as const,
        headline: `${formatFa(Math.abs(r.value))}٪ ${direction}`,
        steps: [
          "فرمول: ((مقدار جدید − مقدار اولیه) ÷ |مقدار اولیه|) × ۱۰۰",
          `${formatFa(y)} − ${formatFa(x)} = ${formatFa(y - x)}`,
          `${formatFa(y - x)} ÷ ${formatFa(Math.abs(x))} × ۱۰۰ = ${formatFa(r.value)}٪`,
        ],
        note: `از ${formatFa(x)} به ${formatFa(y)} رسیده‌اید؛ یعنی ${direction} به میزان ${formatFa(Math.abs(r.value))} درصد.`,
        copy: `تغییر از ${formatFa(x)} به ${formatFa(y)}: ${formatFa(Math.abs(r.value))}٪ ${direction}`,
      };
    }

    if (mode === "discount") {
      if (a.trim() === "" || b.trim() === "") return { state: "empty" as const };
      if (x === null) return { state: "error" as const, message: `قیمت «${a}» عدد معتبری نیست.` };
      if (y === null) return { state: "error" as const, message: `درصد تخفیف «${b}» عدد معتبری نیست.` };
      if (x < 0) return { state: "error" as const, message: "قیمت نمی‌تواند منفی باشد." };
      const r = applyDiscount(x, y);
      if (!r.ok) return { state: "error" as const, message: r.error };
      const saved = r.extra?.saved ?? 0;
      return {
        state: "ok" as const,
        headline: `${formatFa(r.value)} تومان`,
        steps: [
          `مبلغ تخفیف: ${formatFa(x)} × ${formatFa(y)} ÷ ۱۰۰ = ${formatFa(saved)} تومان`,
          `قیمت نهایی: ${formatFa(x)} − ${formatFa(saved)} = ${formatFa(r.value)} تومان`,
        ],
        note: `با ${formatFa(y)} درصد تخفیف روی ${formatFa(x)} تومان، ${formatFa(saved)} تومان کمتر پرداخت می‌کنید.`,
        copy: `قیمت ${formatFa(x)} با ${formatFa(y)}٪ تخفیف → ${formatFa(r.value)} تومان (صرفه‌جویی ${formatFa(saved)})`,
      };
    }

    // mode === "original"
    if (a.trim() === "" || b.trim() === "") return { state: "empty" as const };
    if (x === null) return { state: "error" as const, message: `قیمت پس از تخفیف «${a}» عدد معتبری نیست.` };
    if (y === null) return { state: "error" as const, message: `درصد تخفیف «${b}» عدد معتبری نیست.` };
    if (x < 0) return { state: "error" as const, message: "قیمت نمی‌تواند منفی باشد." };
    const r = originalPrice(x, y);
    if (!r.ok) return { state: "error" as const, message: r.error };
    const saved = r.extra?.saved ?? 0;
    return {
      state: "ok" as const,
      headline: `${formatFa(r.value)} تومان`,
      steps: [
        `فرمول: قیمت پس از تخفیف ÷ (۱ − درصد تخفیف ÷ ۱۰۰)`,
        `${formatFa(x)} ÷ (۱ − ${formatFa(y / 100)}) = ${formatFa(r.value)} تومان`,
        `مبلغ تخفیف: ${formatFa(r.value)} − ${formatFa(x)} = ${formatFa(saved)} تومان`,
      ],
      note: `اگر پس از ${formatFa(y)} درصد تخفیف قیمت ${formatFa(x)} تومان شده، قیمت اصلی ${formatFa(r.value)} تومان بوده است.`,
      copy: `قیمت اصلی با ${formatFa(y)}٪ تخفیف و قیمت نهایی ${formatFa(x)} → ${formatFa(r.value)} تومان`,
    };
  }, [mode, a, b]);

  return (
    <div className="space-y-4">
      <ModeTabs ariaLabel="انتخاب نوع محاسبه درصد" options={MODES} value={mode} onChange={(v) => { setMode(v); reset(); }} />

      <div className="grid gap-3 sm:grid-cols-2">
        {mode === "percent-of" ? (
          <>
            <NumField id="pct-percent" label="درصد" value={a} onChange={setA} placeholder="مثلاً ۲۵" />
            <NumField id="pct-number" label="از عدد" value={b} onChange={setB} placeholder="مثلاً ۲۰۰" />
          </>
        ) : mode === "change" ? (
          <>
            <NumField id="pct-from" label="مقدار اولیه" value={a} onChange={setA} placeholder="مثلاً ۸۰" />
            <NumField id="pct-to" label="مقدار جدید" value={b} onChange={setB} placeholder="مثلاً ۱۰۰" />
          </>
        ) : mode === "discount" ? (
          <>
            <NumField id="pct-price" label="قیمت اصلی (تومان)" value={a} onChange={setA} placeholder="مثلاً ۴۵۰۰۰۰" />
            <NumField id="pct-discount" label="درصد تخفیف" value={b} onChange={setB} placeholder="مثلاً ۲۰" />
          </>
        ) : (
          <>
            <NumField id="pct-final" label="قیمت پس از تخفیف (تومان)" value={a} onChange={setA} placeholder="مثلاً ۳۶۰۰۰۰" />
            <NumField id="pct-discount2" label="درصد تخفیف" value={b} onChange={setB} placeholder="مثلاً ۲۰" />
          </>
        )}
      </div>

      <div aria-live="polite" className="space-y-3">
        {result.state === "empty" && (
          <InfoNote>هر دو مقدار را وارد کنید تا نتیجه و مراحل محاسبه همین‌جا نمایش داده شود.</InfoNote>
        )}
        {result.state === "error" && <ErrorNote>{result.message}</ErrorNote>}
        {result.state === "ok" && (
          <ResultBox
            title="نتیجه"
            actions={<CopyButton text={result.copy} label="کپی نتیجه" />}
          >
            <p className="text-3xl font-extrabold text-primary">{result.headline}</p>
            <ol className="mt-3 space-y-1.5 border-t pt-3 text-sm leading-7 text-muted-foreground">
              {result.steps.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden="true" className="shrink-0 font-bold text-foreground/70">{["۱", "۲", "۳"][i] ?? "•"}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 border-t pt-3 text-sm leading-7">{result.note}</p>
          </ResultBox>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={reset}
        disabled={!a && !b}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        پاک کردن
      </Button>
    </div>
  );
}
