import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Smart Land - AI Digital Audit Platform',
  description: 'Analyze, understand, and improve your digital presence with evidence-based AI-powered audits.',
  keywords: ['digital audit', 'SEO analysis', 'website analyzer', 'AI audit', 'performance check', 'accessibility check'],
  authors: [{ name: 'Smart Land' }],
  openGraph: {
    title: 'Smart Land - AI Digital Audit Platform',
    description: 'Analyze, understand, and improve your digital presence with evidence-based AI-powered audits.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Smart Land',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Land - AI Digital Audit Platform',
    description: 'Analyze, understand, and improve your digital presence with evidence-based AI-powered audits.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="scroll-smooth">
      <body className="min-h-screen bg-smart-black text-white antialiased">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}