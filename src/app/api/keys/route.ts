import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest): boolean {
  return isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

interface KeyRow {
  id: string;
  provider: string;
  label: string;
  api_key: string;
  active: boolean;
  created_at: string;
}

/** پوشاندن میانه کلید برای نمایش امن در پنل: zs…1234 */
export function maskKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length <= 10) return `${trimmed.slice(0, 2)}****`;
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

/**
 * GET /api/keys → کلیدهای API ذخیره‌شده (فقط ادمین).
 * joined کلیدها را با جداکننده «&» یک‌جا می‌دهد تا ابزارهای شریک بتوانند
 * همان فرمت را بخوانند.
 */
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, configured: false, keys: [], joined: "", error: "Supabase تنظیم نشده است." },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from(TABLES.apiKeys)
    .select("id, provider, label, api_key, active, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("GET /api/keys failed:", error);
    return NextResponse.json(
      { ok: false, configured: true, keys: [], joined: "", error: "خواندن کلیدها ممکن نشد." },
      { status: 500 }
    );
  }

  const rows = (data ?? []) as KeyRow[];
  return NextResponse.json(
    {
      ok: true,
      configured: true,
      keys: rows.map((r) => ({
        id: r.id,
        label: r.label,
        active: r.active,
        masked: maskKey(r.api_key),
        createdAt: r.created_at,
      })),
      joined: rows.filter((r) => r.active).map((r) => r.api_key).join("&"),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/**
 * POST /api/keys → افزودن کلیدها (فقط ادمین).
 * ورودی: { keys: "key1&key2&key3" } — کلیدها با «&» از هم جدا می‌شوند چون
 * چند شریک کلید دارند؛ هر کلید یک ردیف جدا ذخیره می‌شود و تکراری‌ها نادیده
 * گرفته می‌شوند. پاسخ: { ok, added, duplicates, count }
 */
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase تنظیم نشده است؛ ابتدا supabase-setup.sql را اجرا کنید." },
      { status: 503 }
    );
  }

  let body: { keys?: unknown; label?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "درخواست نامعتبر است." }, { status: 400 });
  }

  // جداکننده «&» — همان چیزی که کاربر در فیلد ورودی می‌نویسد
  const raw = typeof body.keys === "string" ? body.keys : Array.isArray(body.keys) ? body.keys.join("&") : "";
  const parsedKeys = Array.from(
    new Set(
      raw
        .split("&")
        .map((k) => k.trim())
        .filter((k) => k.length >= 8 && k.length <= 200)
    )
  );

  if (parsedKeys.length === 0) {
    return NextResponse.json(
      { ok: false, error: "هیچ کلید معتبری پیدا نشد؛ کلیدها را با «&» جدا کنید (هر کلید حداقل ۸ نویسه)." },
      { status: 422 }
    );
  }

  const label = typeof body.label === "string" ? body.label.trim().slice(0, 60) : "";

  // کلیدهای موجود — برای نادیده گرفتن تکراری‌ها
  const { data: existing } = await supabase.from(TABLES.apiKeys).select("api_key");
  const existingSet = new Set(((existing ?? []) as { api_key: string }[]).map((r) => r.api_key.trim()));

  const fresh = parsedKeys.filter((k) => !existingSet.has(k));
  const duplicates = parsedKeys.length - fresh.length;

  if (fresh.length > 0) {
    const { error } = await supabase.from(TABLES.apiKeys).insert(
      fresh.map((k) => ({ provider: "z.ai", label, api_key: k, active: true }))
    );
    if (error) {
      console.error("POST /api/keys failed:", error);
      return NextResponse.json(
        { ok: false, error: "ذخیره کلیدها ممکن نشد." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true, added: fresh.length, duplicates });
}

/** DELETE /api/keys?id=… → حذف یک کلید (فقط ادمین) */
export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase تنظیم نشده است." }, { status: 503 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "شناسه کلید نامعتبر است." }, { status: 400 });
  }

  const { error } = await supabase.from(TABLES.apiKeys).delete().eq("id", id);
  if (error) {
    console.error("DELETE /api/keys failed:", error);
    return NextResponse.json({ ok: false, error: "حذف کلید ممکن نشد." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
