'use client'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function Header() {
  const { lang, setLang, t } = useLanguage()
  const { theme, toggle } = useTheme()

  return (
    <header className="site-header">
      <Link href="/" className="logo">
        <div className="logo-mark">
          <svg viewBox="0 0 24 24" width={16} height={16} fill="#fff" aria-hidden="true">
            <path d="M5 4v16l7-4 7 4V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
          </svg>
        </div>
        <span className="logo-name">
          nilves<span>.dev</span>
        </span>
      </Link>

      <div className="hdr-right">
        <div className="hdr-tagline">
          <div className="pulse" aria-hidden="true" />
          <span>{t('header.tagline')}</span>
        </div>

        {/* Language pill */}
        <div className="lang-toggle" role="group" aria-label="Language">
          <button
            className={`lang-opt${lang === 'tr' ? ' active' : ''}`}
            onClick={() => setLang('tr')}
            aria-pressed={lang === 'tr'}
          >
            TR
          </button>
          <button
            className={`lang-opt${lang === 'en' ? ' active' : ''}`}
            onClick={() => setLang('en')}
            aria-pressed={lang === 'en'}
          >
            EN
          </button>
        </div>

        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={toggle}
          title={theme === 'dark' ? t('header.lightTooltip') : t('header.darkTooltip')}
          aria-label={theme === 'dark' ? t('header.lightTooltip') : t('header.darkTooltip')}
        >
          {theme === 'dark'
            ? <Sun size={16} strokeWidth={1.75} />
            : <Moon size={16} strokeWidth={1.75} />}
        </button>
      </div>
    </header>
  )
}
