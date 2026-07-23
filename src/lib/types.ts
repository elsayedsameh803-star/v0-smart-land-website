// ============================================
// Smart Land v2 - AI Digital Audit Platform Types
// ============================================

export type Locale = "en" | "ar";

export interface AnalysisResult {
  id: string;
  url: string;
  date: string;
  overallScore: number;
  scores: CategoryScores;
  findings: Finding[];
  strengths: string[];
  weaknesses: string[];
  criticalIssues: Finding[];
  metadata: AnalysisMetadata;
}

export interface CategoryScores {
  seo: CategoryScore;
  performance: CategoryScore;
  accessibility: CategoryScore;
  security: CategoryScore;
  content: CategoryScore;
  technical: CategoryScore;
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  findings: Finding[];
}

export interface Finding {
  id: string;
  issue: string;
  issueAr: string;
  severity: Severity;
  evidence: string;
  evidenceAr: string;
  location: string;
  whyItMatters: string;
  whyItMattersAr: string;
  howToFix: string;
  howToFixAr: string;
  technicalExample?: string;
  expectedBenefit: string;
  expectedBenefitAr: string;
  category: keyof CategoryScores;
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface AnalysisMetadata {
  analyzedUrl: string;
  analysisDate: string;
  duration: number;
  dataSources: string[];
  limitations: string[];
  methodologyVersion: string;
}

export interface AnalysisStage {
  id: string;
  label: string;
  labelAr: string;
  status: "pending" | "processing" | "completed" | "error";
  duration?: number;
}

export interface CompetitorComparison {
  url: string;
  competitorUrl: string;
  date: string;
  scores: Array<{
    category: keyof CategoryScores;
    primary: number;
    competitor: number;
  }>;
  findings: {
    primaryOnly: string[];
    competitorOnly: string[];
    shared: string[];
  };
  limitations: string[];
}

export interface AnalysisHistory {
  id: string;
  url: string;
  date: string;
  overallScore: number;
  change: number | null;
  findingsCount: number;
}

export interface FixSuggestion {
  issueId: string;
  issue: string;
  issueAr: string;
  explanation: string;
  explanationAr: string;
  steps: string[];
  stepsAr: string[];
  codeExample?: string;
  expectedOutcome: string;
  expectedOutcomeAr: string;
}

export interface ShareableReport {
  id: string;
  url: string;
  date: string;
  overallScore: number;
  scores: CategoryScores;
  summary: string;
  findings: Finding[];
  shareToken: string;
  expiresAt: string;
}

export interface PdfReportData {
  url: string;
  date: string;
  overallScore: number;
  scores: CategoryScores;
  strengths: string[];
  weaknesses: string[];
  criticalIssues: Finding[];
  findings: Finding[];
  actionPlan: ActionItem[];
  methodology: string;
  limitations: string[];
}

export interface ActionItem {
  priority: Severity;
  issue: string;
  issueAr: string;
  action: string;
  actionAr: string;
  expectedImpact: string;
  expectedImpactAr: string;
}

export interface AdminMetrics {
  totalAnalyses: number;
  platformDistribution: Array<{ name: string; count: number }>;
  recentActivity: Array<{ date: string; count: number }>;
  processingFailures: number;
  apiFailures: number;
  averageDuration: number;
  commonIssues: Array<{ issue: string; count: number }>;
  systemHealth: {
    api: "healthy" | "degraded" | "down";
    database: "healthy" | "degraded" | "down";
    lastChecked: string;
  };
}

export interface NavItem {
  href: string;
  label: string;
  labelAr: string;
  icon?: string;
}

// ============================================
// Real Analysis Engine v3.0 Types
// ============================================

export interface TechStack {
  cms: string | null;
  framework: string | null;
  analytics: string[];
  cdn: string | null;
  server: string | null;
  javascriptLibraries: string[];
  cssFramework: string | null;
  hosting: string | null;
  sslProvider: string | null;
  paymentProcessor: string[];
}

export interface SocialPresence {
  facebook: boolean;
  twitter: boolean;
  linkedin: boolean;
  instagram: boolean;
  youtube: boolean;
  tiktok: boolean;
  snapchat: boolean;
  pinterest: boolean;
  github: boolean;
  threads: boolean;
  twitterCards: boolean;
  openGraph: boolean;
  ogImage: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  twitterCard: string | null;
  twitterSite: string | null;
  twitterCreator: string | null;
  facebookAppId: string | null;
  socialLinks: string[];
}

export interface SSLAnalysis {
  issuer: string;
  subject: string;
  expiryDate: string | null;
  daysRemaining: number;
  tlsVersion: string;
  hstsEnabled: boolean;
  hstsMaxAge: number;
  hstsIncludesSubdomains: boolean;
  hstsPreload: boolean;
  score: number;
  isExpired: boolean;
  isAboutToExpire: boolean;
}

export interface DNSSummary {
  hostname: string;
  aRecords: string[];
  aaaaRecords: string[];
  mxRecords: string[];
  nsRecords: string[];
  txtRecords: string[];
  cnameRecord: string | null;
  hasSPF: boolean;
  hasDMARC: boolean;
  hasDKIM: boolean;
  ttl: number | null;
}

export interface SecurityVulnerability {
  type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
}

export interface AIPoweredRecommendation {
  priorityActions: Array<{
    area: string;
    areaAr: string;
    action: string;
    actionAr: string;
    impact: "critical" | "high" | "medium" | "low";
    estimatedTime: string;
  }>;
  quickWins: Array<{
    action: string;
    actionAr: string;
    timeToImplement: string;
  }>;
  longTermStrategy: Array<{
    strategy: string;
    strategyAr: string;
    description: string;
    descriptionAr: string;
    timeline: string;
  }>;
  estimatedImprovement: number;
  estimatedTimeToImplement: string;
  competitiveContext: string;
  marketReadiness: string;
}
