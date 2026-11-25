import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** بررسی نشست ادمین برای کلاینت پنل مدیریت */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return NextResponse.json(
    { authenticated: isValidAdminToken(token) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
