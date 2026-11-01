"use client";

import { useState } from "react";
import { Braces, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { CheckOption, ErrorNote, FieldLabel, InfoNote, NativeSelect, ResultBox } from "@/components/tool-ui";
import { formatJson, minifyJson } from "@/lib/json-utils";
import { faInt } from "@/lib/text-utils";

const MAX_LENGTH = 1_000_000;

/** ابزار ۸: فرمت‌کننده JSON — زیباسازی، فشرده‌سازی، مرتب‌سازی کلیدها و خطای فارسی */
export function JsonFormatterClient() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState("2");
  const [sortKeys, setSortKeys] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [stats, setStats] = useState<{ inBytes: number; outBytes: number; compact: boolean } | null>(null);
  const [error, setError] = useState<{ message: string; line?: number; column?: number } | null>(null);

  const run = (kind: "beautify" | "minify") => {
    const res = kind === "beautify"
      ? formatJson(input, { indent: Number(indent) || 2, sortKeys })
      : minifyJson(input);
    if (res.ok) {
      setOutput(res.result);
      setStats({ inBytes: res.inBytes, outBytes: res.outBytes, compact: kind === "minify" });
      setError(null);
    } else {
      setError(res.error);
      setOutput(null);
      setStats(null);
    }
  };

  const download = () => {
    if (output === null) return;
    const blob = new Blob([output], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const kb = (n: number) =>
    n < 1024 ? `${faInt(n)} بایت` : `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(n / 1024)} کیلوبایت`;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <FieldLabel htmlFor="json-input">JSON ورودی</FieldLabel>
          <div className="mb-1.5 flex items-center gap-3">
            <NativeSelect
              id="json-indent"
              ariaLabel="تعداد فاصله تورفتگی"
              value={indent}
              onChange={setIndent}
              options={[
                { value: "2", label: "تورفتگی ۲ فاصله" },
                { value: "4", label: "تورفتگی ۴ فاصله" },
              ]}
            />
          </div>
        </div>
        <Textarea
          id="json-input"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_LENGTH))}
          rows={8}
          dir="ltr"
          spellCheck={false}
          placeholder='{"name":"Arsham Lab","free":true,"tools":["qr","json"]}'
          className="min-h-40 font-mono text-[13.5px] leading-6"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <CheckOption
          name="json-sort"
          label="مرتب‌سازی کلیدها بر اساس حروف الفبا"
          checked={sortKeys}
          onChange={setSortKeys}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => run("beautify")} disabled={!input.trim()} className="gap-1.5">
          <Braces className="size-4" aria-hidden="true" />
          زیباسازی
        </Button>
        <Button type="button" variant="outline" onClick={() => run("minify")} disabled={!input.trim()} className="gap-1.5">
          فشرده‌سازی
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setInput("");
            setOutput(null);
            setError(null);
            setStats(null);
          }}
          disabled={!input}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          پاک کردن
        </Button>
      </div>

      {error && (
        <ErrorNote>
          {error.message}
          {error.line !== undefined && (
            <span className="mt-1 block font-mono text-xs" dir="ltr">
              line {error.line}, column {error.column}
            </span>
          )}
        </ErrorNote>
      )}

      {output !== null && (
        <div aria-live="polite">
          <ResultBox
            title="خروجی"
            actions={
              <>
                <CopyButton text={output} label="کپی خروجی" />
                <Button type="button" variant="outline" onClick={download} className="gap-1.5">
                  <Download className="size-4" aria-hidden="true" />
                  دانلود فایل JSON
                </Button>
              </>
            }
          >
            <pre
              dir="ltr"
              className="max-h-96 overflow-auto rounded-lg bg-card p-3 text-left font-mono text-[13px] leading-6 thin-scrollbar"
            >
              {output}
            </pre>
            {stats && (
              <p className="mt-2.5 text-xs text-muted-foreground">
                {stats.compact ? "پس از فشرده‌سازی" : "پس از قالب‌بندی"}: {kb(stats.outBytes)} (ورودی: {kb(stats.inBytes)})
              </p>
            )}
          </ResultBox>
        </div>
      )}

      {!output && !error && (
        <InfoNote>
          متن JSON خود را بچسبانید و «زیباسازی» یا «فشرده‌سازی» را بزنید؛ خطاهای ساختاری با
          شماره خط و ستون به فارسی نمایش داده می‌شوند. پردازش کاملاً در مرورگر انجام می‌شود.
        </InfoNote>
      )}
    </div>
  );
}
