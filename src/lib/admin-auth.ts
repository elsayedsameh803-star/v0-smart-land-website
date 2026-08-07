// =============================================================================
// Smart Land - Admin Authentication (Edge-safe)
// Stateless, signed sessions using Web Crypto (HMAC-SHA256) so they work in BOTH
// the Edge runtime (middleware) and the Node runtime (route handlers).
//
// Security model:
//   - The admin password is read from ADMIN_PASSWORD (env variable).
//   - On successful login we issue a short-lived signed token stored in an
//     HttpOnly / Secure / SameSite=Lax cookie.
//   - Tokens are verified by HMAC signature + expiration before any admin
//     page or API is served (defense in depth via middleware + server layout).
// =============================================================================

export const SESSION_COOKIE_NAME = "smartland_admin_session";

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour
export const SESSION_MAX_AGE = Math.floor(SESSION_TTL_MS / 1000); // seconds

const te = new TextEncoder();

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("Admin session secret is not configured");
  }
  return secret;
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    te.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlToBytes(str: string): Uint8Array {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Creates a new signed session token (payload.signature).
 */
export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = bytesToB64url(te.encode(String(expiresAt)));
  const key = await importKey();
  const signature = await crypto.subtle.sign("HMAC", key, te.encode(payload));
  const sigB64 = bytesToB64url(new Uint8Array(signature));
  return `${payload}.${sigB64}`;
}

/**
 * Verifies a session token's signature and expiration. Constant-time via
 * the platform's HMAC verify. Returns true only for valid, unexpired tokens.
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sigB64] = parts;
  if (!payload || !sigB64) return false;

  try {
    const key = await importKey();
    const signature = b64urlToBytes(sigB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      te.encode(payload)
    );
    if (!valid) return false;

    const payloadText = new TextDecoder().decode(b64urlToBytes(payload));
    const expiresAt = Number(payloadText);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * True only when an admin password has actually been configured.
 */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length > 0);
}

/**
 * Constant-time string comparison (avoids leaking the password via timing).
 */
export function safeEqual(a: string, b: string): boolean {
  const ab = te.encode(a);
  const bb = te.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}
