"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function VideoSection() {
  const { language, t } = useLanguage()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Lazy load - only load when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const transcriptAr = `سمارت لاند هو منصة تدقيق رقمي تعمل بالذكاء الاصطناعي.
أدخل رابط موقعك أو حسابك على وسائل التواصل.
سمارت لاند يحلل الإشارات المتاحة فعلياً،
يكتشف نقاط القوة والضعف،
يعرض الأدلة،
ويشرح كيفية إصلاح المشاكل المكتشفة.
احصل على تقرير تدقيق شامل قائم على الأدلة الحقيقية.`

  const transcriptEn = `Smart Land is an AI-powered digital audit platform.
Submit your website or supported public page URL.
Smart Land analyzes real available signals,
detects strengths and weaknesses,
shows evidence,
and explains how to fix detected problems.
Get a comprehensive evidence-based audit report.`

  return (
    <section ref={containerRef} className="py-20 lg:py-32" dir="ltr">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("شاهد كيف يعمل سمارت لاند", "See How Smart Land Works")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t(
              "فيديو تعريفي قصير يشرح كيفية استخدام المنصة لتحليل موقعك وتحسين أدائه",
              "A short explainer video showing how to use the platform to analyze and improve your site"
            )}
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-black/30">
          {/* Video container */}
          <div className="relative aspect-video bg-slate-900">
            {isInView ? (
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                poster="/images/smart-land-poster.jpg"
                preload="metadata"
                playsInline
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src="/videos/smart-land-explainer.mp4" type="video/mp4" />
                {t("متصفحك لا يدعم تشغيل الفيديو.", "Your browser does not support the video tag.")}
              </video>
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900/20">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-20 w-20 rounded-full border-2 border-amber-400/50 flex items-center justify-center">
                    <Play className="h-10 w-10 text-amber-400 ml-1" />
                  </div>
                  <p className="text-sm text-slate-400">{t("اضغط للتشغيل", "Click to play")}</p>
                </div>
              </div>
            )}

            {/* Play/Pause overlay button */}
            {isInView && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30"
                aria-label={isPlaying ? t("إيقاف", "Pause") : t("تشغيل", "Play")}
              >
                {!isPlaying && (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/50 bg-black/40 backdrop-blur-sm transition-transform hover:scale-110">
                    <Play className="ml-1 h-10 w-10 text-white" />
                  </div>
                )}
              </button>
            )}

            {/* Controls bar */}
            {isInView && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-amber-400 transition-colors"
                      aria-label={isPlaying ? t("إيقاف", "Pause") : t("تشغيل", "Play")}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="text-white/70 hover:text-white transition-colors"
                      aria-label={isMuted ? t("إلغاء كتم", "Unmute") : t("كتم", "Mute")}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <span className="text-[10px] text-white/50">
                      {language === "ar" ? "~٣٠-٤٥ ثانية" : "~30-45 sec"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="text-[10px] text-white/50 hover:text-amber-400 transition-colors"
                    >
                      {showTranscript ? (language === "ar" ? "إخفاء النص" : "Hide transcript") : (language === "ar" ? "النص" : "Transcript")}
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="text-white/70 hover:text-white transition-colors"
                      aria-label={isFullscreen ? t("تصغير", "Minimize") : t("تكبير", "Maximize")}
                    >
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transcript */}
          {showTranscript && (
            <div className="border-t border-white/10 bg-slate-900/80 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-amber-400">العربية</h4>
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{transcriptAr}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-amber-400">English</h4>
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{transcriptEn}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video asset location note */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-600">
            {t(
              "ملاحظة: ضع ملف الفيديو في المسار /public/videos/smart-land-explainer.mp4",
              "Note: Place the video file at /public/videos/smart-land-explainer.mp4"
            )}
          </p>
          <p className="text-[10px] text-slate-600">
            {t(
              "وصف الفيديو: سمارت لاند هو منصة تدقيق رقمي تعمل بالذكاء الاصطناعي. أدخل رابط موقعك، يحلل سمارت لاند الإشارات المتاحة، يكتشف نقاط القوة والضعف، يعرض الأدلة، ويشرح كيفية إصلاح المشاكل.",
              "Video description: Smart Land is an AI-powered digital audit platform. Submit your URL, Smart Land analyzes available signals, detects strengths and weaknesses, shows evidence, and explains how to fix problems."
            )}
          </p>
        </div>
      </div>
    </section>
  )
}