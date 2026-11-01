import type { Metadata } from "next";
import { ToolPageShell } from "@/components/tool-page-shell";
import { NumberConverterClient } from "@/components/tools/number-converter-client";
import { buildToolMetadata } from "@/lib/seo";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("number-converter")!;

export const metadata: Metadata = buildToolMetadata(tool);

export default function NumberConverterPage() {
  return (
    <ToolPageShell
      tool={tool}
      intro="ارقام فارسی، انگلیسی و عربی را به یکدیگر تبدیل کنید؛ فقط ارقام عوض می‌شوند و حروف، علائم و ساختار متن دقیقاً حفظ می‌شود."
      toolUi={<NumberConverterClient />}
    >

      <section>
        <h2>چرا ارقام متن‌ها مخلوط می‌شوند؟</h2>
        <p>
          متون فارسی معمولاً ترکیبی از ارقام فارسی (۰۱۲۳)، انگلیسی (0123) و گاهی ارقام عربی
          (٠١٢٣) هستند؛ مثلاً متنی که از نرم‌افزارهای قدیمی یا صفحات عربی کپی شود ارقام عربی
          دارد و داده‌هایی که از سیستم‌های بانکی خارج می‌شوند اغلب انگلیسی‌اند. برای جست‌وجو،
          مرتب‌سازی، ورود به نرم‌افزار حسابداری یا انتشار یکدست در وب، باید همه ارقام به یک
          شکل تبدیل شوند.
        </p>
      </section>

      <section>
        <h2>حالت‌های تبدیل</h2>
        <ul className="list-disc space-y-1.5 pe-5">
          <li>
            <strong>فارسی به انگلیسی:</strong> ارقام فارسی و عربی هر دو به ارقام انگلیسی تبدیل
            می‌شوند؛ مناسب فرم‌ها، شماره‌ها و کدهایی که فقط عدد لاتین می‌پذیرند.
          </li>
          <li>
            <strong>انگلیسی به فارسی:</strong> برای یکدست‌سازی متن فارسی برای انتشار در وب یا
            چاپ.
          </li>
          <li>
            <strong>عربی به فارسی:</strong> فقط ارقام عربی به فارسی تبدیل می‌شود و ارقام
            انگلیسی دست‌نخورده می‌مانند.
          </li>
        </ul>
      </section>

      <section>
        <h2>حفظ سایر بخش‌های متن</h2>
        <p>
          این ابزار عمداً فقط ارقام را تغییر می‌دهد؛ حروف فارسی، علائم نگارشی، نیم‌فاصله‌ها و
          خطوط دقیقاً همان‌طور که هستند باقی می‌مانند. پس می‌توانید یک پاراگراف کامل، جدول یا
          گزارش را یک‌جا بچسبانید و خروجی را بدون هیچ تغییر دیگری کپی کنید. تبدیل به‌صورت زنده
          انجام می‌شود و همه‌چیز در مرورگر شما پردازش می‌شود.
        </p>
      </section>
    </ToolPageShell>
  );
}
