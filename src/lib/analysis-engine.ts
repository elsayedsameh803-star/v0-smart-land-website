// =============================================================================
// Smart Land v3 - Analysis Engine (Public Interface)
// =============================================================================
// This is the public-facing interface that delegates to the real analysis engine.
// No mock data, no static values, no fallback defaults.
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
import { performRealAnalysis, getRealAnalysisStages } from "./real-analysis-engine";

// =============================================================================
// PUBLIC API - MAIN ANALYSIS FUNCTION
// =============================================================================

export async function analyzeUrl(url: string, locale: string = "en"): Promise<AnalysisResult> {
  return performRealAnalysis(url, locale);
}

export async function compareWithCompetitor(
  primaryUrl: string,
  competitorUrl: string
): Promise<CompetitorComparison> {
  const primaryResult = await analyzeUrl(primaryUrl);
  const competitorResult = await analyzeUrl(competitorUrl);

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