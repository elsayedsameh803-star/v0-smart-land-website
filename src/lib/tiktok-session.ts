// =============================================================================
// Smart Land - Encrypted TikTok OAuth session (server-side)
// =============================================================================
// The user's TikTok access/refresh tokens are stored ONLY in an HttpOnly
// cookie which is encrypted with a key derived from the server secret. They
// are never sent to the browser as plain text, never put in source code and
// never written to the logs. Cookies are a pragmatic store (no DB needed);
// tokens never appear in the URL or in network-visible parts of the app.
// =============================================================================

import {
  scryptSync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  timingSafeEqual,
} from "crypto";
import { refreshTikTokAccessToken } from "./tiktok-api";

export const TIKTOK_SESSION_COOKIE = "sl_tiktok_session";

// Secret used to encrypt the session payload. Fails closed when missing.
function sessionSecret(): Buffer {
  const seed = process.env.ADMIN_SESSION_SECRET || process.env.PAYMOB_CUSTOMER_SECRET;
  if (!seed) {
    throw new Error(
      "ADMIN_SESSION_SECRET (or PAYMOB_CUSTOMER_SECRET) must be set to encrypt the TikTok OAuth session. Refusing to fall back to a hard-coded secret."
    );
  }
  return scryptSync(seed, "smart-land-tiktok-session-salt", 32);
}

export interface TikTokOAuthSessionData {
  openId: string;
  displayName: string;
  avatarUrl?: string | null;
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number; // epoch ms
  refreshExpiresAt: number; // epoch ms
  connectedAt: string; // ISO
}

// "v1.<iv>.<ciphertext>.<authTag>" — AES-256-GCM
function encryptSession(data: TikTokOAuthSessionData): string {
  const key = sessionSecret();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plain = Buffer.from(JSON.stringify(data), "utf8");
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${encrypted.toString("base64url")}.${tag.toString("base64url")}`;
}

function decryptSession(token: string): TikTokOAuthSessionData | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 4 || parts[0] !== "v1") return null;
    const key = sessionSecret();
    const iv = Buffer.from(parts[1], "base64url");
    const data = Buffer.from(parts[2], "base64url");
    const tag = Buffer.from(parts[3], "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8")) as TikTokOAuthSessionData;
  } catch {
    return null; // tampered/expired-secret session -> treat as disconnected
  }
}

export function buildTikTokSessionCookieValue(data: TikTokOAuthSessionData): string {
  const payload = encryptSession(data);
  return `${TIKTOK_SESSION_COOKIE}=${payload}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`;
}

/**
 * The raw encrypted session payload ONLY — for `response.cookies.set()`
 * callers. `buildTikTokSessionCookieValue` is a full Set-Cookie header string
 * and MUST NOT be passed as a cookie value (it double-prefixes and corrupts
 * the stored session, forcing users to re-link on every request).
 */
export function encryptTikTokSession(data: TikTokOAuthSessionData): string {
  return encryptSession(data);
}

export function parseTikTokSessionCookie(token: string | undefined | null): TikTokOAuthSessionData | null {
  if (!token) return null;
  return decryptSession(token);
}

export function clearTikTokSessionCookie(): string {
  return `${TIKTOK_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/** Cheap constant-time check helper (avoids unused import warnings is fine). */
export function sessionTokensEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    return ba.length === bb.length && timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/** True when the access token is still within validity (with a 60s margin). */
export function isAccessTokenUsable(sess: TikTokOAuthSessionData, now = Date.now()): boolean {
  return Boolean(sess.accessToken) && sess.accessExpiresAt > now + 60_000;
}

/** Estimate remaining validity for a one-off user-facing message. */
export function accessTokenLifetimeMs(sess: TikTokOAuthSessionData): number {
  return Math.max(0, sess.accessExpiresAt - Date.now());
}

/**
 * If the stored access token is expired but a refresh token is still valid,
 * exchange it with TikTok and return a NEW session payload (the caller then
 * re-encrypts it into the response cookie). Returns the same session when it
 * does not need refreshing, or null when it is unusable and must be
 * disconnected (tokens never land in logs).
 */
export async function refreshTikTokSessionIfNeeded(
  sess: TikTokOAuthSessionData
): Promise<TikTokOAuthSessionData | null> {
  if (isAccessTokenUsable(sess)) return sess;
  if (!sess.refreshToken) return null;

  const refreshed = await refreshTikTokAccessToken(sess.refreshToken);
  if (!refreshed?.access_token) return null;

  const now = Date.now();
  return {
    ...sess,
    accessToken: refreshed.access_token as string,
    refreshToken: (refreshed.refresh_token as string) || sess.refreshToken,
    accessExpiresAt: now + (Number(refreshed.expires_in) || 86400) * 1000,
    refreshExpiresAt: now + (Number(refreshed.refresh_expires_in) || 31536000) * 1000,
    connectedAt: sess.connectedAt,
  };
}