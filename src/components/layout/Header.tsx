"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, Globe, Sparkles } from "lucide-react";

interface HeaderProps {
  locale: string;
  dictionary: {
    nav: { home: string; methodology: string; admin: string; language: string; english: string; arabic: string; };
    app: { name: string; };
  };
}

const Header = ({ locale, dictionary }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/features`, label: "Features" },
    { href: `/${locale}/methodology`, label: dictionary.nav.methodology },
    { href: `/${locale}/about`, label: "About" },
    { href: `/${locale}/contact`, label: "Contact" },
    { href: `/${locale}/faq`, label: "FAQ" },
  ];

  const otherLocale = locale === "en" ? "ar" : "en";
  const localePath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isScrolled 
        ? 'glass-deep shadow-lg shadow-gold-500/5' 
        : 'bg-transparent'
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo - Bigger and more prominent */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center text-dark-950 shadow-lg shadow-gold-500/25 group-hover:shadow-gold-500/50 transition-all duration-300 group-hover:scale-105">
                <Sparkles className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold-500 rounded-full animate-ping-slow" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold-500 rounded-full animate-ping-slow" style={{ animationDelay: "0.5s" }} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-transparent bg-clip-text group-hover:from-gold-300 group-hover:to-gold-500 transition-all duration-300 leading-tight">
                {dictionary.app.name}
              </span>
              <span className="text-[10px] lg:text-xs text-dark-500 hidden sm:block">
                AI Digital Audit Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={cn(
                    "relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive 
                      ? 'text-gold-400' 
                      : 'text-dark-300 hover:text-gold-400'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-gold-500 to-gold-400 rounded-full" />
                  )}
                  {!isActive && (
                    <span className="absolute inset-0 rounded-lg bg-gold-500/0 group-hover:bg-gold-500/5 transition-all duration-200" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link 
              href={localePath} 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-dark-300 hover:text-gold-400 transition-all duration-200 border border-gold-500/10 hover:border-gold-500/30 hover:bg-gold-500/5 gold-glow-hover"
            >
              <Globe className="w-4 h-4" />
              <span>{locale === "en" ? dictionary.nav.arabic : dictionary.nav.english}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="lg:hidden relative p-2.5 rounded-lg text-dark-300 hover:text-gold-400 transition-all duration-200 border border-gold-500/10 hover:border-gold-500/30 hover:bg-gold-500/5"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gold-500/10 animate-slide-down">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={cn(
                      "px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive 
                        ? 'text-gold-400 bg-gold-500/10 border border-gold-500/20' 
                        : 'text-dark-300 hover:text-gold-400 hover:bg-gold-500/5 border border-transparent'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link 
                href={localePath} 
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm text-dark-300 hover:text-gold-400 hover:bg-gold-500/5 transition-all duration-200 border border-transparent"
              >
                <Globe className="w-4 h-4" />
                <span>{locale === "en" ? dictionary.nav.arabic : dictionary.nav.english}</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export { Header };