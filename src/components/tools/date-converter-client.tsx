"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { ErrorNote, ModeTabs, NativeSelect, ResultBox } from "@/components/tool-ui";
import {
  JALALI_MONTHS,
  formatJalaliLong,
  isLeapJalaaliYear,
  jalaliMonthLength,
  todayJalali,
  toGregorian,
  toJalali,
  type JalaliDate,
} from "@/lib/jalali";
import { englishToPersianDigits, faInt } from "@/lib/text-utils";

type Mode = "j2g" | "g2j";

const WEEKDAYS_FA = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
const GREG_MONTHS_FA = [
  "ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن",
  "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر",
];

const FIRST_JAL_YEAR = 1300;
const LAST_JAL_YEAR = 1500;

function weekdayOf(gy: number, gm: number, gd: number): string {
  return WEEKDAYS_FA[new Date(gy, gm - 1, gd).getDay()];
}

function gregorianDayOfYear(gy: number, gm: number, gd: number): number {
  const start = Date.UTC(gy, 0, 1);
  const now = Date.UTC(gy, gm - 1, gd);
  return Math.round((now - start) / 86400000) + 1;
}

function isGregorianLeap(gy: number): boolean {
  return (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
}

function gregorianMonthLength(gy: number, gm: number): number {
  if (gm === 2) return isGregorianLeap(gy) ? 29 : 28;
  if ([4, 6, 9, 11].includes(gm)) return 30;
  return 31;
}

/** ابزار تبدیل تاریخ شمسی ↔ میلادی با الگوریتم دقیق jalaali */
export function DateConverterClient() {
  const [mode, setMode] = useState<Mode>("j2g");
  // ورودی شمسی
  const [jy, setJy] = useState("1404");
  const [jm, setJm] = useState("1");
  const [jd, setJd] = useState("1");
  // ورودی میلادی
  const [gregDate, setGregDate] = useState("");
  // «امروز» فقط سمت کلاینت تنظیم می‌شود تا با رندر سرور تفاوت نداشته باشد
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const today = todayJalali();
      setJy(String(today.jy));
      setJm(String(today.jm));
      setJd(String(today.jd));
      setGregDate(isoOf(toGregorian(today.jy, today.jm, today.jd)));
      setMounted(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const jalaliYearOptions = useMemo(
    () =>
      Array.from({ length: LAST_JAL_YEAR - FIRST_JAL_YEAR + 1 }, (_, i) => {
        const y = LAST_JAL_YEAR - i;
        return { value: String(y), label: englishToPersianDigits(String(y)) };
      }),
    []
  );

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
    if (!mounted) return null;
    try {
      if (mode === "j2g") {
        const y = Number(jy);
        const m = Number(jm);
        const d = Number(jd);
        if (!y || !m || !d) return { state: "empty" as const };
        if (d > jalaliMonthLength(y, m)) {
          return {
            state: "error" as const,
            message: `${englishToPersianDigits(String(d))} ${JALALI_MONTHS[m - 1]} در سال ${faInt(y)} وجود ندارد؛ این ماه فقط ${faInt(jalaliMonthLength(y, m))} روز دارد.`,
          };
        }
        const g = toGregorian(y, m, d);
        return { state: "ok" as const, jalali: { jy: y, jm: m, jd: d }, greg: g };
      }
      if (!gregDate) return { state: "empty" as const };
      const [ys, ms, ds] = gregDate.split("-").map(Number);
      if (!ys || !ms || !ds) return { state: "empty" as const };
      if (ms < 1 || ms > 12 || ds < 1 || ds > gregorianMonthLength(ys, ms)) {
        return {
          state: "error" as const,
          message: "تاریخ میلادی واردشده معتبر نیست؛ روز و ماه را بررسی کنید.",
        };
      }
      const j = toJalali(ys, ms, ds);
      return { state: "ok" as const, jalali: j, greg: { gy: ys, gm: ms, gd: ds } };
    } catch {
      return {
        state: "error" as const,
        message: "این تاریخ خارج از محدوده پشتیبانی‌شده است؛ سال را بین ۱۳۰۰ تا ۱۵۰۰ شمسی انتخاب کنید.",
      };
    }
  }, [mode, jy, jm, jd, gregDate, mounted, jalaliDays]);

  const setToday = () => {
    const today = todayJalali();
    setJy(String(today.jy));
    setJm(String(today.jm));
    setJd(String(today.jd));
    setGregDate(isoOf(toGregorian(today.jy, today.jm, today.jd)));
  };

  return (
    <div className="space-y-4">
      <ModeTabs
        ariaLabel="جهت تبدیل تاریخ"
        value={mode}
        onChange={setMode}
        options={[
          { value: "j2g", label: "شمسی ← میلادی" },
          { value: "g2j", label: "میلادی ← شمسی" },
        ]}
      />

      {mode === "j2g" ? (
        <fieldset className="rounded-xl border bg-muted/20 p-3.5">
          <legend className="px-1.5 text-sm font-semibold">تاریخ شمسی</legend>
          <div className="grid grid-cols-3 gap-2">
            <NativeSelect
              id="dc-jy"
              ariaLabel="سال شمسی"
              value={jy}
              onChange={(v) => {
                setJy(v);
                // اگر روز بزرگ‌تر از حد جدید بود، به آخرین روز ماه منتقل شود
                const y = Number(v);
                const m = Number(jm);
                try {
                  const max = jalaliMonthLength(y, m);
                  if (Number(jd) > max) setJd(String(max));
                } catch {
                  /* نادیده گرفتن */
                }
              }}
              options={jalaliYearOptions}
            />
            <NativeSelect
              id="dc-jm"
              ariaLabel="ماه شمسی"
              value={jm}
              onChange={(v) => {
                setJm(v);
                const y = Number(jy);
                const m = Number(v);
                try {
                  const max = jalaliMonthLength(y, m);
                  if (Number(jd) > max) setJd(String(max));
                } catch {
                  /* نادیده گرفتن */
                }
              }}
              options={JALALI_MONTHS.map((name, i) => ({ value: String(i + 1), label: name }))}
            />
            <NativeSelect
              id="dc-jd"
              ariaLabel="روز شمسی"
              value={jd}
              onChange={setJd}
              options={Array.from({ length: jalaliDays }, (_, i) => ({
                value: String(i + 1),
                label: englishToPersianDigits(String(i + 1)),
              }))}
            />
          </div>
        </fieldset>
      ) : (
        <fieldset className="rounded-xl border bg-muted/20 p-3.5">
          <legend className="px-1.5 text-sm font-semibold">تاریخ میلادی</legend>
          <input
            type="date"
            value={gregDate}
            min="1921-03-22"
            max="2121-03-20"
            onChange={(e) => setGregDate(e.target.value)}
            aria-label="تاریخ میلادی"
            dir="ltr"
            className="h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring"
          />
        </fieldset>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={setToday} className="gap-1.5">
          <CalendarCheck className="size-4" aria-hidden="true" />
          امروز
        </Button>
      </div>

      {result?.state === "error" && <ErrorNote>{result.message}</ErrorNote>}

      {result?.state === "ok" && (
        <ResultBox
          title="نتیجه تبدیل"
          actions={
            <CopyButton
              text={resultSummary(result.jalali, result.greg)}
              label="کپی خلاصه نتیجه"
              copiedLabel="کپی شد"
            />
          }
        >
          <div className="space-y-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">شمسی (جلالی)</p>
              <p className="mt-1 text-lg font-extrabold">
                {weekdayOf(result.greg.gy, result.greg.gm, result.greg.gd)}؛{" "}
                {formatJalaliLong(result.jalali as JalaliDate)}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                <span>
                  روز {faInt(jalaliDayOfYear(result.jalali))} سال{" "}
                  {isLeapJalaaliYear(result.jalali.jy) ? "(سال کبیسه)" : null}
                </span>
                <span
                  dir="ltr"
                  className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[12px] text-foreground"
                >
                  {`${result.jalali.jy}/${String(result.jalali.jm).padStart(2, "0")}/${String(result.jalali.jd).padStart(2, "0")}`}
                </span>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">میلادی (گرگوری)</p>
              <p className="mt-1 text-lg font-extrabold" dir="ltr">
                {englishToPersianDigits(String(result.greg.gd))}{" "}
                {GREG_MONTHS_FA[result.greg.gm - 1]} {englishToPersianDigits(String(result.greg.gy))}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                <span>
                  روز {faInt(gregorianDayOfYear(result.greg.gy, result.greg.gm, result.greg.gd))} سال
                  {isGregorianLeap(result.greg.gy) ? " (سال کبیسه)" : null}
                </span>
                <span
                  dir="ltr"
                  className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[12px] text-foreground"
                >
                  {isoOf(result.greg)}
                </span>
              </div>
            </div>
          </div>
        </ResultBox>
      )}
    </div>
  );
}

function isoOf(g: { gy: number; gm: number; gd: number }): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${g.gy}-${p(g.gm)}-${p(g.gd)}`;
}

/** خلاصه متنی نتیجه برای کپی‌کردن */
function resultSummary(
  j: { jy: number; jm: number; jd: number },
  g: { gy: number; gm: number; gd: number }
): string {
  return `شمسی: ${j.jy}/${String(j.jm).padStart(2, "0")}/${String(j.jd).padStart(2, "0")} | میلادی: ${isoOf(g)}`;
}

function jalaliDayOfYear(d: JalaliDate): number {
  let day = d.jd;
  for (let m = 1; m < d.jm; m += 1) {
    day += jalaliMonthLength(d.jy, m);
  }
  return day;
}
