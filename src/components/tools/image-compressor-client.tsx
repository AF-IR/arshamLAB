"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileDown, Gauge, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorNote, FieldLabel, InfoNote } from "@/components/tool-ui";
import { faInt } from "@/lib/text-utils";
import { cn } from "@/lib/utils";

type Loaded = {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  url: string;
};

type Compressed = {
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  format: string;
};

const MAX_FILE_MB = 30;
const QUALITY_MIN = 10;
const QUALITY_MAX = 95;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${faInt(bytes)} بایت`;
  if (bytes < 1024 * 1024) return `${faInt(Math.round(bytes / 1024))} کیلوبایت`;
  return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(bytes / (1024 * 1024))} مگابایت`;
}

/** فشرده‌سازی عکس در مرورگر با Canvas — بدون آپلود به سرور */
export function ImageCompressorClient() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [quality, setQuality] = useState(75);
  const [maxWidth, setMaxWidth] = useState<"original" | "1920" | "1280" | "800">("1280");
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [result, setResult] = useState<Compressed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const objectUrlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  const loadImage = useCallback(
    (file: File) => {
      setError(null);
      setResult(null);
      if (!file.type.startsWith("image/")) {
        setError("فقط فایل تصویری (JPG، PNG، WebP، GIF و BMP) پذیرفته می‌شود.");
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`حجم فایل بیش از ${faInt(MAX_FILE_MB)} مگابایت است؛ عکس کوچک‌تری انتخاب کنید.`);
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = url;
        setLoaded({
          name: file.name,
          type: file.type,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          url,
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError("این فایل به‌عنوان تصویر باز نشد؛ فرمت دیگری امتحان کنید.");
      };
      img.src = url;
    },
    []
  );

  const compress = useCallback(async () => {
    if (!loaded) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const img = new Image();
      img.decoding = "sync";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("decode"));
        img.src = loaded.url;
      });

      const targetW =
        maxWidth === "original" ? img.naturalWidth : Math.min(img.naturalWidth, Number(maxWidth));
      const scale = targetW / img.naturalWidth;
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      // پس‌زمینه سفید برای شفافیت PNG → JPEG
      if (format === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);

      const q = quality / 100;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), format, q)
      );
      if (!blob || blob.size === 0) {
        setError("ساخت فایل فشرده ممکن نشد؛ فرمت دیگری (JPG) را امتحان کنید.");
        return;
      }
      setResult({
        blob,
        url: URL.createObjectURL(blob),
        size: blob.size,
        width: w,
        height: h,
        format: format === "image/jpeg" ? "JPG" : "WebP",
      });
    } catch {
      setError("در پردازش تصویر خطایی رخ داد؛ عکس دیگری امتحان کنید.");
    } finally {
      setBusy(false);
    }
  }, [loaded, quality, maxWidth, format]);

  const reset = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setLoaded(null);
    setResult(null);
    setError(null);
  };

  const savedPercent =
    loaded && result && loaded.size > 0
      ? Math.round((1 - result.size / loaded.size) * 100)
      : null;

  const downloadName = loaded
    ? `${loaded.name.replace(/\.[^.]+$/, "")}-compressed.${result?.format === "WebP" ? "webp" : "jpg"}`
    : "compressed.jpg";

  return (
    <div className="space-y-4">
      {!loaded ? (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) loadImage(file);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-input bg-muted/30 px-4 py-12 text-center transition-colors hover:border-orange-500/50 hover:bg-orange-500/5 focus-within:outline-2 focus-within:outline-ring"
        >
          <FileDown className="size-8 text-orange-500" aria-hidden="true" />
          <span className="font-semibold">عکس را اینجا رها کنید یا برای انتخاب کلیک کنید</span>
          <span className="text-xs text-muted-foreground">
            فرمت‌های JPG، PNG، WebP، GIF — حداکثر {faInt(MAX_FILE_MB)} مگابایت
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) loadImage(file);
            }}
          />
        </label>
      ) : (
        <>
          {/* اطلاعات عکس اصلی */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-muted/30 p-3.5">
            <img
              src={loaded.url}
              alt={`پیش‌نمایش ${loaded.name}`}
              className="size-16 rounded-lg border object-cover"
            />
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-semibold">{loaded.name}</p>
              <p className="mt-0.5 text-muted-foreground" dir="ltr">
                {loaded.width} × {loaded.height} — {formatBytes(loaded.size)}
              </p>
            </div>
            <Button type="button" variant="ghost" onClick={reset} className="gap-1.5 text-muted-foreground hover:text-foreground">
              <RotateCcw className="size-4" aria-hidden="true" />
              عکس دیگر
            </Button>
          </div>

          {/* تنظیمات */}
          <div className="grid gap-4 rounded-xl border bg-muted/20 p-3.5 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <FieldLabel htmlFor="ic-quality">کیفیت خروجی</FieldLabel>
                <span className="text-sm font-bold tabular-nums">{faInt(quality)}٪</span>
              </div>
              <input
                id="ic-quality"
                type="range"
                min={QUALITY_MIN}
                max={QUALITY_MAX}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-[oklch(0.6_0.106_184.704)]"
                aria-valuetext={`کیفیت ${quality} درصد`}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                کیفیت ۷۰ تا ۸۰ معمولاً بهترین توازن حجم و وضوح است.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <FieldLabel htmlFor="ic-width">بیشترین عرض (تغییر ابعاد)</FieldLabel>
                <select
                  id="ic-width"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value as typeof maxWidth)}
                  className="h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <option value="original">بدون تغییر ابعاد</option>
                  <option value="1920">۱۹۲۰ پیکسل (Full HD)</option>
                  <option value="1280">۱۲۸۰ پیکسل (پیش‌فرض)</option>
                  <option value="800">۸۰۰ پیکسل (وب‌لاگ و چت)</option>
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="ic-format">فرمت خروجی</FieldLabel>
                <select
                  id="ic-format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as typeof format)}
                  className="h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <option value="image/jpeg">JPG — سازگار با همه‌جا</option>
                  <option value="image/webp">WebP — حجم کمتر</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={compress} disabled={busy} className="gap-1.5">
              <Gauge className="size-4" aria-hidden="true" />
              {busy ? "در حال فشرده‌سازی…" : "فشرده‌سازی عکس"}
            </Button>
          </div>

          {error && <ErrorNote>{error}</ErrorNote>}

          {result && (
            <div className="space-y-3 rounded-xl border bg-card p-3.5 sm:p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border bg-muted/30 p-2.5">
                  <p className="text-[11px] text-muted-foreground">حجم قبل</p>
                  <p className="mt-0.5 text-sm font-extrabold tabular-nums">{formatBytes(loaded.size)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-2.5">
                  <p className="text-[11px] text-muted-foreground">حجم بعد</p>
                  <p className="mt-0.5 text-sm font-extrabold tabular-nums">{formatBytes(result.size)}</p>
                </div>
                <div
                  className={cn(
                    "rounded-lg border p-2.5",
                    savedPercent !== null && savedPercent > 0
                      ? "border-green-500/40 bg-green-500/10"
                      : "border-amber-500/40 bg-amber-500/10"
                  )}
                >
                  <p className="text-[11px] text-muted-foreground">تغییر حجم</p>
                  <p className="mt-0.5 text-sm font-extrabold tabular-nums">
                    {savedPercent !== null && savedPercent > 0
                      ? `${faInt(savedPercent)}٪ کمتر`
                      : savedPercent !== null && savedPercent < 0
                        ? `${faInt(Math.abs(savedPercent))}٪ بیشتر`
                        : "بدون تغییر"}
                  </p>
                </div>
              </div>

              <p className="text-[13px] text-muted-foreground" dir="ltr">
                {result.width} × {result.height} — {result.format}
              </p>

              <img
                src={result.url}
                alt="پیش‌نمایش عکس فشرده‌شده"
                className="max-h-72 w-full rounded-lg border object-contain"
              />

              {savedPercent !== null && savedPercent <= 0 && (
                <InfoNote>
                  با این تنظیمات حجم کم نشد؛ کیفیت را پایین‌تر ببرید یا عرض را کوچک‌تر کنید و
                  دوباره فشرده‌سازی بزنید.
                </InfoNote>
              )}

              <Button type="button" asChild className="gap-1.5">
                <a href={result.url} download={downloadName}>
                  <Download className="size-4" aria-hidden="true" />
                  دانلود عکس فشرده
                </a>
              </Button>
            </div>
          )}
        </>
      )}

      <InfoNote>
        فشرده‌سازی با Canvas مرورگر و کاملاً روی دستگاه شما انجام می‌شود؛ عکس به هیچ سروری آپلود
        نمی‌شود. اگر عکس شفاف (PNG) را به JPG تبدیل کنید، پس‌زمینه شفاف سفید می‌شود؛ برای حفظ
        شفافیت از فرمت WebP استفاده کنید.
      </InfoNote>
    </div>
  );
}
