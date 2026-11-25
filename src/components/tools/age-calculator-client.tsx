"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import { ErrorNote, InfoNote, ModeTabs, NativeSelect } from "@/components/tool-ui";
import { computeAge, isValidGregorian, todayParts, type DateParts } from "@/lib/date-utils";
import {
  JALALI_MONTHS,
  formatJalaliLong,
  jalaliMonthLength,
  todayJalali,
  toGregorian,
  toJalali,
} from "@/lib/jalali";
import { faInt } from "@/lib/text-utils";

type Calendar = "jalali" | "gregorian";

const CURRENT_GREG_YEAR = new Date().getFullYear();

const GREG_YEARS = Array.from({ length: 121 }, (_, i) => String(CURRENT_GREG_YEAR - i));
const JAL_YEARS = Array.from({ length: 121 }, (_, i) => String(1405 - i));

/** ابزار ۱۰: محاسبه سن با انتخاب تقویم شمسی یا میلادی */
export function AgeCalculatorClient() {
  const [calendar, setCalendar] = useState<Calendar>("jalali");
  const [gregDate, setGregDate] = useState("");
  const [jy, setJy] = useState("");
  const [jm, setJm] = useState("");
  const [jd, setJd] = useState("");
  const [todayISO, setTodayISO] = useState("");
  const [todayJ, setTodayJ] = useState<{ jy: number; jm: number; jd: number } | null>(null);

  useEffect(() => {
    // تنظیم «امروز» با تأخیر تا رندر سرور و کلاینت یکسان بماند
    const t = setTimeout(() => {
      const tt = todayParts();
      setTodayISO(`${tt.y}-${String(tt.m).padStart(2, "0")}-${String(tt.d).padStart(2, "0")}`);
      setTodayJ(todayJalali());
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const jalaliDays = useMemo(() => {
    const y = Number(jy);
    const m = Number(jm);
    if (!y || !m) return 31;
    try {
      return jalaliMonthLength(y, m);
    } catch {
      return 31;
    }
  }, [jy, jm]);

  const result = useMemo(() => {
    const t = todayParts(new Date());
    if (calendar === "gregorian") {
      if (!gregDate) return { state: "empty" as const };
      const [ys, ms, ds] = gregDate.split("-").map(Number);
      if (!ys || !ms || !ds || !isValidGregorian(ys, ms, ds)) {
        return { state: "error" as const, message: "تاریخ تولد معتبر نیست؛ تاریخ را دوباره انتخاب کنید." };
      }
      const r = computeAge({ y: ys, m: ms, d: ds }, t);
      return finalize(r, { y: ys, m: ms, d: ds });
    }

    if (!jy || !jm || !jd) return { state: "empty" as const };
    const y = Number(jy);
    const m = Number(jm);
    const d = Number(jd);
    if (!y || !m || !d) return { state: "empty" as const };
    try {
      if (d > jalaliMonthLength(y, m)) {
        return {
          state: "error" as const,
          message: `${d} ${JALALI_MONTHS[m - 1]} در سال ${faInt(y)} وجود ندارد؛ این سال ${jalaliMonthLength(y, m) === 29 ? "کبیسه نیست" : "کبیسه است"} و ماه ${JALALI_MONTHS[m - 1]} ${faInt(jalaliMonthLength(y, m))} روز دارد.`,
        };
      }
    } catch {
      return { state: "error" as const, message: "سال انتخاب‌شده در محدوده معتبر تقویم شمسی نیست." };
    }
    const g = toGregorian(y, m, d);
    const r = computeAge({ y: g.gy, m: g.gm, d: g.gd }, t);
    return finalize(r, { y: g.gy, m: g.gm, d: g.gd });
  }, [calendar, gregDate, jy, jm, jd]);

  const reset = () => {
    setGregDate("");
    setJy("");
    setJm("");
    setJd("");
  };

  return (
    <div className="space-y-4">
      <ModeTabs
        ariaLabel="انتخاب تقویم"
        options={[
          { value: "jalali", label: "تقویم شمسی" },
          { value: "gregorian", label: "تقویم میلادی" },
        ]}
        value={calendar}
        onChange={(v) => {
          setCalendar(v);
          reset();
        }}
      />

      {calendar === "gregorian" ? (
        <div>
          <label htmlFor="age-greg" className="mb-1.5 block text-sm font-semibold">
            تاریخ تولد (میلادی)
          </label>
          <Input
            id="age-greg"
            type="date"
            dir="ltr"
            value={gregDate}
            max={todayISO || undefined}
            min="1900-01-01"
            onChange={(e) => setGregDate(e.target.value)}
            className="h-11 text-left text-[15px]"
          />
        </div>
      ) : (
        <fieldset className="grid grid-cols-3 gap-2">
          <legend className="mb-1.5 text-sm font-semibold">تاریخ تولد (شمسی)</legend>
          <div>
            <label htmlFor="age-jd" className="mb-1 block text-xs text-muted-foreground">روز</label>
            <NativeSelect
              id="age-jd"
              ariaLabel="روز تولد"
              value={jd}
              onChange={setJd}
              options={
                jd === ""
                  ? [{ value: "", label: "روز" }, ...Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))]
                  : Array.from({ length: jalaliDays }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
              }
              className="h-11 w-full"
            />
          </div>
          <div>
            <label htmlFor="age-jm" className="mb-1 block text-xs text-muted-foreground">ماه</label>
            <NativeSelect
              id="age-jm"
              ariaLabel="ماه تولد"
              value={jm}
              onChange={(v) => {
                setJm(v);
                setJd("");
              }}
              options={[{ value: "", label: "ماه" }, ...JALALI_MONTHS.map((name, i) => ({ value: String(i + 1), label: name }))]}
              className="h-11 w-full"
            />
          </div>
          <div>
            <label htmlFor="age-jy" className="mb-1 block text-xs text-muted-foreground">سال</label>
            <NativeSelect
              id="age-jy"
              ariaLabel="سال تولد"
              value={jy}
              onChange={(v) => {
                setJy(v);
                setJd("");
              }}
              options={[{ value: "", label: "سال" }, ...JAL_YEARS.map((y) => ({ value: y, label: y }))]}
              className="h-11 w-full"
            />
          </div>
        </fieldset>
      )}

      <div aria-live="polite" className="space-y-3">
        {result.state === "empty" && (
          <InfoNote>تاریخ تولد خود را انتخاب کنید تا سن دقیق شما محاسبه شود.</InfoNote>
        )}
        {result.state === "error" && <ErrorNote>{result.message}</ErrorNote>}
        {result.state === "ok" && (
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-center text-2xl font-extrabold leading-relaxed text-primary sm:text-3xl">
              {result.years > 0 && <>{faInt(result.years)} سال </>}
              {result.months > 0 && <>{faInt(result.months)} ماه </>}
              {faInt(result.days)} روز
            </p>
            <ul className="mt-4 space-y-1.5 border-t pt-3 text-sm leading-7 text-muted-foreground">
              <li>
                مجموع زندگی: <strong className="text-foreground">{faInt(result.totalDays)} روز</strong>
                {result.totalMonths > 0 && (
                  <> ≈ <strong className="text-foreground">{faInt(result.totalMonths)} ماه</strong></>
                )}
              </li>
              {result.birthJalali && (
                <li>تاریخ تولد به شمسی: {formatJalaliLong(result.birthJalali)}</li>
              )}
              {todayJ && <li>محاسبه بر پایه تاریخ امروز: {formatJalaliLong(todayJ)}</li>}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {result.state === "ok" && (
          <CopyButton
            text={`سن: ${result.years} سال و ${result.months} ماه و ${result.days} روز (${result.totalDays} روز)`}
            label="کپی نتیجه"
          />
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={reset}
          disabled={!gregDate && !jy && !jm && !jd}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          پاک کردن
        </Button>
      </div>
    </div>
  );
}

type ComputeAgeReturn = ReturnType<typeof computeAge>;

function finalize(r: ComputeAgeReturn, birth?: DateParts) {
  if (!r.ok) {
    if (r.error === "future") {
      return { state: "error" as const, message: "تاریخ تولد نمی‌تواند در آینده باشد؛ تاریخ را بررسی کنید." };
    }
    return { state: "error" as const, message: "تاریخ تولد معتبر نیست؛ تاریخ را دوباره انتخاب کنید." };
  }
  return {
    state: "ok" as const,
    years: r.age.years,
    months: r.age.months,
    days: r.age.days,
    totalDays: r.totalDays,
    totalMonths: r.totalMonths,
    birthJalali: birth
      ? toJalali(birth.y, birth.m, birth.d)
      : null,
  };
}

