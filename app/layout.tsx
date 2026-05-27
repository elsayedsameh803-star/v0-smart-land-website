import type { Metadata, Viewport } from 'next'
import { Cairo, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const cairo = Cairo({ 
  subsets: ["arabic", "latin"],
  variable: '--font-cairo',
  display: 'swap',
  preload: true,
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'سمارت لاند | Smart Land - منصة تحليل البيانات والذكاء الاصطناعي',
  description: 'سمارت لاند - أفضل منصة عربية لتحليل المواقع والسوشيال ميديا بالذكاء الاصطناعي. تحليل انستجرام، فيسبوك، تيك توك، تحسين SEO، زيادة الأرباح، استشارات احترافية للمواقع والتطبيقات.',
  keywords: [
    'تحليل بيانات',
    'تحليل مواقع',
    'تحليل انستجرام',
    'تحليل فيسبوك', 
    'تحليل تيك توك',
    'سوشيال ميديا',
    'SEO',
    'تحسين محركات البحث',
    'زيادة الأرباح',
    'استشارات مواقع',
    'ذكاء اصطناعي',
    'AI analytics',
    'website analysis',
    'social media analytics',
    'سمارت لاند',
    'Smart Land',
  ],
  authors: [{ name: 'Smart Land - سمارت لاند', url: 'https://smartland.app' }],
  creator: 'Smart Land',
  publisher: 'Smart Land',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    url: 'https://smartland.app',
    siteName: 'سمارت لاند | Smart Land',
    title: 'سمارت لاند - منصة تحليل البيانات والذكاء الاصطناعي',
    description: 'أفضل منصة عربية لتحليل المواقع والسوشيال ميديا بالذكاء الاصطناعي. تحليل شامل لانستجرام، فيسبوك، تيك توك مع توصيات لزيادة الأرباح.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'سمارت لاند - منصة تحليل البيانات',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سمارت لاند | Smart Land - تحليل البيانات بالذكاء الاصطناعي',
    description: 'منصة متكاملة لتحليل المواقع والسوشيال ميديا بالذكاء الاصطناعي',
    images: ['/og-image.png'],
    creator: '@smartland',
  },
  alternates: {
    canonical: 'https://smartland.app',
    languages: {
      'ar-EG': 'https://smartland.app/ar',
      'en-US': 'https://smartland.app/en',
    },
  },
  category: 'technology',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className="bg-background">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <meta name="google-site-verification" content="google101dccb5716e512"/>
      </head>
      <body className={`${cairo.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  )
}
