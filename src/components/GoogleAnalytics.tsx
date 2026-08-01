"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/**
 * Google Analytics 4 - Page View Tracker
 * Tracks page views automatically on route changes
 */
export function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    const timeout = setTimeout(() => {
      trackPageView(url);
    }, 300);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Google Analytics 4 Script Component
 * Loads the GA4 script and initializes it
 * Uses regular script tags to avoid Next.js Script component issues in server components
 */
export function GoogleAnalyticsScript() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  if (!GA_ID) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <script
        id="google-analytics"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
              cookie_flags: 'SameSite=None;Secure',
              anonymize_ip: true,
            });
          `,
        }}
      />
    </>
  );
}

/**
 * Google Search Console Verification Meta Tag
 * Uses hardcoded fallback to ensure verification always works
 */
const GSC_VERIFICATION_ID = "JMwP_nJ4KRNImPNKdVqfgJb3yze-zjBbkEEmnlrkfso";

export function SearchConsoleVerification() {
  const GSC_ID = process.env.NEXT_PUBLIC_GSC_VERIFICATION || GSC_VERIFICATION_ID;
  if (!GSC_ID) return null;

  return (
    <meta name="google-site-verification" content={GSC_ID} />
  );
}
