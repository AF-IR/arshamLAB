"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ErrorNote, FieldLabel } from "@/components/tool-ui";

/**
 * فرم تماس بدون سرور: پیام در کلاینت به یک لینک mailto تبدیل می‌شود.
 * اگر NEXT_PUBLIC_CONTACT_EMAIL تنظیم نشده باشد، فرم فعال نمی‌شود تا
 * اطلاعات تماس جعلی نمایش داده نشود.
 */
export function ContactForm({ email }: { email: string | null }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!email) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 p-5 text-sm leading-7 text-muted-foreground">
        کانال ایمیل تماس در حال حاضر فعال نیست. به‌محض راه‌اندازی ایمیل رسمی پشتیبانی،
        فرم تماس از همین صفحه در دسترس قرار می‌گیرد.
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 3) {
      setError("موضوع پیام باید حداقل ۳ نویسه باشد.");
      return;
    }
    if (body.trim().length < 10) {
      setError("متن پیام باید حداقل ۱۰ نویسه باشد.");
      return;
    }
    setError(null);
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body.trim())}`;
    window.location.href = mailto;
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <FieldLabel htmlFor="contact-subject">موضوع</FieldLabel>
        <Input
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value.slice(0, 120))}
          placeholder="مثلاً: پیشنهاد ابزار جدید"
          className="h-11 text-[15px]"
        />
      </div>
      <div>
        <FieldLabel htmlFor="contact-body">پیام شما</FieldLabel>
        <Textarea
          id="contact-body"
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 2000))}
          rows={6}
          dir="auto"
          placeholder="پیشنهاد، گزارش اشکال یا نظر خود را بنویسید…"
          className="text-[15px] leading-7"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          با ارسال، برنامه ایمیل دستگاه شما با متن آماده باز می‌شود؛ پیام مستقیم از
          مرورگر ارسال نمی‌شود.
        </p>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      <Button type="submit" className="gap-1.5">
        <Send className="size-4" aria-hidden="true" />
        ارسال پیام
      </Button>
    </form>
  );
}
