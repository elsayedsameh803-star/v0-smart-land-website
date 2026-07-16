'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Info, HelpCircle, Code, Target, Zap } from 'lucide-react';
import type { Finding } from '@/lib/types';
import { getSeverityColor, getSeverityLabel } from '@/lib/utils';

interface Props {
  finding: Finding;
  locale: 'en' | 'ar';
  onHelpFix?: () => void;
}

export function EvidenceCard({ finding, locale, onHelpFix }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`audit-card glass-card rounded-xl overflow-hidden border-l-4 ${
      finding.severity === 'critical' ? 'border-l-red-500' :
      finding.severity === 'high' ? 'border-l-orange-500' :
      finding.severity === 'medium' ? 'border-l-yellow-500' :
      finding.severity === 'low' ? 'border-l-smart-gold' :
      'border-l-blue-500'
    }`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex-shrink-0 mt-0.5">
          {finding.severity === 'critical' || finding.severity === 'high' ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : (
            <Info className="w-5 h-5 text-smart-gold" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getSeverityColor(finding.severity)}`}>
              {getSeverityLabel(finding.severity, locale)}
            </span>
          </div>
          <h4 className="text-sm font-medium text-white">
            {locale === 'ar' ? finding.issueAr : finding.issue}
          </h4>
        </div>

        <div className="flex-shrink-0 text-smart-gray mt-1">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="border-t border-smart-dark-3 pt-4" />

          {/* Evidence */}
          <div>
            <div className="flex items-center gap-2 text-xs text-smart-gold font-semibold mb-2">
              <Target className="w-3.5 h-3.5" />
              {locale === 'ar' ? 'الدليل' : 'Evidence'}
            </div>
            <p className="text-sm text-smart-gray-light bg-smart-dark-3/50 rounded-lg p-3">
              {locale === 'ar' ? finding.evidenceAr : finding.evidence}
            </p>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center gap-2 text-xs text-smart-gold font-semibold mb-2">
              <Code className="w-3.5 h-3.5" />
              {locale === 'ar' ? 'الموقع' : 'Location'}
            </div>
            <p className="text-sm text-smart-gray-light font-mono">
              {finding.location}
            </p>
          </div>

          {/* Why It Matters */}
          <div>
            <div className="flex items-center gap-2 text-xs text-smart-gold font-semibold mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              {locale === 'ar' ? 'لماذا يهم' : 'Why It Matters'}
            </div>
            <p className="text-sm text-smart-gray-light">
              {locale === 'ar' ? finding.whyItMattersAr : finding.whyItMatters}
            </p>
          </div>

          {/* How to Fix */}
          <div>
            <div className="flex items-center gap-2 text-xs text-smart-gold font-semibold mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              {locale === 'ar' ? 'كيفية الإصلاح' : 'How to Fix'}
            </div>
            <p className="text-sm text-smart-gray-light">
              {locale === 'ar' ? finding.howToFixAr : finding.howToFix}
            </p>
          </div>

          {/* Technical Example */}
          {finding.technicalExample && (
            <div>
              <div className="flex items-center gap-2 text-xs text-smart-gold font-semibold mb-2">
                <Code className="w-3.5 h-3.5" />
                {locale === 'ar' ? 'مثال تقني' : 'Technical Example'}
              </div>
              <pre className="text-xs text-smart-gray-light bg-smart-black rounded-lg p-3 overflow-x-auto font-mono border border-smart-dark-3">
                {finding.technicalExample}
              </pre>
            </div>
          )}

          {/* Expected Benefit */}
          <div>
            <div className="flex items-center gap-2 text-xs text-green-400 font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" />
              {locale === 'ar' ? 'الفوائد المتوقعة' : 'Expected Benefit'}
            </div>
            <p className="text-sm text-green-400/80">
              {locale === 'ar' ? finding.expectedBenefitAr : finding.expectedBenefit}
            </p>
          </div>

          {/* Help Me Fix Button */}
          {onHelpFix && (
            <button
              onClick={onHelpFix}
              className="w-full btn-gold-outline flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm mt-4"
            >
              <HelpCircle className="w-4 h-4" />
              {locale === 'ar' ? 'ساعدني في الإصلاح' : 'Help Me Fix This'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}