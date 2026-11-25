"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Database,
  ExternalLink,
  FlaskConical,
  Heart,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/sonner";
import {
  SPECIAL_TOOL_COLOR_LABELS,
  SPECIAL_TOOL_COLORS,
  SPECIAL_TOOL_EMOJIS,
  fetchAllSpecialTools,
  type SpecialToolDTO,
} from "@/lib/special-tools";
import { getCategoryColor, type CategoryColor } from "@/lib/category-color";
import { cn } from "@/lib/utils";

type Status = "checking" | "guest" | "authed";

interface AdminStats {
  configured: boolean;
  mode: "server" | "public" | "missing";
  specialTools: number;
  visibleSpecialTools: number;
  apiKeys: number;
  donationsCount: number;
  donationsTotal: number;
}

interface ApiKeyItem {
  id: string;
  label: string;
  active: boolean;
  masked: string;
  createdAt: string;
}

interface FormState {
  title: string;
  seoTitle: string;
  url: string;
  excerpt: string;
  description: string;
  imageUrl: string;
  emoji: string;
  color: CategoryColor;
  badge: string;
  sortOrder: string;
  visible: boolean;
}

const EMPTY_FORM: FormState = {
  title: "",
  seoTitle: "",
  url: "",
  excerpt: "",
  description: "",
  imageUrl: "",
  emoji: "✨",
  color: "pink",
  badge: "ویژه",
  sortOrder: "0",
  visible: true,
};

const faFormat = new Intl.NumberFormat("fa-IR");

