"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { FieldLabel, InfoNote, ModeTabs } from "@/components/tool-ui";
import {
  arabicToPersianDigits,
  englishToPersianDigits,
  toEnglishDigits,
} from "@/lib/text-utils";

const MAX_LENGTH = 500_000;

type Mode = "fa2en" | "en2fa" | "ar2fa";

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: "fa2en", label: "فارسی → انگلیسی" },
  { value: "en2fa", label: "انگلیسی → فارسی" },
  { value: "ar2fa", label: "عربی → فارسی" },
];

/** ابزار ۷: تبدیل ارقام فارسی/انگلیسی/عربی با حفظ سایر بخش‌های متن */
export function NumberConverterClient() {
  const [mode, setMode] = useState<Mode>("fa2en");
  const [text, setText] = useState("");

  const convert = (s: string, m: Mode): string => {
    if (m === "fa2en") return toEnglishDigits(s);
    if (m === "en2fa") return englishToPersianDigits(s);
    return arabicToPersianDigits(s);
  };

  const output = useMemo(() => convert(text, mode), [text, mode]);

  const swap = () => {
    if (mode === "fa2en") {
      setMode("en2fa");
      setText(toEnglishDigits(text));
    } else if (mode === "en2fa") {
      setMode("fa2en");
      setText(englishToPersianDigits(text));
    }
  };

  return (
    <div className="space-y-4">
      <ModeTabs ariaLabel="جهت تبدیل ارقام" options={MODE_OPTIONS} value={mode} onChange={setMode} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <FieldLabel htmlFor="num-input">متن ورودی</FieldLabel>
          <Textarea
            id="num-input"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
            rows={8}
            dir="auto"
            placeholder={mode === "fa2en" ? "مثلاً: سفارش ۱۲۳۴ در سال ۱۴۰۵ ثبت شد." : "مثلاً: Order 1234 placed in 2026."}
            className="min-h-40 text-[15px] leading-7"
          />
        </div>
        <div>
          <FieldLabel htmlFor="num-output">خروجی تبدیل‌شده</FieldLabel>
          <Textarea
            id="num-output"
            readOnly
            value={output}
            dir="auto"
            aria-describedby="num-note"
            placeholder="خروجی اینجا نمایش داده می‌شود…"
            className="min-h-40 bg-muted/40 text-[15px] leading-7"
          />
        </div>
      </div>

      <div id="num-note">
        <InfoNote>
          فقط ارقام تبدیل می‌شوند و بقیه متن (حروف، علائم و قالب) دست‌نخورده می‌ماند. پردازش
          کاملاً در مرورگر شما انجام می‌شود.
        </InfoNote>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton text={output} label="کپی خروجی" disabled={!output} />
        <Button type="button" variant="outline" onClick={swap} disabled={!text} className="gap-1.5">
          <ArrowUpDown className="size-4" aria-hidden="true" />
          جابه‌جایی جهت
        </Button>
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
