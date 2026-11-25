"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ErrorNote, FieldLabel, InfoNote, NativeSelect } from "@/components/tool-ui";
import { faInt } from "@/lib/text-utils";

const SIZES = [
  { value: "256", label: "۲۵۶ پیکسل" },
  { value: "512", label: "۵۱۲ پیکسل" },
  { value: "1024", label: "۱۰۲۴ پیکسل" },
  { value: "2048", label: "۲۰۴۸ پیکسل" },
];

const EC_LEVELS = [
  { value: "L", label: "کم (۷٪ ترمیم)" },
  { value: "M", label: "متوسط (۱۵٪ ترمیم)" },
  { value: "Q", label: "زیاد (۲۵٪ ترمیم)" },
  { value: "H", label: "بسیار زیاد (۳۰٪ ترمیم)" },
];

const MAX_TEXT = 1000;

/** نسبت کنتراست WCAG بین رنگ جوهر و پس‌زمینه QR */
function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const n = parseInt(m[1]!, 16);
  const channel = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channel[0]! + 0.7152 * channel[1]! + 0.0722 * channel[2]!;
}

function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** ابزار ۴: ساخت QR Code — کاملاً محلی با کتابخانه qrcode و دانلود PNG */
export function QrCodeGeneratorClient() {
  const [text, setText] = useState("");
  const [size, setSize] = useState("512");
  const [ecLevel, setEcLevel] = useState("M");
  const [dark, setDark] = useState("#0f172a");
  const [light, setLight] = useState("#ffffff");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const libRef = useRef<typeof import("qrcode") | null>(null);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const value = text.trim();
      if (!value) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        setError(null);
        setReady(false);
        return;
      }
      try {
        if (!libRef.current) libRef.current = await import("qrcode");
        if (cancelled) return;
        await libRef.current.toCanvas(canvas, value, {
          width: Number(size),
          margin: 4,
          errorCorrectionLevel: ecLevel as "L" | "M" | "Q" | "H",
          color: { dark, light },
        });
        setError(null);
        setReady(true);
      } catch {
        if (cancelled) return;
        setReady(false);
        setError(
          "ساخت QR Code ممکن نشد؛ معمولاً علت آن طولانی بودن متن است. متن کوتاه‌تری وارد کنید."
        );
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [text, size, ecLevel, dark, light]);

  const contrast = contrastRatio(dark, light);
  const lowContrast = contrast < 3;

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "arsham-lab-qr-code.png";
    a.click();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        <div>
          <FieldLabel htmlFor="qr-input">متن یا لینک</FieldLabel>
          <Textarea
            id="qr-input"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
            rows={4}
            dir="auto"
            placeholder="مثلاً: https://example.com یا هر متن دلخواه"
            className="text-[15px] leading-7"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            حداکثر {faInt(MAX_TEXT)} نویسه؛ برای لینک‌های کوتاه نتیجه بهتر اسکن می‌شود.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="qr-size">اندازه تصویر</FieldLabel>
            <NativeSelect
              id="qr-size"
              ariaLabel="اندازه تصویر"
              value={size}
              onChange={setSize}
              options={SIZES}
              className="h-10 w-full"
            />
          </div>
          <div>
            <FieldLabel htmlFor="qr-ec">سطح ترمیم خطا</FieldLabel>
            <NativeSelect
              id="qr-ec"
              ariaLabel="سطح ترمیم خطا"
              value={ecLevel}
              onChange={setEcLevel}
              options={EC_LEVELS}
              className="h-10 w-full"
            />
          </div>
          <div>
            <FieldLabel htmlFor="qr-dark">رنگ جوهر</FieldLabel>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-card px-2 shadow-sm">
              <input
                id="qr-dark"
                type="color"
                value={dark}
                onChange={(e) => setDark(e.target.value)}
                className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                {dark.toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="qr-light">رنگ پس‌زمینه</FieldLabel>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-card px-2 shadow-sm">
              <input
                id="qr-light"
                type="color"
                value={light}
                onChange={(e) => setLight(e.target.value)}
                className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                {light.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {lowContrast && (
          <ErrorNote>
            نسبت کنتراست رنگ‌ها کم است و ممکن است برخی اسکنرها کد را نخوانند؛ رنگ جوهر تیره‌تر یا پس‌زمینه روشن‌تر انتخاب کنید.
          </ErrorNote>
        )}
        {error && <ErrorNote>{error}</ErrorNote>}
      </div>

      {/* پیش‌نمایش */}
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <canvas
            ref={canvasRef}
            aria-label={ready ? "پیش‌نمایش کد QR" : "پیش‌نمایش خالی کد QR"}
            className="h-56 w-56 sm:h-64 sm:w-64"
          />
          {!text.trim() && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              پیش‌نمایش زنده اینجا نمایش داده می‌شود
            </p>
          )}
        </div>
        <p aria-live="polite" className="sr-only">
          {ready ? "کد QR با موفقیت ساخته شد" : "کد QR آماده نیست"}
        </p>
        <div className="flex w-full flex-col gap-2">
          <Button type="button" onClick={download} disabled={!ready} className="w-full gap-1.5">
            <Download className="size-4" aria-hidden="true" />
            دانلود تصویر PNG
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setText("");
              setError(null);
            }}
            disabled={!text}
            className="w-full gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            پاک کردن
          </Button>
        </div>
        {ready && !lowContrast && !error && (
          <InfoNote>پیش‌نمایش با هر تغییر ورودی، اندازه و رنگ به‌صورت زنده به‌روز می‌شود.</InfoNote>
        )}
      </div>
    </div>
  );
}
