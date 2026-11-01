"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { CheckOption, ErrorNote, FieldLabel, InfoNote, ModeTabs, ResultBox } from "@/components/tool-ui";
import { faInt, removeDuplicateLines } from "@/lib/text-utils";

const MAX_LENGTH = 500_000;

/** ابزار ۳: حذف خطوط تکراری با حفظ ترتیب یا مرتب‌سازی الفبایی */
export function RemoveDuplicateLinesClient() {
  const [text, setText] = useState("");
  const [keepOrder, setKeepOrder] = useState(true);
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [trimCompare, setTrimCompare] = useState(false);

  const result = useMemo(
    () => removeDuplicateLines(text, { keepOrder, caseInsensitive, trimCompare }),
    [text, keepOrder, caseInsensitive, trimCompare]
  );

  const outputText = result.lines.join("\n");

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel htmlFor="dup-input">لیست یا متن شما (هر خط یک مورد)</FieldLabel>
        <Textarea
          id="dup-input"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          rows={10}
          dir="auto"
          placeholder={"سیب\nسیب\nپرتقال\nموز"}
          className="min-h-44 text-[15px] leading-7"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-sm font-semibold">ترتیب خروجی</span>
          <ModeTabs
            ariaLabel="انتخاب ترتیب خروجی"
            options={[
              { value: "keep", label: "حفظ ترتیب اولیه" },
              { value: "sort", label: "مرتب‌سازی الفبایی" },
            ]}
            value={keepOrder ? "keep" : "sort"}
            onChange={(v) => setKeepOrder(v === "keep")}
          />
        </div>
        <div className="space-y-0.5">
          <CheckOption
            name="dup-case"
            label="مقایسه بدون حساسیت به بزرگی و کوچکی حروف"
            checked={caseInsensitive}
            onChange={setCaseInsensitive}
          />
          <CheckOption
            name="dup-trim"
            label="نادیده‌گرفتن فاصله ابتدا و انتهای خط"
            checked={trimCompare}
            onChange={setTrimCompare}
          />
        </div>
      </div>

      {text.trim() === "" ? (
        text.length > 0 ? (
          <ErrorNote>متن شما فقط شامل فاصله است؛ خطی برای پردازش وجود ندارد.</ErrorNote>
        ) : (
          <InfoNote>لیست خود را وارد کنید؛ نتیجه به‌صورت زنده محاسبه می‌شود.</InfoNote>
        )
      ) : (
        <div aria-live="polite">
          <ResultBox
            title="خروجی یکتا"
            actions={<CopyButton text={outputText} label="کپی خروجی" disabled={!outputText} />}
          >
            <pre
              dir="auto"
              className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-card p-3 text-[14px] leading-7 thin-scrollbar"
            >
              {outputText || "—"}
            </pre>
          </ResultBox>
          <p className="mt-3 text-sm text-muted-foreground">
            {faInt(result.removedCount)} خط تکراری حذف شد؛ از {faInt(result.originalCount)} خط اولیه،{" "}
            <strong className="text-foreground">{faInt(result.lines.length)}</strong> خط یکتا باقی ماند.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
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
