-- ============================================================================
-- Arsham Lab — اسکریپت ساخت جدول‌های Supabase
-- ----------------------------------------------------------------------------
-- چرا نام جدول‌ها طولانی است؟ چون این پروژه روی یک نمونه Supabase مشترک با
-- پروژه‌های دیگر اجرا می‌شود، همه جدول‌ها با پیشوند نام سایت «arshamlab_»
-- ساخته می‌شوند تا با هیچ پروژه دیگری تداخل (تکراری) پیدا نکنند.
--
-- روش اجرا:
--   1. وارد داشبورد Supabase شوید → SQL Editor → New query
--   2. کل این فایل را paste کنید و Run بزنید (چند بار اجرا هم بی‌ضرر است)
--   3. متغیرهای محیطی را در Vercel تنظیم کنید:
--        SUPABASE_URL  (یا NEXT_PUBLIC_SUPABASE_URL)
--        SUPABASE_SERVICE_ROLE_KEY  (Settings → API → service_role)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) ابزارهای ویژه مدیریت‌شده از پنل ادمین (/admin)
--    در «تب ویژه» صفحه /tools و بخش ویژه صفحه اصلی نمایش داده می‌شوند.
-- ---------------------------------------------------------------------------
create table if not exists public.arshamlab_special_tools (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  -- تگ تایتل کامل برای سئو؛ مثال:
  -- «آرشام پوینت | ابزار ساخت پاورپوینت با هوش مصنوعی فارسی رایگان»
  seo_title   text not null default '',
  excerpt     text not null,
  description text not null default '',
  url         text not null,
  -- تصویر کارت (آدرس کامل تصویر)؛ خالی بودن یعنی فقط ایموجی نمایش داده شود
  image_url   text not null default '',
  emoji       text not null default '✨',
  color       text not null default 'pink',
  badge       text not null default 'ویژه',
  sort_order  integer not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists arshamlab_special_tools_order_idx
  on public.arshamlab_special_tools (sort_order asc, created_at asc);

-- ---------------------------------------------------------------------------
-- 2) کلیدهای API زد.آی (z.ai)
--    چند شریک داریم؛ کلیدها از پنل ادمین با جداکننده «&» وارد و هر کلید
--    به‌صورت یک ردیف ذخیره می‌شود تا هر ابزار شریک یک کلید بردارد.
--    خواندن مستقیم جدول با کلید عمومی (anon) مسدود است؛ هر ابزار شریک با
--    کلید سرویس (service_role) خودش می‌تواند این جدول را بخواند.
-- ---------------------------------------------------------------------------
create table if not exists public.arshamlab_api_keys (
  id         uuid primary key default gen_random_uuid(),
  provider   text not null default 'z.ai',
  label      text not null default '',
  api_key    text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3) حمایت‌های مالی زرین‌پال
--    هر پرداخت پس از بازگشت از درگاه زرین‌پال و Verify موفق ثبت می‌شود.
-- ---------------------------------------------------------------------------
create table if not exists public.arshamlab_donations (
  id             uuid primary key default gen_random_uuid(),
  authority      text not null default '',
  ref_id         text not null default '',
  amount         integer not null,          -- به تومان
  status         text not null default 'pending', -- pending | paid | failed
  card_pan       text not null default '',
  supporter_name text not null default '',
  message        text not null default '',
  created_at     timestamptz not null default now()
);

create index if not exists arshamlab_donations_status_idx
  on public.arshamlab_donations (status, created_at desc);

-- ---------------------------------------------------------------------------
-- به‌روزرسانی خودکار updated_at برای ابزارهای ویژه
-- ---------------------------------------------------------------------------
create or replace function public.arshamlab_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists arshamlab_special_tools_updated_at
  on public.arshamlab_special_tools;

create trigger arshamlab_special_tools_updated_at
  before update on public.arshamlab_special_tools
  for each row execute function public.arshamlab_set_updated_at();

-- ---------------------------------------------------------------------------
-- امنیت (RLS)
--   نوشتن فقط از سرور سایت با کلید سرویس انجام می‌شود؛ بنابراین برای anon
--   هیچ اجازه نوشتن وجود ندارد. فقط خواندن ابزارهای «نمایش‌داده‌شونده» عمومی است.
-- ---------------------------------------------------------------------------
alter table public.arshamlab_special_tools enable row level security;
alter table public.arshamlab_api_keys       enable row level security;
alter table public.arshamlab_donations      enable row level security;

drop policy if exists "arshamlab public read visible special tools"
  on public.arshamlab_special_tools;

create policy "arshamlab public read visible special tools"
  on public.arshamlab_special_tools
  for select to anon, authenticated
  using (visible = true);

-- جدول کلیدهای API و حمایت‌های مالی برای anon هیچ پالیسی ندارند؛ یعنی با
-- کلید عمومی قابل خواندن نیستند و فقط سرور (کلید سرویس) به آن‌ها دسترسی دارد.
