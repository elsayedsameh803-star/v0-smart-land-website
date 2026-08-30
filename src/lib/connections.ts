// =============================================================================
// Smart Land - Centralized platform connection store (server-side)
// =============================================================================
// SECURE storage for the user's per-platform OAuth access/refresh tokens.
//
// Design goals (per the SaaS auth+connections spec):
//   * One Smart Land identity (NextAuth session) per user.
//   * Each platform has an INDEPENDENT connection (independent OAuth grant).
//   * Tokens are NEVER sent to the browser. They live ONLY in encrypted
//     HttpOnly + Secure + SameSite=Lax cookies, keyed per platform
//     (`sl_conn_<platform>`).
//   * Encrypted with AES-256-GCM using a key derived (scrypt) from the server
//     secret — EXACTLY the audited pattern already used by `tiktok-session.ts`,
//     so there is a single crypto design to maintain/review. TikTok keeps its
//     own `sl_tiktok_session` cookie untouched (working code is preserved);
//     this module serves Facebook, Instagram, YouTube, LinkedIn and Snapchat.
//   * Fail-closed: if the secret is missing or a cookie is tampered with, the
//     connection reads as "disconnected" — we NEVER invent a valid session.
//   * Tokens are refreshed server-side using each platform's refresh grant when
//     the access token is near expiry; refresh helpers are injected per platform
//     so this module never hard-codes a provider's token endpoint.
// =============================================================================

