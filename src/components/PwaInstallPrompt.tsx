"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone, Monitor, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

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
      // Show prompt after a delay
      setTimeout(() => {
        if (!dismissed) setIsVisible(true);
      }, 30000); // Show after 30 seconds
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show after a delay
    if (isIOSDevice) {
      setTimeout(() => {
        if (!dismissed) setIsVisible(true);
      }, 30000);
    }

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    // Show again after 7 days if dismissed
    setTimeout(() => setDismissed(false), 7 * 24 * 60 * 60 * 1000);
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] max-w-md mx-auto animate-slide-up">
      <div className="relative bg-dark-800/95 backdrop-blur-xl border border-gold-500/20 rounded-2xl shadow-2xl shadow-gold-500/10 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-gold-600/5 pointer-events-none" />
        
        <div className="relative p-4">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gold-500/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-dark-400" />
          </button>

          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20 shrink-0">
              <Sparkles className="w-6 h-6 text-dark-950" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-sm font-bold text-white mb-1">
                Install Smart Land
              </h3>
              <p className="text-xs text-dark-400 leading-relaxed">
                {isIOS 
                  ? "Tap the Share button and select 'Add to Home Screen' for the best experience."
                  : "Install our app for a faster, offline-ready experience with full features."}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            {!isIOS && deferredPrompt ? (
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 text-sm font-bold hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            ) : isIOS ? (
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-300 text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Share → Add to Home Screen</span>
              </div>
            ) : null}
            
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 rounded-xl text-sm text-dark-400 hover:text-gold-300 hover:bg-gold-500/5 transition-all"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}