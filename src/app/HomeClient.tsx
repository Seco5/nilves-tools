'use client'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { ToolIcon } from '@/lib/icons'

type Tool = { tkey: string; desc: string; href: string; badge?: string }
type Category = { tkey: string; flag?: string; tools: Tool[] }

const CATEGORIES: Category[] = [
  {
    tkey: 'nav.formatters',
    tools: [
      { tkey: 'tools.jsonFormatter',   desc: 'Format, validate and minify JSON',        href: '/json-formatter' },
      { tkey: 'tools.diffChecker',     desc: 'Compare two texts line by line',          href: '/diff-checker' },
      { tkey: 'tools.xmlFormatter',    desc: 'Format, validate and minify XML',         href: '/xml-formatter' },
      { tkey: 'tools.sqlFormatter',    desc: 'Format, validate and minify SQL',         href: '/sql-formatter' },
      { tkey: 'tools.csvJson',         desc: 'Convert between CSV and JSON',             href: '/csv-json' },
      { tkey: 'tools.markdownPreview', desc: 'Write and preview Markdown live',          href: '/markdown-preview' },
    ],
  },
  {
    tkey: 'nav.generators',
    tools: [
      { tkey: 'tools.uuidGenerator',     desc: 'Generate unique identifiers',            href: '/uuid-generator' },
      { tkey: 'tools.passwordGenerator', desc: 'Strong random passwords',                href: '/password-generator' },
      { tkey: 'tools.hashGenerator',     desc: 'MD5, SHA-1, SHA-256, SHA-512',           href: '/hash-generator' },
      { tkey: 'tools.loremIpsum',        desc: 'Placeholder text generator',             href: '/lorem-ipsum' },
      { tkey: 'tools.colorConverter',    desc: 'HEX, RGB, HSL conversions',              href: '/color-converter' },
      { tkey: 'tools.barcodeQr',         desc: 'QR codes, EAN-13, Code128 — bulk + ZIP', href: '/barcode-qr' },
    ],
  },
  {
    tkey: 'nav.encoders',
    tools: [
      { tkey: 'tools.base64',          desc: 'Encode and decode Base64',                href: '/base64' },
      { tkey: 'tools.urlEncodeDecode', desc: 'Encode or decode URL strings',             href: '/url-encode-decode' },
      { tkey: 'tools.jwtDecoder',      desc: 'Inspect JWT header and payload',           href: '/jwt-decoder' },
    ],
  },
  {
    tkey: 'nav.converters',
    tools: [
      { tkey: 'tools.timestamp',       desc: 'Unix timestamp ↔ human date',             href: '/timestamp' },
      { tkey: 'tools.numberBase',      desc: 'Binary, octal, decimal, hex',             href: '/number-base' },
      { tkey: 'tools.cronExpression',  desc: 'Explain cron schedules in plain English',  href: '/cron-expression' },
    ],
  },
  {
    tkey: 'nav.testers',
    tools: [
      { tkey: 'tools.regexTester',     desc: 'Test and debug regular expressions',      href: '/regex-tester' },
      { tkey: 'tools.imageDiff',       desc: 'Compare two images, find differences',    href: '/image-diff' },
    ],
  },
  {
    tkey: 'nav.turkish', flag: '🇹🇷',
    tools: [
      { tkey: 'tools.tcknGenerator', desc: 'Valid Turkish national ID numbers',     href: '/tckn-generator',        badge: 'TR' },
      { tkey: 'tools.vknGenerator',  desc: 'Turkish tax identification numbers',    href: '/vkn-generator',         badge: 'TR' },
      { tkey: 'tools.ibanGenerator', desc: 'Generate & validate IBANs, 20+ countries', href: '/iban-generator',     badge: 'TR' },
      { tkey: 'tools.creditCard',    desc: 'Visa, MC, Amex, Troy — Luhn valid',     href: '/credit-card-generator', badge: 'TR' },
    ],
  },
  {
    tkey: 'nav.productivity',
    tools: [
      { tkey: 'tools.projectPlanner', desc: 'Build roadmaps, track dependencies, export to Excel', href: '/project-planner' },
    ],
  },
  {
    tkey: 'nav.education',
    tools: [
      { tkey: 'tools.sqlPlayground',  desc: 'Learn SQL with live examples',          href: '/sql-playground' },
    ],
  },
  {
    tkey: 'nav.database',
    tools: [
      { tkey: 'tools.mongoQueryBuilder', desc: 'Build filters and pipelines, get code', href: '/mongo-query-builder' },
    ],
  },
]

export default function HomeClient() {
  const { t } = useLanguage()

  return (
    <div className="home-wrap">
      {/* ── Hero ── */}
      <section aria-label="Hero" style={{ marginBottom: '3rem' }}>
        <div className="hero-eyebrow">{t('home.eyebrow')}</div>

        <h1 className="hero-title">
          {t('home.title1')}<br />
          <span className="hl">{t('home.title2')}</span>
        </h1>

        <p className="hero-desc">{t('home.description')}</p>

        <div className="hero-stats">
          {(
            [
              [t('home.stats.toolsNum'),   t('home.stats.tools')],
              [t('home.stats.browserNum'), t('home.stats.browserBased')],
              [t('home.stats.trackingNum'), t('home.stats.tracking')],
            ] as const
          ).map(([num, label]) => (
            <div key={label} className="stat">
              <span className="stat-num">{num}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="hero-btns">
          <Link href="/json-formatter" className="btn-primary-lg">
            {t('home.startBtn')}
          </Link>
          <a href="#tools" className="btn-secondary-lg">
            {t('home.browseBtn')}
          </a>
        </div>
      </section>

      {/* ── Tool catalogue ── */}
      <section id="tools" className="home-categories" aria-label="All tools">
        {CATEGORIES.map((cat) => (
          <div key={cat.tkey}>
            <h2 className="cat-title">{cat.flag ? `${cat.flag} ` : ''}{t(cat.tkey)}</h2>

            <div className="tool-grid">
              {cat.tools.map((tool) => (
                <Link key={tool.href} href={tool.href} className="tool-card">
                  <div className="tool-card-icon" aria-hidden="true">
                    <ToolIcon href={tool.href} size={22} />
                  </div>
                  <div className="tool-card-name">
                    {t(tool.tkey)}
                    {tool.badge && (
                      <span className="tool-badge badge-tr" style={{ marginLeft: 5 }}>
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <div className="tool-card-desc">{tool.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
