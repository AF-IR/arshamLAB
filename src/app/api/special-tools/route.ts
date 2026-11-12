import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { toSpecialToolDTO, validateSpecialToolInput } from "@/lib/special-tools";

export const dynamic = "force-dynamic";

/** آیا درخواست، از نشست ادمین معتبر آمده است؟ */
function isAdmin(request: NextRequest): boolean {
  return isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

/**
 * GET /api/special-tools          → فقط ابزارهای نمایش‌داده‌شونده (عمومی)
 * GET /api/special-tools?all=1    → همه ابزارها (فقط ادمین؛ برای پنل مدیریت)
 */
export async function GET(request: NextRequest) {
  const wantsAll = request.nextUrl.searchParams.get("all") === "1";
  try {
    const tools = await db.specialTool.findMany({
      where: wantsAll && isAdmin(request) ? {} : { visible: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(
      { tools: tools.map(toSpecialToolDTO) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/special-tools failed:", error);
    return NextResponse.json(
      { tools: [], error: "خواندن فهرست ابزارهای ویژه ممکن نشد." },
      { status: 500 }
    );
  }
}

/** POST /api/special-tools → افزودن ابزار ویژه جدید (فقط ادمین) */
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز." }, { status: 401 });
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
    const created = await db.specialTool.create({
      data: {
        title: parsed.data.title ?? "",
        excerpt: parsed.data.excerpt ?? "",
        description: parsed.data.description ?? "",
        url: parsed.data.url ?? "",
        emoji: parsed.data.emoji ?? "✨",
        color: parsed.data.color ?? "pink",
        badge: parsed.data.badge ?? "ویژه",
        sortOrder: parsed.data.sortOrder ?? 0,
        visible: parsed.data.visible ?? true,
      },
    });
    return NextResponse.json({ ok: true, tool: toSpecialToolDTO(created) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/special-tools failed:", error);
    return NextResponse.json(
      { ok: false, error: "ذخیره ابزار ویژه ممکن نشد." },
      { status: 500 }
    );
  }
}
