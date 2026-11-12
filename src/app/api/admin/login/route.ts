import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  canAttemptLogin,
  checkAdminPassword,
  clearAttempts,
  clientIpFrom,
  createAdminToken,
  recordFailedAttempt,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** ورود ادمین: POST { password } → تنظیم کوکی نشست */
export async function POST(request: NextRequest) {
  const ip = clientIpFrom(request.headers);

  if (!canAttemptLogin(ip)) {
    return NextResponse.json(
      { ok: false, error: "تلاش‌های ناموفق زیاد بوده است؛ ۱۰ دقیقه دیگر دوباره امتحان کنید." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const password = (body as { password?: unknown } | null)?.password;
  if (!checkAdminPassword(password)) {
    recordFailedAttempt(ip);
    return NextResponse.json(
      { ok: false, error: "رمز عبور نادرست است." },
      { status: 401 }
    );
  }

  clearAttempts(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}

/** خروج ادمین: حذف کوکی نشست */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
