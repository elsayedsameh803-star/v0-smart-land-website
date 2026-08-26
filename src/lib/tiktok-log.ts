// =============================================================================
// Smart Land - TikTok Secrets-safe Logging (server-side)
// =============================================================================
// Logging helper used by every TikTok server integration. It guarantees that
// secrets (client secret, access tokens, refresh tokens, authorization codes,
// state values) NEVER reach the logs. Only one rule applies: if it looks like
// a credential, it is redacted before it is printed.
// =============================================================================

export type TikTokLogLevel = "info" | "warn" | "error";

// JSON style: "client_secret":"..."
const JSON_SECRET_KEY_RE =
  /("(?:client[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|authorization|code|state|scope|redirect[_-]?uri)":)"[^"]*"/gi;

// Query/body style: client_secret=xxx&...
const QUERY_SECRET_KEY_RE =
  /((?:client[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|code|state)=[^&\s"]+)/gi;

// Single quoted style ("'secret': '...'" from debug dumps)
const SINGLE_QUOTE_SECRET_RE =
  /((?:client[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|code|state)\s*[:=]\s*')[^']*'/gi;

// Authorization: Bearer <token>
const BEARER_RE = /(Bearer\s+)[A-Za-z0-9._~+/=-]+/gi;

/** Redacts any credential-looking substring from log text. */
export function redactTikTokText(input: string): string {
  if (!input) return input;
  return input
    .replace(JSON_SECRET_KEY_RE, '"$1"[REDACTED]')
    .replace(QUERY_SECRET_KEY_RE, "[REDACTED]")
    .replace(SINGLE_QUOTE_SECRET_RE, "'[REDACTED]'")
    .replace(BEARER_RE, "$1[REDACTED]");
}

/**
 * Structured, secrets-safe log line for TikTok flows.
 * `meta` may contain message text with token-like strings — it is redacted.
 */
export function logTikTok(level: TikTokLogLevel, event: string, meta?: Record<string, unknown>): void {
  const payload: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    event,
    ...(meta || {}),
  };
  let line: string;
  try {
    line = JSON.stringify(payload);
  } catch {
    line = `[unserializable meta] ${event}`;
  }
  const safe = redactTikTokText(line);
  if (level === "error") console.error("[tiktok]", safe);
  else if (level === "warn") console.warn("[tiktok]", safe);
  else console.log("[tiktok]", safe);
}