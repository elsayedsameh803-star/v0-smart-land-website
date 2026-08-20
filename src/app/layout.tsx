import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Cairo } from "next/font/google";
import { GoogleAnalyticsScript, SearchConsoleVerification } from "@/components/GoogleAnalytics";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: `${SITE_URL}/en`,
      ar: `${SITE_URL}/ar`,
      "x-default": SITE_URL,
    },
  },
  title: {
    default: "Smart Land - AI Digital Audit Platform | سمارت لاند - منصة التدقيق الرقمي",
    template: "%s | Smart Land",
  },
  description: "Analyze, understand, and improve your digital presence with evidence-based AI-powered audits across websites and social media platforms. حلل، افهم، وحسّن حضورك الرقمي بتدقيقات مدعومة بالذكاء الاصطناعي.",
  keywords: [
    "digital audit", "SEO analysis", "website analyzer", "AI audit", 
    "social media audit", "website performance", "accessibility check",
    "تدقيق رقمي", "تحليل مواقع", "تحسين محركات البحث", "سمارت لاند"
  ],
  authors: [{ name: "Smart Land" }],
  creator: "Smart Land",
  publisher: "Smart Land",
  applicationName: "Smart Land",
  generator: "Next.js",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_EG",
    siteName: "Smart Land",
    title: "Smart Land - AI Digital Audit Platform",
    description: "Analyze, understand, and improve your digital presence with evidence-based AI-powered audits.",
    url: SITE_URL,
    images: [
      {
        url: "/og-image-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Smart Land - AI Digital Audit Platform",
      },
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Smart Land Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Land - AI Digital Audit Platform",
    description: "Analyze, understand, and improve your digital presence with evidence-based AI-powered audits.",
    creator: "@smartland",
    images: ["/og-image-1200x630.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon-512x512.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: { url: "/icons/icon-96x96.png", type: "image/png" },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Smart Land",
    statusBarStyle: "black-translucent",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-touch-fullscreen": "yes",
    "apple-mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#020617",
    "msapplication-TileImage": "/icons/icon-144x144.png",
    "msapplication-config": "none",
  } as Record<string, string>,
};

function detectLocaleFromHeaders(): string {
  try {
    const headersList = headers();
    const acceptLanguage = headersList.get("accept-language") || "";
    
    // Check for Arabic first
    if (acceptLanguage.includes("ar")) {
      return "ar";
    }
    
    // Default to English
    return "en";
  } catch {
    return "en";
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = detectLocaleFromHeaders();
  const dir = locale === "ar" ? "rtl" : "ltr";

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Smart Land",
    alternateName: "سمارت لاند",
    url: SITE_URL,
    description: "AI Digital Audit Platform - Analyze, understand, and improve your digital presence with evidence-based AI-powered audits across websites and social media platforms.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "Smart Land",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Smart Land",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icons/icon-512x512.png`,
      },
    },
    sameAs: [
      "https://github.com/elsayedsameh803-star/v0-smart-land-website",
      SITE_URL,
    ],
  };

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${cairo.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#eab308" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Smart Land" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Smart Land" />
        <meta name="msapplication-TileColor" content="#020617" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        
        {/* PWA splash screen */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Google Search Console Verification */}
        <SearchConsoleVerification />
        
        {/* Google Analytics 4 */}
        <GoogleAnalyticsScript />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                  }).then(function(reg) {
                    console.log('[PWA] SW registered:', reg.scope);
                    reg.addEventListener('updatefound', function() {
                      var newWorker = reg.installing;
                      newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                          console.log('[PWA] Update available');
                        }
                      });
                    });
                  }).catch(function(err) {
                    console.warn('[PWA] SW failed:', err);
                  });

                  navigator.serviceWorker.addEventListener('controllerchange', function() {
                    if (!window.__refreshing) {
                      window.__refreshing = true;
                      window.location.reload();
                    }
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-dark-950 text-gold-100 antialiased">
        {children}
      </body>
    </html>
  );
}