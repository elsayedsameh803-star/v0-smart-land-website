import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/admin-auth";

const locales = ["en", "ar"];
const defaultLocale = "en";

// قائمة اللغات المدعومة مع الأولوية
const localePriority: Record<string, string> = {
  "ar": "ar",
  "ar-eg": "ar",
  "ar-sa": "ar",
  "en": "en",
  "en-us": "en",
  "en-gb": "en",
};

// Security headers applied to every response
const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function getPreferredLocale(request: NextRequest): string {
  // 1. التحقق من وجود locale في الـ cookie
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. التحقق من Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    // تحليل الـ Accept-Language (مثال: "ar-EG,ar;q=0.9,en;q=0.8")
    const languages = acceptLanguage
      .split(",")
      .map((lang) => {
        const [locale, q = "q=1"] = lang.trim().split(";");
        const quality = parseFloat(q.split("=")[1] || "1");
        return { locale: locale.trim(), quality };
      })
      .sort((a, b) => b.quality - a.quality);

    // البحث عن أول لغة مدعومة
    for (const lang of languages) {
      const matchedLocale = localePriority[lang.locale.toLowerCase()];
      if (matchedLocale) return matchedLocale;

      // التحقق من اللغة الأساسية (مثال: "ar" من "ar-EG")
      const baseLocale = lang.locale.split("-")[0].toLowerCase();
      if (locales.includes(baseLocale)) return baseLocale;
    }
  }

  return defaultLocale;
}

function withSecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  // ===== Admin authentication guard =====
  if (isAdmin) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authed = token ? await verifySessionToken(token) : false;

    const isLoginPath =
      pathname === "/admin/login" || pathname === "/admin/login/";

    if (isLoginPath) {
      // Already authenticated: send away from the login page.
      if (authed) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/";
        url.search = "";
        return withSecurityHeaders(NextResponse.redirect(url));
      }
      return withSecurityHeaders(NextResponse.next());
    }

    // Protected admin area: redirect to login when not authenticated.
    if (!authed) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return withSecurityHeaders(NextResponse.redirect(url));
    }

    return withSecurityHeaders(NextResponse.next());
  }

  // استثناء مسارات API والملفات الثابتة وملفات PWA
  if (pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/_vercel") ||
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      pathname === "/manifest.json" ||
      pathname === "/sw.js" ||
      pathname.startsWith("/icons/") ||
      pathname.startsWith("/screenshots/") ||
      pathname.endsWith(".svg") ||
      pathname.endsWith(".png") ||
      pathname.endsWith(".jpg") ||
      pathname.endsWith(".ico") ||
      pathname.endsWith(".webp") ||
      pathname.endsWith(".woff2") ||
      pathname.endsWith(".woff") ||
      pathname.endsWith(".ttf")) {
    return withSecurityHeaders(NextResponse.next());
  }

  // التحقق مما إذا كان المسار يحتوي على لغة بالفعل
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith("/" + locale + "/") || pathname === "/" + locale
  );

  if (pathnameHasLocale) return withSecurityHeaders(NextResponse.next());

  // اكتشاف اللغة المفضلة للمستخدم
  const preferredLocale = getPreferredLocale(request);

  // إعادة التوجيه إلى اللغة المناسبة
  request.nextUrl.pathname = "/" + preferredLocale + pathname;
  const response = NextResponse.redirect(request.nextUrl);

  // حفظ اللغة المفضلة في cookie
  response.cookies.set("NEXT_LOCALE", preferredLocale, {
    maxAge: 60 * 60 * 24 * 365, // سنة
    path: "/",
  });

  return withSecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/|_vercel|favicon.ico|robots.txt|sitemap.xml|manifest.json|sw.js|icons/|screenshots/).*)"],
};

