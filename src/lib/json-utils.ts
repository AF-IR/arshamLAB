/**
 * منطق قالب‌بندی و اعتبارسنجی JSON با پیام خطای قابل فهم فارسی.
 */

export interface JsonFormatOptions {
  indent: number; // تعداد فاصله برای تورفتگی (۲ یا ۴)
  sortKeys: boolean;
}

export interface JsonErrorInfo {
  message: string;
  line?: number;
  column?: number;
}

export type JsonFormatResult =
  | { ok: true; result: string; inBytes: number; outBytes: number }
  | { ok: false; error: JsonErrorInfo };

function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a < b ? -1 : a > b ? 1 : 0
    );
    const out: Record<string, unknown> = {};
    for (const [k, v] of entries) out[k] = sortDeep(v);
    return out;
  }
  return value;
}

/** استخراج موقعیت خطا از پیام موتور جاوااسکریپت و تبدیل به خط/ستون */
function locateError(src: string, message: string): { line?: number; column?: number } {
  const m = /position\s+(\d+)/i.exec(message);
  if (!m) return {};
  const pos = Number(m[1]);
  if (!Number.isInteger(pos) || pos < 0 || pos > src.length) return {};
  const upto = src.slice(0, pos);
  const line = upto.split("\n").length;
  const column = pos - upto.lastIndexOf("\n");
  return { line, column };
}

/** تبدیل پیام خطای موتور جاوااسکریپت (V8/JSC) به توضیح فارسی قابل فهم */
export function toPersianMessage(message: string): string {
  if (/unexpected end of json input|unexpected eof/i.test(message)) {
    return "JSON ناقص است؛ احتمالاً یک آکولاد، براکت یا گیومه بسته نشده است.";
  }
  if (/unexpected token|unexpected identifier|unexpected string|unexpected number/i.test(message)) {
    return "کاراکتر غیرمنتظره‌ای پیدا شد؛ معمولاً علت آن کامای اضافه، گیومه اشتباه (باید دابل‌کوت \") یا نوشتن کلید بدون گیومه است.";
  }
  if (/expected/i.test(message)) {
    return "ساختار JSON ناقص یا نادرست است؛ بسته‌شدن آکولادها و براکت‌ها، دابل‌کوت بودن کلیدها و نبودن کامای اضافی را بررسی کنید.";
  }
  if (/is not valid json/i.test(message)) {
    return "این متن JSON معتبر نیست؛ ساختار و گیومه‌ها را بررسی کنید.";
  }
  return `JSON نامعتبر است: ${message}`;
}

/** قالب‌بندی/فشرده‌سازی JSON با مدیریت کامل خطا */
export function formatJson(input: string, opts: JsonFormatOptions): JsonFormatResult {
  const inBytes = byteLength(input);
  if (!input.trim()) {
    return { ok: false, error: { message: "ورودی خالی است؛ یک متن JSON وارد کنید." } };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (e) {
    const err = e instanceof SyntaxError ? e : new SyntaxError(String(e));
    const loc = locateError(input, err.message);
    return { ok: false, error: { message: toPersianMessage(err.message), ...loc } };
  }

  if (opts.sortKeys) parsed = sortDeep(parsed);
  const indentKind = opts.indent === 4 ? 4 : 2;
  const result = JSON.stringify(parsed, null, indentKind);
  return { ok: true, result, inBytes, outBytes: byteLength(result) };
}

/** فشرده‌سازی (Minify) */
export function minifyJson(input: string): JsonFormatResult {
  const res = formatJson(input, { indent: 0, sortKeys: false });
  if (res.ok) {
    const compact = JSON.stringify(JSON.parse(input));
    return { ok: true, result: compact, inBytes: res.inBytes, outBytes: byteLength(compact) };
  }
  return res;
}
