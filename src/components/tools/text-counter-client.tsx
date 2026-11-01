"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { FieldLabel, StatCard } from "@/components/tool-ui";
import { countTextStats, faInt } from "@/lib/text-utils";

const MAX_LENGTH = 500_000;

/** ابزار ۱: شمارش متن — نتیجه زنده، کپی خلاصه، بدون ارسال داده به سرور */
export function TextCounterClient() {
  const [text, setText] = useState("");
  const stats = useMemo(() => countTextStats(text), [text]);

  const summary = useMemo(() => {
    if (!text) return "";
    return [
      `کلمات: ${stats.words}`,
      `کاراکترها (با فاصله): ${stats.chars}`,
      `کاراکترها (بدون فاصله): ${stats.charsNoSpaces}`,
      `خطوط: ${stats.lines}`,
      `پاراگراف‌ها: ${stats.paragraphs}`,
    ].join("\n");
  }, [text, stats]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel htmlFor="text-counter-input">متن شما</FieldLabel>
        <Textarea
          id="text-counter-input"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          rows={9}
          dir="auto"
          placeholder="متن یادداشت، مقاله یا پیام خود را اینجا بنویسید یا بچسبانید…"
          className="min-h-44 text-[15px] leading-7"
        />
      </div>

      <div aria-live="polite" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="کلمات" value={faInt(stats.words)} />
        <StatCard label="کاراکتر با فاصله" value={faInt(stats.chars)} />
        <StatCard label="کاراکتر بدون فاصله" value={faInt(stats.charsNoSpaces)} />
        <StatCard label="خطوط" value={faInt(stats.lines)} />
        <StatCard label="پاراگراف‌ها" value={faInt(stats.paragraphs)} />
        <StatCard
          label="زمان مطالعه"
          value={stats.words ? `~${faInt(stats.readingMinutes)} دقیقه` : "—"}
          hint="۲۰۰ کلمه در دقیقه"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton text={summary} label="کپی خلاصه نتایج" disabled={!text} />
        <Button
          type="button"
          variant="ghost"
          onClick={() => setText("")}
          disabled={!text}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          پاک کردن متن
        </Button>
      </div>
    </div>
  );
}
