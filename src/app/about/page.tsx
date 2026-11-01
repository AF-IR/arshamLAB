import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "درباره ما",
  description:
    "درباره آرشام لب: پروژه‌ای برای ارائه ابزارهای ساده، سریع و رایگان آنلاین بدون ثبت‌نام؛ با پردازش محلی در مرورگر و احترام به حریم خصوصی کاربران.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ name: "خانه", href: "/" }, { name: "درباره ما" }]} />

      <article className="mt-5 space-y-5 text-[15px] leading-8">
        <h1 className="text-2xl font-extrabold sm:text-3xl">درباره آرشام لب</h1>

        <p>
          آرشام لب (Arsham Lab) یک مجموعه ابزارهای کاربردی رایگان آنلاین است که با یک هدف
          ساده ساخته شده: کارهای کوچک روزمره — از شمارش کلمات و پاک‌سازی متن تا محاسبه درصد و
          ساخت رمز عبور — نباید نیازمند نصب نرم‌افزار، ثبت‌نام یا پرداخت هزینه باشند. صفحه را
          باز می‌کنید، ابزار را استفاده می‌کنید و تمام.
        </p>

        <h2 className="pt-2 text-xl font-bold">ابزارها چگونه کار می‌کنند؟</h2>
        <p>
          تقریباً همه ابزارهای آرشام لب مستقیماً در مرورگر شما اجرا می‌شوند. یعنی متن، تاریخ،
          فایل JSON یا هر ورودی دیگری که می‌دهید، از دستگاه شما خارج نمی‌شود و روی سرور ما
          پردازش، ذخیره یا لاگ نمی‌گردد. این رویکرد دو مزیت مهم دارد: اول، پاسخ‌دهی بسیار سریع
          چون هیچ رفت‌وبرگشت شبکه‌ای در کار نیست؛ دوم، حفظ حریم خصوصی، چون حتی ما هم به
          داده‌های شما دسترسی نداریم.
        </p>

        <h2 className="pt-2 text-xl font-bold">اصول ما</h2>
        <ul className="list-disc space-y-1.5 pe-5">
          <li>رایگان و بدون ثبت‌نام بودن همه ابزارهای اصلی، برای همیشه.</li>
          <li>پردازش محلی در مرورگر هرجا ممکن باشد؛ ارسال داده به سرور فقط در صورت ضرورت فنی واقعی.</li>
          <li>واسط کاربری ساده فارسی، واکنش‌گرا برای موبایل و بدون تبلیغات مزاحم.</li>
          <li>شفافیت درباره کارکرد هر ابزار و عدم ادعای قابلیت‌هایی که وجود ندارد.</li>
        </ul>

        <h2 className="pt-2 text-xl font-bold">مسیر پیش‌رو</h2>
        <p>
          نسخه فعلی ده ابزار پرکاربرد را پوشش می‌دهد. در نسخه‌های بعدی، ابزارهای تازه به
          دسته‌های موجود اضافه می‌شود — از ابزارهای تصاویر و تبدیل فرمت فایل تا ابزارهای بیشتر
          برای توسعه‌دهندگان. اگر ابزاری را کاربردی می‌دانید و در فهرست نمی‌بینید، از صفحه{" "}
          <Link href="/contact" className="font-medium text-primary underline underline-offset-4">
            تماس با ما
          </Link>{" "}
          برای ما بنویسید؛ پیشنهادهای کاربران اولویت انتخاب ابزارهای بعدی است.
        </p>

        <h2 className="pt-2 text-xl font-bold">شروع کنید</h2>
        <p>
          فهرست کامل ابزارها را در صفحه{" "}
          <Link href="/tools" className="font-medium text-primary underline underline-offset-4">
            همه ابزارها
          </Link>{" "}
          ببینید یا از جست‌وجوی بالای صفحه استفاده کنید.
        </p>
      </article>
    </div>
  );
}
