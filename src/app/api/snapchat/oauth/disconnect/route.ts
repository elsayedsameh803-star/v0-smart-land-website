// =============================================================================
// Smart Land - Snapchat disconnect
// =============================================================================
// POST /api/snapchat/oauth/disconnect
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  const res = NextResponse.json({ success: true });
  res.cookies.set("sl_conn_snapchat", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
  });
  return res;
}