/** تزریق داده ساختاریافته JSON-LD (فقط سمت سرور) */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // داده از کد خود ما ساخته می‌شود، نه از ورودی کاربر
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
