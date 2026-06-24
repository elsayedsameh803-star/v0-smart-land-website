"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { Language, translations, TranslationKey, LANGUAGES } from "./translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only run in browser
    if (typeof window !== "undefined") {
      try {
        const savedLanguage = localStorage.getItem("language") as Language | null
        if (savedLanguage && LANGUAGES[savedLanguage]) {
          setLanguage(savedLanguage)
        }
      } catch (e) {
        // localStorage might be disabled
        console.warn("Unable to access localStorage:", e)
      }
    }
    setMounted(true)
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("language", lang)
      } catch (e) {
        console.warn("Unable to save to localStorage:", e)
      }
    }
  }

  const t = (key: TranslationKey) => {
    const translation = translations[key as keyof typeof translations]
    if (!translation) {
      // For backward compatibility with old (ar, en) syntax
      if (typeof key === 'string' && language === 'ar') {
        const [ar, en] = key.split('|')
        return ar || key
      }
      return key as string
    }
    return translation[language] || translation.en
  }

  const isRTL = LANGUAGES[language].rtl

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      <div dir={isRTL ? "rtl" : "ltr"} lang={language} className="w-full">
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
