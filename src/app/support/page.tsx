import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CheckCircle2, HeartHandshake, Sparkles, XCircle } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import { getZarinpalDirectLink, isZarinpalConfigured } from "@/lib/zarinpal";
import { SupportForm } from "@/components/support-form";

export const metadata: Metadata = buildPageMetadata({
  title: "حمایت مالی از آرشام لب | پرداخت امن با زرین‌پال",
  description:
    "با حمایت مالی از آرشام لب به ادامه رایگان ماندن ابزارها کمک کنید؛ پرداخت امن و آنی از طریق درگاه زرین‌پال، به تومان و بدون نیاز به ثبت‌نام.",
  path: "/support",
});

interface SupportPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

const faFormat = new Intl.NumberFormat("fa-IR");

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const sp = await searchParams;
  const payment = first(sp.payment);
  const ref = first(sp.ref);
  const amount = Number(first(sp.amount));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      {/* نتیجه بازگشت از درگاه */}
      {payment === "success" ? (
        <div className="mb-6 rounded-3xl border border-green-500/40 bg-green-500/10 p-5" role="status">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-green-700">
            <CheckCircle2 className="size-6" aria-hidden="true" />
            حمایت شما با موفقیت انجام شد؛ از صمیم قلب ممنونیم! 💚
          </h2>
          <p className="mt-2 text-sm leading-6 text-green-800">
            شماره پیگیری پرداخت:{" "}
            <span dir="ltr" className="font-mono font-bold">{ref || "—"}</span>
            {Number.isFinite(amount) && amount > 0 ? (
              <>
                {" "}• مبلغ: <span className="font-bold">{faFormat.format(amount)} تومان</span>
              </>
            ) : null}
          </p>
        </div>
      ) : payment === "canceled" ? (
        <div className="mb-6 rounded-3xl border border-amber-500/40 bg-amber-500/10 p-5" role="status">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-amber-700">
            <XCircle className="size-6" aria-hidden="true" />
            پرداخت لغو شد
          </h2>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            پرداخت توسط شما یا بانک کامل نشد؛ اگر مبلغی از حساب شما کسر شده باشد، طی ۷۲ ساعت
            به‌صورت خودکار برگردانده می‌شود. هر وقت خواستید دوباره امتحان کنید.
          </p>
        </div>
      ) : payment === "failed" ? (
        <div className="mb-6 rounded-3xl border border-destructive/40 bg-destructive/10 p-5" role="status">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-destructive">
            <XCircle className="size-6" aria-hidden="true" />
            پرداخت ناموفق بود
          </h2>
          <p className="mt-2 text-sm leading-6 text-destructive">
            تأیید تراکنش ممکن نشد. اگر مبلغی از حساب شما کسر شده، طی ۷۲ ساعت بازگشت داده می‌شود؛
            در صورت تکرار مشکل از طریق{" "}
            <Link href="/contact" className="font-bold underline underline-offset-4">
              صفحه تماس
            </Link>{" "}
            به ما خبر بدهید.
          </p>
        </div>
      ) : null}

      {/* معرفی */}
      <section className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-pink-500/10 px-4 py-1.5 text-sm font-bold text-pink-600">
          <HeartHandshake className="size-4" aria-hidden="true" />
          حمایت مالی
        </span>
        <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">
          با حمایت شما، آرشام لب رایگان می‌ماند
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
          همه ابزارهای آرشام لب — از تبدیل تاریخ شمسی و میلادی تا آرشام پوینت و آرشام فرم — بدون
          تبلیغ اجباری، ثبت‌نام و هزینه برای کاربران کار می‌کنند. حمایت مالی شما هزینه سرور و دامنه
          را پوشش می‌دهد و به ساخت ابزارهای جدیدِ هوش مصنوعی فارسی کمک می‌کند.
        </p>
      </section>

      {/* فرم پرداخت */}
      <div className="mt-8">
        <SupportForm apiReady={isZarinpalConfigured()} directLink={getZarinpalDirectLink()} />
      </div>

      {/* حمایت‌ها صرف چه چیزی می‌شود */}
      <section aria-labelledby="usage-title" className="mt-10">
        <h2 id="usage-title" className="text-lg font-bold">
          حمایت‌ها صرف چه چیزی می‌شود؟
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            {
              title: "هزینه سرور و دامنه",
              text: "بخش اصلی هزینه‌های جاری؛ تا هر ابزار سریع و همیشه در دسترس بماند.",
            },
            {
              title: "توسعه ابزارهای هوش مصنوعی فارسی",
              text: "ساخت و بهبود ابزارهایی مثل آرشام پوینت (ساخت پاورپوینت با هوش مصنوعی) و آرشام فرم.",
            },
            {
              title: "مستندسازی و آموزش",
              text: "نوشتن راهنمای فارسی برای هر ابزار تا کاربران تازه‌کار هم راحت استفاده کنند.",
            },
            {
              title: "حفظ نسخه رایگان",
              text: "بدون دیوار پرداخت روی خود ابزارها؛ حمایت داوطلبانه تنها منبع درآمد است.",
            },
          ].map((item) => (
            <li key={item.title} className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="flex items-center gap-2 font-bold">
                <BadgeCheck className="size-4.5 text-teal-600" aria-hidden="true" />
                {item.title}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* پرسش‌های پرتکرار */}
      <section aria-labelledby="support-faq-title" className="mt-10">
        <h2 id="support-faq-title" className="text-lg font-bold">
          پرسش‌های پرتکرار درباره حمایت مالی
        </h2>
        <div className="mt-4 space-y-4 text-[15px] leading-7">
          <div>
            <h3 className="font-bold">پرداخت از چه راهی انجام می‌شود؟</h3>
            <p className="mt-1 text-muted-foreground">
              از طریق درگاه رسمی زرین‌پال؛ بعد از انتخاب مبلغ، به صفحه پرداخت بانک منتقل می‌شوید و
              پس از بازگشت، رسید و شماره پیگیری همین‌جا نمایش داده می‌شود. هیچ داده بانکی نزد ما
              ذخیره نمی‌شود.
            </p>
          </div>
          <div>
            <h3 className="font-bold">حداقل و حداکثر مبلغ چقدر است؟</h3>
            <p className="mt-1 text-muted-foreground">
              حداقل مبلغ {faFormat.format(10_000)} تومان است و حداکثر آن {faFormat.format(100_000_000)} تومان؛
              می‌توانید هر عدد دلخواهی بین این دو بنویسید.
            </p>
          </div>
          <div>
            <h3 className="font-bold">آیا حمایت مالی اجباری است؟</h3>
            <p className="mt-1 text-muted-foreground">
              خیر؛ استفاده از همه ابزارها کاملاً رایگان است و خواهد ماند. حمایت مالی انتخابی است و
              فقط به رشد سریع‌تر پروژه کمک می‌کند.
            </p>
          </div>
          <div>
            <h3 className="font-bold">رسید پرداخت را از کجا بگیرم؟</h3>
            <p className="mt-1 text-muted-foreground">
              پس از تکمیل پرداخت، شماره پیگیری زرین‌پال در همین صفحه نمایش داده می‌شود و رسید اصلی
              از درگاه بانک یا پنل کاربری زرین‌پال قابل دریافت است.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-10 flex items-center justify-center gap-1.5 rounded-2xl bg-muted/60 px-4 py-3 text-center text-sm leading-6 text-muted-foreground">
        <Sparkles className="size-4 shrink-0 text-amber-500" aria-hidden="true" />
        اگر امکان پرداخت ندارید، معرفی آرشام لب به دوستان هم یک حمایت واقعی است.
      </p>
    </div>
  );
}
