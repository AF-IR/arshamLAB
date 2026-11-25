"use client";

import { useState } from "react";
import { ExternalLink, Heart, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRESETS = [50_000, 100_000, 250_000, 500_000];

const faFormat = new Intl.NumberFormat("fa-IR");

interface SupportFormProps {
  /** آیا مرچنت کد زرین‌پال روی سرور تنظیم شده است؟ */
  apiReady: boolean;
  /** لینک مستقیم حمایت (اختیاری) — وقتی API تنظیم نیست نمایش داده می‌شود */
  directLink: string | null;
}

export function SupportForm({ apiReady, directLink }: SupportFormProps) {
  const [amount, setAmount] = useState<number>(100_000);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAmount = custom.trim() ? Math.floor(Number(custom.replace(/[^\d]/g, ""))) : amount;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!Number.isFinite(effectiveAmount) || effectiveAmount < 10_000) {
      setError("حداقل مبلغ حمایت ۱۰٬۰۰۰ تومان است.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/support/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: effectiveAmount, name, message }),
      });
      const json = (await res.json()) as { ok?: boolean; redirectUrl?: string; error?: string };
      if (res.ok && json.ok && json.redirectUrl) {
        toast.success("در حال انتقال به درگاه زرین‌پال…");
        window.location.href = json.redirectUrl;
        return;
      }
      setError(json.error ?? "شروع پرداخت ممکن نشد.");
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <Toaster position="bottom-left" richColors dir="rtl" />

      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Heart className="size-5 text-pink-500" aria-hidden="true" />
        مبلغ حمایت را انتخاب کنید
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
        پرداخت امن از طریق درگاه زرین‌پال انجام می‌شود؛ به تومان و بدون نیاز به ثبت‌نام.
      </p>

      {!apiReady ? (
        <div className="mt-5 rounded-2xl bg-amber-500/10 px-4 py-4 text-sm leading-6 text-amber-800">
          <p className="font-bold">درگاه هنوز متصل نشده است</p>
          <p className="mt-1">
            برای فعال‌سازی پرداخت آنلاین، مرچنت کد زرین‌پال را در متغیر محیطی{" "}
            <code dir="ltr" className="rounded bg-amber-500/15 px-1 py-0.5 font-mono text-xs">
              ZARINPAL_MERCHANT_ID
            </code>{" "}
            تنظیم کنید. اگر لینک مستقیم حمایت دارید، از دکمه زیر استفاده کنید.
          </p>
          {directLink ? (
            <a
              href={directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-pink-700"
            >
              پرداخت با لینک مستقیم زرین‌پال
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setAmount(p);
                  setCustom("");
                }}
                aria-pressed={!custom && amount === p}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-sm font-bold transition-all",
                  !custom && amount === p
                    ? "border-pink-500 bg-pink-500/10 text-pink-700 shadow-sm"
                    : "border-border bg-background text-foreground/80 hover:border-pink-400"
                )}
              >
                {faFormat.format(p)}
                <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">تومان</span>
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="donate-custom">یا مبلغ دلخواه (تومان)</Label>
            <Input
              id="donate-custom"
              inputMode="numeric"
              dir="ltr"
              className="text-left"
              placeholder="100000"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="donate-name">نام شما (اختیاری)</Label>
              <Input
                id="donate-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً آرشام"
                maxLength={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="donate-message">پیام شما (اختیاری)</Label>
              <Input
                id="donate-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="برای تیم آرشام لب 🌱"
                maxLength={300}
              />
            </div>
          </div>

          {error ? (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white hover:bg-pink-700"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Heart className="size-4" aria-hidden="true" />
            )}
            پرداخت {faFormat.format(Number.isFinite(effectiveAmount) && effectiveAmount > 0 ? effectiveAmount : 0)} تومانی با زرین‌پال
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            پرداخت امن روی سرورهای زرین‌پال؛ اطلاعات بانکی شما نزد آرشام لب ذخیره نمی‌شود.
          </p>
        </form>
      )}
    </div>
  );
}
