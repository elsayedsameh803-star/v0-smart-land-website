// ============================================
// Smart Land - AI Digital Audit Platform Types
// ============================================

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
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
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
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: number;
}

export interface CompetitorComparison {
  url: string;
  competitorUrl: string;
  date: string;
  scores: {
    category: keyof CategoryScores;
    primary: number;
    competitor: number;
  }[];
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
  priority: 'critical' | 'high' | 'medium' | 'low' | 'info';
  issue: string;
  issueAr: string;
  action: string;
  actionAr: string;
  expectedImpact: string;
  expectedImpactAr: string;
}

export interface AdminMetrics {
  totalAnalyses: number;
  platformDistribution: { name: string; count: number }[];
  recentActivity: { date: string; count: number }[];
  processingFailures: number;
  apiFailures: number;
  averageDuration: number;
  commonIssues: { issue: string; count: number }[];
  systemHealth: {
    api: 'healthy' | 'degraded' | 'down';
    database: 'healthy' | 'degraded' | 'down';
    lastChecked: string;
  };
}

export interface ExplainerVideo {
  posterUrl: string;
  videoUrl: string;
  duration: number;
  transcriptEn: string;
  transcriptAr: string;
  thumbnailUrl: string;
}

export interface MethodologySection {
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  icon: string;
}