"use client";

/**
 * Smart Land - Google Analytics & Search Console Integration
 * Google Analytics 4 (GA4) + Google Search Console
 */

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";
// Google Search Console verification
const GSC_VERIFICATION_ID = process.env.NEXT_PUBLIC_GSC_VERIFICATION || "";

/**
 * Track page view in Google Analytics
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) return;
  
  try {
    (window as any).gtag?.("config", GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  } catch (error) {
    console.warn("[Analytics] Failed to track page view:", error);
  }
}

/**
 * Track custom event
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) return;

  try {
    (window as any).gtag?.("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      send_to: GA_MEASUREMENT_ID,
    });
  } catch (error) {
    console.warn("[Analytics] Failed to track event:", error);
  }
}

/**
 * Track analysis events
 */
export function trackAnalysis(url: string, score: number, platform: string) {
  trackEvent("analysis_completed", "Analysis", platform, score);
  trackEvent("url_analyzed", "Engagement", url);
}

/**
 * Track PWA installation
 */
export function trackPwaInstall() {
  trackEvent("pwa_installed", "PWA");
}

/**
 * Track user engagement
 */
export function trackEngagement(action: string) {
  trackEvent(action, "Engagement");
}

/**
 * Get Google Search Console verification meta tag
 */
export function getGscVerificationTag(): string {
  return GSC_VERIFICATION_ID;
}

/**
 * Check if Analytics is configured
 */
export function isAnalyticsConfigured(): boolean {
  return !!GA_MEASUREMENT_ID;
}

/**
 * Check if Search Console is configured
 */
export function isSearchConsoleConfigured(): boolean {
  return !!GSC_VERIFICATION_ID;
}

// Track user timing
export function trackTiming(category: string, variable: string, value: number) {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) return;

  try {
    (window as any).gtag?.("event", "timing_complete", {
      name: variable,
      value: value,
      event_category: category,
    });
  } catch (error) {
    console.warn("[Analytics] Failed to track timing:", error);
  }
}