import {
  scryptSync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from "crypto";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type PlatformId =
  | "website"
  | "facebook"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "snapchat"
  | "linkedin";

export interface ConnectionToken {
  accessToken: string;
  refreshToken?: string;
  /** Epoch ms at which the access token expires. */
  expiresAt: number;
  /** Epoch ms at which the refresh token expires (if the platform issues one). */
  refreshExpiresAt?: number;
  /** Space-separated scope string returned by the provider. */
  scope?: string;
}

export interface PlatformConnection {
  platform: PlatformId;
  accountId: string;
  displayName: string;
  avatarUrl?: string | null;
  token: ConnectionToken;
  connectedAt: string; // ISO
  /** Opaque, non-secret profile snapshot for UI display only. */
  profile?: Record<string, unknown>;
}

/**
 * Per-platform token refresh strategy. Each platform implements its own
 * refresh (different endpoints/grants). Returning `null` means the refresh
 * failed or is not applicable — the caller then treats the connection as
 * needing a manual re-link.
 */
export interface PlatformRefresher {
  refresh(current: PlatformConnection): Promise<PlatformConnection | null>;
  isUsable?(conn: PlatformConnection, now?: number): boolean;
}

// -----------------------------------------------------------------------------
// Config / constants
// -----------------------------------------------------------------------------

const COOKIE_PREFIX = "sl_conn_";
export const CONN_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year, in seconds
const ACCESS_TOKEN_SAFETY_MARGIN_MS = 60_000; // 60s grace

// Registry of per-platform refresh strategies. Populated by each platform's
// OAuth module (Meta, YouTube, LinkedIn, Snapchat) at module init. TikTok is
// handled by its own `tiktok-session.ts` and is intentionally excluded here.
const REFRESHERS: Record<string, PlatformRefresher | undefined> = {
  facebook: undefined,
  instagram: undefined,
  youtube: undefined,
  snapchat: undefined,
  linkedin: undefined,
};

export function registerRefresher(platform: PlatformId, refresher: PlatformRefresher): void {
  if (platform === "tiktok") return; // TikTok uses its own session store
  REFRESHERS[platform] = refresher;
}

// -----------------------------------------------------------------------------
// Crypto (mirrors tiktok-session.ts: AES-256-GCM over scrypt-derived key)
// -----------------------------------------------------------------------------

function connSecret(): Buffer {
  // Reuse the same server secret already required by tiktok-session.ts so we
  // don't introduce a NEW required env var. Fail closed if it is absent.
  const seed =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.PAYMOB_CUSTOMER_SECRET;
  if (!seed) {
    throw new Error(
      "ADMIN_SESSION_SECRET (or NEXTAUTH_SECRET) must be set to encrypt platform connections. Refusing to fall back to a hard-coded secret."
    );
  }
  return scryptSync(seed, "smart-land-connection-salt", 32);
}

/** `v1.<iv>.<ciphertext>.<authTag>` — base64url segments. */
function encryptConnection(data: PlatformConnection): string {
  const key = connSecret();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plain = Buffer.from(JSON.stringify(data), "utf8");
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${encrypted.toString("base64url")}.${tag.toString("base64url")}`;
}

function decryptConnection(token: string | undefined | null): PlatformConnection | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 4 || parts[0] !== "v1") return null;
    const key = connSecret();
    const iv = Buffer.from(parts[1], "base64url");
    const data = Buffer.from(parts[2], "base64url");
    const tag = Buffer.from(parts[3], "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8")) as PlatformConnection;
  } catch {
    return null; // tampered / wrong secret / malformed → disconnected
  }
}

// -----------------------------------------------------------------------------
// Cookie-level helpers (operate on NextRequest/NextResponse cookies)
// -----------------------------------------------------------------------------

export function cookieNameFor(platform: PlatformId): string {
  return `${COOKIE_PREFIX}${platform}`;
}

export type CookieStore = { get: (name: string) => { value: string } | undefined };
export type SetCookieFn = (
  name: string,
  value: string,
  options: Record<string, unknown>
) => void;

/** Read + decrypt a connection for `platform` from the request. */
export function readConnection(
  cookies: CookieStore | undefined,
  platform: PlatformId
): PlatformConnection | null {
  if (!cookies) return null;
  const raw = cookies.get(cookieNameFor(platform))?.value;
  return decryptConnection(raw);
}

/** Set (or overwrite) a platform's encrypted connection cookie on the response. */
export function writeConnection(
  setCookie: SetCookieFn,
  platform: PlatformId,
  conn: PlatformConnection
): void {
  const payload = encryptConnection(conn);
  setCookie(cookieNameFor(platform), payload, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: CONN_COOKIE_MAX_AGE,
  });
}

/** Clear a platform's connection cookie. */
export function clearConnection(setCookie: SetCookieFn, platform: PlatformId): void {
  setCookie(cookieNameFor(platform), "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
  });
}

/** Clear EVERY platform connection cookie (used on logout). */
export function clearAllConnectionCookies(setCookie: SetCookieFn): void {
  (["facebook", "instagram", "youtube", "snapchat", "linkedin"] as PlatformId[]).forEach(
    (p) => clearConnection(setCookie, p)
  );
}

// -----------------------------------------------------------------------------
// Token validity / refresh
// -----------------------------------------------------------------------------

/** True when the access token is still usable (with a small safety margin). */
export function isConnectionUsable(
  conn: PlatformConnection,
  now = Date.now()
): boolean {
  return (
    Boolean(conn?.token?.accessToken) &&
    conn.token.expiresAt > now + ACCESS_TOKEN_SAFETY_MARGIN_MS
  );
}

/**
 * Best-effort refresh: if the access token is expired but a refresh token is
 * still valid, ask the platform's refresher to rotate the tokens and return a
 * new connection. Returns `null` when the connection can no longer be
 * refreshed (→ must be re-linked by the user).
 */
export async function refreshConnectionIfNeeded(
  conn: PlatformConnection
): Promise<PlatformConnection | null> {
  if (conn.platform === "tiktok") return conn; // handled by tiktok-session.ts
  if (isConnectionUsable(conn)) return conn;
  const refresher = REFRESHERS[conn.platform as Exclude<PlatformId, "tiktok">];
  if (!refresher || !conn.token.refreshToken) return null;
  try {
    return await refresher.refresh(conn);
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// "Is this connection usable right now (refreshing if possible)?"
// Used by the analysis gate + the unified status endpoint. TikTok is resolved
// through its own session module so this file never touches that cookie.
// -----------------------------------------------------------------------------

export async function resolveUsableConnection(
  cookies: CookieStore | undefined,
  platform: PlatformId
): Promise<PlatformConnection | null> {
  if (platform === "tiktok") {
    const mod = await import("@/lib/tiktok-session");
    const raw = cookies?.get("sl_tiktok_session")?.value;
    const sess = mod.parseTikTokSessionCookie(raw ?? null);
    if (!sess || !sess.accessToken) return null;
    if (!mod.isAccessTokenUsable(sess)) {
      const refreshed = await mod.refreshTikTokSessionIfNeeded(sess);
      if (!refreshed) return null;
      return mapTikTokSession(refreshed);
    }
    return mapTikTokSession(sess);
  }

  const conn = readConnection(cookies, platform);
  if (!conn) return null;
  if (isConnectionUsable(conn)) return conn;
  const refreshed = await refreshConnectionIfNeeded(conn);
  return refreshed ?? null;
}

function mapTikTokSession(sess: Awaited<ReturnType<typeof import("@/lib/tiktok-session").parseTikTokSessionCookie>>): PlatformConnection | null {
  if (!sess) return null;
  return {
    platform: "tiktok",
    accountId: sess.openId,
    displayName: sess.displayName,
    avatarUrl: sess.avatarUrl,
    token: {
      accessToken: sess.accessToken,
      refreshToken: sess.refreshToken,
      expiresAt: sess.accessExpiresAt,
      refreshExpiresAt: sess.refreshExpiresAt,
    },
    connectedAt: sess.connectedAt,
    profile: { openId: sess.openId },
  };
}

