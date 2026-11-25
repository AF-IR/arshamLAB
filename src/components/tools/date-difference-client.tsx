"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import { CheckOption, ErrorNote, FieldLabel, InfoNote, ResultBox } from "@/components/tool-ui";
import { diffInDays, parseISODate, todayParts, toISOInputValue } from "@/lib/date-utils";
import { formatJalaliLong, toJalali } from "@/lib/jalali";
import { faInt } from "@/lib/text-utils";

/** ابزار ۶: محاسبه اختلاف دو تاریخ میلادی + نمایش معادل شمسی */
export function DateDifferenceClient() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [inclusive, setInclusive] = useState(false);

  // تاریخ امروز فقط هنگام کلیک محاسبه می‌شود تا با SSR ناسازگاری رخ ندهد
  const todayISO = () => toISOInputValue(todayParts());

  const result = useMemo(() => {
    if (!start || !end) return { state: "empty" as const };
    const s = parseISODate(start);
    const e = parseISODate(end);
    if (!s) return { state: "error" as const, message: "تاریخ شروع معتبر نیست؛ فرمت صحیح سال/ماه/روز میلادی را انتخاب کنید." };
    if (!e) return { state: "error" as const, message: "تاریخ پایان معتبر نیست؛ فرمت صحیح سال/ماه/روز میلادی را انتخاب کنید." };
    const rawDays = diffInDays(s, e);
    if (rawDays < 0) {
      return { state: "error" as const, message: "تاریخ شروع باید قبل یا برابر تاریخ پایان باشد." };
    }
    const days = inclusive ? rawDays + 1 : rawDays;
    const weeks = Math.floor(days / 7);
    const restDays = days % 7;
    const monthsApprox = Math.floor(days / 30.436875);
    return {
      state: "ok" as const,
      days,
      weeks,
      restDays,
      monthsApprox,
      sJalali: toJalali(s.y, s.m, s.d),
      eJalali: toJalali(e.y, e.m, e.d),
    };
  }, [start, end, inclusive]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="date-start">تاریخ شروع (میلادی)</FieldLabel>
          <Input
            id="date-start"
            type="date"
            dir="ltr"
            value={start}
            max="9999-12-31"
            onChange={(e) => setStart(e.target.value)}
            className="h-11 text-left text-[15px]"
          />
          <p className="mt-1.5 min-h-5 text-xs text-muted-foreground">
            {result.state === "ok" ? `معادل شمسی: ${formatJalaliLong(result.sJalali)}` : ""}
          </p>
        </div>
        <div>
          <FieldLabel htmlFor="date-end">تاریخ پایان (میلادی)</FieldLabel>
          <Input
            id="date-end"
            type="date"
            dir="ltr"
            value={end}
            max="9999-12-31"
            onChange={(e) => setEnd(e.target.value)}
            className="h-11 text-left text-[15px]"
          />
          <p className="mt-1.5 min-h-5 text-xs text-muted-foreground">
            {result.state === "ok" ? `معادل شمسی: ${formatJalaliLong(result.eJalali)}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CheckOption
          name="date-inclusive"
          label="احتساب روز پایانی"
          hint="برای محاسبه مدت اقامت یا سناریوهای شمارش کامل"
          checked={inclusive}
          onChange={setInclusive}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setStart(todayISO())} className="text-[13px]">
          شروع: امروز
        </Button>
        <Button type="button" variant="outline" onClick={() => setEnd(todayISO())} className="text-[13px]">
          پایان: امروز
        </Button>
      </div>

      <div aria-live="polite" className="space-y-3">
        {result.state === "empty" && (
          <InfoNote>هر دو تاریخ را انتخاب کنید تا تعداد روزها محاسبه شود.</InfoNote>
        )}
        {result.state === "error" && <ErrorNote>{result.message}</ErrorNote>}
        {result.state === "ok" && (
          <ResultBox title="نتیجه" actions={<CopyButton text={`اختلاف دو تاریخ: ${result.days} روز`} label="کپی نتیجه" />}>
            <p className="text-3xl font-extrabold text-primary">
              {faInt(result.days)} روز
            </p>
            <ul className="mt-3 space-y-1.5 border-t pt-3 text-sm leading-7 text-muted-foreground">
              <li>
                معادل <strong className="text-foreground">{faInt(result.weeks)} هفته و {faInt(result.restDays)} روز</strong>
              </li>
              <li>
                حدود <strong className="text-foreground">{faInt(result.monthsApprox)} ماه</strong> (بر پایه میانگین طول ماه میلادی)
              </li>
              <li>
                {inclusive
                  ? "روز پایانی در محاسبه احتساب شده است."
                  : "روز پایانی در محاسبه احتساب نشده است؛ می‌توانید گزینه بالا را فعال کنید."}
              </li>
            </ul>
          </ResultBox>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setStart("");
          setEnd("");
          setInclusive(false);
        }}
        disabled={!start && !end}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        پاک کردن
      </Button>
    </div>
  );
}
