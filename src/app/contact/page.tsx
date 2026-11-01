import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/contact-form";
import { buildPageMetadata } from "@/lib/seo";
import { getContactEmail } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "تماس با ما",
  description:
    "راه‌های ارتباط با آرشام لب: پیشنهاد ابزار جدید، گزارش اشکال یا سوال درباره عملکرد ابزارها را از طریق فرم تماس برای ما ارسال کنید.",
  path: "/contact",
});

export default function ContactPage() {
  const email = getContactEmail();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-10">
      <Breadcrumbs items={[{ name: "خانه", href: "/" }, { name: "تماس با ما" }]} />

      <article className="mt-5 space-y-6 text-[15px] leading-8">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">تماس با ما</h1>
          <p className="mt-3">
            نظر، پیشنهاد یا گزارش اشکال شما برای بهترشدن آرشام لب ارزشمند است. رایج‌ترین
            موضوع‌های تماس:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pe-5">
            <li>پیشنهاد ابزار جدید برای نسخه‌های بعدی</li>
            <li>گزارش خطا یا رفتار غیرمنتظره یک ابزار</li>
            <li>سوال درباره عملکرد، محاسبات و حریم خصوصی ابزارها</li>
          </ul>
        </div>

        <section aria-label="فرم تماس">
          <h2 className="mb-3 text-lg font-bold">ارسال پیام</h2>
          <ContactForm email={email} />
        </section>

        <p className="text-sm text-muted-foreground">
          معمولاً پیشنهادهای کاربردی را در فهرست ابزارهای نسخه بعد می‌بینید؛ از همراهی شما
          متشکریم.
        </p>
      </article>
    </div>
  );
}
