import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { getSupabaseAdmin, getSupabaseMode, TABLES } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest): boolean {
  return isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

/** GET /api/admin/stats → آمار پنل مدیریت (فقط ادمین) */
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const stats = {
    ok: true,
    configured: supabase !== null,
    mode: getSupabaseMode(),
    specialTools: 0,
    visibleSpecialTools: 0,
    apiKeys: 0,
    donationsCount: 0,
    donationsTotal: 0,
  };

  if (!supabase) return NextResponse.json(stats);

  try {
    const [
      { count: totalCount },
      { count: visibleCount },
      { count: keyCount },
      { data: donationRows, error: donationError },
    ] = await Promise.all([
      supabase.from(TABLES.specialTools).select("*", { count: "exact", head: true }),
      supabase.from(TABLES.specialTools).select("*", { count: "exact", head: true }).eq("visible", true),
      supabase.from(TABLES.apiKeys).select("*", { count: "exact", head: true }),
      supabase.from(TABLES.donations).select("amount").eq("status", "paid").limit(5000),
    ]);

    stats.specialTools = totalCount ?? 0;
    stats.visibleSpecialTools = visibleCount ?? 0;
    stats.apiKeys = keyCount ?? 0;
    if (!donationError && donationRows) {
      stats.donationsCount = donationRows.length;
      stats.donationsTotal = (donationRows as { amount: number }[]).reduce((sum, r) => sum + (r.amount || 0), 0);
    }
  } catch (error) {
    console.error("GET /api/admin/stats failed:", error);
  }

  return NextResponse.json(stats, { headers: { "Cache-Control": "no-store" } });
}
