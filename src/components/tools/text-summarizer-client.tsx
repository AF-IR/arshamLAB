"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { ErrorNote, InfoNote, ModeTabs, ResultBox, StatCard } from "@/components/tool-ui";
import { summarizeText } from "@/lib/summarizer";
import { faInt } from "@/lib/text-utils";

type Length = "short" | "balanced" | "detailed";

const LENGTH_OPTIONS: { value: Length; label: string; ratio: number }[] = [
  { value: "short", label: "کوتاه (~۲۵٪)", ratio: 0.25 },
  { value: "balanced", label: "متعادل (~۴۰٪)", ratio: 0.4 },
  { value: "detailed", label: "مفصل (~۶۰٪)", ratio: 0.6 },
];

/** خلاصه‌ساز متن فارسی — استخراجی و کاملاً محلی */
export function TextSummarizerClient() {
  const [text, setText] = useState("");
  const [length, setLength] = useState<Length>("balanced");
  const [summary, setSummary] = useState<string | null>(null);
  const [stats, setStats] = useState<{ originalWords: number; summaryWords: number; compression: number; sentences: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    const trimmed = text.trim();
    if (!trimmed) {
      setError("ابتدا متن خود را وارد کنید.");
      setSummary(null);
      return;
    }
    if (trimmed.length < 120) {
      setError("متن خیلی کوتاه است؛ برای خلاصه‌سازی معنادار، دست‌کم چند جمله (حدود ۱۲۰ نویسه) وارد کنید.");
      setSummary(null);
      return;
    }
    const ratio = LENGTH_OPTIONS.find((o) => o.value === length)?.ratio ?? 0.4;
    const result = summarizeText(trimmed, ratio);
    if (!result) {
      setError("خلاصه‌سازی ممکن نشد؛ مطمئن شوید متن جمله‌های مشخصی دارد.");
      setSummary(null);
      return;
    }
    setSummary(result.summary);
    setStats({
      originalWords: result.originalWords,
      summaryWords: result.summaryWords,
      compression: result.compression,
      sentences: result.sentences.length,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="ts-input" className="mb-1.5 block text-sm font-semibold">
          متن اصلی
        </label>
        <textarea
          id="ts-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="متن خود را اینجا بچسبانید؛ مقاله، گزارش یا هر نوشته فارسی…"
          className="w-full rounded-xl border border-input bg-card p-3.5 text-[15px] leading-8 shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-ring thin-scrollbar"
          maxLength={60000}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {faInt(text.length)} نویسه از ۶۰٫۰۰۰
        </p>
      </div>

      <ModeTabs
        ariaLabel="طول خلاصه"
        value={length}
        onChange={setLength}
        options={LENGTH_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={run} className="gap-1.5">
          <Sparkles className="size-4" aria-hidden="true" />
          خلاصه‌سازی متن
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setText("");
            setSummary(null);
            setStats(null);
            setError(null);
          }}
          disabled={!text}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          پاک کردن
        </Button>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      {summary !== null && stats && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatCard label="واژه‌های متن اصلی" value={faInt(stats.originalWords)} />
            <StatCard label="واژه‌های خلاصه" value={faInt(stats.summaryWords)} />
            <StatCard label="جمله‌های خلاصه" value={faInt(stats.sentences)} />
            <StatCard
              label="فشرده‌سازی"
              value={`${faInt(stats.compression)}٪`}
              hint="کاهش حجم متن"
            />
          </div>

          <ResultBox
            title="متن خلاصه‌شده"
            actions={<CopyButton text={summary} label="کپی خلاصه" variant="outline" />}
          >
            <p dir="auto" className="whitespace-pre-wrap rounded-lg border bg-card p-3.5 leading-8">
              {summary}
            </p>
          </ResultBox>
        </div>
      )}

      <InfoNote>
        این ابزار با روش <strong className="text-foreground">خلاصه‌سازی استخراجی</strong> کار
        می‌کند: جمله‌های مهم‌تر بر پایه بسامد واژه‌های معنادار انتخاب و بدون تغییر متن اصلی
        بازچینی می‌شوند. پردازش کاملاً در مرورگر انجام می‌شود و متن شما به سرور ارسال نمی‌شود.
      </InfoNote>
    </div>
  );
}
