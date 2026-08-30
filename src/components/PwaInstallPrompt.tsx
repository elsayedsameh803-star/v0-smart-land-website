"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, Smartphone, Monitor, Sparkles, Zap, Wifi, Shield, Star, Check, ChevronRight } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const FEATURES = [
  { icon: Zap, label: "Fast & Instant" },
  { icon: Wifi, label: "Works Offline" },
  { icon: Shield, label: "Secure & Private" },
  { icon: Star, label: "Premium Experience" },
];

const DISMISSAL_KEY = "sl_pwa_dismissed_at";
const DISMISSAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const wasDismissedRecently = useCallback(() => {
    try {
      const dismissedAt = localStorage.getItem(DISMISSAL_KEY);
      if (!dismissedAt) return false;
      return Date.now() - parseInt(dismissedAt, 10) < DISMISSAL_DURATION_MS;
    } catch {
      return false;
    }
  }, []);

  const showPrompt = useCallback(() => {
    if (!wasDismissedRecently()) setIsVisible(true);
  }, [wasDismissedRecently]);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true) {
      setIsStandalone(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 8 seconds for better engagement
      setTimeout(showPrompt, 8000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show after 8 seconds
    if (isIOSDevice) {
      setTimeout(showPrompt, 8000);
    }

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [showPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setIsVisible(false);
        }
      } finally {
        setIsInstalling(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISSAL_KEY, String(Date.now()));
    } catch {
      // ignore storage errors
    }
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] max-w-md mx-auto animate-slide-up">
      <div className="relative bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 backdrop-blur-xl border border-gold-500/30 rounded-3xl shadow-2xl shadow-gold-500/20 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 via-transparent to-gold-600/10 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative p-5">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gold-500/10 transition-colors z-10"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-dark-400 hover:text-gold-300" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4">
            {/* App Icon */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/30">
                <Sparkles className="w-8 h-8 text-dark-950" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-dark-900 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white leading-tight">
                Install Smart Land
              </h3>
              <p className="text-xs text-gold-300/80 mt-0.5">
                {isIOS ? "Add to Home Screen" : "Get the Full App Experience"}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-dark-300 leading-relaxed mt-4">
            {isIOS 
              ? "Install Smart Land on your device for instant access, offline support, and a native app experience."
              : "Transform your browser into a powerful app with one tap. Enjoy faster loading, offline access, and exclusive features."}
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold-500/5 border border-gold-500/10">
                <Icon className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span className="text-[11px] font-medium text-dark-200">{label}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-5">
            {!isIOS && deferredPrompt ? (
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 text-sm font-bold hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isInstalling ? (
                  <>
                    <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Install App
                  </>
                )}
              </button>
            ) : isIOS ? (
              <button
                onClick={() => setShowIOSInstructions(!showIOSInstructions)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-300 text-sm font-medium hover:bg-gold-500/20 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                How to Install
                <ChevronRight className={`w-4 h-4 transition-transform ${showIOSInstructions ? "rotate-90" : ""}`} />
              </button>
            ) : (
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 text-sm font-bold hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
            
            <button
              onClick={handleDismiss}
              className="px-4 py-3 rounded-xl text-sm text-dark-400 hover:text-gold-300 hover:bg-gold-500/5 transition-all"
            >
              Later
            </button>
          </div>

          {/* iOS Instructions */}
          {isIOS && showIOSInstructions && (
            <div className="mt-4 p-4 rounded-xl bg-dark-900/80 border border-gold-500/20 animate-slide-up">
              <p className="text-xs text-dark-300 leading-relaxed">
                <span className="font-bold text-gold-300">Step 1:</span> Tap the{" "}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-300">
                  <Monitor className="w-3 h-3" /> Share
                </span>{" "}
                button in Safari
              </p>
              <p className="text-xs text-dark-300 leading-relaxed mt-2">
                <span className="font-bold text-gold-300">Step 2:</span> Scroll down and tap{" "}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-300">
                  <Smartphone className="w-3 h-3" /> Add to Home Screen
                </span>
              </p>
              <p className="text-xs text-dark-300 leading-relaxed mt-2">
                <span className="font-bold text-gold-300">Step 3:</span> Tap{" "}
                <span className="font-bold text-gold-300">Add</span> to confirm
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}