export function AdminDashboard() {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [stats, setStats] = useState<AdminStats | null>(null);

  const [tools, setTools] = useState<SpecialToolDTO[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ------------------------- کلیدهای API زد.آی ------------------------- */
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [keysJoined, setKeysJoined] = useState("");
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keysInput, setKeysInput] = useState("");
  const [savingKeys, setSavingKeys] = useState(false);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (res.ok) setStats((await res.json()) as AdminStats);
    } catch {
      /* آمار اختیاری است؛ خطا نادیده گرفته می‌شود */
    }
  }, []);

  const loadTools = useCallback(async () => {
    setLoadingTools(true);
    const list = await fetchAllSpecialTools();
    setTools(list);
    setLoadingTools(false);
  }, []);

  const loadKeys = useCallback(async () => {
    setLoadingKeys(true);
    try {
      const res = await fetch("/api/keys", { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as { keys?: ApiKeyItem[]; joined?: string };
        setKeys(json.keys ?? []);
        setKeysJoined(json.joined ?? "");
      }
    } catch {
      /* بی‌صدا */
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  /* بررسی نشست در بارگذاری اولیه */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/session", { cache: "no-store" });
        const json = (await res.json()) as { authenticated?: boolean };
        if (cancelled) return;
        if (json.authenticated) {
          setStatus("authed");
          await Promise.all([loadTools(), loadStats(), loadKeys()]);
        } else {
          setStatus("guest");
        }
      } catch {
        if (!cancelled) setStatus("guest");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadTools, loadStats, loadKeys]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setPassword("");
        setStatus("authed");
        toast.success("ورود موفق بود؛ خوش آمدید!");
        await Promise.all([loadTools(), loadStats(), loadKeys()]);
      } else {
        setLoginError(json.error ?? "ورود ممکن نشد.");
      }
    } catch {
      setLoginError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setStatus("guest");
    setTools([]);
    setKeys([]);
    setKeysJoined("");
    setStats(null);
    setForm(EMPTY_FORM);
    setEditingId(null);
    toast.success("از پنل خارج شدید.");
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        seoTitle: form.seoTitle,
        url: form.url,
        excerpt: form.excerpt,
        description: form.description,
        imageUrl: form.imageUrl,
        emoji: form.emoji || "✨",
        color: form.color,
        badge: form.badge || "ویژه",
        sortOrder: Number(form.sortOrder) || 0,
        visible: form.visible,
      };
      const res = await fetch(editingId ? `/api/special-tools/${editingId}` : "/api/special-tools", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        errors?: Record<string, string>;
      };
      if (res.ok && json.ok) {
        toast.success(
          editingId
            ? "ابزار ویژه ویرایش شد."
            : "ابزار ویژه جدید اضافه شد و از همین حالا در تب ویژه نمایش داده می‌شود."
        );
        setForm(EMPTY_FORM);
        setEditingId(null);
        await Promise.all([loadTools(), loadStats()]);
      } else if (json.errors) {
        setFieldErrors(json.errors);
        toast.error("چند فیلد نیاز به اصلاح دارند.");
      } else {
        toast.error(json.error ?? "ذخیره ممکن نشد.");
      }
    } catch {
      toast.error("ارتباط با سرور برقرار نشد.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (tool: SpecialToolDTO) => {
    setEditingId(tool.id);
    setFieldErrors({});
    setForm({
      title: tool.title,
      seoTitle: tool.seoTitle,
      url: tool.url,
      excerpt: tool.excerpt,
      description: tool.description,
      imageUrl: tool.imageUrl,
      emoji: tool.emoji,
      color: tool.color,
      badge: tool.badge,
      sortOrder: String(tool.sortOrder),
      visible: tool.visible,
    });
    document.getElementById("special-tool-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleVisible = async (tool: SpecialToolDTO, visible: boolean) => {
    const res = await fetch(`/api/special-tools/${tool.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible }),
    });
    if (res.ok) {
      setTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, visible } : t)));
      toast.success(visible ? "ابزار نمایش داده می‌شود." : "ابزار مخفی شد.");
      void loadStats();
    } else {
      toast.error("تغییر وضعیت نمایش ممکن نشد.");
    }
  };

  const deleteTool = async () => {
    if (!deletingId) return;
    const res = await fetch(`/api/special-tools/${deletingId}`, { method: "DELETE" });
    if (res.ok) {
      setTools((prev) => prev.filter((t) => t.id !== deletingId));
      if (editingId === deletingId) {
        setEditingId(null);
        setForm(EMPTY_FORM);
      }
      toast.success("ابزار ویژه حذف شد.");
      void loadStats();
    } else {
      toast.error("حذف ممکن نشد.");
    }
    setDeletingId(null);
  };

  /* --------------------------- کلیدهای API --------------------------- */
  const addKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keysInput.trim()) return;
    setSavingKeys(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: keysInput }),
      });
      const json = (await res.json()) as { ok?: boolean; added?: number; duplicates?: number; error?: string };
      if (res.ok && json.ok) {
        toast.success(
          `${faFormat.format(json.added ?? 0)} کلید جدید ذخیره شد` +
            (json.duplicates ? `؛ ${faFormat.format(json.duplicates)} کلید تکراری نادیده گرفته شد.` : ".")
        );
        setKeysInput("");
        await loadKeys();
        void loadStats();
      } else {
        toast.error(json.error ?? "ذخیره کلیدها ممکن نشد.");
      }
    } catch {
      toast.error("ارتباط با سرور برقرار نشد.");
    } finally {
      setSavingKeys(false);
    }
  };

  const deleteKey = async () => {
    if (!deletingKeyId) return;
    const res = await fetch(`/api/keys?id=${deletingKeyId}`, { method: "DELETE" });
    if (res.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== deletingKeyId));
      toast.success("کلید حذف شد.");
      void loadKeys();
      void loadStats();
    } else {
      toast.error("حذف کلید ممکن نشد.");
    }
    setDeletingKeyId(null);
  };

  const copyJoined = async () => {
    if (!keysJoined) return;
    try {
      await navigator.clipboard.writeText(keysJoined);
      setCopied(true);
      toast.success("همه کلیدها (جدا شده با &) کپی شد.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("کپی ممکن نشد؛ دسترسی کلیپ‌بورد را بررسی کنید.");
    }
  };

  return (
    <>
      <Toaster position="bottom-left" richColors dir="rtl" />
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        {status === "checking" ? (
          <div className="flex min-h-40 items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            در حال بررسی نشست…
          </div>
        ) : status === "guest" ? (
          /* --------------------------- فرم ورود --------------------------- */
          <section aria-labelledby="admin-login-title" className="mx-auto mt-10 max-w-md">
            <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600">
                <ShieldCheck className="size-6" aria-hidden="true" />
              </span>
              <h1 id="admin-login-title" className="mt-4 text-xl font-extrabold">
                پنل مدیریت آرشام لب
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                این بخش فقط برای مدیر سایت است: مدیریت ابزارهای ویژه، کلیدهای API زد.آی و مشاهده
                حمایت‌های مالی. رمز عبور را وارد کنید.
              </p>
              <form onSubmit={login} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-password">رمز عبور مدیر</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="text-left"
                  />
                </div>
                {loginError ? (
                  <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                    {loginError}
                  </p>
                ) : null}
                <Button type="submit" disabled={loggingIn || password.length === 0} className="w-full">
                  {loggingIn ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
                  ورود به پنل
                </Button>
              </form>
            </div>
            <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
              رمز عبور از متغیر محیطی ADMIN_PASSWORD تنظیم می‌شود.
            </p>
          </section>
        ) : (
          /* ---------------------------- داشبورد ---------------------------- */
          <div>
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-sm">
                  <FlaskConical className="size-5.5" aria-hidden="true" />
                </span>
                <div>
                  <h1 className="text-xl font-extrabold">پنل مدیریت آرشام لب</h1>
                  <p className="text-sm text-muted-foreground">
                    ابزارهای ویژه، کلیدهای API و حمایت‌های مالی در یک‌جا
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={logout} className="shrink-0">
                <LogOut className="size-4" aria-hidden="true" />
                خروج
              </Button>
            </header>

            {/* وضعیت اتصال Supabase */}
            {stats && !stats.configured ? (
              <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-4 text-sm leading-6 text-amber-800">
                <p className="flex items-center gap-2 font-bold">
                  <Database className="size-4" aria-hidden="true" />
                  Supabase هنوز متصل نشده است
                </p>
                <p className="mt-1.5">
                  فایل <code dir="ltr" className="rounded bg-amber-500/15 px-1 font-mono text-xs">supabase-setup.sql</code> را در
                  SQL Editor سوپابیس اجرا کنید و سپس متغیرهای{" "}
                  <code dir="ltr" className="rounded bg-amber-500/15 px-1 font-mono text-xs">SUPABASE_URL</code> و{" "}
                  <code dir="ltr" className="rounded bg-amber-500/15 px-1 font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> را
                  تنظیم کنید. نام جدول‌ها با پیشوند <b dir="ltr">arshamlab_</b> ساخته می‌شوند تا روی
                  سوپابیس مشترک با پروژه‌های دیگر تداخل پیدا نکنند.
                </p>
              </div>
            ) : stats?.mode === "public" ? (
              <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-800">
                Supabase فقط با کلید عمومی تنظیم شده؛ برای ذخیره‌سازی کامل، کلید سمت سرور
                (service_role) را هم تنظیم کنید.
              </div>
            ) : (
              <p className="mt-3 rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-6 text-muted-foreground">
                ابزارهای ویژه در <Link href="/tools?filter=special" className="font-medium text-primary underline underline-offset-4">تب ویژه</Link> و
                بخش ویژه صفحه اصلی نمایش داده می‌شوند و روی دامنه خودشان باز می‌شوند.
              </p>
            )}

            {/* آمار */}
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard icon={<Sparkles className="size-4" aria-hidden="true" />} label="ابزار ویژه ثبت‌شده" value={stats ? stats.specialTools : null} />
              <StatCard icon={<Check className="size-4" aria-hidden="true" />} label="فعال در تب ویژه" value={stats ? stats.visibleSpecialTools : null} />
              <StatCard icon={<KeyRound className="size-4" aria-hidden="true" />} label="کلید API زد.آی" value={stats ? stats.apiKeys : null} />
              <StatCard
                icon={<Heart className="size-4" aria-hidden="true" />}
                label="مجموع حمایت‌های موفق"
                value={stats ? `${faFormat.format(stats.donationsTotal)} تومان` : null}
                hint={stats && stats.donationsCount > 0 ? `${faFormat.format(stats.donationsCount)} پرداخت موفق` : undefined}
              />
            </div>

            {/* ------------------------ فرم ابزار ویژه ------------------------ */}
            <form
              id="special-tool-form"
              onSubmit={submitForm}
              className="mt-8 scroll-mt-24 rounded-3xl border bg-card p-5 shadow-sm sm:p-6"
            >
              <h2 className="flex items-center gap-2 text-lg font-bold">
                {editingId ? <Pencil className="size-5 text-primary" aria-hidden="true" /> : <Plus className="size-5 text-primary" aria-hidden="true" />}
                {editingId ? "ویرایش ابزار ویژه" : "افزودن ابزار ویژه جدید"}
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="f-title">عنوان ابزار *</Label>
                  <Input
                    id="f-title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="مثلاً آرشام چت"
                    maxLength={60}
                    required
                  />
                  {fieldErrors.title ? <FieldError message={fieldErrors.title} /> : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="f-url">لینک ابزار *</Label>
                  <Input
                    id="f-url"
                    dir="ltr"
                    className="text-left"
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                    placeholder="https://example.vercel.app"
                    maxLength={300}
                    required
                  />
                  {fieldErrors.url ? <FieldError message={fieldErrors.url} /> : null}
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <Label htmlFor="f-seotitle">تگ تایتل کامل سئو (عنوان کامل‌تر)</Label>
                <Input
                  id="f-seotitle"
                  value={form.seoTitle}
                  onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                  placeholder="مثلاً: آرشام پوینت | ابزار ساخت پاورپوینت با هوش مصنوعی فارسی رایگان"
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground">
                  این عنوان در مرورگر و نتایج گوگل به‌صورت کامل نمایش داده می‌شود؛ خالی بگذارید تا
                  عنوان ساده استفاده شود.
                </p>
                {fieldErrors.seoTitle ? <FieldError message={fieldErrors.seoTitle} /> : null}
              </div>

              <div className="mt-4 space-y-1.5">
                <Label htmlFor="f-excerpt">توضیح کوتاه (روی کارت) *</Label>
                <Input
                  id="f-excerpt"
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="یک جمله کوتاه درباره کاری که ابزار انجام می‌دهد"
                  maxLength={160}
                  required
                />
                {fieldErrors.excerpt ? <FieldError message={fieldErrors.excerpt} /> : null}
              </div>

              <div className="mt-4 space-y-1.5">
                <Label htmlFor="f-description">توضیح کامل (اختیاری)</Label>
                <textarea
                  id="f-description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  maxLength={2000}
                  placeholder="توضیح بیشتر برای معرفی کامل‌تر ابزار"
                  className="flex min-h-16 w-full rounded-xl border border-input bg-transparent px-3 py-2.5 text-[15px] shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-ring"
                />
                {fieldErrors.description ? <FieldError message={fieldErrors.description} /> : null}
              </div>

              <div className="mt-4 space-y-1.5">
                <Label htmlFor="f-image">تصویر کارت (اختیاری)</Label>
                <div className="flex items-start gap-3">
                  <Input
                    id="f-image"
                    dir="ltr"
                    className="text-left flex-1"
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.png"
                    maxLength={500}
                  />
                  {form.imageUrl ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                    >
                      <X className="size-4" aria-hidden="true" />
                      حذف تصویر
                    </Button>
                  ) : (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border text-muted-foreground">
                      <ImageIcon className="size-4" aria-hidden="true" />
                    </span>
                  )}
                </div>
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt={`پیش‌نمایش تصویر ${form.title || "ابزار"}`}
                    className="mt-2 h-32 w-full max-w-xs rounded-xl border object-cover shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = "block";
                    }}
                  />
                ) : null}
                <p className="text-xs text-muted-foreground">
                  لینک مستقیم یک تصویر را بدهید تا روی کارت ابزار ویژه نمایش داده شود؛ خالی بماند فقط ایموجی دیده می‌شود.
                </p>
                {fieldErrors.imageUrl ? <FieldError message={fieldErrors.imageUrl} /> : null}
              </div>

              {/* ایموجی */}
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="f-emoji">آیکون (ایموجی)</Label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {SPECIAL_TOOL_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, emoji: em }))}
                      aria-pressed={form.emoji === em}
                      aria-label={`انتخاب آیکون ${em}`}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg border text-lg transition-all",
                        form.emoji === em
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-background hover:border-primary/40"
                      )}
                    >
                      {em}
                    </button>
                  ))}
                  <Input
                    id="f-emoji"
                    value={form.emoji}
                    onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                    className="w-16 text-center text-lg"
                    maxLength={8}
                    aria-label="ایموجی دلخواه"
                  />
                </div>
                {fieldErrors.emoji ? <FieldError message={fieldErrors.emoji} /> : null}
              </div>

              {/* رنگ */}
              <div className="mt-4 space-y-1.5">
                <Label>رنگ کارت</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIAL_TOOL_COLORS.map((c) => {
                    const style = getCategoryColor(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, color: c }))}
                        aria-pressed={form.color === c}
                        aria-label={`رنگ ${SPECIAL_TOOL_COLOR_LABELS[c]}`}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                          form.color === c
                            ? "border-primary bg-primary/10 text-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        <span className={cn("size-3 rounded-full", style.solid)} aria-hidden="true" />
                        {SPECIAL_TOOL_COLOR_LABELS[c]}
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.color ? <FieldError message={fieldErrors.color} /> : null}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="f-badge">برچسب روی کارت</Label>
                  <Input
                    id="f-badge"
                    value={form.badge}
                    onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                    maxLength={20}
                  />
                  {fieldErrors.badge ? <FieldError message={fieldErrors.badge} /> : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="f-order">ترتیب نمایش (۰ = اول)</Label>
                  <Input
                    id="f-order"
                    type="number"
                    min={0}
                    max={999}
                    dir="ltr"
                    className="text-left"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                  />
                  {fieldErrors.sortOrder ? <FieldError message={fieldErrors.sortOrder} /> : null}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Switch
                    id="f-visible"
                    checked={form.visible}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, visible: v }))}
                  />
                  <Label htmlFor="f-visible" className="cursor-pointer">
                    نمایش در تب ویژه
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  {editingId ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setForm(EMPTY_FORM);
                        setFieldErrors({});
                      }}
                    >
                      <X className="size-4" aria-hidden="true" />
                      انصراف
                    </Button>
                  ) : null}
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : editingId ? <Pencil className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
                    {editingId ? "ذخیره تغییرات" : "افزودن ابزار"}
                  </Button>
                </div>
              </div>
            </form>

            {/* ------------------------ فهرست ابزارها ------------------------ */}
            <section aria-labelledby="tools-list-title" className="mt-10">
              <h2 id="tools-list-title" className="text-lg font-bold">
                ابزارهای ویژه ثبت‌شده
              </h2>
              {loadingTools ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  در حال بارگذاری…
                </div>
              ) : tools.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                  هنوز ابزار ویژه‌ای از پنل اضافه نشده است؛ آرشام پوینت و آرشام فرم به‌صورت
                  پیش‌فرض در تب ویژه هستند.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {tools.map((tool) => {
                    const style = getCategoryColor(tool.color);
                    return (
                      <li
                        key={tool.id}
                        className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm"
                      >
                        {tool.imageUrl ? (
                          <img
                            src={tool.imageUrl}
                            alt=""
                            loading="lazy"
                            className="size-10 shrink-0 rounded-xl border object-cover"
                          />
                        ) : (
                          <span
                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-lg ${style.tile}`}
                            aria-hidden="true"
                          >
                            {tool.emoji}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2 font-bold">
                            {tool.title}
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              {tool.badge}
                            </span>
                            {!tool.visible ? (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                مخفی
                              </span>
                            ) : null}
                          </p>
                          {tool.seoTitle ? (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground" title={tool.seoTitle}>
                              تایتل سئو: {tool.seoTitle}
                            </p>
                          ) : null}
                          <p className="truncate text-xs text-muted-foreground" dir="ltr">
                            {tool.url}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex size-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                            aria-label={`باز کردن ${tool.title} در تب جدید`}
                          >
                            <ExternalLink className="size-4" aria-hidden="true" />
                          </a>
                          <div className="flex items-center gap-1.5" title="نمایش/مخفی">
                            <Switch
                              checked={tool.visible}
                              onCheckedChange={(v) => toggleVisible(tool, v)}
                              aria-label={`نمایش ${tool.title} در تب ویژه`}
                            />
                          </div>
                          <Button variant="outline" size="sm" onClick={() => startEdit(tool)}>
                            <Pencil className="size-4" aria-hidden="true" />
                            ویرایش
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletingId(tool.id)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            حذف
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* ------------------------ کلیدهای API زد.آی ------------------------ */}
            <section aria-labelledby="keys-title" className="mt-10">
              <h2 id="keys-title" className="flex items-center gap-2 text-lg font-bold">
                <KeyRound className="size-5 text-primary" aria-hidden="true" />
                کلیدهای API زد.آی (z.ai)
              </h2>
              <p className="mt-2 rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-6 text-muted-foreground">
                چون چند شریک دارید، همه کلیدها را در کادر زیر وارد کنید و با «&amp;» از هم جدا کنید؛
                هر کلید جداگانه در جدول <code dir="ltr" className="font-mono text-xs">arshamlab_api_keys</code> ذخیره می‌شود و
                کلیدهای تکراری خودکار نادیده گرفته می‌شوند. مثال:{" "}
                <code dir="ltr" className="rounded bg-background px-1 font-mono text-xs">key1&amp;key2&amp;key3</code>
              </p>

              {!stats?.configured ? (
                <p className="mt-4 rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  برای ذخیره کلیدها ابتدا Supabase را وصل کنید (راهنمای بالای صفحه).
                </p>
              ) : (
                <>
                  <form onSubmit={addKeys} className="mt-4 rounded-3xl border bg-card p-5 shadow-sm">
                    <div className="space-y-1.5">
                      <Label htmlFor="keys-input">کلیدها (با &amp; جدا شوند)</Label>
                      <textarea
                        id="keys-input"
                        dir="ltr"
                        value={keysInput}
                        onChange={(e) => setKeysInput(e.target.value)}
                        rows={3}
                        placeholder="key1&key2&key3"
                        className="w-full rounded-xl border border-input bg-transparent px-3 py-2.5 font-mono text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-ring"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        {faFormat.format(keys.length)} کلید ذخیره شده
                      </p>
                      <Button type="submit" disabled={savingKeys || !keysInput.trim()}>
                        {savingKeys ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
                        ذخیره کلیدها
                      </Button>
                    </div>
                  </form>

                  {loadingKeys ? (
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      در حال بارگذاری کلیدها…
                    </div>
                  ) : keys.length === 0 ? (
                    <p className="mt-4 rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                      هنوز کلیدی ذخیره نشده است.
                    </p>
                  ) : (
                    <div className="mt-4 rounded-2xl border bg-card p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold">
                          کلیدهای فعال: {faFormat.format(keys.filter((k) => k.active).length)}
                        </p>
                        <Button type="button" variant="outline" size="sm" onClick={copyJoined} disabled={!keysJoined}>
                          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                          کپی همه (با &amp;)
                        </Button>
                      </div>
                      <ul className="mt-3 divide-y">
                        {keys.map((k) => (
                          <li key={k.id} className="flex items-center justify-between gap-3 py-2.5">
                            <code dir="ltr" className="rounded bg-muted px-2 py-1 font-mono text-xs">
                              {k.masked}
                            </code>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => setDeletingKeyId(k.id)}
                              aria-label="حذف کلید"
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        کلیدها به‌صورت امن در Supabase ذخیره شده‌اند و با کلید عمومی قابل خواندن
                        نیستند؛ ابزارهای شریک با کلید سرویس خودشان از جدول می‌خوانند.
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </div>

      {/* تایید حذف ابزار */}
      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف ابزار ویژه؟</AlertDialogTitle>
            <AlertDialogDescription>
              این ابزار از تب ویژه و صفحه اصلی حذف می‌شود و قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTool}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              حذف کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* تایید حذف کلید */}
      <AlertDialog open={deletingKeyId !== null} onOpenChange={(open) => !open && setDeletingKeyId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کلید API؟</AlertDialogTitle>
            <AlertDialogDescription>
              ابزارهایی که از این کلید استفاده می‌کنند دیگر به آن دسترسی نخواهند داشت.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteKey}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              حذف کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string | null;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </p>
      {value === null ? (
        <div className="mt-2 h-6 w-16 animate-pulse rounded bg-muted" aria-hidden="true" />
      ) : (
        <p className="mt-1.5 text-lg font-extrabold">{typeof value === "number" ? faFormat.format(value) : value}</p>
      )}
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}
