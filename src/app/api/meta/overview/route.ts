import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  fetchUserPages,
  fetchPageInsights,
  fetchInstagramInsights,
  isMetaConfigured,
} from "@/lib/meta-graph";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Server-side proxy to the Meta Graph API. Reads the authenticated session's
 * access token and returns Page + Instagram analytics WITHOUT ever leaking
 * the raw token to the client.
 */
export async function GET() {
  if (!isMetaConfigured()) {
    return NextResponse.json(
      { error: "meta_not_configured" },
      { status: 500 }
    );
  }

  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const pages = await fetchUserPages(token);

    const pageResults: Array<Record<string, unknown>> = [];
    for (const page of pages.slice(0, 10)) {
      const pageToken = page.access_token || token;

      const insights = await fetchPageInsights(page.id, pageToken);

      let instagram: Record<string, unknown> | null = null;
      const igId = page.instagram_business_account?.id;
      if (igId) {
        const igInsights = await fetchInstagramInsights(igId, pageToken);
        instagram = { id: igId, insights: igInsights };
      }

      pageResults.push({
        id: page.id,
        name: page.name,
        link: page.link || null,
        picture: page.picture?.data?.url || null,
        insights,
        instagram,
      });
    }

    return NextResponse.json({
      pages: pageResults,
      count: pageResults.length,
    });
  } catch {
    return NextResponse.json(
      { error: "meta_api_error" },
      { status: 502 }
    );
  }
}