'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { section: null, label: '🏠 Home', href: '/', icon: null, isHome: true },
  { section: 'Formatters' },
  { label: 'JSON Formatter', href: '/json-formatter', icon: '{ }' },
  { label: 'Diff Checker', href: '/diff-checker', icon: '⇄' },
  { label: 'CSV ↔ JSON', href: '/csv-json', icon: '⊞' },
  { label: 'Markdown Preview', href: '/markdown-preview', icon: 'M↓' },
  { section: 'Generators' },
  { label: 'UUID / NanoID', href: '/uuid-generator', icon: '⊡' },
  { label: 'Password', href: '/password-generator', icon: '🔑' },
  { label: 'Hash (MD5/SHA)', href: '/hash-generator', icon: '⊕' },
  { label: 'Lorem Ipsum', href: '/lorem-ipsum', icon: '¶' },
  { label: 'Color Converter', href: '/color-converter', icon: '◉' },
  { section: 'Encoders' },
  { label: 'Base64', href: '/base64', icon: '64' },
  { label: 'URL Encode/Decode', href: '/url-encode-decode', icon: '🔗' },
  { label: 'JWT Decoder', href: '/jwt-decoder', icon: '🔐' },
  { section: 'Converters' },
  { label: 'Timestamp', href: '/timestamp', icon: '⏱' },
  { label: 'Number Base', href: '/number-base', icon: '01' },
  { label: 'Cron Expression', href: '/cron-expression', icon: '⏰' },
  { section: 'Testers' },
  { label: 'Regex Tester', href: '/regex-tester', icon: '.*' },
  { section: '🇹🇷 Turkish' },
  { label: 'TCKN Generator', href: '/tckn-generator', icon: '#' },
  { label: 'VKN Generator', href: '/vkn-generator', icon: '#' },
  { label: 'IBAN Generator', href: '/tr-iban-generator', icon: 'TR' },
  { label: 'Credit Card No', href: '/credit-card-generator', icon: '▪' },
  { label: 'Fake Person Data', href: '/fake-person-data', icon: '◈' },
  { section: 'Education' },
  { label: 'SQL Playground', href: '/sql-playground', icon: '⌗' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav style={{
      width: 'var(--sidebar)', flexShrink: 0,
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
      padding: '8px 8px 16px'
    }}>
      {navItems.map((item, i) => {
        if ('section' in item && item.section) {
          return (
            <div key={i} style={{
              fontSize: '.62rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'var(--muted)', padding: '10px 10px 4px', marginTop: 4
            }}>{item.section}</div>
          )
        }
        const active = item.href === '/' ? pathname === '/' : pathname === item.href
        if (item.isHome) {
          return (
            <Link key={i} href="/" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: active ? '8px 8px 8px 8px' : '8px 10px',
                borderRadius: 7, cursor: 'pointer', fontSize: '.82rem', fontWeight: 500,
                color: active ? 'var(--teal2)' : 'var(--muted2)',
                border: active ? '2px solid var(--teal)' : 'none',
                background: active ? 'var(--teal-dim)' : 'transparent',
                textAlign: 'left', width: '100%', transition: 'all .12s', marginBottom: 4,
                borderLeft: active ? '2px solid var(--teal)' : 'none',
                paddingLeft: active ? 8 : 10,
              }}>🏠 Home</button>
            </Link>
          )
        }
        return (
          <Link key={i} href={item.href!} style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
              borderRadius: 7, cursor: 'pointer', transition: 'all .12s',
              fontSize: '.82rem', fontWeight: 500,
              color: active ? 'var(--teal2)' : 'var(--muted2)',
              border: 'none', background: active ? 'var(--teal-dim)' : 'transparent',
              textAlign: 'left', width: '100%',
              borderLeft: active ? '2px solid var(--teal)' : 'none',
              paddingLeft: active ? 8 : 10,
            }}>
              <span style={{ fontSize: 13, opacity: .7, flexShrink: 0, width: 16, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          </Link>
        )
      })}
    </nav>
  )
}
