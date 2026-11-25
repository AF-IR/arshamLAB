"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { CheckOption, FieldLabel, InfoNote, ResultBox } from "@/components/tool-ui";
import { cleanSpaces, faInt, type CleanSpacesOptions } from "@/lib/text-utils";

const MAX_LENGTH = 500_000;

const DEFAULT_OPTIONS: CleanSpacesOptions = {
  tabsToSpace: true,
  collapse: true,
  trimLines: true,
  removeBlankLines: false,
  trimText: true,
};

/** ابزار ۲: حذف فاصله‌های اضافی — پردازش زنده و محلی */
export function RemoveExtraSpacesClient() {
  const [text, setText] = useState("");
  const [opts, setOpts] = useState<CleanSpacesOptions>(DEFAULT_OPTIONS);

  const output = useMemo(() => cleanSpaces(text, opts), [text, opts]);
  const removedCount = text.length - output.length;

  const set = (key: keyof CleanSpacesOptions) => (v: boolean) =>
    setOpts((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <FieldLabel htmlFor="spaces-input">متن اصلی</FieldLabel>
          <Textarea
            id="spaces-input"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
            rows={10}
            dir="auto"
            placeholder="متنی که فاصله‌های اضافی دارد را اینجا بچسبانید…"
            className="min-h-48 text-[15px] leading-7"
          />
        </div>

        <div>
          <FieldLabel htmlFor="spaces-output">خروجی تمیزشده</FieldLabel>
          <Textarea
            id="spaces-output"
            readOnly
            value={output}
            dir="auto"
            placeholder="خروجی اینجا نمایش داده می‌شود…"
            aria-describedby="spaces-stats"
            className="min-h-48 bg-muted/40 text-[15px] leading-7"
          />
        </div>
      </div>

      <fieldset className="rounded-xl border bg-muted/20 p-3">
        <legend className="px-1.5 text-sm font-semibold">گزینه‌های پاک‌سازی</legend>
        <div className="grid gap-0.5 sm:grid-cols-2">
          <CheckOption name="opt-collapse" label="حذف فاصله‌های تکراری" checked={opts.collapse} onChange={set("collapse")} />
          <CheckOption name="opt-trim-lines" label="حذف فاصله ابتدا و انتهای هر خط" checked={opts.trimLines} onChange={set("trimLines")} />
          <CheckOption name="opt-trim-text" label="حذف فاصله ابتدا و انتهای کل متن" checked={opts.trimText} onChange={set("trimText")} />
          <CheckOption name="opt-tabs" label="تبدیل تب به فاصله" checked={opts.tabsToSpace} onChange={set("tabsToSpace")} />
          <CheckOption name="opt-blank" label="حذف خطوط خالی" checked={opts.removeBlankLines} onChange={set("removeBlankLines")} />
        </div>
      </fieldset>

      <div id="spaces-stats" aria-live="polite">
        {text ? (
          removedCount > 0 ? (
            <InfoNote>
              {faInt(removedCount)} کاراکتر اضافی حذف شد. خروجی همیشه زنده به‌روزرسانی می‌شود.
            </InfoNote>
          ) : (
            <InfoNote>فاصله اضافه‌ای پیدا نشد؛ متن شما تمیز است.</InfoNote>
          )
        ) : (
          <InfoNote>متن را وارد کنید تا نتیجه به‌صورت زنده نمایش داده شود.</InfoNote>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton text={output} label="کپی خروجی" disabled={!output} />
        <Button
          type="button"
          variant="ghost"
          onClick={() => setText("")}
          disabled={!text}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          پاک کردن
        </Button>
      </div>
    </div>
  );
}
