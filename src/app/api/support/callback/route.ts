import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin, TABLES } from "@/lib/supabase";
import { verifyZarinpalPayment } from "@/lib/zarinpal";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * GET /api/support/callback → بازگشت کاربر از درگاه زرین‌پال.
 * زرین‌پال با Authority و Status=OK|NOK و پارامتر مبلغ (a) که خودمان اضافه
 * کرده‌ایم برمی‌گردد؛ پس از Verify کاربر به /support با نتیجه هدایت می‌شود.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const authority = (params.get("Authority") ?? params.get("authority") ?? "").trim();
  const status = (params.get("Status") ?? params.get("status") ?? "").trim().toUpperCase();
  const amount = Math.floor(Number(params.get("a")));

  const fail = (reason: string) =>
    NextResponse.redirect(absoluteUrl(`/support?payment=failed&reason=${reason}`), { status: 302 });

  if (!authority || authority.length < 20 || !Number.isFinite(amount) || amount <= 0) {
    return fail("invalid");
  }

  if (status !== "OK") {
    await markDonation(authority, "failed");
    return NextResponse.redirect(absoluteUrl("/support?payment=canceled"), { status: 302 });
  }

  const verification = await verifyZarinpalPayment(amount, authority);

  if (!verification.ok) {
    await markDonation(authority, "failed");
    return fail("verify");
  }

  await markDonation(authority, "paid", verification.refId ?? "", verification.cardPan ?? "");

  const ref = new URLSearchParams({
    payment: "success",
    ref: verification.refId ?? "",
    amount: String(amount),
  });
  return NextResponse.redirect(absoluteUrl(`/support?${ref.toString()}`), { status: 302 });
}

/** به‌روزرسانی وضعیت حمایت ثبت‌شده (در نبود Supabase بی‌صدا رد می‌شود) */
async function markDonation(
  authority: string,
  status: "pending" | "paid" | "failed",
  refId = "",
  cardPan = ""
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from(TABLES.donations)
      .update({ status, ref_id: refId, card_pan: cardPan })
      .eq("authority", authority);
    if (error) throw error;
  } catch (error) {
    console.error("markDonation failed:", error);
  }
}
