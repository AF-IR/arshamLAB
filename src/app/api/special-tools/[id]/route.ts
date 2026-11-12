import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { toSpecialToolDTO, validateSpecialToolInput } from "@/lib/special-tools";

export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest): boolean {
  return isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

/** PUT /api/special-tools/[id] → ویرایش ابزار ویژه (فقط ادمین) */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "دسترسی غیرمجاز." }, { status: 401 });
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
    const updated = await db.specialTool.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ ok: true, tool: toSpecialToolDTO(updated) });
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

  const { id } = await params;

  try {
    await db.specialTool.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/special-tools/${id} failed:`, error);
    return NextResponse.json(
      { ok: false, error: "حذف ابزار ویژه ممکن نشد؛ شاید قبلاً حذف شده باشد." },
      { status: 500 }
    );
  }
}
