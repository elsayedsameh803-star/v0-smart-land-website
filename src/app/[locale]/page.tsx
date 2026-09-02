"use client";

import { useState, useEffect } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { OnboardingSteps } from "@/components/home/OnboardingSteps";
import { VideoSection } from "@/components/home/VideoSection";
import { StatsSection } from "@/components/home/StatsSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { PricingSection } from "@/components/home/PricingSection";
import { CTASection } from "@/components/home/CTASection";
import { AnalysisProgress } from "@/components/analysis/AnalysisProgress";
import { ScoreBreakdown } from "@/components/analysis/ScoreBreakdown";
import { EvidenceCard } from "@/components/analysis/EvidenceCard";
import { FixAssistant } from "@/components/analysis/FixAssistant";
import { CompetitorComparison } from "@/components/analysis/CompetitorComparison";
import { AnalysisHistory } from "@/components/analysis/AnalysisHistory";
import { PdfReport } from "@/components/analysis/PdfReport";
import { MethodologySection } from "@/components/home/MethodologySection";
import { TikTokDataPanel } from "@/components/analysis/TikTokDataPanel";
import { TikTokConnectCard } from "@/components/analysis/TikTokConnectCard";
import { SocialLinkPrompt } from "@/components/analysis/SocialLinkPrompt";
import { ConnectionGate } from "@/components/analysis/ConnectionGate";
import { analyzeUrl, getAnalysisStages } from "@/lib/analysis-engine";
import { saveAnalysis, getAnalysisHistory } from "@/lib/storage";
import { PLATFORMS, getPlatformMeta, type PlatformId } from "@/lib/platforms";
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
  const [connectionVerified, setConnectionVerified] = useState<boolean>(true);

  // Social platforms come from the single registry (src/lib/platforms.ts).
  const socialPlatforms = PLATFORMS.filter((p) => p.requiresConnection).map((p) => p.id);
  const isSocialPlatform = socialPlatforms.includes(platform as PlatformId);

  const handleAnalyze = async (submittedUrl: string, selectedPlatform?: string) => {
    // Check connection before starting analysis for social platforms
    const newPlatform = selectedPlatform || "website";
    if (socialPlatforms.includes(newPlatform as PlatformId) && !connectionVerified) {
      const platformName = getPlatformMeta(newPlatform);
      setError(locale === "ar" 
        ? `يرجى ربط حساب ${platformName?.nameAr || newPlatform} أولاً قبل بدء التحليل` 
        : `Please connect your ${platformName?.name || newPlatform} account before starting analysis`);
      return;
    }

    setUrl(submittedUrl);
    setPlatform(newPlatform);
    setError(null);

    // Remember the pending URL so ANY platform's OAuth return can resume it.
    try {
      sessionStorage.setItem("sl_pending_url", submittedUrl);
      sessionStorage.setItem("sl_pending_platform", selectedPlatform || "website");
    } catch {
      // ignore
    }

    // Initialize real stages IMMEDIATELY before any network calls
    // This ensures the user sees the stages list right away, not "0 من 0 مراحل"
    const initialStages = getAnalysisStages();
    setStages(initialStages);
    setCurrentView("analyzing");
    setIsAnalyzing(true);

    // Helper to update a single stage status
    const updateStage = (id: string, status: "pending" | "processing" | "completed" | "error") => {
      setStages(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };

    try {
      const stageOrder = initialStages.map(s => s.id);
      
      // Start the real-time stage progression
      // Stage 1: validating
      updateStage(stageOrder[0], "processing");

      const result = await analyzeUrl(submittedUrl, locale, selectedPlatform, {
        onStageStart: (id) => updateStage(id, "processing"),
        onStageComplete: (id) => updateStage(id, "completed"),
        onStageError: (id) => updateStage(id, "error"),
      });
      
      // Mark all stages as completed
      const completedStages = initialStages.map(s => ({ ...s, status: "completed" as const }));
      setStages(completedStages);
      
      saveAnalysis(result);
      setAnalysisResult(result);
      setCurrentView("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Auto-resume the pending analysis after ANY platform's OAuth return.
    // Each platform comes back with ITS OWN flag (meta_oauth / youtube_oauth /
    // tiktok_oauth / snapchat_oauth / linkedin_oauth) — see PLATFORMS[*].
    // oauthFlagParam. Only a `success` flag resumes; `failed` is surfaced by
    // the ConnectionGate banner instead.
    try {
      const params = new URLSearchParams(window.location.search);
      const returnedPlatform = PLATFORMS.find(
        (p) => p.oauthFlagParam && params.get(p.oauthFlagParam) !== null
      );
      if (!returnedPlatform) return;

      const flagValue = params.get(returnedPlatform.oauthFlagParam);
      const pendingUrl = sessionStorage.getItem("sl_pending_url");
      const pendingPlatform =
        sessionStorage.getItem("sl_pending_platform") || "website";
      sessionStorage.removeItem("sl_pending_url");
      sessionStorage.removeItem("sl_pending_platform");

      // Clean the marker params so they can never re-trigger on reload.
      for (const p of PLATFORMS) {
        if (p.oauthFlagParam) params.delete(p.oauthFlagParam);
      }
      window.history.replaceState(
        {},
        "",
        params.toString() === ""
          ? window.location.pathname
          : `${window.location.pathname}?${params.toString()}`
      );

      if (flagValue === "success" && pendingUrl) {
        handleAnalyze(pendingUrl, pendingPlatform);
      }
    } catch {
      // ignore — the flag is best-effort only
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div id="page-home" className="bg-dark-950">
          <HeroSection onAnalyze={handleAnalyze} locale={locale} />
          <StatsSection locale={locale} />
          <OnboardingSteps locale={locale} />
          <VideoSection locale={locale} />
          <PartnersSection locale={locale} />
          <TestimonialsSection locale={locale} />
          <MethodologySection locale={locale} />
          <PricingSection locale={locale} />
          <CTASection locale={locale} onAnalyze={handleAnalyze} />
        </div>
      )}

      {currentView === "analyzing" && (
        <div id="page-analyzing" className="pt-24 pb-16 px-4 bg-dark-950 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <ConnectionGate 
              locale={locale} 
              selectedPlatform={platform}
              onConnectionVerified={setConnectionVerified}
            />
            <AnalysisProgress stages={stages} url={url} error={error} locale={locale} />
            {error && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={() => { if (url) handleAnalyze(url, platform); }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 text-sm font-bold hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25">
                  {locale === "ar" ? "إعادة المحاولة" : "Try Again"}
                </button>
                <button onClick={handleNewAnalysis} className="px-6 py-3 rounded-xl border border-gold-500/20 text-gold-300 text-sm hover:bg-gold-500/10 transition-colors">
                  {locale === "ar" ? "رجوع للرئيسية" : "Back to Home"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentView === "results" && analysisResult && (
        <div id="page-results" className="pt-24 pb-16 px-4 bg-dark-950 min-h-screen">
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

            {/* Linking gate: public analysis stays open; private/hidden pages
                get a one-click connect prompt that returns here instantly */}
            <SocialLinkPrompt platform={platform} result={analysisResult} locale={locale} />

            {platform === "tiktok" && (
              <div className="space-y-4">
                <TikTokConnectCard locale={locale} />
                <TikTokDataPanel result={analysisResult} locale={locale} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl p-6 bg-dark-800/60 border border-gold-500/10">
                <h3 className="text-sm uppercase tracking-[0.2em] text-gold-400 mb-3">
                  {locale === "ar" ? "ثقة المصدر" : "Source Confidence"}
                </h3>
                <p className="text-2xl font-semibold text-white capitalize">
                  {analysisResult.metadata.sourceConfidence || (locale === "ar" ? "محدودة" : "Limited")}
                </p>
                <p className="text-dark-400 text-sm mt-3">
                  {locale === "ar"
                    ? "قياس جودة البيانات المستخدمة في التحليل"
                    : "Quality of the extracted data used for analysis"}
                </p>
              </div>
              <div className="md:col-span-2 rounded-xl p-6 bg-dark-800/60 border border-gold-500/10">
                <h3 className="text-sm uppercase tracking-[0.2em] text-gold-400 mb-3">
                  {locale === "ar" ? "مصادر البيانات" : "Data Sources"}
                </h3>
                <div className="space-y-2 text-dark-300 text-sm">
                  {analysisResult.metadata.dataSources.map((source, index) => (
                    <div key={index} className="rounded-lg border border-gold-500/10 p-3 bg-dark-900/80">
                      {source}
                    </div>
                  ))}
                </div>
              </div>
            </div>

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