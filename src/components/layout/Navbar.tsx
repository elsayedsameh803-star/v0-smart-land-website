'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Globe } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [locale, setLocale] = useState<'en' | 'ar'>('en');

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    setLocale(newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-smart-black/90 backdrop-blur-md border-b border-smart-dark-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-br from-smart-gold to-smart-gold-dark rounded-lg flex items-center justify-center">
              <span className="text-smart-black font-bold text-sm">SL</span>
            </div>
            <span className="text-lg font-bold gold-gradient-text">
              Smart Land
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <Link
              href="/"
              className="text-sm text-smart-gray-light hover:text-smart-gold transition-colors"
            >
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <Link
              href="/methodology"
              className="text-sm text-smart-gray-light hover:text-smart-gold transition-colors"
            >
              {locale === 'ar' ? 'المنهجية' : 'Methodology'}
            </Link>
            <Link
              href="/admin"
              className="text-sm text-smart-gray-light hover:text-smart-gold transition-colors"
            >
              {locale === 'ar' ? 'لوحة الإدارة' : 'Admin'}
            </Link>

            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 rounded-lg border border-smart-dark-3 text-sm text-smart-gray-light hover:text-smart-gold hover:border-smart-gold/30 transition-all"
            >
              <Globe className="w-4 h-4" />
              <span>{locale === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-smart-gray-light hover:text-smart-gold transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-smart-dark border-t border-smart-dark-3">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block text-sm text-smart-gray-light hover:text-smart-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <Link
              href="/methodology"
              className="block text-sm text-smart-gray-light hover:text-smart-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {locale === 'ar' ? 'المنهجية' : 'Methodology'}
            </Link>
            <Link
              href="/admin"
              className="block text-sm text-smart-gray-light hover:text-smart-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {locale === 'ar' ? 'لوحة الإدارة' : 'Admin'}
            </Link>
            <button
              onClick={toggleLocale}
              className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 rounded-lg border border-smart-dark-3 text-sm text-smart-gray-light hover:text-smart-gold transition-all"
            >
              <Globe className="w-4 h-4" />
              <span>{locale === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}