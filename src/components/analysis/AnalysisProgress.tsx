'use client';

import { CheckCircle2, Loader2, XCircle, Globe, Search } from 'lucide-react';
import type { AnalysisStage } from '@/lib/types';

interface Props {
  stages: AnalysisStage[];
  url: string;
  error: string | null;
  locale: 'en' | 'ar';
}

export function AnalysisProgress({ stages, url, error, locale }: Props) {
  const isComplete = stages.every(s => s.status === 'completed');
  const hasError = stages.some(s => s.status === 'error');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-smart-gold/20 bg-smart-gold/5 text-smart-gold text-sm mb-4">
          <Globe className="w-4 h-4" />
          <span className="truncate max-w-[300px]">{url}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold gold-gradient-text">
          {error
            ? (locale === 'ar' ? 'فشل التحليل' : 'Analysis Failed')
            : isComplete
            ? (locale === 'ar' ? 'اكتمل التحليل' : 'Analysis Complete')
            : (locale === 'ar' ? 'تحليل في الوقت الفعلي' : 'Real-Time Analysis')}
        </h2>
        {!error && !isComplete && (
          <p className="text-smart-gray text-sm mt-2">
            {locale === 'ar' ? 'جارٍ تحليل إشارات موقعك...' : 'Analyzing your site signals...'}
          </p>
        )}
      </div>

      {/* Progress Stages */}
      <div className="glass-card rounded-xl p-6 sm:p-8">
        <div className="space-y-3">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                stage.status === 'processing'
                  ? 'bg-smart-gold/5 border border-smart-gold/20'
                  : stage.status === 'completed'
                  ? 'bg-smart-success/5 border border-smart-success/10'
                  : stage.status === 'error'
                  ? 'bg-red-500/5 border border-red-500/20'
                  : 'opacity-50'
              }`}
            >
              {/* Status Icon */}
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                {stage.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-smart-success" />
                ) : stage.status === 'processing' ? (
                  <Loader2 className="w-5 h-5 text-smart-gold animate-spin" />
                ) : stage.status === 'error' ? (
                  <XCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-smart-dark-3" />
                )}
              </div>

              {/* Stage Label */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  stage.status === 'processing'
                    ? 'text-smart-gold'
                    : stage.status === 'completed'
                    ? 'text-white'
                    : stage.status === 'error'
                    ? 'text-red-400'
                    : 'text-smart-gray-dark'
                }`}>
                  {locale === 'ar' ? stage.labelAr : stage.label}
                </p>
              </div>

              {/* Duration */}
              {stage.duration && (
                <span className="text-xs text-smart-gray-dark flex-shrink-0">
                  {(stage.duration / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1 bg-smart-dark-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-smart-gold to-smart-gold-light rounded-full transition-all duration-500"
            style={{
              width: `${Math.round(
                (stages.filter(s => s.status === 'completed').length / stages.length) * 100
              )}%`,
            }}
          />
        </div>

        <p className="text-xs text-smart-gray-dark text-center mt-3">
          {stages.filter(s => s.status === 'completed').length} / {stages.length}
          {locale === 'ar' ? ' مرحلة مكتملة' : ' stages completed'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-card rounded-xl p-6 border-red-500/20 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 font-medium mb-2">
            {locale === 'ar' ? 'فشل التحليل' : 'Analysis Failed'}
          </p>
          <p className="text-sm text-smart-gray mb-4">{error}</p>
        </div>
      )}

      {/* Loading indication */}
      {!error && !isComplete && (
        <div className="flex items-center justify-center gap-2 text-sm text-smart-gray">
          <Search className="w-4 h-4 animate-pulse" />
          <span>
            {locale === 'ar'
              ? 'جاري جمع البيانات المتاحة...'
              : 'Collecting available data...'}
          </span>
        </div>
      )}
    </div>
  );
}