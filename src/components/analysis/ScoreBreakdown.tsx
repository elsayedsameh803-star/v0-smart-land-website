'use client';

import type { CategoryScores } from '@/lib/types';
import { getScoreColor, getScoreBgColor, getScoreLabel, getCategoryLabel } from '@/lib/utils';

interface Props {
  overallScore: number;
  scores: CategoryScores;
  locale: 'en' | 'ar';
}

export function ScoreBreakdown({ overallScore, scores, locale }: Props) {
  const categories = Object.entries(scores) as [keyof CategoryScores, typeof scores[keyof CategoryScores]][];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-sm text-smart-gray mb-2">
          {locale === 'ar' ? 'النتيجة الإجمالية' : 'Overall Score'}
        </p>
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#222"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(overallScore / 100) * 339.292} 339.292`}
              className={getScoreColor(overallScore)}
            />
          </svg>
          <span className={`absolute text-3xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}
          </span>
        </div>
        <p className={`text-sm font-medium mt-2 ${getScoreColor(overallScore)}`}>
          {getScoreLabel(overallScore, locale)}
        </p>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(([key, category]) => (
          <div key={key} className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">
                {getCategoryLabel(key, locale)}
              </span>
              <span className={`text-sm font-bold ${getScoreColor(category.score)}`}>
                {category.score}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-smart-dark-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getScoreBgColor(category.score)}`}
                style={{ width: `${(category.score / category.maxScore) * 100}%` }}
              />
            </div>

            <p className={`text-xs mt-2 ${getScoreColor(category.score)}`}>
              {getScoreLabel(category.score, locale)}
            </p>

            {category.findings.length > 0 && (
              <p className="text-xs text-smart-gray-dark mt-1">
                {category.findings.length} {locale === 'ar' ? 'نتيجة' : 'finding'}
                {category.findings.length !== 1 ? (locale === 'ar' ? '' : 's') : ''}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}