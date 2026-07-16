'use client';

import { useState } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import type { AnalysisHistory as HistoryType, AnalysisResult } from '@/lib/types';
import { formatDateShort, getScoreColor } from '@/lib/utils';
import { compareAnalyses } from '@/lib/analysis-engine';

interface Props {
  history: HistoryType[];
  locale: 'en' | 'ar';
  onReAnalyze: () => void;
  currentResult: AnalysisResult;
}

export function AnalysisHistory({ history, locale, onReAnalyze, currentResult }: Props) {
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  if (history.length === 0) return null;

  const previousAnalysis = history.length > 1 ? history[history.length - 1] : null;
  const comparison = previousAnalysis && history.length >= 2
    ? compareAnalyses(
        { ...currentResult, overallScore: previousAnalysis.overallScore } as AnalysisResult,
        currentResult
      )
    : null;

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        {locale === 'ar' ? 'سجل التحليلات' : 'Analysis History'}
      </h3>

      {/* History List */}
      <div className="space-y-3 mb-6">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg bg-smart-dark-3/50 border border-smart-dark-3"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-smart-gray" />
              <div>
                <p className="text-sm text-white">{formatDateShort(item.date, locale)}</p>
                <p className="text-xs text-smart-gray">{item.url}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-bold ${getScoreColor(item.overallScore)}`}>
                {item.overallScore}
              </span>
              {item.change !== null && (
                <span className={`text-xs flex items-center gap-1 ${
                  item.change > 0 ? 'text-green-400' : item.change < 0 ? 'text-red-400' : 'text-smart-gray'
                }`}>
                  {item.change > 0 ? <TrendingUp className="w-3 h-3" /> :
                   item.change < 0 ? <TrendingDown className="w-3 h-3" /> :
                   <Minus className="w-3 h-3" />}
                  {item.change > 0 ? '+' : ''}{item.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Before/After Comparison */}
      {comparison && (
        <div>
          <button
            onClick={() => setShowBeforeAfter(!showBeforeAfter)}
            className="flex items-center gap-2 text-sm text-smart-gold hover:text-smart-gold-light transition-colors mb-4"
          >
            <BarChart3 className="w-4 h-4" />
            {locale === 'ar' ? 'مقارنة قبل / بعد' : 'Before / After Comparison'}
          </button>

          {showBeforeAfter && (
            <div className="space-y-4 animate-fade-in">
              {/* Overall Change */}
              <div className={`p-4 rounded-lg ${
                comparison.overallChange >= 0 ? 'bg-green-500/5 border border-green-500/20' : 'bg-red-500/5 border border-red-500/20'
              }`}>
                <p className="text-sm font-medium">
                  {locale === 'ar' ? 'التغيير الإجمالي: ' : 'Overall Change: '}
                  <span className={comparison.overallChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {comparison.overallChange > 0 ? '+' : ''}{comparison.overallChange}
                  </span>
                </p>
              </div>

              {/* Category Changes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {comparison.categoryChanges.map((cat) => (
                  <div key={cat.category} className="p-2 rounded-lg bg-smart-dark-3/50 text-center">
                    <p className="text-xs text-smart-gray capitalize">{cat.category}</p>
                    <p className={`text-sm font-bold ${
                      cat.change > 0 ? 'text-green-400' : cat.change < 0 ? 'text-red-400' : 'text-smart-gray'
                    }`}>
                      {cat.change > 0 ? '+' : ''}{cat.change}
                    </p>
                  </div>
                ))}
              </div>

              {/* Resolved/New Findings */}
              {comparison.findingsResolved.length > 0 && (
                <div>
                  <p className="text-xs text-green-400 font-semibold mb-2">
                    {locale === 'ar' ? 'تم حل المشكلات:' : 'Resolved Issues:'}
                  </p>
                  <ul className="space-y-1">
                    {comparison.findingsResolved.map((f, i) => (
                      <li key={i} className="text-xs text-green-400/70 flex items-start gap-1">
                        <span>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {comparison.findingsNew.length > 0 && (
                <div>
                  <p className="text-xs text-yellow-400 font-semibold mb-2">
                    {locale === 'ar' ? 'مشكلات جديدة:' : 'New Issues:'}
                  </p>
                  <ul className="space-y-1">
                    {comparison.findingsNew.map((f, i) => (
                      <li key={i} className="text-xs text-yellow-400/70 flex items-start gap-1">
                        <span>•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Re-Analyze Button */}
      <div className="mt-6">
        <button
          onClick={onReAnalyze}
          className="btn-gold-outline w-full px-4 py-2.5 rounded-lg text-sm"
        >
          {locale === 'ar' ? 'إعادة التحليل' : 'Re-Analyze URL'}
        </button>
      </div>
    </div>
  );
}