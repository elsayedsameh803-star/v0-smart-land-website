// =============================================================================
// Smart Land - LinkedIn disconnect
// =============================================================================
// POST /api/linkedin/oauth/disconnect
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  const res = NextResponse.json({ success: true });
  res.cookies.set("sl_conn_linkedin", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
  });
  return res;
}