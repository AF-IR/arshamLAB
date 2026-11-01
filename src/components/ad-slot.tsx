import { ADS, type AdSlotId } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * جایگاه تبلیغاتی ماژولار.
 * - تا وقتی NEXT_PUBLIC_ADS_ENABLED=false باشد هیچ چیزی رندر نمی‌شود (هزینه صفر).
 * - وقتی فعال باشد اما کد شبکه تبلیغاتی تنظیم نشده باشد، یک Placeholder با
 *   ارتفاع رزروشده نمایش داده می‌شود تا از پرش صفحه (Layout Shift) جلوگیری شود.
 * - کد تبلیغات فقط از متغیرهای محیطی سمت سرور می‌آید و هیچ آمار یا کلیک
 *   ساختگی تولید نمی‌شود.
 */
export function AdSlot({
  slot,
  className,
  minHeight = 100,
}: {
  slot: AdSlotId;
  className?: string;
  minHeight?: number;
}) {
  if (!ADS.enabled) return null;

  const code = ADS.slots[slot];
  if (code) {
    return (
      <aside
        aria-label="تبلیغات"
        className={cn("w-full overflow-hidden", className)}
        // کد تبلیغاتی توسط مالک سایت از متغیر محیطی تنظیم می‌شود (ورودی مورد اعتماد)
        dangerouslySetInnerHTML={{ __html: code }}
      />
    );
  }

  return (
    <aside aria-label="جایگاه تبلیغات" className={cn("w-full", className)}>
      <div
        className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-4 text-center text-xs text-muted-foreground"
        style={{ minHeight }}
      >
        جایگاه تبلیغات — پس از تأیید حساب ناشر، کد شبکه تبلیغاتی اینجا قرار می‌گیرد
      </div>
    </aside>
  );
}
