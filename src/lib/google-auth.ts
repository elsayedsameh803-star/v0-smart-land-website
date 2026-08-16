// =============================================================================
// Smart Land - Google OAuth (Google Sign-In) helpers
// Stateless, SDK-free Google OAuth 2.0 (authorization code flow) for admin.
// Uses Google's public OAuth endpoints directly with fetch + verified id_token.
//
// Required env vars (Vercel):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
//   ADMIN_ALLOWED_EMAILS (comma separated) OR ADMIN_EMAIL
//
// Security: we always verify email_verified === true on the id_token and only
// allow an email that is explicitly listed. If OAuth is not configured we fail
// closed (no one can log in) instead of falling back to a password.
// =============================================================================

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
}

export function getGoogleRedirectUri(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base.replace(/\/+$/, "")}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID as string;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface GoogleProfile {
  email: string;
  emailVerified: boolean;
  name: string;
  sub: string;
}

/**
 * Exchanges an authorization code for a verified Google profile.
 * Returns null on any failure or if the email is not verified.
 */
export async function exchangeCodeForToken(
  code: string
): Promise<GoogleProfile | null> {
  if (!isGoogleOAuthConfigured() || !code) return null;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        redirect_uri: getGoogleRedirectUri(),
        grant_type: "authorization_code",
      }).toString(),
    });
    if (!tokenRes.ok) return null;
    const tokenJson: any = await tokenRes.json();
    const idToken = tokenJson?.id_token;
    if (!idToken) return null;

    const infoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );
    if (!infoRes.ok) return null;
    const info: any = await infoRes.json();
    if (info?.email_verified !== true || !info?.email) return null;
    return {
      email: info.email,
      emailVerified: true,
      name: info.name || info.email,
      sub: info.sub || "",
    };
  } catch {
    return null;
  }
}

/** Only allow an email explicitly listed by the site owner. */
export function isAllowedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  const list = process.env.ADMIN_ALLOWED_EMAILS || process.env.ADMIN_EMAIL || "";
  if (!list) return false;
  return list
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .includes(e);
}