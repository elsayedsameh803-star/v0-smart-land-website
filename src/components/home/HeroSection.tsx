"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Globe, Shield, Zap, BarChart3, Youtube, Facebook, Instagram, Music2, Camera, Linkedin, ChevronDown } from "lucide-react";
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === "ar";

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener("mousemove", handleMouseMove);
      return () => section.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

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
    <section 
      ref={sectionRef}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-dark-950" />
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, rgba(234, 179, 8, 0.12), transparent 60%)`,
        }}
      />
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-gold-600/8 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gold-500/5 rounded-full blur-3xl animate-pulse-slow" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(234,179,8,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Animated gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold-500/20 rounded-full"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
              animation: `float ${4 + i * 2}s ease-in-out ${i * 0.5}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow">
        <span className="text-xs text-dark-500">{isRtl ? "اسفل" : "Scroll"}</span>
        <ChevronDown className="w-4 h-4 text-gold-500/50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500/10 border border-gold-500/20 backdrop-blur-sm mb-8 gold-glow animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-sm text-gold-300 font-medium">
              {isRtl ? "مدعوم بالذكاء الاصطناعي" : "AI-Powered Digital Audit"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {isRtl ? (
              <>
                حضورك الرقمي،
                <br />
                <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-300 text-transparent bg-clip-text text-glow">
                  يُحلل بذكاء
                </span>
              </>
            ) : (
              <>
                Your Digital Presence,
                <br />
                <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-300 text-transparent bg-clip-text text-glow">
                  Intelligently Analyzed
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-dark-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {isRtl
              ? "أرسل رابط موقعك الإلكتروني أو صفحتك على التواصل الاجتماعي. تقوم سمارت لاند بتحليل الإشارات المتاحة الفعلية، وتكتشف نقاط القوة والضعف، وتظهر الأدلة، وتشرح كيفية إصلاح المشكلات المكتشفة."
              : "Submit your website or social media profile URL. Smart Land analyzes real available signals, detects strengths and weaknesses, shows evidence, and explains how to fix detected problems."}
          </p>

          {/* Platform Selector */}
          <div className="max-w-3xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <p className="text-sm text-dark-400 mb-4 text-center font-medium">
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
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border",
                      isSelected
                        ? `bg-gradient-to-br ${platformColors[platform.id]} text-white border-transparent shadow-lg scale-105 neon-gold`
                        : "bg-dark-800/60 text-dark-300 border-gold-500/10 hover:border-gold-500/30 hover:text-gold-300 hover:bg-dark-800/80"
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
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-500/20 via-gold-500/10 to-gold-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-xl" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setIsValid(true); }}
                  placeholder={getPlaceholder()}
                  className={cn(
                    "relative w-full px-6 py-4 rounded-xl bg-dark-800/80 border text-white placeholder-dark-400 text-lg transition-all duration-200 backdrop-blur-sm",
                    "focus:outline-none focus:ring-2 focus:ring-gold-500/30",
                    isValid ? 'border-gold-500/30 focus:border-gold-500' : 'border-red-500 focus:border-red-500'
                  )}
                  dir={isRtl ? "rtl" : "ltr"}
                />
              </div>
              <button
                type="submit"
                className="relative px-8 py-4 rounded-xl font-bold transition-all duration-200 text-lg whitespace-nowrap group overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 bg-size-200 animate-gradient-shift" />
                <span className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2 text-dark-950">
                  {getButtonText()}
                  <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180' : ''}`} />
                </span>
              </button>
            </div>
            {!isValid && (
              <p className="text-red-400 text-sm mt-2 text-right animate-fade-in">
                {isRtl ? "يرجى إدخال رابط صحيح" : "Please enter a valid URL"}
              </p>
            )}
          </form>

          {/* Social Media Icons Bar */}
          <div className="max-w-3xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <p className="text-xs text-dark-500 mb-3 text-center font-medium uppercase tracking-wider">
              {isRtl ? "أو اختر منصة للتحليل" : "Or choose a platform to analyze"}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {platforms.slice(1).map((platform) => {
                const Icon = platformIcons[platform.id];
                const isSelected = selectedPlatform === platform.id;
                return (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 group relative",
                      isSelected
                        ? `bg-gradient-to-br ${platformColors[platform.id]} text-white shadow-lg scale-110`
                        : "bg-dark-800/40 border border-gold-500/5 hover:bg-dark-800/80 hover:border-gold-500/20"
                    )}
                    title={platform.label}
                  >
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold-500 rounded-full animate-ping-slow" />
                    )}
                    <Icon className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isSelected ? "text-white" : "text-dark-400 group-hover:text-gold-400"
                    )} />
                    <span className={cn(
                      "text-[10px] font-medium transition-all duration-200",
                      isSelected ? "text-white" : "text-dark-500 group-hover:text-gold-400"
                    )}>
                      {platform.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-800/60 border border-gold-500/10 backdrop-blur-sm hover:bg-dark-800/80 hover:border-gold-500/30 transition-all duration-200 gold-glow-hover card-hover-effect"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="w-5 h-5 text-dark-950" />
                </div>
                <span className="text-sm text-dark-200 font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Trust indicator */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-dark-800/40 border border-gold-500/5 mt-8">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping-slow" />
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping-slow" style={{ animationDelay: "0.5s" }} />
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping-slow" style={{ animationDelay: "1s" }} />
              </span>
              <span className="text-dark-500 text-sm">
                {isRtl ? "موثوق من فرق رقمية حول العالم" : "Trusted by digital teams worldwide"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}