"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Globe, Shield, Zap, BarChart3, Youtube, Facebook, Instagram, Music2, Camera, Linkedin, ChevronDown, AlertCircle } from "lucide-react";
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

// Translations for this component
const translations: Record<string, Record<string, string>> = {
  en: {
    badge: "Smart Land - Analyze Websites & Social Media",
    title1: "Smart Land,",
    title2: "Analyze Websites & Social Media",
    subtitle: "Submit your website or social media URL. Get instant AI-powered analysis with evidence-based insights and actionable recommendations.",
    platformLabel: "Select the platform you want to analyze:",
    placeholderWebsite: "Enter your website URL (e.g., example.com)",
    placeholderYoutube: "Enter YouTube channel or video URL",
    placeholderFacebook: "Enter Facebook page or profile URL",
    placeholderInstagram: "Enter Instagram profile URL",
    placeholderTiktok: "Enter TikTok profile URL",
    placeholderSnapchat: "Enter Snapchat profile URL",
    placeholderLinkedin: "Enter LinkedIn profile or company URL",
    btnWebsite: "Analyze Your Site",
    btnYoutube: "Analyze Your Channel",
    btnFacebook: "Analyze Your Page",
    btnInstagram: "Analyze Your Profile",
    btnTiktok: "Analyze Your Profile",
    btnSnapchat: "Analyze Your Profile",
    btnLinkedin: "Analyze Your Profile",
    errorEmpty: "Please enter a valid URL to analyze",
    errorInvalid: "Please enter a valid URL (e.g., example.com)",
    trusted: "Trusted by digital teams worldwide",
    scroll: "Scroll",
    featureSeo: "SEO Analysis",
    featurePerf: "Performance",
    featureSec: "Security Check",
    featureFull: "Full Audit",
    platformWebsite: "Website",
  },
  ar: {
    badge: "سمارت لاند لتحليل المواقع والسوشيال ميديا",
    title1: "سمارت لاند،",
    title2: "لتحليل المواقع والسوشيال ميديا",
    subtitle: "أرسل رابط موقعك أو صفحتك على التواصل الاجتماعي. احصل على تحليل فوري بالذكاء الاصطناعي مع رؤى قائمة على الأدلة وتوصيات قابلة للتنفيذ.",
    platformLabel: "اختر نوع المنصة التي تريد تحليلها:",
    placeholderWebsite: "أدخل رابط موقعك (مثال: example.com)",
    placeholderYoutube: "أدخل رابط قناة أو فيديو يوتيوب",
    placeholderFacebook: "أدخل رابط صفحة أو بروفايل فيسبوك",
    placeholderInstagram: "أدخل رابط بروفايل إنستغرام",
    placeholderTiktok: "أدخل رابط بروفايل تيك توك",
    placeholderSnapchat: "أدخل رابط بروفايل سناب شات",
    placeholderLinkedin: "أدخل رابط بروفايل أو شركة لينكد إن",
    btnWebsite: "حلل موقعك الآن",
    btnYoutube: "حلل قناتك الآن",
    btnFacebook: "حلل صفحتك الآن",
    btnInstagram: "حلل حسابك الآن",
    btnTiktok: "حلل حسابك الآن",
    btnSnapchat: "حلل حسابك الآن",
    btnLinkedin: "حلل بروفايلك الآن",
    errorEmpty: "يرجى إدخال رابط للتحليل",
    errorInvalid: "يرجى إدخال رابط صحيح (مثال: example.com)",
    trusted: "موثوق من فرق رقمية حول العالم",
    scroll: "اسفل",
    featureSeo: "تحليل SEO",
    featurePerf: "تحليل الأداء",
    featureSec: "فحص الأمان",
    featureFull: "تحليل شامل",
    platformWebsite: "موقع",
  },
};

export function HeroSection({ onAnalyze, locale }: HeroSectionProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("website");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === "ar";
  const t = translations[locale] || translations.en;

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
      setError(t.errorEmpty);
      return;
    }
    
    // Basic URL validation
    const hasValidFormat = /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmedUrl.replace(/^https?:\/\//, ""));
    if (!hasValidFormat) {
      setError(t.errorInvalid);
      return;
    }
    
    setError(null);
    onAnalyze(trimmedUrl, selectedPlatform);
  };

  const getPlaceholder = () => {
    const key = `placeholder${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}` as keyof typeof t;
    return t[key] || t.placeholderWebsite;
  };

  const getButtonText = () => {
    const key = `btn${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}` as keyof typeof t;
    return t[key] || t.btnWebsite;
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
    { icon: BarChart3, label: t.featureSeo, color: "from-gold-500 to-gold-600" },
    { icon: Zap, label: t.featurePerf, color: "from-gold-400 to-gold-600" },
    { icon: Shield, label: t.featureSec, color: "from-gold-500 to-gold-700" },
    { icon: Globe, label: t.featureFull, color: "from-gold-400 to-gold-500" },
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
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
        <span className="text-xs text-dark-500">{t.scroll}</span>
        <ChevronDown className="w-4 h-4 text-gold-500/50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40 w-full">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-500/10 border border-gold-500/20 backdrop-blur-sm mb-8 gold-glow animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-sm text-gold-300 font-medium">
              {t.badge}
            </span>
          </div>

          {/* Title - Bigger and more prominent */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {isRtl ? (
              <>
                {t.title1}
                <br />
                <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-300 text-transparent bg-clip-text text-glow">
                  {t.title2}
                </span>
              </>
            ) : (
              <>
                {t.title1}
                <br />
                <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-300 text-transparent bg-clip-text text-glow">
                  {t.title2}
                </span>
              </>
            )}
          </h1>

          {/* Subtitle - Shorter and clearer */}
          <p className="text-lg sm:text-xl text-dark-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {t.subtitle}
          </p>

          {/* Platform Selector */}
          <div className="max-w-3xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <p className="text-sm text-dark-400 mb-4 text-center font-medium">
              {t.platformLabel}
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
                  onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }}
                  placeholder={getPlaceholder()}
                  className={cn(
                    "relative w-full px-6 py-4 rounded-xl bg-dark-800/80 border text-white placeholder-dark-400 text-lg transition-all duration-200 backdrop-blur-sm",
                    "focus:outline-none focus:ring-2",
                    error ? 'border-red-500 focus:ring-red-500/30' : 'border-gold-500/30 focus:ring-gold-500/30 focus:border-gold-500'
                  )}
                  dir={isRtl ? "rtl" : "ltr"}
                  aria-label={getPlaceholder()}
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
            {error && (
              <div className="flex items-center gap-2 mt-3 text-red-400 text-sm animate-fade-in" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

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

          {/* Trust indicator - Enhanced */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-dark-800/40 border border-gold-500/5 mt-8 hover:bg-dark-800/60 hover:border-gold-500/20 transition-all duration-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping-slow" />
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping-slow" style={{ animationDelay: "0.5s" }} />
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping-slow" style={{ animationDelay: "1s" }} />
              </span>
              <span className="text-dark-400 text-sm font-medium">
                {t.trusted}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}