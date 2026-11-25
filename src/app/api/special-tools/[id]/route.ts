import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { toSpecialToolDTO, validateSpecialToolInput } from "@/lib/special-tools";

export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest): boolean {
  return isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

/** نام ستون‌های snake_case در Supabase */
function toDbRow(data: Record<string, unknown>): Record<string, unknown> {
  const map: Record<string, string> = {
    title: "title",
    seoTitle: "seo_title",
    excerpt: "excerpt",
    description: "description",
    url: "url",
    imageUrl: "image_url",
    emoji: "emoji",
    color: "color",
    badge: "badge",
    sortOrder: "sort_order",
    visible: "visible",
  };
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const col = map[key];
    if (col && value !== undefined) row[col] = value;
  }
  return row;
}

/** PUT /api/special-tools/[id] → ویرایش ابزار ویژه (فقط ادمین) */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase تنظیم نشده است." },
      { status: 503 }
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const parsed = validateSpecialToolInput(body, { partial: true });
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, errors: parsed.errors }, { status: 422 });
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.specialTools)
      .update(toDbRow(parsed.data))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, tool: toSpecialToolDTO(data) });
  } catch (error) {
    console.error(`PUT /api/special-tools/${id} failed:`, error);
    return NextResponse.json(
      { ok: false, error: "ویرایش ابزار ویژه ممکن نشد؛ شاید حذف شده باشد." },
      { status: 500 }
    );
  }
}

/** DELETE /api/special-tools/[id] → حذف ابزار ویژه (فقط ادمین) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase تنظیم نشده است." },
      { status: 503 }
    );
  }

  const { id } = await params;

  try {
    const { error } = await supabase.from(TABLES.specialTools).delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/special-tools/${id} failed:`, error);
    return NextResponse.json(
      { ok: false, error: "حذف ابزار ویژه ممکن نشد؛ شاید قبلاً حذف شده باشد." },
      { status: 500 }
    );
  }
}
