import type { Metadata } from "next";
import { ToolPageShell } from "@/components/tool-page-shell";
import { RemoveExtraSpacesClient } from "@/components/tools/remove-extra-spaces-client";
import { buildToolMetadata } from "@/lib/seo";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("remove-extra-spaces")!;

export const metadata: Metadata = buildToolMetadata(tool);

export default function RemoveExtraSpacesPage() {
  return (
    <ToolPageShell
      tool={tool}
      intro="فاصله‌های تکراری، تب‌های اضافه و خطوط خالی متن را در یک لحظه پاک کنید؛ گزینه‌ها را خودتان انتخاب می‌کنید و خروجی زنده قابل کپی است."
      toolUi={<RemoveExtraSpacesClient />}
    >

      <section>
        <h2>فاصله‌های اضافی از کجا می‌آیند؟</h2>
        <p>
          وقتی متنی را از PDF کپی می‌کنید، از چند منبع ترکیب می‌کنید یا بین برنامه‌های مختلف
          جابه‌جا می‌شود، معمولاً فاصله‌های دوبله، تب‌های ناخواسته و خطوط خالی اضافه به آن
          اضافه می‌شود. این نویزه‌ها در چاپ و انتشار دیده نمی‌شوند اما در محاسبه تعداد کاراکتر،
          حجم فایل و ظاهر نهایی متن مشکل‌ساز می‌شوند. این ابزار همه حالت‌های رایج را با یک
          کلیک اصلاح می‌کند.
        </p>
      </section>

      <section>
        <h2>هر گزینه چه کاری انجام می‌دهد؟</h2>
        <ul className="list-disc space-y-1.5 pe-5">
          <li>
            <strong>حذف فاصله‌های تکراری:</strong> هر توالی از چند فاصله پشت‌سرهم به یک فاصله
            تبدیل می‌شود؛ نیم‌فاصله‌های فارسی دست‌نخورده می‌مانند.
          </li>
          <li>
            <strong>حذف فاصله ابتدا و انتهای هر خط:</strong> برای آماده‌سازی لیست‌ها و کدها
            کاربرد دارد.
          </li>
          <li>
            <strong>حذف فاصله ابتدا و انتهای کل متن:</strong> متن نهایی بدون فاصله یا خط خالی
            سر و ته تحویل می‌گیرید.
          </li>
          <li>
            <strong>تبدیل تب به فاصله:</strong> کاراکتر Tab با یک فاصله ساده جایگزین می‌شود.
          </li>
          <li>
            <strong>حذف خطوط خالی:</strong> خطوطی که فقط فاصله دارند یا کاملاً خالی‌اند حذف
            می‌شوند؛ برای به‌هم‌پیوستن پاراگراف‌های پراکنده مفید است.
          </li>
        </ul>
      </section>

      <section>
        <h2>حریم خصوصی و سرعت</h2>
        <p>
          پردازش متن کاملاً در مرورگر شما انجام می‌شود؛ متن شما هرگز به سرور ارسال یا ذخیره
          نمی‌شود. به همین دلیل ابزار حتی با متن‌های چند صد هزار کاراکتری هم سریع پاسخ می‌دهد و
          می‌توانید با خیال راحت اسناد اداری یا محتوای شخصی را پاک‌سازی کنید.
        </p>
      </section>
    </ToolPageShell>
  );
}
