"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, X } from "lucide-react";

const CONSENT_STORAGE_KEY = "smartland_cookie_consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

function loadGoogleAnalytics(gaId: string) {
  if (!gaId || typeof window === "undefined") return;
  if (document.querySelector(`script[src*="${gaId}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  const initScript = document.createElement("script");
  initScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}', {
      page_path: window.location.pathname,
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure',
      anonymize_ip: true,
    });
  `;
  document.head.appendChild(initScript);
}

export default function CookieConsent() {
  const [consent, setConsent] = useState<"accepted" | "declined" | "unknown">("unknown");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (saved === "accepted") {
      setConsent("accepted");
      loadGoogleAnalytics(GA_ID);
    } else if (saved === "declined") {
      setConsent("declined");
    } else {
      setConsent("unknown");
    }
  }, []);

  const handleAccept = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
    setConsent("accepted");
    loadGoogleAnalytics(GA_ID);
  };

  const handleDecline = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "declined");
    setConsent("declined");
  };

  if (!GA_ID || consent !== "unknown") return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] rounded-3xl border border-gold-500/20 bg-dark-900/95 p-4 shadow-2xl shadow-gold-500/20 backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-gold-500/10 p-2 text-gold-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Smart Land uses cookies for analytics</p>
            <p className="text-sm text-dark-400">Accept analytics cookies to help improve the service and track usage anonymously.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={handleDecline}
            className="rounded-full border border-gold-500/20 bg-dark-800 px-4 py-2 text-sm text-dark-200 transition hover:border-gold-400 hover:text-gold-300"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-full bg-gradient-to-r from-gold-500 to-gold-600 px-4 py-2 text-sm font-semibold text-dark-950 transition hover:from-gold-400 hover:to-gold-500"
          >
            Accept
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-dark-500">
        <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" />
        <span>Privacy-first analytics, no personal data is stored.</span>
      </div>
    </div>
  );
}
