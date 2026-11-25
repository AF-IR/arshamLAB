/**
 * درگاه پرداخت زرین‌پال برای حمایت مالی — تنها محل ارتباط با API زرین‌پال.
 *
 * متغیرهای محیطی:
 *   ZARINPAL_MERCHANT_ID  → مرچنت کد (۱۲۸ نویسه در پنل زرین‌پال → تنظیمات)
 *   ZARINPAL_SANDBOX      → "true" برای محیط تست sandbox
 *   NEXT_PUBLIC_ZARINPAL_LINK → (اختیاری) لینک مستقیم حمایت مثل https://zarinp.al/XXXX
 *
 * مبالغ بر پایه «تومان» هستند و با currency=IRT به زرین‌پال ارسال می‌شوند.
 */

import { absoluteUrl } from "@/lib/site";

export const MIN_DONATION_TOMAN = 10_000;
export const MAX_DONATION_TOMAN = 100_000_000;

/** مرچنت کد زرین‌پال — فقط در سرور خوانده می‌شود */
export function getZarinpalMerchant(): string | null {
  const raw = process.env.ZARINPAL_MERCHANT_ID?.trim();
  return raw ? raw : null;
}

export function isZarinpalConfigured(): boolean {
  return getZarinpalMerchant() !== null;
}

/** لینک مستقیم حمایت (بدون API) — در نبود مرچنت کد به‌عنوان جایگزین نمایش داده می‌شود */
export function getZarinpalDirectLink(): string | null {
  const raw = process.env.NEXT_PUBLIC_ZARINPAL_LINK?.trim();
  return raw ? raw : null;
}

function getBase(): string {
  return process.env.ZARINPAL_SANDBOX === "true"
    ? "https://sandbox.zarinpal.com"
    : "https://payment.zarinpal.com";
}

interface ZarinpalV4Response {
  data?: { code?: number; authority?: string; ref_id?: number | string; card_pan?: string; message?: string } | null;
  errors?: { code?: number | string; message?: string; validations?: unknown } | null;
}

/** متن فارسی خطاهای رایج زرین‌پال */
function zarinpalErrorMessage(code: number | string | undefined, fallback?: string): string {
  switch (String(code ?? "")) {
    case "-9":
      return "تنظیمات درگاه (مرچنت کد) نامعتبر است.";
    case "-10":
    case "-11":
    case "-12":
      return "مرچنت کد فعال نیست؛ وضعیت درگاه را در پنل زرین‌پال بررسی کنید.";
    case "-15":
    case "-16":
      return "مرچنت کد بسته شده است.";
    case "-50":
      return "مبلغ پرداخت با مبلغ ثبت‌شده هم‌خوانی ندارد.";
    case "-51":
      return "پرداخت ناموفق بوده یا انجام نشده است.";
    case "-53":
      return "این پرداخت قبلاً تأیید شده است.";
    case "-54":
      return "این پرداخت نامعتبر است.";
    default:
      return fallback ?? "ارتباط با درگاه زرین‌پال برقرار نشد.";
  }
}

export interface ZarinpalRequestInput {
  amountToman: number;
  description: string;
  email?: string;
  mobile?: string;
}

export type ZarinpalResult =
  | { ok: true; authority?: string; refId?: string; cardPan?: string; alreadyVerified?: boolean }
  | { ok: false; error: string };

/** مرحله ۱: درخواست Authority و ساخت لینک پرداخت */
export async function requestZarinpalPayment(input: ZarinpalRequestInput): Promise<ZarinpalResult> {
  const merchant = getZarinpalMerchant();
  if (!merchant) return { ok: false, error: "درگاه زرین‌پال تنظیم نشده است (ZARINPAL_MERCHANT_ID)." };

  let json: ZarinpalV4Response;
  try {
    const res = await fetch(`${getBase()}/pg/v4/payment/request.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        merchant_id: merchant,
        amount: input.amountToman,
        currency: "IRT",
        description: input.description,
        // مبلغ را در callback حمل می‌کنیم تا Verify هم بدون ذخیره‌سازی ممکن باشد
        callback_url: `${absoluteUrl("/api/support/callback")}?a=${input.amountToman}`,
        metadata: {
          email: input.email || undefined,
          mobile: input.mobile || undefined,
        },
      }),
    });
    json = (await res.json()) as ZarinpalV4Response;
  } catch {
    return { ok: false, error: "ارتباط با درگاه زرین‌پال برقرار نشد؛ بعداً دوباره امتحان کنید." };
  }

  const authority = json.data?.authority;
  if (json.data?.code === 100 && authority) {
    return { ok: true, authority };
  }
  const errCode = json.errors?.code ?? json.data?.code;
  return { ok: false, error: zarinpalErrorMessage(errCode) };
}

/** آدرس شروع پرداخت کاربر */
export function zarinpalStartPayUrl(authority: string): string {
  return `${getBase()}/pg/StartPay/${authority}`;
}

/** مرحله ۲ (بازگشت از درگاه): تأیید پرداخت — کد ۱۰۰ پرداخت موفق، ۱۰۱ قبلاً تأیید شده */
export async function verifyZarinpalPayment(
  amountToman: number,
  authority: string
): Promise<ZarinpalResult> {
  const merchant = getZarinpalMerchant();
  if (!merchant) return { ok: false, error: "درگاه زرین‌پال تنظیم نشده است (ZARINPAL_MERCHANT_ID)." };

  let json: ZarinpalV4Response;
  try {
    const res = await fetch(`${getBase()}/pg/v4/payment/verify.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        merchant_id: merchant,
        amount: amountToman,
        currency: "IRT",
        authority,
      }),
    });
    json = (await res.json()) as ZarinpalV4Response;
  } catch {
    return { ok: false, error: "ارتباط برای تأیید پرداخت برقرار نشد." };
  }

  const code = json.data?.code;
  if ((code === 100 || code === 101) && json.data?.ref_id) {
    return {
      ok: true,
      refId: String(json.data.ref_id),
      cardPan: json.data.card_pan,
      alreadyVerified: code === 101,
    };
  }
  const errCode = json.errors?.code ?? code;
  return { ok: false, error: zarinpalErrorMessage(errCode, "تأیید پرداخت ناموفق بود.") };
}
