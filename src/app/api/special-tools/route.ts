import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { toSpecialToolDTO, validateSpecialToolInput } from "@/lib/special-tools";

export const dynamic = "force-dynamic";

/** آیا درخواست، از نشست ادمین معتبر آمده است؟ */
function isAdmin(request: NextRequest): boolean {
  return isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

/** نام ستون‌ها در Supabase snake_case است؛ ورودی JSON از کلاینت camelCase می‌آید */
function toDbRow(data: {
  title?: string;
  seoTitle?: string;
  excerpt?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  emoji?: string;
  color?: string;
  badge?: string;
  sortOrder?: number;
  visible?: boolean;
}): Record<string, unknown> {
  return {
    title: data.title,
    seo_title: data.seoTitle,
    excerpt: data.excerpt,
    description: data.description,
    url: data.url,
    image_url: data.imageUrl,
    emoji: data.emoji,
    color: data.color,
    badge: data.badge,
    sort_order: data.sortOrder,
    visible: data.visible,
  };
}

/**
 * GET /api/special-tools          → فقط ابزارهای نمایش‌داده‌شونده (عمومی)
 * GET /api/special-tools?all=1    → همه ابزارها (فقط ادمین؛ برای پنل مدیریت)
 * پاسخ شامل configured است تا پنل مدیریت در صورت تنظیم نبودن Supabase راهنمایی کند.
 */
export async function GET(request: NextRequest) {
  const wantsAll = request.nextUrl.searchParams.get("all") === "1";
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(
      { tools: [], configured: false, error: "Supabase تنظیم نشده است؛ supabase-setup.sql را اجرا کنید." },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    let query = supabase
      .from(TABLES.specialTools)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!(wantsAll && isAdmin(request))) {
      query = query.eq("visible", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(
      { tools: (data ?? []).map(toSpecialToolDTO), configured: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/special-tools failed:", error);
    return NextResponse.json(
      { tools: [], configured: true, error: "خواندن فهرست ابزارهای ویژه ممکن نشد." },
      { status: 500 }
    );
  }
}

/** POST /api/special-tools → افزودن ابزار ویژه جدید (فقط ادمین) */
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase تنظیم نشده است؛ ابتدا supabase-setup.sql را اجرا و متغیرهای محیطی را تنظیم کنید." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const parsed = validateSpecialToolInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, errors: parsed.errors }, { status: 422 });
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.specialTools)
      .insert(toDbRow(parsed.data))
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, tool: toSpecialToolDTO(data) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/special-tools failed:", error);
    return NextResponse.json(
      { ok: false, error: "ذخیره ابزار ویژه ممکن نشد." },
      { status: 500 }
    );
  }
}
