'use client';

import { useState } from 'react';
import { ArrowRight, AlertTriangle, Info } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import { compareWithCompetitor } from '@/lib/analysis-engine';
import { getScoreColor, getScoreBgColor, getCategoryLabel } from '@/lib/utils';

interface Props {
  primaryResult: AnalysisResult;
  locale: 'en' | 'ar';
}

export function CompetitorComparison({ primaryResult, locale }: Props) {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [comparison, setComparison] = useState<ReturnType<typeof compareWithCompetitor> | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const handleCompare = () => {
    if (!competitorUrl.trim()) return;
    setIsComparing(true);
    
    // Simulate comparison
    setTimeout(() => {
      const result = compareWithCompetitor(primaryResult, competitorUrl);
      setComparison(result);
      setIsComparing(false);
    }, 1500);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        {locale === 'ar' ? 'مقارنة المنافسين' : 'Competitor Comparison'}
      </h3>
      <p className="text-sm text-smart-gray mb-6">
        {locale === 'ar' ? 'قارن موقعك مع رابط عام آخر' : 'Compare your site with another public URL'}
      </p>

      {/* Input */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={competitorUrl}
          onChange={(e) => setCompetitorUrl(e.target.value)}
          placeholder={locale === 'ar' ? 'أدخل رابط المنافس' : 'Enter competitor URL'}
          className="flex-1 bg-smart-dark-3 border border-smart-dark-3 rounded-lg px-4 py-2.5 text-sm text-white placeholder-smart-gray-dark focus:border-smart-gold/50 transition-colors"
        />
        <button
          onClick={handleCompare}
          disabled={!competitorUrl.trim() || isComparing}
          className="btn-gold px-4 py-2.5 rounded-lg text-sm disabled:opacity-50"
        >
          {isComparing
            ? (locale === 'ar' ? 'جارٍ المقارنة...' : 'Comparing...')
            : (locale === 'ar' ? 'قارن' : 'Compare')}
        </button>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6 animate-fade-in">
          {/* Score Comparison */}
          <div className="space-y-3">
            {comparison.scores.map((score) => (
              <div key={score.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-smart-gray-light">
                    {getCategoryLabel(score.category, locale)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${getScoreColor(score.primary)}`}>
                      {locale === 'ar' ? 'موقعك: ' : 'You: '}{score.primary}
                    </span>
                    <ArrowRight className="w-3 h-3 text-smart-gray-dark" />
                    <span className={`font-medium ${getScoreColor(score.competitor)}`}>
                      {locale === 'ar' ? 'المنافس: ' : 'Them: '}{score.competitor}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 h-2">
                  <div
                    className={`rounded-l-full ${getScoreBgColor(score.primary)}`}
                    style={{ width: `${score.primary}%` }}
                  />
                  <div
                    className={`rounded-r-full ${getScoreBgColor(score.competitor)}`}
                    style={{ width: `${score.competitor}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Limitations */}
          <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-yellow-400 mb-2">
                  {locale === 'ar' ? 'حدود المقارنة' : 'Comparison Limitations'}
                </p>
                <ul className="space-y-1">
                  {comparison.limitations.map((lim, i) => (
                    <li key={i} className="text-xs text-yellow-400/70 flex items-start gap-1">
                      <span>•</span>
                      {lim}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info when no comparison yet */}
      {!comparison && (
        <div className="flex items-center gap-2 text-xs text-smart-gray-dark">
          <Info className="w-3 h-3" />
          <span>
            {locale === 'ar'
              ? 'أدخل رابط منافس لمقارنة الإشارات العامة القابلة للقياس'
              : 'Enter a competitor URL to compare publicly measurable signals'}
          </span>
        </div>
      )}
    </div>
  );
}