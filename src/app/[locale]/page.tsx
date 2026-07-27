"use client";

import { useState, useEffect } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { OnboardingSteps } from "@/components/home/OnboardingSteps";
import { VideoSection } from "@/components/home/VideoSection";
import { AnalysisProgress } from "@/components/analysis/AnalysisProgress";
import { ScoreBreakdown } from "@/components/analysis/ScoreBreakdown";
import { EvidenceCard } from "@/components/analysis/EvidenceCard";
import { FixAssistant } from "@/components/analysis/FixAssistant";
import { CompetitorComparison } from "@/components/analysis/CompetitorComparison";
import { AnalysisHistory } from "@/components/analysis/AnalysisHistory";
import { PdfReport } from "@/components/analysis/PdfReport";
import { MethodologySection } from "@/components/home/MethodologySection";
import { analyzeUrl } from "@/lib/analysis-engine";
import { saveAnalysis, getAnalysisHistory } from "@/lib/storage";
import type { AnalysisResult, AnalysisStage, Finding } from "@/lib/types";

interface PageProps {
  params: { locale: string };
}

export default function HomePage({ params }: PageProps) {
  const locale = params.locale || "en";
  const [currentView, setCurrentView] = useState<"home" | "analyzing" | "results">("home");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<string>("website");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [stages, setStages] = useState<AnalysisStage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);
  const [showFixAssistant, setShowFixAssistant] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (submittedUrl: string, selectedPlatform?: string) => {
    setUrl(submittedUrl);
    setPlatform(selectedPlatform || "website");
    setCurrentView("analyzing");
    setIsAnalyzing(true);
    setError(null);

    // Initialize stages
    const initialStages = [
      { id: "validating", label: "Validating URL", labelAr: "التحقق من الرابط", status: "pending" as const },
      { id: "connecting", label: "Connecting", labelAr: "الاتصال", status: "pending" as const },
      { id: "collecting", label: "Collecting data", labelAr: "جمع البيانات", status: "pending" as const },
      { id: "seo", label: "SEO Analysis", labelAr: "تحليل SEO", status: "pending" as const },
      { id: "technical", label: "Technical Check", labelAr: "الفحص التقني", status: "pending" as const },
      { id: "performance", label: "Performance", labelAr: "الأداء", status: "pending" as const },
      { id: "accessibility", label: "Accessibility", labelAr: "إمكانية الوصول", status: "pending" as const },
      { id: "recommendations", label: "Recommendations", labelAr: "التوصيات", status: "pending" as const },
      { id: "preparing", label: "Preparing Report", labelAr: "تجهيز التقرير", status: "pending" as const },
    ];
    setStages(initialStages);

    try {
      // Simulate analysis progression
      const updatedStages = [...initialStages] as AnalysisStage[];
      for (let i = 0; i < updatedStages.length; i++) {
        updatedStages[i] = { ...updatedStages[i], status: "processing" } as AnalysisStage;
        setStages([...updatedStages]);
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
        updatedStages[i] = { ...updatedStages[i], status: "completed" } as AnalysisStage;
        setStages([...updatedStages]);
      }

      const result = await analyzeUrl(submittedUrl, locale);
      saveAnalysis(result);
      setAnalysisResult(result);
      setCurrentView("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReAnalyze = () => {
    if (url) handleAnalyze(url, platform);
  };

  const handleHelpFix = (finding: Finding) => {
    setActiveFinding(finding);
    setShowFixAssistant(true);
  };

  const handleNewAnalysis = () => {
    setCurrentView("home");
    setAnalysisResult(null);
    setStages([]);
    setUrl("");
    setPlatform("website");
    setError(null);
    setShowFixAssistant(false);
    setActiveFinding(null);
  };

  const history = url ? getAnalysisHistory() : [];

  return (
    <div className="min-h-screen bg-dark-950">
      {currentView === "home" && (
        <>
          <HeroSection onAnalyze={handleAnalyze} locale={locale} />
          <OnboardingSteps locale={locale} />
          <VideoSection locale={locale} />
          <MethodologySection locale={locale} />
        </>
      )}

      {currentView === "analyzing" && (
        <div className="pt-24 pb-16 px-4 bg-dark-950 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <AnalysisProgress stages={stages} url={url} error={error} locale={locale} />
          </div>
        </div>
      )}

      {currentView === "results" && analysisResult && (
        <div className="pt-24 pb-16 px-4 bg-dark-950 min-h-screen">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {locale === "ar" ? "نتائج التحليل" : "Analysis Results"}
                </h1>
                <p className="text-dark-400 text-sm mt-1">{analysisResult.url}</p>
                {platform !== "website" && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gold-500/20 text-gold-300">
                    {platform}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleReAnalyze} className="px-4 py-2 rounded-lg border border-gold-500/20 text-gold-300 text-sm hover:bg-gold-500/10 transition-colors">
                  {locale === "ar" ? "إعادة التحليل" : "Re-Analyze"}
                </button>
                <button onClick={handleNewAnalysis} className="px-4 py-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 text-sm font-bold hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25">
                  {locale === "ar" ? "تحليل جديد" : "New Analysis"}
                </button>
              </div>
            </div>

            <ScoreBreakdown overallScore={analysisResult.overallScore} scores={analysisResult.scores} locale={locale} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl p-6 bg-dark-800/60 border border-gold-500/10">
                <h3 className="text-lg font-semibold text-gold-400 mb-4">{locale === "ar" ? "نقاط القوة" : "Strengths"}</h3>
                <ul className="space-y-2">
                  {analysisResult.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-dark-300">
                      <span className="text-gold-500 mt-0.5">✓</span>{s}
                    </li>
                  ))}
                  {analysisResult.strengths.length === 0 && (
                    <li className="text-sm text-dark-500">{locale === "ar" ? "لم يتم اكتشاف نقاط قوة محددة" : "No specific strengths detected"}</li>
                  )}
                </ul>
              </div>
              <div className="rounded-xl p-6 bg-dark-800/60 border border-gold-500/10">
                <h3 className="text-lg font-semibold text-red-400 mb-4">{locale === "ar" ? "نقاط الضعف" : "Weaknesses"}</h3>
                <ul className="space-y-2">
                  {analysisResult.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-dark-300">
                      <span className="text-red-400 mt-0.5">✗</span>{w}
                    </li>
                  ))}
                  {analysisResult.weaknesses.length === 0 && (
                    <li className="text-sm text-dark-500">{locale === "ar" ? "لم يتم اكتشاف نقاط ضعف كبيرة" : "No major weaknesses detected"}</li>
                  )}
                </ul>
              </div>
            </div>

            {analysisResult.criticalIssues.length > 0 && (
              <div className="rounded-xl p-6 bg-red-500/5 border border-red-500/20">
                <h3 className="text-lg font-semibold text-red-400 mb-4">{locale === "ar" ? "المشكلات الحرجة" : "Critical Issues"}</h3>
                <div className="space-y-4">
                  {analysisResult.criticalIssues.map((finding) => (
                    <EvidenceCard key={finding.id} finding={finding} locale={locale} onHelpFix={() => handleHelpFix(finding)} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold text-white mb-6">{locale === "ar" ? "جميع النتائج والأدلة" : "All Findings & Evidence"}</h3>
              <div className="space-y-4">
                {analysisResult.findings.map((finding) => (
                  <EvidenceCard key={finding.id} finding={finding} locale={locale} onHelpFix={() => handleHelpFix(finding)} />
                ))}
              </div>
            </div>

            <CompetitorComparison primaryResult={analysisResult} locale={locale} />

            {history.length > 0 && (
              <AnalysisHistory history={history} locale={locale} onReAnalyze={handleReAnalyze} currentResult={analysisResult} />
            )}

            <PdfReport result={analysisResult} locale={locale} />
          </div>
        </div>
      )}

      {showFixAssistant && activeFinding && (
        <FixAssistant finding={activeFinding} locale={locale} onClose={() => { setShowFixAssistant(false); setActiveFinding(null); }} />
      )}
    </div>
  );
}