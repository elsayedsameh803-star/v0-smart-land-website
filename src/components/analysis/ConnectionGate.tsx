"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Link2, 
  Facebook, 
  Instagram, 
  Youtube,
  Globe,
  ArrowRight
} from "lucide-react";

interface ConnectionStatus {
  platform: string;
  connected: boolean;
  requiresConnection: boolean;
  message: string;
  messageAr: string;
}

interface PropTypes {
  locale: string;
  selectedPlatform: string;
  onConnectionVerified?: (canProceed: boolean) => void;
}

const platformIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Globe,
  snapchat: Globe,
  linkedin: Globe,
  website: Globe,
};

const platformColors: Record<string, string> = {
  facebook: "text-[#1877F2]",
  instagram: "text-pink-500",
  youtube: "text-red-500",
  tiktok: "text-cyan-400",
  snapchat: "text-yellow-400",
  linkedin: "text-blue-600",
  website: "text-gold-400",
};

const platformNamesAr: Record<string, string> = {
  facebook: "فيسبوك",
  instagram: "إنستجرام",
  youtube: "يوتيوب",
  tiktok: "تيك توك",
  snapchat: "سناب شات",
  linkedin: "لينكد إن",
  website: "موقع ويب",
};

export function ConnectionGate({ locale, selectedPlatform, onConnectionVerified }: PropTypes) {
  const isAr = locale === "ar";
  const { data: session, status: sessionStatus } = useSession();
  const [statuses, setStatuses] = useState<ConnectionStatus[]>([]);
  const [checking, setChecking] = useState(false);

  const socialPlatforms = ["facebook", "instagram", "youtube", "tiktok", "snapchat", "linkedin"];
  const isSocialPlatform = socialPlatforms.includes(selectedPlatform);

  const checkConnections = useCallback(async () => {
    if (!session?.user || !isSocialPlatform) {
      onConnectionVerified?.(true);
      return;
    }

    setChecking(true);
    try {
      const res = await fetch("/api/social/connection-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: selectedPlatform }),
      });
      const data = await res.json();
      
      if (data.success) {
        const newStatuses: ConnectionStatus[] = [{
          platform: data.platform,
          connected: data.connected,
          requiresConnection: data.requiresConnection,
          message: data.message,
          messageAr: data.messageAr,
        }];
        setStatuses(newStatuses);
        onConnectionVerified?.(data.connected);
      } else {
        if (data.code === "auth_required") {
          setStatuses([{
            platform: selectedPlatform,
            connected: false,
            requiresConnection: true,
            message: "Please sign in first",
            messageAr: "يرجى تسجيل الدخول أولاً",
          }]);
        }
        onConnectionVerified?.(false);
      }
    } catch {
      onConnectionVerified?.(false);
    } finally {
      setChecking(false);
    }
  }, [session, selectedPlatform, isSocialPlatform, onConnectionVerified]);

  useEffect(() => {
    checkConnections();
  }, [checkConnections]);

  if (!isSocialPlatform) return null;

  if (checking || sessionStatus === "loading") {
    return (
      <div className="rounded-xl p-5 bg-dark-800/40 border border-gold-500/10 mb-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
          <span className="text-sm text-dark-300">
            {isAr ? "جاري فحص حالة الاتصال..." : "Checking connection status..."}
          </span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="rounded-xl p-5 bg-yellow-500/10 border border-yellow-500/20 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-yellow-300 font-semibold text-sm">
              {isAr ? "تسجيل الدخول مطلوب" : "Sign in required"}
            </h4>
            <p className="text-xs text-yellow-400/80 mt-1">
              {isAr 
                ? `لتحليل ${platformNamesAr[selectedPlatform] || selectedPlatform}، يرجى تسجيل الدخول أولاً`
                : `To analyze ${selectedPlatform}, please sign in first`}
            </p>
            <button
              onClick={() => signIn("facebook-meta", { callbackUrl: window.location.href })}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-dark-950 text-sm font-semibold transition-colors"
            >
              {isAr ? "تسجيل الدخول" : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = statuses[0];
  if (currentStatus?.connected) {
    return (
      <div className="rounded-xl p-5 bg-emerald-500/10 border border-emerald-500/20 mb-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-emerald-300">
            {isAr ? currentStatus.messageAr : currentStatus.message}
          </span>
        </div>
      </div>
    );
  }

  const Icon = platformIcons[selectedPlatform] || Globe;
  const color = platformColors[selectedPlatform] || "text-gold-400";

  return (
    <div className="rounded-xl p-5 bg-red-500/10 border border-red-500/20 mb-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-red-300 font-semibold text-sm">
            {isAr ? `حساب ${platformNamesAr[selectedPlatform] || selectedPlatform} غير مرتبط` : `${selectedPlatform} account not connected`}
          </h4>
          <p className="text-xs text-red-400/80 mt-1">
            {isAr 
              ? `لتحليل ${platformNamesAr[selectedPlatform] || selectedPlatform}، يرجى ربط حسابك أولاً. هذا يضمن لك الحصول على بيانات دقيقة وحقيقية.`
              : `To analyze ${selectedPlatform}, please connect your account first. This ensures you get accurate, real data.`}
          </p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedPlatform === "facebook" || selectedPlatform === "instagram" ? (
              <button
                onClick={() => signIn("facebook-meta", { callbackUrl: window.location.href })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-[#0d65d9] text-white text-sm font-semibold transition-colors"
              >
                <Facebook className="w-4 h-4" />
                {isAr ? "ربط حساب فيسبوك" : "Connect Facebook"}
              </button>
            ) : selectedPlatform === "tiktok" ? (
              <button
                onClick={() => {
                  const returnPath = `${window.location.pathname}${window.location.search}`;
                  window.location.href = `/api/tiktok/oauth/start?return=${encodeURIComponent(returnPath)}`;
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white text-sm font-semibold transition-all"
              >
                <Link2 className="w-4 h-4" />
                {isAr ? "ربط حساب تيك توك" : "Connect TikTok"}
              </button>
            ) : (
              <button
                onClick={() => signIn("google", { callbackUrl: window.location.href })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-colors"
              >
                <Youtube className="w-4 h-4" />
                {isAr ? "ربط حساب يوتيوب" : "Connect YouTube"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
