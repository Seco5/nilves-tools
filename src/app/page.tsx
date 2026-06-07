import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Nilves — Developer Toolkit | 50+ Free Dev Tools',
  description: 'Every utility you need as a developer — formatters, generators, encoders, converters — in one fast, private, browser-based toolkit. No ads. No signup.',
}

const categories = [
  { title: 'Formatters', tools: [
    { icon: '{ }', name: 'JSON Formatter', desc: 'Format, validate and minify JSON', href: '/json-formatter' },
    { icon: '⇄', name: 'Diff Checker', desc: 'Compare two texts line by line', href: '/diff-checker' },
    { icon: '⊞', name: 'CSV ↔ JSON', desc: 'Convert between CSV and JSON', href: '/csv-json' },
    { icon: 'M↓', name: 'Markdown Preview', desc: 'Write and preview Markdown live', href: '/markdown-preview' },
  ]},
  { title: 'Generators', tools: [
    { icon: '⊡', name: 'UUID / NanoID', desc: 'Generate unique identifiers', href: '/uuid-generator' },
    { icon: '🔑', name: 'Password Generator', desc: 'Strong random passwords', href: '/password-generator' },
    { icon: '⊕', name: 'Hash Generator', desc: 'MD5, SHA-1, SHA-256, SHA-512', href: '/hash-generator' },
    { icon: '¶', name: 'Lorem Ipsum', desc: 'Placeholder text generator', href: '/lorem-ipsum' },
    { icon: '◉', name: 'Color Converter', desc: 'HEX, RGB, HSL conversions', href: '/color-converter' },
  ]},
  { title: 'Encoders', tools: [
    { icon: '64', name: 'Base64', desc: 'Encode and decode Base64', href: '/base64' },
    { icon: '🔗', name: 'URL Encode/Decode', desc: 'Encode or decode URL strings', href: '/url-encode-decode' },
    { icon: '🔐', name: 'JWT Decoder', desc: 'Inspect JWT header and payload', href: '/jwt-decoder' },
  ]},
  { title: 'Converters', tools: [
    { icon: '⏱', name: 'Timestamp', desc: 'Unix timestamp ↔ human date', href: '/timestamp' },
    { icon: '01', name: 'Number Base', desc: 'Binary, octal, decimal, hex', href: '/number-base' },
    { icon: '⏰', name: 'Cron Expression', desc: 'Explain cron schedules in plain English', href: '/cron-expression' },
  ]},
  { title: 'Testers', tools: [
    { icon: '.*', name: 'Regex Tester', desc: 'Test and debug regular expressions', href: '/regex-tester' },
  ]},
  { title: '🇹🇷 Turkish Tools', tools: [
    { icon: '#', name: 'TCKN Generator', desc: 'Valid Turkish national ID numbers', href: '/tckn-generator', badge: 'TR' },
    { icon: '#', name: 'VKN Generator', desc: 'Turkish tax identification numbers', href: '/vkn-generator', badge: 'TR' },
    { icon: 'TR', name: 'TR IBAN Generator', desc: 'Valid Turkish IBAN numbers', href: '/tr-iban-generator', badge: 'TR' },
    { icon: '▪', name: 'Credit Card No', desc: 'Visa, MC, Amex, Troy — Luhn valid', href: '/credit-card-generator', badge: 'TR' },
    { icon: '◈', name: 'Fake Person Data', desc: 'Turkish fake identity for testing', href: '/fake-person-data', badge: 'TR' },
  ]},
  { title: 'Education', tools: [
    { icon: '⌗', name: 'SQL Playground', desc: 'Learn SQL with live examples', href: '/sql-playground' },
  ]},
]

export default function Home() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 3rem 4rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <div className="hero-eyebrow">All-in-one developer toolkit</div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.04em', color: 'var(--text)', marginBottom: '1rem' }}>
          Stop googling<br />the same <span style={{ color: 'var(--teal2)' }}>tools</span> twice.
        </h1>
        <p style={{ fontSize: '.95rem', color: 'var(--muted2)', lineHeight: 1.7, maxWidth: 560, marginBottom: '2rem' }}>
          Every utility you need as a developer — formatters, generators, encoders, converters — in one fast, private, browser-based toolkit. No ads. No signup. No nonsense.
        </p>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
          {[['50+', 'Tools'], ['0', 'Signups needed'], ['100%', 'Browser-based']].map(([num, label]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-.03em' }}>{num}</span>
              <span style={{ fontSize: '.75rem', color: 'var(--muted)', letterSpacing: '.02em' }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/json-formatter">
            <button style={{ padding: '9px 20px', borderRadius: 8, background: 'var(--teal)', color: '#fff', border: 'none', fontFamily: 'var(--sans)', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer' }}>
              Start with JSON →
            </button>
          </Link>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {categories.map(cat => (
          <div key={cat.title}>
            <div style={{ fontFamily: 'var(--display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              {cat.title}
              <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {cat.tools.map((tool) => (
                <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
                  <div className="tool-card">
                    <div className="tool-card-icon">{tool.icon}</div>
                    <div className="tool-card-name">
                      {tool.name}
                      {'badge' in tool && tool.badge && <span className="tool-badge badge-tr" style={{ marginLeft: 5 }}>{tool.badge}</span>}
                    </div>
                    <div className="tool-card-desc">{tool.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
