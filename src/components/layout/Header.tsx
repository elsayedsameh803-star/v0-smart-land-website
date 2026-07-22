"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, Globe } from "lucide-react";

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-surface-200' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-xl font-bold text-surface-900">
            <span className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">SL</span>
            <span>{dictionary.app.name}</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors duration-200 ${pathname === link.href ? 'text-primary-600' : 'text-surface-600 hover:text-surface-900'}`}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Link href={localePath} className="flex items-center gap-1.5 text-sm text-surface-600 hover:text-surface-900 transition-colors px-3 py-2 rounded-lg hover:bg-surface-100">
              <Globe className="w-4 h-4" />
              <span>{locale === "en" ? dictionary.nav.arabic : dictionary.nav.english}</span>
            </Link>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 rounded-lg text-surface-600 hover:bg-surface-100" aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-surface-200 animate-slide-down">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === link.href ? 'text-primary-600 bg-primary-50' : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'}`}>
                  {link.label}
                </Link>
              ))}
              <Link href={localePath} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-600 hover:bg-surface-50">
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