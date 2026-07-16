'use client';

import { X, Lightbulb, List, Code, Star, Sparkles } from 'lucide-react';
import type { Finding } from '@/lib/types';
import { generateFixSuggestion } from '@/lib/analysis-engine';
import { getSeverityColor, getSeverityLabel } from '@/lib/utils';

interface Props {
  finding: Finding;
  locale: 'en' | 'ar';
  onClose: () => void;
}

export function FixAssistant({ finding, locale, onClose }: Props) {
  const suggestion = generateFixSuggestion(finding, locale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl border border-smart-gold/20 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-smart-dark/95 backdrop-blur-md border-b border-smart-dark-3 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-smart-gold to-smart-gold-dark flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-smart-black" />
            </div>
            <div>
              <h3 className="text-base font-bold gold-gradient-text">
                {locale === 'ar' ? 'مساعد الإصلاح بالذكاء الاصطناعي' : 'AI Fix Assistant'}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(finding.severity)}`}>
                {getSeverityLabel(finding.severity, locale)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-smart-gray-light hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Issue */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">
              {locale === 'ar' ? 'المشكلة' : 'Issue'}
            </h4>
            <p className="text-sm text-smart-gray-light">
              {locale === 'ar' ? finding.issueAr : finding.issue}
            </p>
          </div>

          {/* Explanation */}
          <div>
            <div className="flex items-center gap-2 text-xs text-smart-gold font-semibold mb-2">
              <Lightbulb className="w-3.5 h-3.5" />
              {locale === 'ar' ? 'الشرح' : 'Explanation'}
            </div>
            <p className="text-sm text-smart-gray-light bg-smart-dark-3/50 rounded-lg p-4">
              {suggestion.explanation}
            </p>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center gap-2 text-xs text-smart-gold font-semibold mb-3">
              <List className="w-3.5 h-3.5" />
              {locale === 'ar' ? 'خطوات الإصلاح' : 'Fix Steps'}
            </div>
            <ol className="space-y-2">
              {(locale === 'ar' ? suggestion.stepsAr : suggestion.steps).map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-smart-gray-light">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-smart-gold/10 text-smart-gold flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Code Example */}
          {suggestion.codeExample && (
            <div>
              <div className="flex items-center gap-2 text-xs text-smart-gold font-semibold mb-2">
                <Code className="w-3.5 h-3.5" />
                {locale === 'ar' ? 'مثال برمجي' : 'Code Example'}
              </div>
              <pre className="text-xs text-smart-gray-light bg-smart-black rounded-lg p-4 overflow-x-auto font-mono border border-smart-dark-3">
                {suggestion.codeExample}
              </pre>
            </div>
          )}

          {/* Expected Outcome */}
          <div>
            <div className="flex items-center gap-2 text-xs text-green-400 font-semibold mb-2">
              <Star className="w-3.5 h-3.5" />
              {locale === 'ar' ? 'النتيجة المتوقعة' : 'Expected Outcome'}
            </div>
            <p className="text-sm text-green-400/80 bg-green-500/5 rounded-lg p-4">
              {locale === 'ar' ? suggestion.expectedOutcomeAr : suggestion.expectedOutcome}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-smart-dark-3 flex justify-end">
          <button
            onClick={onClose}
            className="btn-gold-outline px-6 py-2 rounded-lg text-sm"
          >
            {locale === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}