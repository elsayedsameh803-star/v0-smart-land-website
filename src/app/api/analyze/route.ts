import { NextRequest, NextResponse } from "next/server";
import type { Finding } from "@/lib/types";
import { performRealAnalysis } from "@/lib/real-analysis-engine";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    // Use the new real multi-source analysis engine
    const result = await performRealAnalysis(targetUrl);

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        overallScore: result.overallScore,
        scores: {
          seo: { score: result.scores.seo.score, findings: result.findings.filter((f: Finding) => f.category === "seo").map((f: Finding) => f.issue) },
          performance: { score: result.scores.performance.score, findings: result.findings.filter((f: Finding) => f.category === "performance").map((f: Finding) => f.issue) },
          accessibility: { score: result.scores.accessibility.score, findings: result.findings.filter((f: Finding) => f.category === "accessibility").map((f: Finding) => f.issue) },
          security: { score: result.scores.security.score, findings: result.findings.filter((f: Finding) => f.category === "security").map((f: Finding) => f.issue) },
          content: { score: result.scores.content.score, findings: result.findings.filter((f: Finding) => f.category === "content").map((f: Finding) => f.issue) },
          technical: { score: result.scores.technical.score, findings: result.findings.filter((f: Finding) => f.category === "technical").map((f: Finding) => f.issue) },
        },
        dataSources: result.metadata.dataSources,
        duration: result.metadata.duration,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
