// =============================================================================
// Smart Land - Meta (Facebook + Instagram) disconnect
// =============================================================================
// POST /api/meta/oauth/disconnect
//   Clears BOTH the facebook and instagram connection cookies.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  const res = NextResponse.json({ success: true });
  res.cookies.set("sl_conn_facebook", "", { path: "/", httpOnly: true, secure: true, sameSite: "lax", maxAge: 0 });
  res.cookies.set("sl_conn_instagram", "", { path: "/", httpOnly: true, secure: true, sameSite: "lax", maxAge: 0 });
  return res;
}