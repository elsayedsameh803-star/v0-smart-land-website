/**
 * Google Analytics Tracking Functions
 * حسابات قوقل أناليتكس والتتبع
 */

export interface AnalyticsEvent {
  event: string
  parameters?: Record<string, any>
}

/**
 * Track page view in Google Analytics
 */
export function trackPageView(page_path: string, page_title?: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path,
      page_title,
      engagement_time_msec: 100,
    })
  }
}

/**
 * Track custom event in Google Analytics
 */
export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      engagement_time_msec: 100,
      ...parameters,
    })
  }
}

/**
 * Track user action - PDF Download
 */
export function trackPDFDownload(fileName: string, language: string) {
  trackEvent('pdf_download', {
    file_name: fileName,
    language,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track user action - Analysis submission
 */
export function trackAnalysisSubmit(websiteUrl: string, analysisType: string) {
  trackEvent('analysis_submit', {
    website_url: websiteUrl,
    analysis_type: analysisType,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track social media clicks
 */
export function trackSocialClick(platform: string) {
  trackEvent('social_media_click', {
    platform,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track API call for analytics
 */
export function trackAPICall(apiName: string, status: string, responseTime?: number) {
  trackEvent('api_call', {
    api_name: apiName,
    status,
    response_time_ms: responseTime,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track language change
 */
export function trackLanguageChange(fromLang: string, toLang: string) {
  trackEvent('language_change', {
    from_language: fromLang,
    to_language: toLang,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track user engagement
 */
export function trackUserEngagement(engagementType: string, duration?: number) {
  trackEvent('user_engagement', {
    engagement_type: engagementType,
    duration_seconds: duration,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Initialize Google Analytics custom dimensions
 */
export function initializeAnalytics() {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('set', {
      'app_name': 'Smart Land Analytics',
      'app_version': '1.0.0',
      'language': document.documentElement.lang || 'en',
    })
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('set', properties)
  }
}

export default {
  trackPageView,
  trackEvent,
  trackPDFDownload,
  trackAnalysisSubmit,
  trackSocialClick,
  trackAPICall,
  trackLanguageChange,
  trackUserEngagement,
  initializeAnalytics,
  setUserProperties,
}
