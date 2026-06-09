'use client'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useSidebar } from '@/contexts/SidebarContext'
import Logo from '@/components/Logo'
import { Sun, Moon, Menu } from 'lucide-react'

export default function Header() {
  const { lang, setLang, t } = useLanguage()
  const { theme, toggle } = useTheme()
  const { toggle: toggleSidebar } = useSidebar()

  return (
    <header className="site-header">
      <button
        className="nav-burger"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <Menu size={20} strokeWidth={2} />
      </button>
      <Logo size="sm" showText={true} />

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
