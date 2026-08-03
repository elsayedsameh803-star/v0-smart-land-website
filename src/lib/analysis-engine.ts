// =============================================================================
// Smart Land v3 - Analysis Engine (Public Interface)
// =============================================================================
// This is the public-facing interface that delegates to the real analysis engine.
// No mock data, no static values, no fallback defaults.
// Routes requests to platform-specific analyzers (website, youtube, tiktok, etc.)
// =============================================================================

import type {
  AnalysisResult,
  CategoryScores,
  CategoryScore,
  Finding,
  AnalysisMetadata,
  CompetitorComparison,
  AnalysisStage,
  FixSuggestion,
} from "./types";
import { generateId, normalizeUrl, formatScore } from "./utils";
import { performRealAnalysis, performRealSocialAnalysis, getRealAnalysisStages } from "./real-analysis-engine";

// =============================================================================
// PUBLIC API - MAIN ANALYSIS FUNCTION
// =============================================================================

export async function analyzeUrl(url: string, locale: string = "en", platform: string = "website"): Promise<AnalysisResult> {
  // Detect platform from URL if not explicitly provided
  const detectedPlatform = detectPlatform(url, platform);
  
  switch (detectedPlatform) {
    case "youtube":
      return performRealSocialAnalysis(url, locale, "youtube");
    case "tiktok":
      return performRealSocialAnalysis(url, locale, "tiktok");
    case "facebook":
    case "instagram":
    case "snapchat":
    case "linkedin":
      return performRealSocialAnalysis(url, locale, detectedPlatform);
    default:
      return performRealAnalysis(url, locale);
  }
}

export async function compareWithCompetitor(
  primaryUrl: string,
  competitorUrl: string,
  platform: string = "website"
): Promise<CompetitorComparison> {
  const primaryResult = await analyzeUrl(primaryUrl, "en", platform);
  const competitorResult = await analyzeUrl(competitorUrl, "en", platform);

  const comparisonScores = (Object.keys(primaryResult.scores) as Array<keyof CategoryScores>).map(
    (category) => ({
      category,
      primary: primaryResult.scores[category].score,
      competitor: competitorResult.scores[category].score,
    })
  );

  return {
    url: normalizeUrl(primaryUrl),
    competitorUrl: normalizeUrl(competitorUrl),
    date: new Date().toISOString(),
    scores: comparisonScores,
    findings: {
      primaryOnly: primaryResult.findings.map((f) => f.issue),
      competitorOnly: competitorResult.findings.map((f) => f.issue),
      shared: [],
    },
    limitations: [
      "Only publicly measurable signals are compared",
      "Results reflect available data at the time of analysis",
    ],
  };
}

export function getFixSuggestion(finding: Finding): FixSuggestion {
  return {
    issueId: finding.id,
    issue: finding.issue,
    issueAr: finding.issueAr,
    explanation: finding.whyItMatters,
    explanationAr: finding.whyItMattersAr,
    steps: [finding.howToFix],
    stepsAr: [finding.howToFixAr],
    codeExample: finding.technicalExample,
    expectedOutcome: finding.expectedBenefit,
    expectedOutcomeAr: finding.expectedBenefitAr,
  };
}

export function getAnalysisStages(): AnalysisStage[] {
  return getRealAnalysisStages();
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function detectPlatform(url: string, selectedPlatform?: string): string {
  if (selectedPlatform && selectedPlatform !== "website") {
    return selectedPlatform;
  }
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) return "youtube";
  if (lowerUrl.includes("tiktok.com")) return "tiktok";
  if (lowerUrl.includes("facebook.com") || lowerUrl.includes("fb.com")) return "facebook";
  if (lowerUrl.includes("instagram.com")) return "instagram";
  if (lowerUrl.includes("snapchat.com")) return "snapchat";
  if (lowerUrl.includes("linkedin.com")) return "linkedin";
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) return "twitter";
  
  return "website";
}