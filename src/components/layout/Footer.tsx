import Link from 'next/link';
import { Sparkles, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-gold-500/10 bg-dark-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/2 to-gold-600/3 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gold-600/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand - wider column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/40 transition-all duration-300 group-hover:scale-105">
                  <Sparkles className="w-5 h-5 text-dark-950" />
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold-500 rounded-full animate-ping-slow" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 text-transparent bg-clip-text">Smart Land</span>
            </Link>
            <p className="text-sm text-dark-400 max-w-md leading-relaxed mb-6">
              AI Digital Audit Platform — Evidence-driven digital presence analysis.
              Analyze, understand, and improve your digital presence with actionable insights.
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Mail, href: "#", label: "Email" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-dark-800 border border-gold-500/10 flex items-center justify-center text-dark-400 hover:text-gold-400 hover:border-gold-500/30 hover:bg-dark-700 transition-all duration-200 gold-glow-hover"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Team avatars */}
            <div className="flex items-center gap-3 mt-6">
              <div className="flex -space-x-2">
                {['bg-gold-500', 'bg-gold-600', 'bg-gold-700', 'bg-gold-800'].map((color, i) => (
                  <div 
                    key={i} 
                    className={`w-8 h-8 rounded-full ${color} ring-2 ring-dark-950 flex items-center justify-center text-xs font-bold text-dark-950 hover:scale-110 transition-transform duration-200`}
                  >
                    {['S', 'M', 'A', 'L'][i]}
                  </div>
                ))}
              </div>
              <span className="text-xs text-dark-500">Trusted globally</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gold-400 mb-5 relative inline-block">
              Product
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "URL Analyzer" },
                { href: "/methodology", label: "Methodology" },
                { href: "/admin", label: "Admin Dashboard" },
              ].map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-sm text-dark-400 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500/0 group-hover:bg-gold-500 transition-all duration-200" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gold-400 mb-5 relative inline-block">
              Resources
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
            </h3>
            <ul className="space-y-3">
              {[
                { href: "#", label: "Documentation" },
                { href: "#", label: "API Reference" },
                { href: "#", label: "Blog" },
              ].map((item) => (
                <li key={item.label}>
                  <a 
                    href={item.href} 
                    className="text-sm text-dark-400 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500/0 group-hover:bg-gold-500 transition-all duration-200" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gold-400 mb-5 relative inline-block">
              Company
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
            </h3>
            <ul className="space-y-3">
              {[
                { href: "#", label: "Privacy Policy" },
                { href: "#", label: "Terms of Service" },
                { href: "#", label: "Contact" },
              ].map((item) => (
                <li key={item.label}>
                  <a 
                    href={item.href} 
                    className="text-sm text-dark-400 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500/0 group-hover:bg-gold-500 transition-all duration-200" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-dark-500 flex items-center gap-1">
            © {new Date().getFullYear()} Smart Land. All rights reserved.
          </p>
          <p className="text-xs text-dark-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-gold-500 fill-gold-500" /> precision — AI Digital Audit Platform
          </p>
        </div>
      </div>
    </footer>
  );
}