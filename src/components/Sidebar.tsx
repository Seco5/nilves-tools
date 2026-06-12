'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSidebar } from '@/contexts/SidebarContext'
import Logo from '@/components/Logo'
import { ToolIcon } from '@/lib/icons'
import { Home, Search } from 'lucide-react'

type SectionItem = { kind: 'section'; tkey: string; flag?: string }
type NavItem = {
  kind: 'link'
  tkey?: string
  label?: string
  href: string
  home?: boolean
}
type Item = SectionItem | NavItem

const items: Item[] = [
  { kind: 'link',    tkey: 'nav.home',                href: '/',                      home: true },

  { kind: 'section', tkey: 'nav.formatters' },
  { kind: 'link',    tkey: 'tools.jsonFormatter',     href: '/json-formatter' },
  { kind: 'link',    tkey: 'tools.diffChecker',       href: '/diff-checker' },
  { kind: 'link',    tkey: 'tools.xmlFormatter',      href: '/xml-formatter' },
  { kind: 'link',    tkey: 'tools.sqlFormatter',      href: '/sql-formatter' },
  { kind: 'link',    tkey: 'tools.csvJson',           href: '/csv-json' },
  { kind: 'link',    tkey: 'tools.markdownPreview',   href: '/markdown-preview' },

  { kind: 'section', tkey: 'nav.generators' },
  { kind: 'link',    tkey: 'tools.uuidGenerator',     href: '/uuid-generator' },
  { kind: 'link',    tkey: 'tools.passwordGenerator', href: '/password-generator' },
  { kind: 'link',    tkey: 'tools.hashGenerator',     href: '/hash-generator' },
  { kind: 'link',    tkey: 'tools.loremIpsum',        href: '/lorem-ipsum' },
  { kind: 'link',    tkey: 'tools.colorConverter',    href: '/color-converter' },
  { kind: 'link',    tkey: 'tools.barcodeQr',         href: '/barcode-qr' },

  { kind: 'section', tkey: 'nav.encoders' },
  { kind: 'link',    tkey: 'tools.base64',            href: '/base64' },
  { kind: 'link',    tkey: 'tools.urlEncodeDecode',   href: '/url-encode-decode' },
  { kind: 'link',    tkey: 'tools.jwtDecoder',        href: '/jwt-decoder' },

  { kind: 'section', tkey: 'nav.converters' },
  { kind: 'link',    tkey: 'tools.timestamp',         href: '/timestamp' },
  { kind: 'link',    tkey: 'tools.numberBase',        href: '/number-base' },
  { kind: 'link',    tkey: 'tools.cronExpression',    href: '/cron-expression' },

  { kind: 'section', tkey: 'nav.testers' },
  { kind: 'link',    tkey: 'tools.regexTester',       href: '/regex-tester' },
  { kind: 'link',    tkey: 'tools.imageDiff',         href: '/image-diff' },

  { kind: 'section', tkey: 'nav.turkish', flag: '🇹🇷' },
  { kind: 'link',    tkey: 'tools.tcknGenerator',     href: '/tckn-generator' },
  { kind: 'link',    tkey: 'tools.vknGenerator',      href: '/vkn-generator' },
  { kind: 'link',    tkey: 'tools.ibanGenerator',     href: '/iban-generator' },
  { kind: 'link',    tkey: 'tools.creditCard',        href: '/credit-card-generator' },

  { kind: 'section', tkey: 'nav.productivity' },
  { kind: 'link',    tkey: 'tools.projectPlanner',    href: '/project-planner' },

  { kind: 'section', tkey: 'nav.education' },
  { kind: 'link',    tkey: 'tools.sqlPlayground',     href: '/sql-playground' },

  { kind: 'section', tkey: 'nav.database' },
  { kind: 'link',    tkey: 'tools.mongoQueryBuilder', href: '/mongo-query-builder' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { t, lang } = useLanguage()
  const { open, close } = useSidebar()
  const [query, setQuery] = useState('')

  // Close the drawer whenever the route changes (mobile)
  useEffect(() => { close() }, [pathname, close])

  const norm = (s: string) => s.toLocaleLowerCase(lang === 'tr' ? 'tr' : 'en')
  const q = norm(query.trim())

  const renderLink = (item: NavItem, key: React.Key) => {
    const active = item.href === '/'
      ? pathname === '/'
      : pathname.startsWith(item.href)
    const classes = ['nav-item', item.home ? 'home' : '', active ? 'active' : '']
      .filter(Boolean).join(' ')
    return (
      <Link key={key} href={item.href} className={classes}>
        <span className="nav-icon" aria-hidden="true">
          {item.home ? <Home size={16} strokeWidth={1.75} /> : <ToolIcon href={item.href} size={16} />}
        </span>
        {t(item.tkey!)}
      </Link>
    )
  }

  // When searching, show a flat list of matching tools (ignore sections & Home)
  const results = q
    ? items.filter(
        (it): it is NavItem =>
          it.kind === 'link' && !it.home &&
          (norm(t(it.tkey!)).includes(q) || norm(it.href).includes(q)),
      )
    : null

  return (
    <>
      <div
        className={`sidebar-overlay${open ? ' show' : ''}`}
        onClick={close}
        aria-hidden="true"
      />
      <nav className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo"><Logo size="sm" showText={true} /></div>

        <div className="sidebar-search">
          <Search size={15} strokeWidth={1.75} className="sidebar-search-ic" aria-hidden="true" />
          <input
            type="search"
            className="sidebar-search-input"
            placeholder={t('nav.search')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label={t('nav.search')}
          />
        </div>

        {results
          ? (results.length
              ? results.map((it, i) => renderLink(it, i))
              : <div className="sidebar-noresults">{t('nav.noResults')}</div>)
          : items.map((item, i) =>
              item.kind === 'section'
                ? (
                  <div key={i} className="nav-section">
                    {item.flag ? `${item.flag} ` : ''}{t(item.tkey)}
                  </div>
                )
                : renderLink(item, i),
            )}
      </nav>
    </>
  )
}
