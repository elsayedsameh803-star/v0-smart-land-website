// =============================================================================
// Smart Land - Single source of truth for the site's public base URL.
// =============================================================================
// Prevents multiple hard-coded domains drifting apart. Resolution order:
//   1. NEXT_PUBLIC_SITE_URL (set this on Vercel to the final domain)
//   2. The canonical production domain (this file) — used in PRODUCTION so that
//      sitemap.xml / robots.txt / canonicals never leak a preview URL.
//   3. VERCEL_URL (only for non-production preview deployments)
// Used by sitemap, robots, referral links and webhook URLs.
// =============================================================================

// IMPORTANT: this fallback is only used when NEXT_PUBLIC_SITE_URL is not set.
// It MUST point to the real production domain (smart-land-theta.vercel.app),
// otherwise sitemap.xml / robots.txt / canonicals leak a wrong or preview URL.
const DEFAULT_SITE_URL = "https://smart-land-theta.vercel.app";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  // In production, always use the canonical domain — never the preview VERCEL_URL.
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return DEFAULT_SITE_URL;
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  return DEFAULT_SITE_URL;
}