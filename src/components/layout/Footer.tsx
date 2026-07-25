import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-gold-500/10 bg-dark-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/2 to-gold-600/2 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/40 transition-all">
                <Sparkles className="w-4 h-4 text-dark-950" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gold-400 to-gold-600 text-transparent bg-clip-text">Smart Land</span>
            </Link>
            <p className="text-sm text-dark-400 max-w-md leading-relaxed">
              AI Digital Audit Platform — Evidence-driven digital presence analysis.
              Analyze, understand, and improve your digital presence with actionable insights.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="flex -space-x-2">
                {['bg-gold-500', 'bg-gold-600', 'bg-gold-700', 'bg-gold-800'].map((color, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${color} ring-2 ring-dark-950 flex items-center justify-center text-xs font-bold text-dark-950`}>
                    {['S', 'M', 'A', 'L'][i]}
                  </div>
                ))}
              </div>
              <span className="text-xs text-dark-500">Trusted globally</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gold-400 mb-5">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-dark-400 hover:text-gold-400 transition-colors">
                  URL Analyzer
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="text-sm text-dark-400 hover:text-gold-400 transition-colors">
                  Methodology
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-dark-400 hover:text-gold-400 transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gold-400 mb-5">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-dark-400 hover:text-gold-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-dark-400 hover:text-gold-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-dark-400 hover:text-gold-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-gradient-to-r from-transparent via-gold-500/10 to-transparent" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-dark-500">
            © {new Date().getFullYear()} Smart Land. All rights reserved.
          </p>
          <p className="text-xs text-dark-500">
            Made with precision — AI Digital Audit Platform
          </p>
        </div>
      </div>
    </footer>
  );
}