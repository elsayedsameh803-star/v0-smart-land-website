'use client';

import { useState, useEffect } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { OnboardingSteps } from '@/components/home/OnboardingSteps';
import { VideoSection } from '@/components/home/VideoSection';
import { AnalysisProgress } from '@/components/analysis/AnalysisProgress';
import { ScoreBreakdown } from '@/components/analysis/ScoreBreakdown';
import { EvidenceCard } from '@/components/analysis/EvidenceCard';
import { FixAssistant } from '@/components/analysis/FixAssistant';
import { CompetitorComparison } from '@/components/analysis/CompetitorComparison';
import { AnalysisHistory } from '@/components/analysis/AnalysisHistory';
import { PdfReport } from '@/components/analysis/PdfReport';
import { MethodologySection } from '@/components/home/MethodologySection';
import { analyzeUrl, storeAnalysisResult, getAnalysisHistory, compareWithCompetitor } from '@/lib/analysis-engine';
import type { AnalysisResult, AnalysisStage, Finding } from '@/lib/types';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'home' | 'analyzing' | 'results'>('home');
  const [url, setUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [stages, setStages] = useState<AnalysisStage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);
  const [showFixAssistant, setShowFixAssistant] = useState(false);
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dir = document.documentElement.dir;
    setLocale(dir === 'rtl' ? 'ar' : 'en');
  }, []);

  const handleAnalyze = async (submittedUrl: string) => {
    setUrl(submittedUrl);
    setCurrentView('analyzing');
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeUrl(submittedUrl, (stage, allStages) => {
        setStages([...allStages]);
      });
      
      storeAnalysisResult(result);
      setAnalysisResult(result);
      setCurrentView('results');
      setIsAnalyzing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleReAnalyze = () => {
    if (url) {
      handleAnalyze(url);
    }
  };

  const handleHelpFix = (finding: Finding) => {
    setActiveFinding(finding);
    setShowFixAssistant(true);
  };

  const handleNewAnalysis = () => {
    setCurrentView('home');
    setAnalysisResult(null);
    setStages([]);
    setUrl('');
    setError(null);
    setShowFixAssistant(false);
    setActiveFinding(null);
  };

  const history = url ? getAnalysisHistory(url) : [];

  return (
    <div className="min-h-screen">
      {/* Home View */}
      {currentView === 'home' && (
        <>
          <HeroSection onAnalyze={handleAnalyze} locale={locale} />
          <OnboardingSteps locale={locale} />
          <VideoSection locale={locale} />
          <MethodologySection locale={locale} />
        </>
      )}

      {/* Analysis View */}
      {currentView === 'analyzing' && (
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <AnalysisProgress stages={stages} url={url} error={error} locale={locale} />
          </div>
        </div>
      )}

      {/* Results View */}
      {currentView === 'results' && analysisResult && (
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold gold-gradient-text">
                  {locale === 'ar' ? 'نتائج التحليل' : 'Analysis Results'}
                </h1>
                <p className="text-smart-gray text-sm mt-1">
                  {analysisResult.url}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReAnalyze}
                  className="btn-gold-outline px-4 py-2 rounded-lg text-sm"
                >
                  {locale === 'ar' ? 'إعادة التحليل' : 'Re-Analyze'}
                </button>
                <button
                  onClick={handleNewAnalysis}
                  className="btn-gold px-4 py-2 rounded-lg text-sm"
                >
                  {locale === 'ar' ? 'تحليل جديد' : 'New Analysis'}
                </button>
              </div>
            </div>

            {/* Score Breakdown */}
            <ScoreBreakdown
              overallScore={analysisResult.overallScore}
              scores={analysisResult.scores}
              locale={locale}
            />

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-4">
                  {locale === 'ar' ? 'نقاط القوة' : 'Strengths'}
                </h3>
                <ul className="space-y-2">
                  {analysisResult.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-smart-gray-light">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {s}
                    </li>
                  ))}
                  {analysisResult.strengths.length === 0 && (
                    <li className="text-sm text-smart-gray">
                      {locale === 'ar' ? 'لم يتم اكتشاف نقاط قوة محددة' : 'No specific strengths detected'}
                    </li>
                  )}
                </ul>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4">
                  {locale === 'ar' ? 'نقاط الضعف' : 'Weaknesses'}
                </h3>
                <ul className="space-y-2">
                  {analysisResult.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-smart-gray-light">
                      <span className="text-red-400 mt-0.5">✗</span>
                      {w}
                    </li>
                  ))}
                  {analysisResult.weaknesses.length === 0 && (
                    <li className="text-sm text-smart-gray">
                      {locale === 'ar' ? 'لم يتم اكتشاف نقاط ضعف كبيرة' : 'No major weaknesses detected'}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Critical Issues */}
            {analysisResult.criticalIssues.length > 0 && (
              <div className="glass-card rounded-xl p-6 border-red-500/20">
                <h3 className="text-lg font-semibold text-red-400 mb-4">
                  {locale === 'ar' ? 'المشكلات الحرجة' : 'Critical Issues'}
                </h3>
                <div className="space-y-4">
                  {analysisResult.criticalIssues.map((finding) => (
                    <EvidenceCard
                      key={finding.id}
                      finding={finding}
                      locale={locale}
                      onHelpFix={() => handleHelpFix(finding)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Findings by Category */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">
                {locale === 'ar' ? 'جميع النتائج والأدلة' : 'All Findings & Evidence'}
              </h3>
              <div className="space-y-4">
                {analysisResult.findings.map((finding) => (
                  <EvidenceCard
                    key={finding.id}
                    finding={finding}
                    locale={locale}
                    onHelpFix={() => handleHelpFix(finding)}
                  />
                ))}
              </div>
            </div>

            {/* Competitor Comparison */}
            <CompetitorComparison
              primaryResult={analysisResult}
              locale={locale}
            />

            {/* Analysis History */}
            {history.length > 0 && (
              <AnalysisHistory
                history={history}
                locale={locale}
                onReAnalyze={handleReAnalyze}
                currentResult={analysisResult}
              />
            )}

            {/* PDF Report */}
            <PdfReport
              result={analysisResult}
              locale={locale}
            />
          </div>
        </div>
      )}

      {/* AI Fix Assistant Modal */}
      {showFixAssistant && activeFinding && (
        <FixAssistant
          finding={activeFinding}
          locale={locale}
          onClose={() => {
            setShowFixAssistant(false);
            setActiveFinding(null);
          }}
        />
      )}
    </div>
  );
}