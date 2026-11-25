import type { Metadata } from "next";
import { ArrowUpLeft, CheckCircle2, Presentation, Wand2 } from "lucide-react";
import { ToolPageShell } from "@/components/tool-page-shell";
import { buildToolMetadata } from "@/lib/seo";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("arsham-point")!;
const ARSHAM_POINT_URL = tool.externalUrl ?? "https://arshampoint.vercel.app";

export const metadata: Metadata = buildToolMetadata(tool);

const FEATURES = [
  "ساخت کامل ارائه فارسی از روی موضوع؛ بدون طراحی دستی اسلاید",
  "خروجی HTML راست‌چین با فونت فارسی که در هر مرورگری اجرا می‌شود",
  "قالب‌های طراحی آماده با پالت‌های رنگی متنوع و تم روشن و تاریک",
  "اسلایدهای عنوان، دستور جلسه، آمار، نقل‌قول، تایم‌لاین و جمع‌بندی",
  "قابل استفاده آنلاین بدون نصب؛ فایل نهایی مالک شماست و قابل دانلود",
];

export default function ArshamPointPage() {
  return (
    <ToolPageShell
      tool={tool}
      intro="آرشام پوینت ابزار هوش مصنوعی ساخت ارائه فارسی است: موضوع ارائه را بنویسید تا اسلایدهای کامل با طراحی حرفه‌ای ساخته شود؛ خروجی HTML قابل اجرا و دانلود."
      toolUi={
        <section
          aria-label="رفتن به آرشام پوینت"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-pink-600 via-fuchsia-600 to-violet-700 p-6 text-white shadow-lg sm:p-8"
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
              <Wand2 className="size-3.5" aria-hidden="true" />
              ابزار هوش مصنوعی آرشام
            </p>
            <h2 className="mt-4 text-2xl font-extrabold leading-relaxed sm:text-3xl">
              ارائه بعدی‌ات را هوش مصنوعی بسازد
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-8 text-white/90">
              کافی است موضوع، مخاطب و تعداد اسلاید را مشخص کنید. آرشام پوینت ساختار، متن و
              طراحی هر اسلاید را آماده می‌کند و یک فایل HTML فارسی و راست‌چین تحویل می‌دهد که در
              هر مرورگر و سیستم‌عاملی اجرا می‌شود.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={ARSHAM_POINT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-fuchsia-700 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-white"
              >
                <Presentation className="size-5" aria-hidden="true" />
                ورود به آرشام پوینت
                <ArrowUpLeft className="size-4" aria-hidden="true" />
              </a>
              <span className="text-xs text-white/75" dir="ltr">
                arshampoint.vercel.app
              </span>
            </div>
          </div>
        </section>
      }
    >
      <section>
        <h2>آرشام پوینت چیست؟</h2>
        <p>
          آرشام پوینت یک ابزار آنلاین هوش مصنوعی برای ساخت ارائه‌های فارسی است. به‌جای شروع از
          یک قالب خالی پاورپوینت و نوشتن تک‌تک اسلایدها، فقط موضوع ارائه، مخاطب هدف، لحن و تعداد
          اسلاید را مشخص می‌کنید؛ هوش مصنوعی ساختار کامل ارائه را پیشنهاد می‌دهد، متن هر اسلاید
          را می‌نویسد و طراحی رنگی و چیدمان را آماده می‌کند. خروجی نهایی یک فایل HTML یکپارچه و
          راست‌چین است که روی هر مرورگر و هر سیستم‌عاملی بدون نصب برنامه باز می‌شود.
        </p>
      </section>

      <section>
        <h2>چطور از آرشام پوینت استفاده کنیم؟</h2>
        <p>
          کار در سه گام انجام می‌شود: اول موضوع ارائه را با توضیح مخاطب و تعداد اسلاید دلخواه
          می‌نویسید؛ دوم هوش مصنوعی ساختار، محتوا و تصاویر را می‌سازد (معمولاً در حدود نیم
          دقیقه)؛ سوم ارائه را در مرورگر مرور می‌کنید یا فایل HTML آن را دانلود و همیشگی نگه
          می‌دارید. امکان مرور اسلایدها با کلید جهت‌دار، نمای کلی اسلایدها و نمایش تمام‌صفحه هم
          برای ارائه زنده در نظر گرفته شده است.
        </p>
      </section>

      <section>
        <h2>امکانات کلیدی</h2>
        <ul className="space-y-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-1 size-5 shrink-0 text-pink-600" aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>چه زمانی از آرشام پوینت استفاده کنیم؟</h2>
        <p>
          برای ارائه کلاسی و دانشگاهی، معرفی محصول به مشتری، گزارش تیمی هفتگی، دفاع پروژه و هر
          جایی که وقت طراحی اسلاید ندارید، آرشام پوینت نقطه شروع کامل و فارسی می‌دهد. خروجی HTML
          مزیت دارد: نیازی به نصب PowerPoint ندارید، روی موبایل هم باز می‌شود و فایل سبکی است
          که راحت ارسال می‌شود. جزئیات نسخه‌ها، محدودیت‌های استفاده رایگان و قیمت‌گذاری را در
          خود سایت آرشام پوینت ببینید؛ این صفحه فقط معرفی‌کننده است.
        </p>
      </section>

      <section>
        <h2>ابزارهای مرتبط در آرشام لب</h2>
        <p>
          اگر متن ارائه‌تان طولانی است، ابتدا با <a href="/tools/text-summarizer">خلاصه‌ساز
          متن</a> نکات اصلی را استخراج کنید؛ برای ساخت QR کد روی اسلاید پایانی (مثلاً لینک
          تماس) از <a href="/tools/qr-code-generator">ساخت QR Code</a> استفاده کنید و عکس‌های
          سنگین اسلایدها را با <a href="/tools/image-compressor">کم کردن حجم عکس</a> سبک
          کنید تا فایل ارائه سریع‌تر باز شود.
        </p>
      </section>
    </ToolPageShell>
  );
}
