"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, ExternalLink, ImageUp, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { ErrorNote, InfoNote, ModeTabs, ResultBox } from "@/components/tool-ui";
import { cn } from "@/lib/utils";

type Mode = "upload" | "camera";
type ReadResult =
  | { state: "idle" }
  | { state: "found"; text: string }
  | { state: "notfound" }
  | { state: "error"; message: string };

const MAX_SCAN_DIM = 1600;

/** رسم تصویر روی کانواس با محدودسازی ابعاد و گرفتن داده پیکسلی */
function drawToCanvas(source: HTMLImageElement | HTMLVideoElement): {
  imageData: ImageData;
  width: number;
  height: number;
} | null {
  const naturalW = source instanceof HTMLImageElement ? source.naturalWidth : source.videoWidth;
  const naturalH = source instanceof HTMLImageElement ? source.naturalHeight : source.videoHeight;
  if (!naturalW || !naturalH) return null;
  const scale = Math.min(1, MAX_SCAN_DIM / Math.max(naturalW, naturalH));
  const w = Math.max(1, Math.round(naturalW * scale));
  const h = Math.max(1, Math.round(naturalH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, w, h);
  return { imageData: ctx.getImageData(0, 0, w, h), width: w, height: h };
}

function decode(imageData: ImageData): string | null {
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "attemptBoth",
  });
  return code?.data ?? null;
}

