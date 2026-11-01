/**
 * تولید رمز عبور امن با Web Crypto API.
 * از crypto.getRandomValues با روش نمونه‌گیری طردی (rejection sampling)
 * استفاده می‌شود تا سوگیری modulo حذف شود. هرگز از Math.random استفاده نمی‌کنیم.
 */

export const CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/~",
} as const;

/** کاراکترهای بصری مبهم که بهتر است در رمز حذف شوند */
export const AMBIGUOUS_CHARS = "Il1O0o";

export interface PasswordOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 64;

function filterSet(set: string, excludeAmbiguous: boolean): string {
  if (!excludeAmbiguous) return set;
  return Array.from(set)
    .filter((ch) => !AMBIGUOUS_CHARS.includes(ch))
    .join("");
}

export function buildPool(opts: PasswordOptions): string {
  let pool = "";
  if (opts.lower) pool += filterSet(CHARSETS.lower, opts.excludeAmbiguous);
  if (opts.upper) pool += filterSet(CHARSETS.upper, opts.excludeAmbiguous);
  if (opts.digits) pool += filterSet(CHARSETS.digits, opts.excludeAmbiguous);
  if (opts.symbols) pool += filterSet(CHARSETS.symbols, opts.excludeAmbiguous);
  return pool;
}

/**
 * عدد صحیح تصادفی امن در بازه [0, max)
 * با طرد مقادیر بالای بزرگ‌ترین مضرب کامل max.
 */
export function randomInt(max: number): number {
  if (max <= 0 || !Number.isInteger(max)) throw new RangeError("max باید عدد صحیح مثبت باشد");
  const range = 0x100000000; // 2^32
  const limit = range - (range % max);
  const buf = new Uint32Array(1);
  const crypto = globalThis.crypto;
  if (!crypto?.getRandomValues) throw new Error("Web Crypto API در این محیط در دسترس نیست");
  let v: number;
  do {
    crypto.getRandomValues(buf);
    v = buf[0]!;
  } while (v >= limit);
  return v % max;
}

/** جابه‌جایی امن Fisher–Yates */
export function secureShuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export type GenerateResult =
  | { ok: true; password: string; poolSize: number }
  | { ok: false; error: string };

/** تولید رمز عبور با تضمین حضور حداقل یک کاراکتر از هر مجموعه انتخاب‌شده */
export function generatePassword(opts: PasswordOptions): GenerateResult {
  const length = Math.floor(opts.length);
  if (length < MIN_PASSWORD_LENGTH || length > MAX_PASSWORD_LENGTH) {
    return { ok: false, error: "طول رمز باید بین ۶ تا ۶۴ کاراکتر باشد." };
  }

  const sets: string[] = [];
  if (opts.lower) sets.push(filterSet(CHARSETS.lower, opts.excludeAmbiguous));
  if (opts.upper) sets.push(filterSet(CHARSETS.upper, opts.excludeAmbiguous));
  if (opts.digits) sets.push(filterSet(CHARSETS.digits, opts.excludeAmbiguous));
  if (opts.symbols) sets.push(filterSet(CHARSETS.symbols, opts.excludeAmbiguous));

  const nonEmpty = sets.filter((s) => s.length > 0);
  if (nonEmpty.length === 0) {
    return { ok: false, error: "حداقل یک نوع کاراکتر (حرف، عدد یا نماد) را انتخاب کنید." };
  }
  if (length < nonEmpty.length) {
    return { ok: false, error: "طول رمز برای پوشش همه مجموعه‌های انتخاب‌شده کافی نیست." };
  }

  const pool = buildPool(opts);
  const chars: string[] = nonEmpty.map((set) => set[randomInt(set.length)]!);
  while (chars.length < length) {
    chars.push(pool[randomInt(pool.length)]!);
  }
  const shuffled = secureShuffle(chars);
  return { ok: true, password: shuffled.join(""), poolSize: pool.length };
}

/** آنتروپی تقریبی به بیت */
export function passwordEntropyBits(poolSize: number, length: number): number {
  if (poolSize <= 1 || length <= 0) return 0;
  return Math.round(length * Math.log2(poolSize));
}

export function strengthLabel(bits: number): { label: string; level: 0 | 1 | 2 | 3 } {
  if (bits < 45) return { label: "ضعیف", level: 0 };
  if (bits < 70) return { label: "متوسط", level: 1 };
  if (bits < 100) return { label: "قوی", level: 2 };
  return { label: "بسیار قوی", level: 3 };
}
