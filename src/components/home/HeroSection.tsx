"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Globe, Shield, Zap, BarChart3, Youtube, Facebook, Instagram, Music2, Camera, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onAnalyze: (url: string, platform?: string) => void;
  locale: string;
}

type Platform = "website" | "youtube" | "facebook" | "instagram" | "tiktok" | "snapchat" | "linkedin";

const platformIcons: Record<Platform, React.ElementType> = {
  website: Globe,
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Music2,
  snapchat: Camera,
  linkedin: Linkedin,
};

const platformColors: Record<Platform, string> = {
  website: "from-gold-500 to-gold-600",
  youtube: "from-red-500 to-red-600",
  facebook: "from-blue-600 to-blue-700",
  instagram: "from-pink-500 to-purple-600",
  tiktok: "from-cyan-400 to-cyan-600",
  snapchat: "from-yellow-400 to-yellow-500",
  linkedin: "from-blue-500 to-blue-600",
};

export function HeroSection({ onAnalyze, locale }: HeroSectionProps) {
  const [url, setUrl] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("website");
  const isRtl = locale === "ar";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
    onAnalyze(trimmedUrl, selectedPlatform);
  };

  const getPlaceholder = () => {
    if (isRtl) {
      switch (selectedPlatform) {
        case "website": return "أدخل رابط موقعك (مثال: example.com)";
        case "youtube": return "أدخل رابط قناة أو فيديو يوتيوب";
        case "facebook": return "أدخل رابط صفحة أو بروفايل فيسبوك";
        case "instagram": return "أدخل رابط بروفايل إنستغرام";
        case "tiktok": return "أدخل رابط بروفايل تيك توك";
        case "snapchat": return "أدخل رابط بروفايل سناب شات";
        case "linkedin": return "أدخل رابط بروفايل أو شركة لينكد إن";
      }
    } else {
      switch (selectedPlatform) {
        case "website": return "Enter your website URL (e.g., example.com)";
        case "youtube": return "Enter YouTube channel or video URL";
        case "facebook": return "Enter Facebook page or profile URL";
        case "instagram": return "Enter Instagram profile URL";
        case "tiktok": return "Enter TikTok profile URL";
        case "snapchat": return "Enter Snapchat profile URL";
        case "linkedin": return "Enter LinkedIn profile or company URL";
      }
    }
  };

  const getButtonText = () => {
    if (isRtl) {
      switch (selectedPlatform) {
        case "website": return "حلل موقعك الآن";
        case "youtube": return "حلل قناتك الآن";
        case "facebook": return "حلل صفحتك الآن";
        case "instagram": return "حلل حسابك الآن";
        case "tiktok": return "حلل حسابك الآن";
        case "snapchat": return "حلل حسابك الآن";
        case "linkedin": return "حلل بروفايلك الآن";
      }
    } else {
      switch (selectedPlatform) {
        case "website": return "Analyze Your Site";
        case "youtube": return "Analyze Your Channel";
        case "facebook": return "Analyze Your Page";
        case "instagram": return "Analyze Your Profile";
        case "tiktok": return "Analyze Your Profile";
        case "snapchat": return "Analyze Your Profile";
        case "linkedin": return "Analyze Your Profile";
      }
    }
  };

  const platforms: { id: Platform; label: string }[] = [
    { id: "website", label: isRtl ? "موقع" : "Website" },
    { id: "youtube", label: "YouTube" },
    { id: "facebook", label: "Facebook" },
    { id: "instagram", label: "Instagram" },
    { id: "tiktok", label: "TikTok" },
    { id: "snapchat", label: "Snapchat" },
    { id: "linkedin", label: "LinkedIn" },
  ];

  const features = [
    { icon: BarChart3, label: isRtl ? "تحليل SEO" : "SEO Analysis", color: "from-gold-500 to-gold-600" },
    { icon: Zap, label: isRtl ? "تحليل الأداء" : "Performance", color: "from-gold-400 to-gold-600" },
    { icon: Shield, label: isRtl ? "فحص الأمان" : "Security Check", color: "from-gold-500 to-gold-700" },
    { icon: Globe, label: isRtl ? "تحليل شامل" : "Full Audit", color: "from-gold-400 to-gold-500" },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent" />
      
      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(234,179,8,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 backdrop-blur-sm mb-8 gold-glow">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-sm text-gold-300">
              {isRtl ? "مدعوم بالذكاء الاصطناعي" : "AI-Powered Digital Audit"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {isRtl ? (
              <>
                حضورك الرقمي،
                <br />
                <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-300 text-transparent bg-clip-text">
                  يُحلل بذكاء
                </span>
              </>
            ) : (
              <>
                Your Digital Presence,
                <br />
                <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-300 text-transparent bg-clip-text">
                  Intelligently Analyzed
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-dark-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {isRtl
              ? "أرسل رابط موقعك الإلكتروني أو صفحتك على التواصل الاجتماعي. تقوم سمارت لاند بتحليل الإشارات المتاحة الفعلية، وتكتشف نقاط القوة والضعف، وتظهر الأدلة، وتشرح كيفية إصلاح المشكلات المكتشفة."
              : "Submit your website or social media profile URL. Smart Land analyzes real available signals, detects strengths and weaknesses, shows evidence, and explains how to fix detected problems."}
          </p>

          {/* Platform Selector */}
          <div className="max-w-2xl mx-auto mb-6">
            <p className="text-sm text-dark-400 mb-3 text-center">
              {isRtl ? "اختر نوع المنصة التي تريد تحليلها:" : "Select the platform you want to analyze:"}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {platforms.map((platform) => {
                const Icon = platformIcons[platform.id];
                const isSelected = selectedPlatform === platform.id;
                return (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
                      isSelected
                        ? `bg-gradient-to-br ${platformColors[platform.id]} text-white border-transparent shadow-lg`
                        : "bg-dark-800/60 text-dark-300 border-gold-500/10 hover:border-gold-500/30 hover:text-gold-300"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{platform.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* URL Input */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setIsValid(true); }}
                  placeholder={getPlaceholder()}
                  className={`w-full px-6 py-4 rounded-xl bg-dark-800/80 border ${isValid ? 'border-gold-500/30 focus:border-gold-500' : 'border-red-500'} text-white placeholder-dark-400 text-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all backdrop-blur-sm`}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-dark-950 font-bold rounded-xl transition-all duration-200 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 flex items-center justify-center gap-2 text-lg whitespace-nowrap"
              >
                {getButtonText()}
                <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {!isValid && (
              <p className="text-red-400 text-sm mt-2 text-right">
                {isRtl ? "يرجى إدخال رابط صحيح" : "Please enter a valid URL"}
              </p>
            )}
          </form>

          {/* Social Media Icons Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {platforms.slice(1).map((platform) => {
                const Icon = platformIcons[platform.id];
                return (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 group",
                      selectedPlatform === platform.id
                        ? `bg-gradient-to-br ${platformColors[platform.id]} text-white shadow-lg scale-110`
                        : "bg-dark-800/40 border border-gold-500/5 hover:bg-dark-800/80 hover:border-gold-500/20"
                    )}
                    title={platform.label}
                  >
                    <Icon className={cn(
                      "w-6 h-6 transition-all",
                      selectedPlatform === platform.id ? "text-white" : "text-dark-400 group-hover:text-gold-400"
                    )} />
                    <span className={cn(
                      "text-[10px] font-medium",
                      selectedPlatform === platform.id ? "text-white" : "text-dark-500 group-hover:text-gold-400"
                    )}>
                      {platform.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-800/60 border border-gold-500/10 backdrop-blur-sm hover:bg-dark-800/80 hover:border-gold-500/30 transition-all gold-glow-hover"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-4 h-4 text-dark-950" />
                </div>
                <span className="text-sm text-dark-200 font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Trust indicator */}
          <p className="text-dark-500 text-sm mt-8 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            {isRtl ? "موثوق من فرق رقمية حول العالم" : "Trusted by digital teams worldwide"}
          </p>
        </div>
      </div>
    </section>
  );
}