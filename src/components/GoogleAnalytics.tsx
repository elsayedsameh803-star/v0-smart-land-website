"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const CONSENT_STORAGE_KEY = "smartland_cookie_consent";

function isAnalyticsAllowed(): boolean {
  if (typeof window === "undefined" || !GA_ID) return false;
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}

function loadGoogleAnalytics() {
  if (typeof window === "undefined" || !GA_ID) return;
  if (document.querySelector(`script[src*="${GA_ID}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  const initScript = document.createElement("script");
  initScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}', {
      page_path: window.location.pathname,
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure',
      anonymize_ip: true,
    });
  `;
  document.head.appendChild(initScript);
}

/**
 * Google Analytics 4 - Page View Tracker
 * Tracks page views automatically on route changes when consent is granted
 */
export function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAnalyticsAllowed() || typeof window === "undefined" || typeof (window as any).gtag !== "function") {
      return;
    }

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
 * Loads the GA4 script only after the user accepts analytics cookies.
 */
export function GoogleAnalyticsScript() {
  useEffect(() => {
    if (isAnalyticsAllowed()) {
      loadGoogleAnalytics();
    }
  }, []);

  return null;
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
