// =============================================================================
// Smart Land - Logout endpoint
// =============================================================================
// POST /api/auth/logout
//   Clears the user's NextAuth session cookie AND every per-platform
//   connection cookie (sl_conn_* and the TikTok session). After this, the
//   browser holds no Smart Land identity and no encrypted tokens — so a shared
//   computer never leaks another user's connections.
//
//   The client calls this, then navigates to /login. (We clear the next-auth
//   cookies here directly so a single call fully logs the visitor out.)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { clearAllConnectionCookies } from "@/lib/connections";
import { logTikTok } from "@/lib/tiktok-log";

export const dynamic = "force-dynamic";

// Names used by NextAuth v4 (JWT strategy) for session + csrf state.
const NEXTAUTH_COOKIES = [
  "next-auth.session-token",
  "__Host-next-auth.session-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.pkce.code_verifier",
  "next-auth.state",
];

export async function POST(_request: NextRequest) {
  const res = NextResponse.json({ success: true, loggedOut: true });

  // 1) All per-platform encrypted connection cookies (Meta / YouTube / ...).
  clearAllConnectionCookies((name, value, options) => {
    res.cookies.set(name, value, options);
  });

  // 2) TikTok's dedicated cookie (kept separate, per tiktok-session.ts).
  res.cookies.set("sl_tiktok_session", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
  });
  logTikTok("info", "logout_session_cleared");

  // 3) NextAuth identity cookies.
  for (const name of NEXTAUTH_COOKIES) {
    res.cookies.set(name, "", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
    });
  }

  return res;
}
