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
    <section className="relative py-20 bg-dark-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/3 via-transparent to-transparent" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {isRtl ? "شاهد سمارت لاند في العمل" : "See Smart Land in Action"}
          </h2>
          <p className="text-lg text-dark-400">
            {isRtl ? "شاهد كيف يمكن لسمارت لاند تحويل تحليلك الرقمي" : "Watch how Smart Land transforms your digital audit experience"}
          </p>
        </div>

        {/* Video Placeholder */}
        <div className="relative rounded-2xl overflow-hidden bg-dark-800 aspect-video shadow-2xl shadow-gold-500/10 group cursor-pointer border border-gold-500/10">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gold-500/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-gold-500/30 transition-all group-hover:scale-110 gold-glow">
              <Play className="w-8 h-8 text-gold-400 ml-1" />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-white text-lg font-semibold">
              {isRtl ? "نظرة عامة على سمارت لاند" : "Smart Land Overview"}
            </p>
            <p className="text-dark-400 text-sm mt-1">
              {isRtl ? "دقيقتان - تعرف على المنصة" : "2 min - Platform Introduction"}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 via-transparent to-gold-600/10" />
        </div>

        {/* Transcript Toggle */}
        <div className="mt-8">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-2 text-dark-400 hover:text-gold-400 transition-colors mx-auto"
          >
            <span className="text-sm font-medium">
              {isRtl ? "نص الفيديو" : "Video Transcript"}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTranscript ? 'rotate-180' : ''}`} />
          </button>
          
          {showTranscript && (
            <div className="mt-4 p-6 rounded-xl bg-dark-800 border border-gold-500/10 animate-slide-down">
              <p className="text-sm text-dark-300 leading-relaxed">
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