'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { ToolIcon } from '@/lib/icons'
import { Home } from 'lucide-react'

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
  { kind: 'link',    label: 'Home',                   href: '/',                      home: true },

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

  { kind: 'section', tkey: 'nav.turkish', flag: '🇹🇷' },
  { kind: 'link',    tkey: 'tools.tcknGenerator',     href: '/tckn-generator' },
  { kind: 'link',    tkey: 'tools.vknGenerator',      href: '/vkn-generator' },
  { kind: 'link',    tkey: 'tools.ibanGenerator',     href: '/tr-iban-generator' },
  { kind: 'link',    tkey: 'tools.creditCard',        href: '/credit-card-generator' },
  { kind: 'link',    tkey: 'tools.fakeData',          href: '/fake-person-data' },

  { kind: 'section', tkey: 'nav.productivity' },
  { kind: 'link',    tkey: 'tools.projectPlanner',    href: '/project-planner' },

  { kind: 'section', tkey: 'nav.education' },
  { kind: 'link',    tkey: 'tools.sqlPlayground',     href: '/sql-playground' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { open, close } = useSidebar()

  // Close the drawer whenever the route changes (mobile)
  useEffect(() => { close() }, [pathname, close])

  return (
    <>
      <div
        className={`sidebar-overlay${open ? ' show' : ''}`}
        onClick={close}
        aria-hidden="true"
      />
      <nav className={`sidebar${open ? ' open' : ''}`}>
      {items.map((item, i) => {
        if (item.kind === 'section') {
          return (
            <div key={i} className="nav-section">
              {item.flag ? `${item.flag} ` : ''}{t(item.tkey)}
            </div>
          )
        }

        const active = item.href === '/'
          ? pathname === '/'
          : pathname.startsWith(item.href)

        const classes = ['nav-item', item.home ? 'home' : '', active ? 'active' : '']
          .filter(Boolean).join(' ')

        return (
          <Link key={i} href={item.href} className={classes}>
            <span className="nav-icon" aria-hidden="true">
              {item.home ? <Home size={16} strokeWidth={1.75} /> : <ToolIcon href={item.href} size={16} />}
            </span>
            {item.home ? item.label : t(item.tkey!)}
          </Link>
        )
      })}
      </nav>
    </>
  )
}
