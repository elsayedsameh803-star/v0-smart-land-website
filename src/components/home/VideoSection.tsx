"use client";

import { Play, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";

interface VideoSectionProps {
  locale: string;
}

export function VideoSection({ locale }: VideoSectionProps) {
  const isRtl = locale === "ar";
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <section className="relative py-20 md:py-28 bg-dark-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gold-500/3 rounded-full blur-3xl" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs text-gold-400 font-medium uppercase tracking-wider">
              {isRtl ? "فيديو تعريفي" : "DEMO VIDEO"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {isRtl ? "شاهد سمارت لاند في العمل" : "See Smart Land in Action"}
          </h2>
          <p className="text-lg text-dark-400">
            {isRtl ? "شاهد كيف يمكن لسمارت لاند تحويل تحليلك الرقمي" : "Watch how Smart Land transforms your digital audit experience"}
          </p>
        </div>

        {/* Video Container */}
        <div className="relative rounded-2xl overflow-hidden bg-dark-800 aspect-video shadow-2xl shadow-gold-500/10 group cursor-pointer border border-gold-500/10 gold-glow-hover">
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 via-transparent to-gold-600/10 z-10" />
          
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent_50%)]" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="relative">
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-gold-500/20 blur-xl group-hover:bg-gold-500/30 transition-all duration-300" />
              <div className="w-20 h-20 rounded-full bg-gold-500/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-gold-500/30 transition-all duration-300 group-hover:scale-110 gold-glow border border-gold-500/30">
                <Play className="w-8 h-8 text-gold-400 ml-1" />
              </div>
            </div>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-6 left-6 right-6 z-20">
            <p className="text-white text-lg font-semibold text-glow">
              {isRtl ? "نظرة عامة على سمارت لاند" : "Smart Land Overview"}
            </p>
            <p className="text-dark-400 text-sm mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-ping-slow" />
              {isRtl ? "دقيقتان - تعرف على المنصة" : "2 min - Platform Introduction"}
            </p>
          </div>

          {/* Hover shimmer */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </div>

        {/* Transcript Toggle */}
        <div className="mt-8">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-2 text-dark-400 hover:text-gold-400 transition-colors mx-auto group"
          >
            <span className="text-sm font-medium">{isRtl ? "نص الفيديو" : "Video Transcript"}</span>
            <ChevronDown className={`w-4 h-4 transition-all duration-300 ${showTranscript ? 'rotate-180' : ''} group-hover:text-gold-400`} />
          </button>
          
          {showTranscript && (
            <div className="mt-4 p-6 md:p-8 rounded-2xl bg-dark-800/60 border border-gold-500/10 animate-slide-down gold-glow">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-dark-950" />
                </div>
                <p className="text-sm text-dark-300 leading-relaxed">
                  {isRtl
                    ? "سمارت لاند هي منصة تدقيق رقمي مدعومة بالذكاء الاصطناعي. أرسل موقعك الإلكتروني أو صفحتك العامة المدعومة. تقوم سمارت لاند بتحليل الإشارات المتاحة الفعلية، وتكتشف نقاط القوة والضعف، وتظهر الأدلة، وتشرح كيفية إصلاح المشكلات المكتشفة. احصل على تقرير تدقيق احترافي مع توصيات قابلة للتنفيذ. تابع تحسنك بمرور الوقت من خلال إعادة التحليل."
                    : "Smart Land is an AI-powered digital audit platform. Submit your website or supported public page. Smart Land analyzes real available signals, detects strengths and weaknesses, shows evidence, and explains how to fix detected problems. Get a professional audit report with actionable recommendations. Track your improvement over time with re-analysis."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}