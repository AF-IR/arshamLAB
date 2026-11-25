import type { Metadata } from "next";
import { ArrowUpLeft, CheckCircle2, ClipboardCheck, GraduationCap } from "lucide-react";
import { ToolPageShell } from "@/components/tool-page-shell";
import { buildToolMetadata } from "@/lib/seo";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("arsham-form")!;
const ARSHAM_FORM_URL = tool.externalUrl ?? "https://afform.vercel.app";

export const metadata: Metadata = buildToolMetadata(tool);

const FEATURES = [
  "ساخت فرم و آزمون آنلاین با انواع سوال؛ بدون نصب برنامه",
  "تحلیل پاسخنامه با هوش مصنوعی: بررسی الگوی پاسخ‌ها و استخراج جمع‌بندی",
  "رابط فارسی و راست‌چین مناسب معلمان، اساتید و مدیران آموزشی",
  "جمع‌آوری پاسخ‌ها و مشاهده نتایج به‌صورت خلاصه و قابل فهم",
  "اجرای کاملاً آنلاین در مرورگر؛ بدون نیاز به ثبت‌نام پیچیده",
];

export default function ArshamFormPage() {
  return (
    <ToolPageShell
      tool={tool}
      intro="آرشام فرم ابزار ساخت فرم و آزمون آنلاین با تحلیل هوش مصنوعی پاسخنامه است: سوال‌ها را بسازید، لینک را در اختیار مخاطب بگذارید و نتایج را با تحلیل هوش مصنوعی بررسی کنید."
      toolUi={
        <section
          aria-label="رفتن به آرشام فرم"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-lg sm:p-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-10 size-64 rounded-full bg-amber-400/20 blur-3xl"
          />
          <div className="relative">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
              <GraduationCap className="size-3.5" aria-hidden="true" />
              ابزار ویژه هوش مصنوعی آرشام
            </p>
            <h2 className="mt-4 text-2xl font-extrabold leading-relaxed sm:text-3xl">
              فرم و آزمون بسازید؛ تحلیل پاسخنامه را هوش مصنوعی انجام دهد
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-8 text-white/90">
              سوال‌های آزمون، نظرسنجی یا فرم ثبت‌نام را در محیط ساده فارسی طراحی کنید و لینک آن
              را برای دانش‌آموزان یا مخاطبان بفرستید. پس از رسیدن پاسخ‌ها، هوش مصنوعی پاسخنامه‌ها
              را تحلیل می‌کند و جمع‌بندی قابل استفاده در اختیار شما می‌گذارد.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={ARSHAM_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-teal-700 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-white"
              >
                <ClipboardCheck className="size-5" aria-hidden="true" />
                ورود به آرشام فرم
                <ArrowUpLeft className="size-4" aria-hidden="true" />
              </a>
              <span className="text-xs text-white/75" dir="ltr">
                afform.vercel.app
              </span>
            </div>
          </div>
        </section>
      }
    >
      <section>
        <h2>آرشام فرم چیست؟</h2>
        <p>
          آرشام فرم یک ابزار آنلاین ساخت فرم و آزمون است که بخش تحلیل آن با هوش مصنوعی تقویت شده
          است. به‌جای اینکه پس از هر آزمون یا نظرسنجی، ساعت‌ها وقت بررسی برگه‌ها و پاسخ‌ها کنید،
          در آرشام فرم سوال‌ها را طراحی می‌کنید، لینک فرم را بین مخاطبان توزیع می‌کنید و در پایان،
          تحلیل خودکار پاسخنامه‌ها را دریافت می‌کنید. این ابزار بخشی از مجموعه ابزارهای ویژه
          آرشام است و کنار <a href="/tools/arsham-point">آرشام پوینت</a> برای مدرسه، آموزشگاه و
          محیط کار طراحی شده است.
        </p>
      </section>

      <section>
        <h2>تحلیل هوش مصنوعی پاسخنامه چطور کار می‌کند؟</h2>
        <p>
          پس از جمع شدن پاسخ‌ها، هوش مصنوعی متن پاسخ‌ها و الگوی پاسخ‌دهی را بررسی می‌کند و به‌جای
          یک فهرست خام از جواب‌ها، جمع‌بندی قابل فهم تحویل می‌دهد: کدام سوال‌ها بیشترین اشکال را
          داشته‌اند، سطح کلی پاسخ‌ها چگونه بوده و چه نکاتی برای تدریس یا تصمیم‌گیری بعدی قابل
          استفاده است. نتیجه این تحلیل به‌صورت متن فارسی و خلاصه نمایش داده می‌شود تا سریع بتوانید
          بر اساس آن اقدام کنید.
        </p>
      </section>

      <section>
        <h2>چطور از آرشام فرم استفاده کنیم؟</h2>
        <p>
          کار در سه گام انجام می‌شود: نخست فرم یا آزمون خود را با سوال‌های دلخواه (چهارگزینه‌ای،
          تشریحی یا ترکیبی) می‌سازید؛ دوم لینک فرم را برای دانش‌آموزان، همکاران یا مخاطبان ارسال
          می‌کنید تا در هر دستگاهی پاسخ بدهند؛ سوم پس از جمع شدن پاسخ‌ها، تحلیل هوش مصنوعی
          پاسخنامه‌ها را می‌بینید و از آن برای نمره‌دهی، بازخورد یا برنامه‌ریزی بعدی استفاده
          می‌کنید. جزئیات امکانات و محدودیت‌های نسخه رایگان را در خود سایت آرشام فرم ببینید؛ این
          صفحه فقط معرفی‌کننده ابزار است.
        </p>
      </section>

      <section>
        <h2>امکانات کلیدی</h2>
        <ul className="space-y-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-1 size-5 shrink-0 text-teal-600" aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>چه زمانی از آرشام فرم استفاده کنیم؟</h2>
        <p>
          برای آزمونک‌های هفتگی کلاس، آزمون‌های جامع مدرسه، نظرسنجی از اولیا، ثبت‌نام رویدادها و
          کلاس‌ها، ارزشیابی درس توسط دانش‌آموزان و حتی فرم‌های ساده ثبت اطلاعات در محیط کار؛ هر
          جایی که باید «فرم بدهید و جواب بگیرید و از جواب‌ها نتیجه بگیرید». مزیت اصلی نسبت به
          فرم‌سازهای خارجی، فارسی و راست‌چین بودن و داشتن تحلیل هوشمند پاسخنامه بدون نیاز به
          ابزار جانبی است.
        </p>
      </section>

      <section>
        <h2>ابزارهای مرتبط در آرشام لب</h2>
        <p>
          برای محاسبه نمره و درصد قبولی آزمون از <a href="/tools/percentage-calculator">محاسبه
          درصد</a> استفاده کنید؛ اگر خلاصه متن سوال‌های تشریحی یا بازخوردهای طولانی لازم دارید،
          <a href="/tools/text-summarizer"> خلاصه‌ساز متن</a> به کارتان می‌آید و برای چاپ QR کد
          لینک آزمون روی برگه امتحان، <a href="/tools/qr-code-generator">ساخت QR Code</a> سریع‌ترین
          راه است.
        </p>
      </section>
    </ToolPageShell>
  );
}
