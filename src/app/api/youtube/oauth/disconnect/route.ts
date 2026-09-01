// =============================================================================
// Smart Land - YouTube disconnect
// =============================================================================
// POST /api/youtube/oauth/disconnect
//   Clears the encrypted `sl_conn_youtube` cookie.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  const res = NextResponse.json({ success: true });
  res.cookies.set("sl_conn_youtube", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
  });
  return res;
}