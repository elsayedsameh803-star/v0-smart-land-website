// =============================================================================
// Smart Land - Connected Social Accounts (client-side registry)
// =============================================================================
// Keeps a lightweight registry of the social accounts the VISITOR explicitly
// linked (TikTok / Facebook / Instagram) so we never re-run an OAuth flow when
// the account is already connected. This is only metadata for the UI — the
// real tokens stay on the server (encrypted HttpOnly cookies / NextAuth JWT).
// =============================================================================

export type ConnectedPlatform = "tiktok" | "facebook" | "instagram";

export interface ConnectedSocialAccount {
  platform: ConnectedPlatform;
  accountId: string;
  name: string;
  linkedAt: string;
  connectedAt?: number;
  valid: boolean;
}

const KEY = "smart-land-connected-social";

function readAll(): ConnectedSocialAccount[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ConnectedSocialAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(accounts: ConnectedSocialAccount[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(accounts.slice(0, 50)));
  } catch {
    // storage unavailable — non-fatal
  }
}

/** True when a given platform has a linked account. */
export function isSocialConnected(platform: ConnectedPlatform): boolean {
  return readAll().some((a) => a.platform === platform && a.valid);
}

/** Returns the currently linked accounts, newest first. */
export function getConnectedSocialAccounts(): ConnectedSocialAccount[] {
  return readAll().sort(
    (a, b) => (b.connectedAt ?? 0) - (a.connectedAt ?? 0)
  );
}

/** Records a successful link (replaces any previous account for the platform). */
export function saveConnectedSocialAccount(account: ConnectedSocialAccount): void {
  const all = readAll().filter((a) => a.platform !== account.platform);
  all.push({ ...account, valid: true, connectedAt: account.connectedAt || Date.now() });
  writeAll(all);
}

/** Removes a connected account (user "unlink"). */
export function removeConnectedSocialAccount(
  platform: ConnectedPlatform,
  accountId?: string
): void {
  if (accountId) {
    writeAll(
      readAll().filter((a) => !(a.platform === platform && a.accountId === accountId))
    );
  } else {
    writeAll(readAll().filter((a) => a.platform !== platform));
  }
}

export function getConnectedPlatformLabel(
  platform: ConnectedPlatform,
  locale: string
): string {
  const labels: Record<ConnectedPlatform, { en: string; ar: string }> = {
    tiktok: { en: "TikTok", ar: "تيك توك" },
    facebook: { en: "Facebook", ar: "فيسبوك" },
    instagram: { en: "Instagram", ar: "إنستغرام" },
  };
  return locale === "ar" ? labels[platform].ar : labels[platform].en;
}