// =============================================================================
// Smart Land - Single source of truth for the site's public base URL.
// =============================================================================
// Prevents multiple hard-coded domains drifting apart. Resolution order:
//   1. NEXT_PUBLIC_SITE_URL (set this on Vercel to the final domain)
//   2. VERCEL_URL (injected at deploy time)
//   3. A single documented fallback (update ONLY here, once).
// Used by sitemap, robots, referral links and webhook URLs.
// =============================================================================

const DEFAULT_SITE_URL = "https://smart-land.vercel.app";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  return DEFAULT_SITE_URL;
}