'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { translations, type Lang } from '@/lib/translations'

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  /** Dot-path translation lookup, e.g. t('common.copy'). Falls back to the key. */
  t: (path: string) => string
}

const LanguageContext = createContext<Ctx | null>(null)

function lookup(lang: Lang, path: string): string {
  const parts = path.split('.')
  let node: unknown = translations[lang]
  for (const p of parts) {
    if (node && typeof node === 'object' && p in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[p]
    } else {
      return path
    }
  }
  return typeof node === 'string' ? node : path
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('tr')

  useEffect(() => {
    const saved = localStorage.getItem('nilves-lang') as Lang | null
    if (saved === 'tr' || saved === 'en') setLangState(saved)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem('nilves-lang', l)
    document.documentElement.lang = l
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback((path: string) => lookup(lang, path), [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
