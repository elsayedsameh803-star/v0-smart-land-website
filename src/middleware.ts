import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "ar"];
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith("/" + locale + "/") || pathname === "/" + locale
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Redirect to default locale (for /api routes, don't redirect)
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // Add default locale
  request.nextUrl.pathname = "/" + defaultLocale + pathname;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next/|_vercel|favicon.ico|robots.txt|sitemap.xml).*)"],
};
