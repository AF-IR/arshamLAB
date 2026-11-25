/**
 * اتصال سرور به Supabase — تنها محل ساخت کلاینت سمت سرور.
 *
 * نکته مهم: چون این پروژه روی یک نمونه (instance) مشترک Supabase اجرا می‌شود،
 * نام همه جدول‌ها با پیشوند نام سایت طولانی شده‌اند تا با پروژه‌های دیگر تداخل
 * نکنند. نام جدول‌ها را فقط از طریق TABLES استفاده کنید:
 *   arshamlab_special_tools | arshamlab_api_keys | arshamlab_donations
 *
 * متغیرهای محیطی لازم (در Vercel → Project Settings → Environment Variables):
 *   SUPABASE_URL  یا  NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  یا  SUPABASE_SECRET_KEY   (کلید سمت سرور)
 * اگر کلید سمت سرور تنظیم نشده باشد و فقط کلید عمومی (anon/publishable) باشد،
 * پنل ادمین وضعیت «محدود» نشان می‌دهد؛ نوشتن با RLS مسدود می‌شود.
 * اسکریپت ساخت جدول‌ها: supabase-setup.sql در ریشه پروژه.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** نام جدول‌ها — طولانی و با پیشوند نام سایت تا روی سوپابیس مشترک تکراری نشوند */
export const TABLES = {
  specialTools: "arshamlab_special_tools",
  apiKeys: "arshamlab_api_keys",
  donations: "arshamlab_donations",
} as const;

function getSupabaseUrl(): string | undefined {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    undefined
  );
}

/** کلید سمت سرور (service_role یا کلید جدید sb_secret_… ) */
function getServerKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    undefined
  );
}

/** کلید عمومی — فقط به‌عنوان fallback؛ با RLS معمولاً نوشتن نمی‌دهد */
function getPublicKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    undefined
  );
}

export type SupabaseMode = "server" | "public" | "missing";

/** وضعیت پیکربندی Supabase برای نمایش در پنل مدیریت */
export function getSupabaseMode(): SupabaseMode {
  if (!getSupabaseUrl()) return "missing";
  return getServerKey() ? "server" : "public";
}

let cachedClient: SupabaseClient | null = null;

/**
 * کلاینت ادمین سمت سرور (بای‌پس RLS با کلید سرویس).
 * اگر Supabase تنظیم نشده باشد null برمی‌گرداند و مسیرهای API
 * به‌جای خطای ۵۰۰، پاسخ خالی و قابل‌فهم می‌دهند.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getServerKey() ?? getPublicKey();
  if (!url || !key) return null;
  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedClient;
}
