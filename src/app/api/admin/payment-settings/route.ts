import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getPaymentSettings, savePaymentSettings } from "@/lib/paymob-store";
import { getPaymobConfig, getAuthToken } from "@/lib/paymob";
import { getSiteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

// Never expose secret keys. We only expose booleans + non-secret identifiers.
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const stored = getPaymentSettings();
  const env = getPaymobConfig();
  // webhookUrl from env if set, else a sensible default
  const baseUrl = getSiteUrl();
  const webhookUrl = process.env.PAYMOB_WEBHOOK_URL || `${baseUrl}/api/payments/webhook`;
  return NextResponse.json({
    success: true,
    settings: {
      ...stored,
      webhookUrl,
      mode: env.mode,
      envConfigured: env.configured,
      sandbox: env.sandbox,
      hasSecretKey: !!env.secretKey,
      hasHmacSecret: !!env.hmacSecret,
      integrationConfigured: !!env.integrationId,
      iframeConfigured: !!env.iframeId,
    },
  });
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const action = String(body?.action || "save");
  try {
    if (action === "test-connection") {
      try {
        const token = await getAuthToken();
        return NextResponse.json({ success: true, connected: !!token });
      } catch (e: any) {
        return NextResponse.json({ success: false, connected: false, error: "Connection failed" }, { status: 502 });
      }
    }
    // Persist non-secret settings only.
    const patch: any = {};
    if (body?.mode === "test" || body?.mode === "live") patch.mode = body.mode;
    if (typeof body?.integrationId === "string") patch.integrationId = body.integrationId.trim();
    if (typeof body?.iframeId === "string") patch.iframeId = body.iframeId.trim();
    if (typeof body?.webhookActive === "boolean") patch.webhookActive = body.webhookActive;
    if (typeof body?.refundPolicyEn === "string") patch.refundPolicyEn = body.refundPolicyEn.trim();
    if (typeof body?.refundPolicyAr === "string") patch.refundPolicyAr = body.refundPolicyAr.trim();
    savePaymentSettings(patch);
    return NextResponse.json({ success: true, settings: getPaymentSettings() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
