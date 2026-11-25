"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import { CheckOption, ErrorNote, FieldLabel, InfoNote } from "@/components/tool-ui";
import {
  DEFAULT_PASSWORD_OPTIONS,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  generatePassword,
  passwordEntropyBits,
  strengthLabel,
  type PasswordOptions,
} from "@/lib/password";
import { faInt } from "@/lib/text-utils";
import { cn } from "@/lib/utils";

const STRENGTH_STYLES = [
  "bg-destructive/70",
  "bg-amber-500",
  "bg-lime-500",
  "bg-primary",
] as const;

/** ابزار ۹: تولید رمز عبور امن با Web Crypto API — کاملاً محلی */
export function PasswordGeneratorClient() {
  const [opts, setOpts] = useState<PasswordOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [poolSize, setPoolSize] = useState(0);

  const generate = useCallback((o: PasswordOptions) => {
    const res = generatePassword(o);
    if (res.ok) {
      setPassword(res.password);
      setPoolSize(res.poolSize);
      setError(null);
    } else {
      setPassword("");
      setPoolSize(0);
      setError(res.error);
    }
  }, []);

  // تولید در callback تایمر (نه هم‌زمان با effect) تا رندر آبشاری ایجاد نشود
  useEffect(() => {
    const t = setTimeout(() => generate(opts), 0);
    return () => clearTimeout(t);
  }, [opts, generate]);

  const bits = passwordEntropyBits(poolSize, opts.length);
  const strength = strengthLabel(bits);
  const set = <K extends keyof PasswordOptions>(key: K) => (v: PasswordOptions[K]) =>
    setOpts((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel htmlFor="password-output">رمز تولیدشده</FieldLabel>
        <div className="flex gap-2">
          <Input
            id="password-output"
            readOnly
            value={password}
            dir="ltr"
            className="h-12 text-center font-mono text-lg tracking-wider"
            aria-describedby="password-strength"
          />
        </div>
      </div>

      <div id="password-strength" aria-live="polite">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">قدرت رمز:</span>
          <span className="font-bold" aria-hidden="true">
            {strength.label} (~{faInt(bits)} بیت آنتروپی)
          </span>
          <span className="sr-only">{`قدرت رمز: ${strength.label}`}</span>
        </div>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                i <= strength.level ? STRENGTH_STYLES[strength.level] : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <FieldLabel htmlFor="password-length">طول رمز</FieldLabel>
          <span className="text-sm font-bold tabular-nums" aria-hidden="true">
            {faInt(opts.length)} کاراکتر
          </span>
        </div>
        <input
          id="password-length"
          type="range"
          min={MIN_PASSWORD_LENGTH}
          max={MAX_PASSWORD_LENGTH}
          step={1}
          value={opts.length}
          onChange={(e) => set("length")(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-[oklch(0.6_0.106_184.704)]"
          aria-valuetext={`${opts.length} کاراکتر`}
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground" dir="ltr" aria-hidden="true">
          <span>{MIN_PASSWORD_LENGTH}</span>
          <span>{MAX_PASSWORD_LENGTH}</span>
        </div>
      </div>

      <fieldset className="rounded-xl border bg-muted/20 p-3">
        <legend className="px-1.5 text-sm font-semibold">نوع کاراکترها</legend>
        <div className="grid gap-0.5 sm:grid-cols-2">
          <CheckOption name="pw-lower" label="حروف کوچک انگلیسی (a-z)" checked={opts.lower} onChange={set("lower")} />
          <CheckOption name="pw-upper" label="حروف بزرگ انگلیسی (A-Z)" checked={opts.upper} onChange={set("upper")} />
          <CheckOption name="pw-digits" label="اعداد (0-9)" checked={opts.digits} onChange={set("digits")} />
          <CheckOption name="pw-symbols" label="نمادها (!@#$…)" checked={opts.symbols} onChange={set("symbols")} />
          <CheckOption
            name="pw-ambiguous"
            label="حذف کاراکترهای مبهم"
            hint="مثل I، l، 1، O و 0"
            checked={opts.excludeAmbiguous}
            onChange={set("excludeAmbiguous")}
          />
        </div>
      </fieldset>

      {error && <ErrorNote>{error}</ErrorNote>}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => generate(opts)} className="gap-1.5">
          <RefreshCw className="size-4" aria-hidden="true" />
          تولید رمز جدید
        </Button>
        <CopyButton text={password} label="کپی رمز" variant="default" disabled={!password} />
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setPassword("");
            setError(null);
          }}
          disabled={!password}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          پاک کردن
        </Button>
      </div>

      <InfoNote>
        رمزها با <strong className="text-foreground">Web Crypto API</strong> در مرورگر خود شما
        تولید می‌شوند؛ هیچ رمزی ساخته، ذخیره یا به سرور ارسال نمی‌شود. از Math.random استفاده
        نمی‌کنیم تا خروجی از نظر رمزنگاری امن باشد.
      </InfoNote>
    </div>
  );
}

