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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [pathname]);

  const navLinks = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/methodology`, label: dictionary.nav.methodology },
    { href: `/${locale}/admin`, label: dictionary.nav.admin },
  ];

  const otherLocale = locale === "en" ? "ar" : "en";
  const localePath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-dark-950/95 backdrop-blur-md shadow-lg shadow-gold-500/5 border-b border-gold-500/10' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-xl font-bold text-gold-400 group">
            <span className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center text-dark-950 text-sm font-bold shadow-lg shadow-gold-500/25 group-hover:shadow-gold-500/50 transition-all">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="bg-gradient-to-r from-gold-400 to-gold-600 text-transparent bg-clip-text">{dictionary.app.name}</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors duration-200 ${pathname === link.href ? 'text-gold-400' : 'text-dark-300 hover:text-gold-400'}`}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Link href={localePath} className="flex items-center gap-1.5 text-sm text-dark-300 hover:text-gold-400 transition-colors px-3 py-2 rounded-lg hover:bg-gold-500/10 gold-border">
              <Globe className="w-4 h-4" />
              <span>{locale === "en" ? dictionary.nav.arabic : dictionary.nav.english}</span>
            </Link>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 rounded-lg text-dark-300 hover:bg-gold-500/10 gold-border" aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gold-500/10 animate-slide-down">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === link.href ? 'text-gold-400 bg-gold-500/10' : 'text-dark-300 hover:text-gold-400 hover:bg-gold-500/5'}`}>
                  {link.label}
                </Link>
              ))}
              <Link href={localePath} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-300 hover:bg-gold-500/5">
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