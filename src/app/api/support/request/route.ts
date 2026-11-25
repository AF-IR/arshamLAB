import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import {
  MAX_DONATION_TOMAN,
  MIN_DONATION_TOMAN,
  requestZarinpalPayment,
  zarinpalStartPayUrl,
} from "@/lib/zarinpal";

export const dynamic = "force-dynamic";

/**
 * POST /api/support/request → شروع پرداخت حمایت مالی با زرین‌پال.
 * ورودی: { amount: تومان, name?, email?, message? }
 * خروجی: { ok: true, redirectUrl } یا { ok: false, error }
 */
export async function POST(request: NextRequest) {
  let body: { amount?: unknown; name?: unknown; email?: unknown; message?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const amount = Math.floor(Number(body.amount));
  if (!Number.isFinite(amount) || amount < MIN_DONATION_TOMAN || amount > MAX_DONATION_TOMAN) {
    return NextResponse.json(
      {
        ok: false,
        error: `مبلغ باید بین ${new Intl.NumberFormat("fa-IR").format(MIN_DONATION_TOMAN)} و ${new Intl.NumberFormat("fa-IR").format(MAX_DONATION_TOMAN)} تومان باشد.`,
      },
      { status: 422 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
  const email = typeof body.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
    ? body.email.trim().slice(0, 120)
    : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 300) : "";

  const payment = await requestZarinpalPayment({
    amountToman: amount,
    description: `حمایت مالی از آرشام لب`,
    email: email || undefined,
  });

  if (!payment.ok) {
    return NextResponse.json({ ok: false, error: payment.error }, { status: 502 });
  }
  if (!payment.authority) {
    return NextResponse.json(
      { ok: false, error: "درگاه پرداخت پاسخ معتبری برنگرداند؛ دوباره امتحان کنید." },
      { status: 502 }
    );
  }

  // ثبت ردیف «در انتظار پرداخت» — در callback پس از Verify وضعیت به‌روز می‌شود
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error: insertError } = await supabase.from(TABLES.donations).insert({
      authority: payment.authority,
      amount,
      status: "pending",
      supporter_name: name,
      message,
    });
    if (insertError) {
      console.error("donation insert failed:", insertError);
    }
  }

  return NextResponse.json({ ok: true, redirectUrl: zarinpalStartPayUrl(payment.authority) });
}
