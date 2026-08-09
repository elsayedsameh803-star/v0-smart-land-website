// ============================================
// Smart Land - API Route for URL Analysis
// Server-side fetch to avoid CORS issues
// Protected with SSRF validation (same as /api/analyze)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { safeFetch, validateUrlForFetch, ssrfErrorResponse } from '@/lib/security';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Only allow http and https protocols
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are supported' },
        { status: 400 }
      );
    }

    // SSRF protection - block internal/private network access
    const urlError = validateUrlForFetch(targetUrl.toString());
    if (urlError) {
      return ssrfErrorResponse(urlError);
    }

    // Fetch the URL server-side (no CORS restrictions) with SSRF-safe fetch
    try {
      const response = await safeFetch(targetUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'SmartLand-Audit/2.0 (Analysis Bot; +https://smart-land-theta.vercel.app)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      }, 15000);

      const html = await response.text();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return NextResponse.json({
        success: true,
        statusCode: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type') || '',
        headers,
        html,
        htmlLength: html.length,
        url: targetUrl.toString(),
      });
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out after 15 seconds' },
          { status: 504 }
        );
      }

      return NextResponse.json(
        {
          error: `Failed to fetch URL: ${fetchError.message}`,
          url: targetUrl.toString(),
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}