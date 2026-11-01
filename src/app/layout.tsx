import type { Metadata, Viewport } from "next";
import { vazirmatn } from "@/lib/fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { websiteJsonLd } from "@/lib/seo";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_NAME_FA,
  SITE_TAGLINE,
  absoluteUrl,
  getSiteUrl,
} from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME_FA} | ابزارهای کاربردی و رایگان آنلاین`,
    template: `%s | ${SITE_NAME_FA}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "ابزارهای آنلاین",
    "ابزار رایگان",
    "ابزارهای کاربردی",
    "آرشام لب",
    "بدون ثبت‌نام",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: absoluteUrl("/"),
    siteName: `${SITE_NAME} — ${SITE_TAGLINE}`,
    title: `${SITE_NAME_FA} | ابزارهای کاربردی و رایگان آنلاین`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: absoluteUrl("/og.png"),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME_FA} | ابزارهای کاربردی و رایگان آنلاین`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d9488",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  );
}
