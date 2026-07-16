'use client';

import { useState, useRef } from 'react';
import { Play, Youtube } from 'lucide-react';

interface Props {
  locale: 'en' | 'ar';
}

export function VideoSection({ locale }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    // In production, this would trigger actual video playback
    // For now, we show the placeholder with play button state change
  };

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-smart-black via-smart-dark to-smart-black" />
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold gold-gradient-text mb-4">
            {locale === 'ar' ? 'شاهد سمارت لاند في العمل' : 'See Smart Land in Action'}
          </h2>
          <p className="text-smart-gray-light text-lg max-w-2xl mx-auto">
            {locale === 'ar'
              ? 'فيديو قصير يشرح كيف يمكن لسمارت لاند مساعدتك'
              : 'A short video explaining how Smart Land can help you'}
          </p>
        </div>

        {/* Video Container */}
        <div className="relative group rounded-2xl overflow-hidden border border-smart-dark-3 shadow-2xl">
          {/* Poster/Lazy Load Placeholder */}
          <div className="aspect-video relative bg-gradient-to-br from-smart-dark-2 to-smart-black">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border border-smart-gold/20 rounded-full" />
              <div className="absolute bottom-10 right-10 w-48 h-48 border border-smart-gold/10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-smart-gold/5 rounded-full" />
            </div>

            {/* Logo in center of poster */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-smart-gold to-smart-gold-dark rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-smart-gold/20">
                <span className="text-3xl font-bold text-smart-black">SL</span>
              </div>
              <p className="text-smart-gold text-sm font-medium">
                {locale === 'ar' ? 'منصة التدقيق الرقمي' : 'AI Digital Audit Platform'}
              </p>
            </div>

            {/* Play Button */}
            {!isPlaying && (
              <button
                onClick={handlePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all hover:bg-black/40 group"
                aria-label={locale === 'ar' ? 'تشغيل الفيديو' : 'Play video'}
              >
                <div className="w-20 h-20 rounded-full bg-smart-gold/90 flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-2xl">
                  <Play className="w-8 h-8 text-smart-black ml-1" fill="currentColor" />
                </div>
              </button>
            )}

            {/* Video element (hidden until played) */}
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-smart-dark-2">
                <div className="text-center">
                  <Youtube className="w-16 h-16 text-smart-gold/50 mx-auto mb-4" />
                  <p className="text-smart-gray text-sm">
                    {locale === 'ar'
                      ? 'سيتم تشغيل فيديو العرض التوضيحي هنا في الإنتاج'
                      : 'Demo video will play here in production'}
                  </p>
                  <p className="text-xs text-smart-gray-dark mt-2">
                    {locale === 'ar'
                      ? 'ضع ملف الفيديو في: /public/videos/smart-land-demo.mp4'
                      : 'Place video file at: /public/videos/smart-land-demo.mp4'}
                  </p>
                </div>
              </div>
            )}

            {/* Video Duration Badge */}
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-black/60 text-xs text-white">
              0:45
            </div>
          </div>
        </div>

        {/* Transcript Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-sm text-smart-gold hover:text-smart-gold-light transition-colors"
          >
            {showTranscript
              ? (locale === 'ar' ? 'إخفاء النص' : 'Hide Transcript')
              : (locale === 'ar' ? 'عرض النص' : 'View Transcript')}
          </button>

          {showTranscript && (
            <div className="mt-4 glass-card rounded-xl p-6 text-left">
              <p className="text-sm text-smart-gray-light leading-relaxed">
                {locale === 'ar'
                  ? 'سمارت لاند هي منصة تدقيق رقمي مدعومة بالذكاء الاصطناعي. أرسل موقعك الإلكتروني أو صفحتك العامة المدعومة. تقوم سمارت لاند بتحليل الإشارات المتاحة الفعلية، وتكتشف نقاط القوة والضعف، وتظهر الأدلة، وتشرح كيفية إصلاح المشكلات المكتشفة. احصل على تقرير تدقيق احترافي مع توصيات قابلة للتنفيذ. تابع تحسنك بمرور الوقت من خلال إعادة التحليل.'
                  : 'Smart Land is an AI-powered digital audit platform. Submit your website or supported public page. Smart Land analyzes real available signals, detects strengths and weaknesses, shows evidence, and explains how to fix detected problems. Get a professional audit report with actionable recommendations. Track your improvement over time with re-analysis.'}
              </p>
            </div>
          )}
        </div>

        {/* Video Asset Documentation */}
        <div className="mt-8 p-4 rounded-xl border border-smart-gold/10 bg-smart-gold/5">
          <p className="text-xs text-smart-gray">
            <strong className="text-smart-gold">
              {locale === 'ar' ? 'ملاحظة: ' : 'Note: '}
            </strong>
            {locale === 'ar'
              ? 'لإضافة فيديو العرض التوضيحي الفعلي، ضع ملف الفيديو في المسار /public/videos/smart-land-demo.mp4. الطول المستهدف: 30-45 ثانية. الصيغة الموصى بها: MP4 مع H.264. الصورة المصغرة الموصى بها: /public/videos/smart-land-poster.jpg'
              : 'To add the actual demo video, place the video file at /public/videos/smart-land-demo.mp4. Target duration: 30-45 seconds. Recommended format: MP4 with H.264. Recommended poster: /public/videos/smart-land-poster.jpg'}
          </p>
        </div>
      </div>
    </section>
  );
}