"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  FlaskConical,
  Loader2,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
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

interface FormState {
  title: string;
  url: string;
  excerpt: string;
  description: string;
  emoji: string;
  color: CategoryColor;
  badge: string;
  sortOrder: string;
  visible: boolean;
}

const EMPTY_FORM: FormState = {
  title: "",
  url: "",
  excerpt: "",
  description: "",
  emoji: "✨",
  color: "pink",
  badge: "ویژه",
  sortOrder: "0",
  visible: true,
};

export function AdminDashboard() {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [tools, setTools] = useState<SpecialToolDTO[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTools = useCallback(async () => {
    setLoadingTools(true);
    const list = await fetchAllSpecialTools();
    setTools(list);
    setLoadingTools(false);
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
          await loadTools();
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
  }, [loadTools]);

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
        await loadTools();
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
        url: form.url,
        excerpt: form.excerpt,
        description: form.description,
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
        toast.success(editingId ? "ابزار ویژه ویرایش شد." : "ابزار ویژه جدید اضافه شد و از همین حالا در تب ویژه نمایش داده می‌شود.");
        setForm(EMPTY_FORM);
        setEditingId(null);
        await loadTools();
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
      url: tool.url,
      excerpt: tool.excerpt,
      description: tool.description,
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
    } else {
      toast.error("حذف ممکن نشد.");
    }
    setDeletingId(null);
  };

  const visibleCount = tools.filter((t) => t.visible).length;

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
                پنل مدیریت ابزارهای ویژه
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                این بخش فقط برای مدیر سایت است. برای افزودن یا ویرایش ابزارهای ویژه، رمز عبور
                را وارد کنید.
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
                  <h1 className="text-xl font-extrabold">پنل مدیریت ابزارهای ویژه</h1>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat("fa-IR").format(tools.length)} ابزار ثبت شده
                    {" "}•{" "}
                    {new Intl.NumberFormat("fa-IR").format(visibleCount)} فعال در تب ویژه
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={logout} className="shrink-0">
                <LogOut className="size-4" aria-hidden="true" />
                خروج
              </Button>
            </header>

            <p className="mt-3 rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-6 text-muted-foreground">
              ابزارهای ویژه در <Link href="/tools?filter=special" className="font-medium text-primary underline underline-offset-4">تب ویژه</Link> و
              بخش ویژه صفحه اصلی نمایش داده می‌شوند و روی دامنه خودشان باز می‌شوند.
            </p>

            {/* فرم افزودن / ویرایش */}
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
                  placeholder="توضیح بیشتر برای مستندات داخلی یا معرفی کامل‌تر"
                  className="flex min-h-16 w-full rounded-xl border border-input bg-transparent px-3 py-2.5 text-[15px] shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-ring"
                />
                {fieldErrors.description ? <FieldError message={fieldErrors.description} /> : null}
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

            {/* فهرست ابزارها */}
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
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-lg ${style.tile}`}
                          aria-hidden="true"
                        >
                          {tool.emoji}
                        </span>
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
                          <p className="mt-0.5 truncate text-xs text-muted-foreground" dir="ltr">
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
          </div>
        )}
      </div>

      {/* تایید حذف */}
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
    </>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}
