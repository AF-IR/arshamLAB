import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { getCategoriesWithTools, getPopularTools } from "@/lib/tools";

const QUICK_LINKS = [
  { href: "/", label: "خانه" },
  { href: "/tools", label: "همه ابزارها" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "سیاست حفظ حریم خصوصی" },
  { href: "/terms", label: "شرایط استفاده" },
  { href: "/tools", label: "معرفی ابزارها" },
];

export function SiteFooter() {
  const year = 1405; // سال شمسیِ متناسب با نسخه اولیه؛ در نگهداری به‌روز شود
  const categories = getCategoriesWithTools();
  const popular = getPopularTools().slice(0, 4);

  return (
    <footer className="mt-auto border-t bg-card" aria-label="پاورقی سایت">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FlaskConical className="size-4.5" aria-hidden="true" />
            </span>
            <span className="text-base font-extrabold" dir="ltr">
              {SITE_NAME}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {SITE_TAGLINE}؛ مجموعه‌ای از ابزارهای ساده و رایگان آنلاین که بدون ثبت‌نام
            کار می‌کنند و بیشتر پردازش‌ها مستقیماً در مرورگر شما انجام می‌شود.
          </p>
        </div>

        <nav aria-label="دسترسی سریع">
          <h2 className="text-sm font-bold">دسترسی سریع</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted-foreground transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="دسته‌بندی‌ها">
          <h2 className="text-sm font-bold">دسته‌بندی ابزارها</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/tools?cat=${c.id}`}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="پیوندهای مهم">
          <h2 className="text-sm font-bold">پیوندهای مهم</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href + l.label}>
                <Link href={l.href} className="text-muted-foreground transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
            {popular.slice(0, 2).map((t) => (
              <li key={t.slug}>
                <Link href={`/tools/${t.slug}`} className="text-muted-foreground transition-colors hover:text-primary">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-center text-xs leading-5 text-muted-foreground">
          © {year} {SITE_NAME} — {SITE_TAGLINE}. استفاده رایگان برای همه کاربران؛
          خروجی ابزارها را پیش از تصمیم‌های مهم بررسی کنید.
        </p>
      </div>
    </footer>
  );
}