/** خواندن QR Code از تصویر آپلودی یا دوربین — پردازش کاملاً در مرورگر */
export function QrCodeReaderClient() {
  const [mode, setMode] = useState<Mode>("upload");
  const [result, setResult] = useState<ReadResult>({ state: "idle" });
  const [scanning, setScanning] = useState(false);
  const [fileName, setFileName] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const readImageFile = useCallback((file: File) => {
    setResult({ state: "idle" });
    if (!file.type.startsWith("image/")) {
      setResult({ state: "error", message: "فقط فایل تصویری (JPG، PNG، WebP و…) پذیرفته می‌شود." });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setResult({ state: "error", message: "حجم تصویر بیش از ۲۵ مگابایت است؛ تصویر کوچک‌تری انتخاب کنید." });
      return;
    }
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const drawn = drawToCanvas(img);
        if (!drawn) {
          setResult({ state: "error", message: "خواندن تصویر ممکن نشد؛ فایل دیگری امتحان کنید." });
          return;
        }
        const text = decode(drawn.imageData);
        setResult(text ? { state: "found", text } : { state: "notfound" });
      } catch {
        setResult({ state: "error", message: "در پردازش تصویر خطایی رخ داد؛ تصویر دیگری امتحان کنید." });
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setResult({ state: "error", message: "این فایل به‌عنوان تصویر باز نشد؛ فرمت دیگری امتحان کنید." });
    };
    img.src = url;
  }, []);

  const startCamera = useCallback(async () => {
    setResult({ state: "idle" });
    stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) {
      setResult({
        state: "error",
        message: "مرورگر شما به دوربین دسترسی نمی‌دهد؛ از حالت «آپلود تصویر» استفاده کنید یا مرورگر را به‌روز کنید.",
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setScanning(true);

      // اسکن پیوسته هر ۳۰۰ میلی‌ثانیه از فریم فعلی
      timerRef.current = setInterval(() => {
        const v = videoRef.current;
        if (!v || v.readyState < 2) return;
        const drawn = drawToCanvas(v);
        if (!drawn) return;
        const text = decode(drawn.imageData);
        if (text) {
          stopCamera();
          setResult({ state: "found", text });
        }
      }, 300);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") {
        setResult({
          state: "error",
          message: "اجازه دوربین داده نشد. از تنظیمات مرورگر اجازه دوربین را برای این سایت فعال کنید یا از حالت «آپلود تصویر» استفاده کنید.",
        });
      } else if (name === "NotFoundError") {
        setResult({ state: "error", message: "دوربینی روی این دستگاه پیدا نشد؛ از حالت «آپلود تصویر» استفاده کنید." });
      } else {
        setResult({
          state: "error",
          message: "دسترسی به دوربین ممکن نشد (مثلاً در حالت embed شده). می‌توانید تصویر QR را در حالت «آپلود تصویر» بخوانید.",
        });
      }
    }
  }, [stopCamera]);

  const isUrl = result.state === "found" && /^https?:\/\//i.test(result.text.trim());

  return (
    <div className="space-y-4">
      <ModeTabs
        ariaLabel="روش خواندن QR"
        value={mode}
        onChange={(m) => {
          setMode(m);
          if (m === "upload") stopCamera();
          setResult({ state: "idle" });
        }}
        options={[
          { value: "upload", label: "آپلود تصویر" },
          { value: "camera", label: "دوربین گوشی" },
        ]}
      />

      {mode === "upload" ? (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) readImageFile(file);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-input bg-muted/30 px-4 py-10 text-center transition-colors hover:border-teal-500/50 hover:bg-teal-500/5 focus-within:outline-2 focus-within:outline-ring"
        >
          <ImageUp className="size-8 text-teal-600" aria-hidden="true" />
          <span className="font-semibold">
            {fileName ? `تصویر انتخاب‌شده: ${fileName}` : "عکس QR را اینجا رها کنید یا برای انتخاب کلیک کنید"}
          </span>
          <span className="text-xs text-muted-foreground">
            فرمت‌های JPG، PNG، WebP — حداکثر ۲۵ مگابایت
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) readImageFile(file);
            }}
          />
        </label>
      ) : (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border bg-slate-900">
            <video
              ref={videoRef}
              playsInline
              muted
              className={cn("aspect-video w-full object-cover", scanning ? "opacity-100" : "opacity-40")}
              aria-label="نمای دوربین برای اسکن QR"
            />
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-100">
                <Camera className="size-8" aria-hidden="true" />
                <p className="px-6 text-center text-sm leading-6">
                  برای شروع، دوربین را روشن کنید و کد QR را مقابل لنز بگیرید.
                </p>
              </div>
            )}
            {scanning && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 m-auto size-3/5 rounded-2xl border-4 border-teal-400/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.35)]"
              />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {!scanning ? (
              <Button type="button" onClick={startCamera} className="gap-1.5">
                <Camera className="size-4" aria-hidden="true" />
                روشن کردن دوربین
              </Button>
            ) : (
              <Button type="button" variant="destructive" onClick={stopCamera} className="gap-1.5">
                <CameraOff className="size-4" aria-hidden="true" />
                توقف اسکن
              </Button>
            )}
          </div>
          <InfoNote>
            اسکن به‌صورت پیوسته انجام می‌شود و به‌محض تشخیص کد، نتیجه نمایش داده می‌شود. دسترسی
            دوربین فقط در همین صفحه و بدون ارسال تصویر به سرور استفاده می‌شود.
          </InfoNote>
        </div>
      )}

      {result.state === "error" && <ErrorNote>{result.message}</ErrorNote>}
      {result.state === "notfound" && (
        <ErrorNote>
          کد QR در این تصویر پیدا نشد. از وضوح و تاریکی کافی عکس مطمئن شوید، کل کد داخل تصویر
          باشد و کمی نزدیک‌تر عکس بگیرید.
        </ErrorNote>
      )}

      {result.state === "found" && (
        <ResultBox
          title="محتوای خوانده‌شده"
          actions={
            <>
              <CopyButton text={result.text} label="کپی متن" variant="outline" />
              {isUrl && (
                <Button type="button" variant="outline" asChild className="gap-1.5">
                  <a href={result.text.trim()} target="_blank" rel="noopener noreferrer nofollow">
                    <ExternalLink className="size-4" aria-hidden="true" />
                    باز کردن لینک
                  </a>
                </Button>
              )}
              {mode === "camera" && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setResult({ state: "idle" })}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ScanLine className="size-4" aria-hidden="true" />
                  اسکن بعدی
                </Button>
              )}
            </>
          }
        >
          <p
            dir="auto"
            className="break-all rounded-lg border bg-card p-3 font-medium leading-7"
          >
            {result.text}
          </p>
          {isUrl && (
            <p className="mt-2 text-xs text-muted-foreground">
              این متن یک لینک وب است؛ پیش از باز کردن، آدرس را بررسی کنید.
            </p>
          )}
        </ResultBox>
      )}

      <InfoNote>
        رمزگشایی QR با کتابخانه متن‌باز <code dir="ltr">jsQR</code> و کاملاً در مرورگر شما انجام
        می‌شود؛ تصویر آپلودی یا فریم‌های دوربین به هیچ سروری ارسال نمی‌شود.
      </InfoNote>
    </div>
  );
}
