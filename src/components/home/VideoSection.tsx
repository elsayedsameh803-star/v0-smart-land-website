"use client";

import { Play, ChevronDown } from "lucide-react";
import { useState } from "react";

interface VideoSectionProps {
  locale: string;
}

export function VideoSection({ locale }: VideoSectionProps) {
  const isRtl = locale === "ar";
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <section className="relative py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
            {isRtl ? "شاهد سمارت لاند في العمل" : "See Smart Land in Action"}
          </h2>
          <p className="text-lg text-surface-500">
            {isRtl ? "شاهد كيف يمكن لسمارت لاند تحويل تحليلك الرقمي" : "Watch how Smart Land transforms your digital audit experience"}
          </p>
        </div>

        {/* Video Placeholder */}
        <div className="relative rounded-2xl overflow-hidden bg-surface-900 aspect-video shadow-2xl group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all group-hover:scale-110">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-white text-lg font-semibold">
              {isRtl ? "نظرة عامة على سمارت لاند" : "Smart Land Overview"}
            </p>
            <p className="text-white/60 text-sm mt-1">
              {isRtl ? "دقيقتان - تعرف على المنصة" : "2 min - Platform Introduction"}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
        </div>

        {/* Transcript Toggle */}
        <div className="mt-8">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-2 text-surface-600 hover:text-surface-900 transition-colors mx-auto"
          >
            <span className="text-sm font-medium">
              {isRtl ? "نص الفيديو" : "Video Transcript"}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTranscript ? 'rotate-180' : ''}`} />
          </button>
          
          {showTranscript && (
            <div className="mt-4 p-6 rounded-xl bg-surface-50 border border-surface-200 animate-slide-down">
              <p className="text-sm text-surface-600 leading-relaxed">
                {isRtl
                  ? "سمارت لاند هي منصة تدقيق رقمي مدعومة بالذكاء الاصطناعي. أرسل موقعك الإلكتروني أو صفحتك العامة المدعومة. تقوم سمارت لاند بتحليل الإشارات المتاحة الفعلية، وتكتشف نقاط القوة والضعف، وتظهر الأدلة، وتشرح كيفية إصلاح المشكلات المكتشفة. احصل على تقرير تدقيق احترافي مع توصيات قابلة للتنفيذ. تابع تحسنك بمرور الوقت من خلال إعادة التحليل."
                  : "Smart Land is an AI-powered digital audit platform. Submit your website or supported public page. Smart Land analyzes real available signals, detects strengths and weaknesses, shows evidence, and explains how to fix detected problems. Get a professional audit report with actionable recommendations. Track your improvement over time with re-analysis."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}