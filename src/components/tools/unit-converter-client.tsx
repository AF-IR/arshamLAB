"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeTabs, NativeSelect, StatCard } from "@/components/tool-ui";
import { UNIT_GROUPS, convertUnit, formatUnitResult, getUnit, getUnitGroup } from "@/lib/units";
import { faNumber } from "@/lib/text-utils";

/** مبدل واحدها — طول، وزن، دما، مساحت، حجم، سرعت، داده و زمان */
export function UnitConverterClient() {
  const [groupId, setGroupId] = useState(UNIT_GROUPS[0].id);
  const group = getUnitGroup(groupId)!;

  const [amount, setAmount] = useState("1");
  // مقدار اولیه فقط در اولین رندر محاسبه شود (init تابعی) تا با تغییر گروه به خطا نخورد
  const [fromId, setFromId] = useState(() => group.units[Math.min(2, group.units.length - 1)].id);
  const [toId, setToId] = useState(() => group.units[Math.min(4, group.units.length - 1)].id);

  const changeGroup = (id: string) => {
    const g = getUnitGroup(id)!;
    setGroupId(id);
    // انتخاب پیش‌فرض معنادار برای هر گروه
    const from = id === "temperature" ? g.units[0].id : g.units[Math.min(2, g.units.length - 1)].id;
    const to = id === "temperature" ? g.units[1].id : g.units[Math.min(4, g.units.length - 1)].id;
    setFromId(from);
    setToId(to);
  };

  const parsed = useMemo(() => {
    const normalized = amount.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
    const n = Number(normalized);
    return Number.isFinite(n) && normalized.trim() !== "" ? n : null;
  }, [amount]);

  const result = useMemo(() => {
    if (parsed === null) return null;
    return convertUnit(parsed, groupId, fromId, toId);
  }, [parsed, groupId, fromId, toId]);

  const fromUnit = getUnit(group, fromId);
  const toUnit = getUnit(group, toId);

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  // رابط تبدیل برای نمایش فرمول
  const oneFromTo = useMemo(() => convertUnit(1, groupId, fromId, toId), [groupId, fromId, toId]);

  return (
    <div className="space-y-4">
      <ModeTabs
        ariaLabel="دسته واحد"
        value={groupId}
        onChange={changeGroup}
        options={UNIT_GROUPS.map((g) => ({ value: g.id, label: g.title }))}
        className="justify-start"
      />

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div className="space-y-2">
          <label htmlFor="uc-amount" className="block text-sm font-semibold">
            مقدار
          </label>
          <Input
            id="uc-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="مثلاً ۱٫۵ یا 25"
            aria-describedby="uc-result"
          />
          <NativeSelect
            id="uc-from"
            ariaLabel="واحد مبدأ"
            value={fromId}
            onChange={setFromId}
            className="h-10 w-full"
            options={group.units.map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` }))}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={swap}
          aria-label="جابه‌جایی واحدهای مبدأ و مقصد"
          title="جابه‌جایی واحدها"
          className="size-10 rounded-full"
        >
          <ArrowUpDown className="size-4" aria-hidden="true" />
        </Button>

        <div className="space-y-2">
          <label htmlFor="uc-result" className="block text-sm font-semibold">
            نتیجه
          </label>
          <div
            id="uc-result"
            aria-live="polite"
            className="flex h-10 items-center rounded-lg border bg-teal-500/5 px-3 text-lg font-extrabold tabular-nums"
          >
            {result === null ? "—" : `${formatUnitResult(result)} ${toUnit?.symbol ?? ""}`}
          </div>
          <NativeSelect
            id="uc-to"
            ariaLabel="واحد مقصد"
            value={toId}
            onChange={setToId}
            className="h-10 w-full"
            options={group.units.map((u) => ({ value: u.id, label: `${u.name} (${u.symbol})` }))}
          />
        </div>
      </div>

      {fromUnit && toUnit && parsed !== null && result !== null && (
        <p className="text-[13px] leading-6 text-muted-foreground" aria-live="polite">
          {faNumber(parsed)} {fromUnit.name} برابر است با{" "}
          <strong className="text-foreground">{faNumber(result)} {toUnit.name}</strong>
          {parsed !== 0 && oneFromTo !== null && (
            <>
              {" "}؛ هر {fromUnit.name} = {faNumber(oneFromTo)} {toUnit.name}
            </>
          )}
        </p>
      )}

      {group.isTemperature && (
        <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-[13px] leading-6 text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            تبدیل دما با فرمول دقیق انجام می‌شود: سلسیوس به فارنهایت (مقدار × ۹/۵) + ۳۲ و
            سلسیوس به کلوین مقدار + ۲۷۳٫۱۵.
          </span>
        </p>
      )}

      {/* جدول تبدیل به همه واحدهای گروه */}
      {parsed !== null && (
        <div className="rounded-xl border bg-card p-3.5">
          <h3 className="mb-2.5 text-sm font-bold">
            معادل {faNumber(parsed)} {fromUnit?.name} در واحدهای دیگر
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {group.units
              .filter((u) => u.id !== fromId)
              .map((u) => {
                const v = convertUnit(parsed, groupId, fromId, u.id);
                return <StatCard key={u.id} label={`${u.name} (${u.symbol})`} value={v === null ? "—" : formatUnitResult(v)} />;
              })}
          </div>
          {group.units.some((u) => u.approximate) && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              واحد سال تقریبی است (۳۶۵ روز) و برای محاسبات دقیق تقویمی مناسب نیست.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
