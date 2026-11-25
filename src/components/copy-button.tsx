"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** کپی امن متن در کلیپ‌بورد با بازگشت به روش جایگزین */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ادامه با روش جایگزین
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({
  text,
  label = "کپی",
  copiedLabel = "کپی شد",
  disabled = false,
  variant = "outline",
  className,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onCopy = useCallback(async () => {
    const ok = await copyText(text);
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }, [text]);

  return (
    <Button
      type="button"
      variant={variant}
      onClick={onCopy}
      disabled={disabled || !text}
      aria-live="polite"
      className={cn("gap-1.5", className)}
    >
      {copied ? <Check className="size-4 text-primary" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
