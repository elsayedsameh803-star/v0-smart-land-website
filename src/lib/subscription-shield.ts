// =============================================================================
// Smart Land - Subscription Access Shell (server-side) IMPORTANT: OPEN ACCESS
// =============================================================================
// Smart Land is fully open to every visitor, so this guard no longer blocks ANY
// request. It is kept as a harmless no-op so the analyze routes keep working
// unchanged. There is no free-analysis limit and no paywall on the server.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

export function enforceSubscription(_request: NextRequest): NextResponse | null {
  return null;
}
