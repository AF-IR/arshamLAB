/**
 * کمک‌تابع‌های SEO — ساخت Metadata یکسان برای همه صفحات و داده ساختاریافته.
 * URLهای Canonical همیشه از getSiteUrl() ساخته می‌شوند تا در محیط توسعه
 * اشتباهاً به دامنه تولیدی اشاره نکنند.
 */

import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_NAME_FA, SITE_TAGLINE, absoluteUrl, getSiteUrl } from "./site";
import type { Tool } from "./tools";
import { getToolCategory } from "./tools";

const OG_IMAGE = "/og.png";

interface PageMetaInput {
  title: string;
  description: string;
  /** مسیر نسبی، مثل /tools/text-counter */
  path: string;
  keywords?: string[];
}

export function buildPageMetadata({ title, description, path, keywords }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(OG_IMAGE);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME_FA}`,
      description,
      url,
      siteName: `${SITE_NAME} — ${SITE_TAGLINE}`,
      locale: SITE_LOCALE,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME_FA}`,
      description,
      images: [ogImage],
    },
  };
}

export function buildToolMetadata(tool: Tool): Metadata {
  return buildPageMetadata({
    title: tool.title,
    description: tool.description,
    path: `/tools/${tool.slug}`,
    keywords: [...tool.keywords, getToolCategory(tool).title],
  });
}

/* ------------------------------ داده ساختاریافته ----------------------------- */

export function websiteJsonLd(): Record<string, unknown> {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${SITE_NAME} | ${SITE_NAME_FA}`,
    alternateName: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: base,
    inLanguage: "fa-IR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/tools?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string; // مسیر نسبی
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
