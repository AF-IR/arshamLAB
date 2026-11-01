import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { HeaderSearch } from "@/components/header-search";
import { MobileMenu } from "@/components/mobile-menu";
import { NavLinks } from "@/components/nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
          aria-label={`${SITE_NAME} — ${SITE_TAGLINE}`}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <FlaskConical className="size-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-[17px] font-extrabold tracking-tight" dir="ltr">
              {SITE_NAME}
            </span>
            <span className="block text-xs text-muted-foreground">{SITE_TAGLINE}</span>
          </span>
        </Link>

        <NavLinks />

        <div className="flex items-center gap-1">
          <HeaderSearch />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
