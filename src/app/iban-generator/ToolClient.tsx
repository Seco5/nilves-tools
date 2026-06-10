'use client'

import { useState, useCallback, useMemo } from 'react'
import { Copy, RefreshCw, CheckCircle2, Landmark } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// ── Ülke verisi ───────────────────────────────────────────────────────────────
type Country = { code: string; name: string; flag: string; len: number; sepa: boolean; format: string; example: string }
const COUNTRIES: Country[] = [
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', len: 26, sepa: false, format: 'TRkk bbbbb 0aaa aaaa aaaa aaaa aa', example: 'TR33 0006 1005 1978 6457 8413 26' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', len: 22, sepa: true, format: 'DEkk bbbb bbbb cccc cccc cc', example: 'DE89 3704 0044 0532 0130 00' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', len: 22, sepa: true, format: 'GBkk BBBB ssss sscc cccc cc', example: 'GB29 NWBK 6016 1331 9268 19' },
  { code: 'FR', name: 'France', flag: '🇫🇷', len: 27, sepa: true, format: 'FRkk bbbb bsss sscc cccc cccc cxx', example: 'FR76 3000 6000 0112 3456 7890 189' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', len: 18, sepa: true, format: 'NLkk BBBB cccc cccc cc', example: 'NL91 ABNA 0417 1643 00' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', len: 24, sepa: true, format: 'ESkk bbbb ssss xxcc cccc cccc', example: 'ES91 2100 0418 4502 0005 1332' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', len: 27, sepa: true, format: 'ITkk xbbb bbss sssc cccc cccc ccc', example: 'IT60 X054 2811 1010 0000 0123 456' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', len: 21, sepa: true, format: 'CHkk bbbb bccc cccc cccc c', example: 'CH93 0076 2011 6238 5295 7' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', len: 20, sepa: true, format: 'ATkk bbbb bccc cccc cccc', example: 'AT61 1904 3002 3457 3201' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', len: 16, sepa: true, format: 'BEkk bbbc cccc ccxx', example: 'BE71 0961 2345 6769' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', len: 28, sepa: true, format: 'PLkk bbbs sssx cccc cccc cccc cccc', example: 'PL61 1090 1014 0000 0712 1981 2874' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', len: 24, sepa: true, format: 'SEkk bbbc cccc cccc cccc cccx', example: 'SE45 5000 0000 0583 9825 7466' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', len: 15, sepa: true, format: 'NOkk bbbb cccc ccx', example: 'NO93 8601 1117 947' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', len: 18, sepa: true, format: 'DKkk bbbb cccc cccc cx', example: 'DK50 0040 0440 1162 43' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', len: 25, sepa: true, format: 'PTkk bbbb ssss cccc cccc cccxx', example: 'PT50 0002 0123 1234 5678 901 54' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', len: 27, sepa: true, format: 'GRkk bbbs sssc cccc cccc cccc ccc', example: 'GR16 0110 1250 0000 0001 2300 695' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', len: 23, sepa: false, format: 'AEkk bbbc cccc cccc cccc ccc', example: 'AE07 0331 2345 6789 0123 456' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', len: 24, sepa: false, format: 'SAkk bbcc cccc cccc cccc cccc', example: 'SA03 8000 0000 6080 1016 7519' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', len: 24, sepa: false, format: 'PKkk BBBB cccc cccc cccc cccc', example: 'PK36 SCBL 0000 0011 2345 6702' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', len: 0, sepa: false, format: 'Avustralya IBAN kullanmaz', example: '' },
  { code: 'US', name: 'United States', flag: '🇺🇸', len: 0, sepa: false, format: 'ABD IBAN kullanmaz', example: '' },
]
const byCode = (c: string) => COUNTRIES.find((x) => x.code === c)

// ── IBAN üretimi / doğrulaması ────────────────────────────────────────────────
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
function randInt(n: number) { return Math.floor(Math.random() * n) }
function randomDigits(n: number) { return Array.from({ length: n }, () => randInt(10)).join('') }
function randomLetters(n: number) { return Array.from({ length: n }, () => ALPHA[randInt(26)]).join('') }
function mod97(numeric: string): number {
  let r = 0
  for (const ch of numeric) r = (r * 10 + (ch.charCodeAt(0) - 48)) % 97
  return r
}
function toNumeric(s: string): string {
  return s.split('').map((c) => (/[A-Z]/.test(c) ? (c.charCodeAt(0) - 55).toString() : c)).join('')
}
function calcCheckDigits(countryCode: string, bban: string): string {
  const rem = mod97(toNumeric(bban + countryCode + '00'))
  return String(98 - rem).padStart(2, '0')
}
function genBBAN(country: Country): string {
  const len = country.len - 4
  if (country.code === 'GB') return randomLetters(4) + randomDigits(len - 4)
  return randomDigits(len)
}
function genIBAN(country: Country): string {
  const bban = genBBAN(country)
  return country.code + calcCheckDigits(country.code, bban) + bban
}
function formatSpaced(iban: string): string {
  return iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
}

// ── Copy Hook ─────────────────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }, [])
  return { copied, copy }
}

// ── i18n ──────────────────────────────────────────────────────────────────────
const T = {
  tr: {
    badge: '🌍 Uluslararası Araçlar',
    title: 'IBAN Üretici & Doğrulayıcı',
    subtitle: '20+ ülke için geçerli formatta IBAN üretin ve doğrulayın. Yalnızca test amaçlıdır.',
    genTitle: 'IBAN Üret',
    searchCountry: 'Ülke Ara',
    selectCountry: 'Ülke Seç',
    searchPh: 'Ülke adı veya kodu…',
    format: 'Biçim',
    generate: 'Üret',
    copy: 'Kopyala',
    copied: 'Kopyalandı',
    noIban: 'Bu ülke IBAN kullanmaz',
    valTitle: 'IBAN Doğrula',
    valPh: "Herhangi bir ülke IBAN'ı yapıştırın…",
    valid: 'Geçerli',
    invalid: 'Geçersiz',
    errCountry: 'Ülke kodu tanınmıyor',
    errLength: (c: string, n: number) => `Uzunluk hatalı — ${c} IBAN ${n} karakter olmalı`,
    errCheck: 'Kontrol hanesi doğrulaması başarısız',
    infoTitle: 'Ülke Bilgisi',
    country: 'Ülke',
    length: 'Uzunluk',
    checkDigits: 'Kontrol Hanesi',
    bban: 'BBAN',
    sepaMember: 'SEPA Üyesi',
    yes: 'Evet',
    no: 'Hayır',
    formatPattern: 'Format',
    example: 'Örnek',
    chars: 'karakter',
    emptyState: 'Ülke seç ve Üret butonuna bas',
  },
  en: {
    badge: '🌍 International Tools',
    title: 'IBAN Generator & Validator',
    subtitle: 'Generate and validate valid-format IBANs for 20+ countries. For testing only.',
    genTitle: 'Generate IBAN',
    searchCountry: 'Search Country',
    selectCountry: 'Select Country',
    searchPh: 'Country name or code…',
    format: 'Format',
    generate: 'Generate',
    copy: 'Copy',
    copied: 'Copied',
    noIban: 'This country does not use IBAN',
    valTitle: 'Validate IBAN',
    valPh: 'Paste an IBAN from any country…',
    valid: 'Valid',
    invalid: 'Invalid',
    errCountry: 'Unknown country code',
    errLength: (c: string, n: number) => `Wrong length — ${c} IBAN must be ${n} characters`,
    errCheck: 'Check-digit validation failed',
    infoTitle: 'Country Info',
    country: 'Country',
    length: 'Length',
    checkDigits: 'Check Digits',
    bban: 'BBAN',
    sepaMember: 'SEPA Member',
    yes: 'Yes',
    no: 'No',
    formatPattern: 'Format',
    example: 'Example',
    chars: 'characters',
    emptyState: 'Select a country and press Generate',
  },
} as const

// ── Detail row ─────────────────────────────────────────────────────────────────
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] py-2.5 last:border-0">
      <span className="shrink-0 text-xs text-[var(--muted2)]">{label}</span>
      <span className="text-right text-sm text-[var(--text)]">{children}</span>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function IbanToolClient() {
  const { lang } = useLanguage()
  const t = T[lang === 'en' ? 'en' : 'tr']
  const { copied, copy } = useCopy()

  const [search, setSearch] = useState('')
  const [code, setCode] = useState('TR')
  const [spaced, setSpaced] = useState(true)
  const [iban, setIban] = useState('')
  const [valInput, setValInput] = useState('')

  const selected = byCode(code)!
  const usesIban = selected.len > 0

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return COUNTRIES.filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
  }, [search])

  const generate = () => {
    if (!usesIban) return
    setIban(genIBAN(selected))
  }
  const fmt = (s: string) => (spaced ? formatSpaced(s) : s.replace(/\s/g, ''))

  // ── Validator (real-time) ──
  const val = useMemo(() => {
    const cleaned = valInput.replace(/\s/g, '').toUpperCase()
    if (!cleaned) return null
    const c = byCode(cleaned.slice(0, 2))
    if (!c || c.len === 0) return { ok: false as const, err: t.errCountry }
    if (cleaned.length !== c.len) return { ok: false as const, err: t.errLength(c.code, c.len) }
    const rearr = cleaned.slice(4) + cleaned.slice(0, 4)
    if (mod97(toNumeric(rearr)) !== 1) return { ok: false as const, err: t.errCheck }
    return { ok: true as const, country: c, check: cleaned.slice(2, 4), bban: cleaned.slice(4) }
  }, [valInput, t])

  const onValChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9a-zA-Z]/g, '').toUpperCase().slice(0, 34)
    setValInput(formatSpaced(cleaned))
  }

  // ── Right panel colored segments ──
  const half = iban ? 4 + Math.ceil((iban.length - 4) / 2) : 0
  const parts = iban
    ? [
        { v: iban.slice(0, 2), label: t.country, bg: 'rgba(29,158,117,.22)', fg: 'var(--teal)' },
        { v: iban.slice(2, 4), label: t.checkDigits, bg: 'rgba(96,165,250,.20)', fg: 'var(--blue)' },
        { v: iban.slice(4, half), label: 'BBAN ¹', bg: 'rgba(251,191,36,.18)', fg: 'var(--yellow)' },
        { v: iban.slice(half), label: 'BBAN ²', bg: 'rgba(244,114,182,.18)', fg: '#f472b6' },
      ]
    : []

  return (
    <main className="mx-auto max-w-6xl space-y-16 px-6 py-16 md:px-10">
      {/* Hero */}
      <section className="space-y-4 text-center">
        <span className="inline-block rounded-full bg-[var(--teal-dim)] px-3 py-1 text-xs font-medium uppercase tracking-widest text-[var(--teal)]">
          {t.badge}
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text)]">{t.title}</h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-[var(--muted2)]">{t.subtitle}</p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* SOL PANEL */}
        <div className="space-y-6">
          {/* CARD 1 — Generator */}
          <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-base font-bold text-[var(--text)]">{t.genTitle}</h2>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{t.searchCountry}</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPh}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[#16a34a] focus:outline-none"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{t.selectCountry}</span>
              <select
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[#16a34a] focus:outline-none"
              >
                {filtered.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.code}){c.len === 0 ? ' — ✕' : ''}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-1.5">
              <span className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{t.format}</span>
              <div className="inline-flex w-full rounded-xl border border-[var(--border)] p-0.5">
                <button
                  onClick={() => setSpaced(true)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${spaced ? 'bg-[#16a34a] text-white' : 'text-[var(--muted2)]'}`}
                >
                  TR33 0006…
                </button>
                <button
                  onClick={() => setSpaced(false)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${!spaced ? 'bg-[#16a34a] text-white' : 'text-[var(--muted2)]'}`}
                >
                  TR330006…
                </button>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={!usesIban}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] px-7 py-3 text-[15px] font-semibold text-white transition-all duration-150 hover:bg-[#15803d] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw size={16} />
              {t.generate}
            </button>
            {!usesIban && <p className="text-center text-xs text-[var(--del-text)]">{t.noIban}</p>}
          </section>

          {/* CARD 2 — Validator */}
          <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-base font-bold text-[var(--text)]">{t.valTitle}</h2>
            <textarea
              value={valInput}
              onChange={(e) => onValChange(e.target.value)}
              placeholder={t.valPh}
              rows={2}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-4 py-3 font-mono text-sm tracking-wider text-[var(--text)] focus:border-[#16a34a] focus:outline-none"
            />
            {val && (
              <div className="space-y-3">
                {val.ok ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--teal-dim)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
                      <CheckCircle2 size={13} /> {t.valid}
                    </span>
                    <div className="rounded-xl border border-[var(--border)] px-4 py-1">
                      <Row label={t.country}>{val.country.flag} {val.country.name}</Row>
                      <Row label={t.checkDigits}><span className="font-mono">{val.check}</span></Row>
                      <Row label={t.bban}><span className="break-all font-mono text-xs">{val.bban}</span></Row>
                      <Row label={t.sepaMember}>{val.country.sepa ? t.yes : t.no}</Row>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--del-bg)] px-3 py-1 text-xs font-semibold text-[var(--del-text)]">
                      ✗ {t.invalid}
                    </span>
                    <p className="text-sm text-[var(--del-text)]">{val.err}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* CARD 3 — Country info */}
          <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{selected.flag}</span>
              <div>
                <p className="text-base font-bold text-[var(--text)]">{selected.name}</p>
                <p className="text-xs text-[var(--muted)]">{selected.code}</p>
              </div>
            </div>
            <div className="px-1">
              <Row label={t.length}>{usesIban ? `${selected.len} ${t.chars}` : '—'}</Row>
              <Row label={t.sepaMember}>{selected.sepa ? t.yes : t.no}</Row>
              <Row label={t.formatPattern}><span className="break-all font-mono text-xs">{selected.format}</span></Row>
              {selected.example && <Row label={t.example}><span className="break-all font-mono text-xs">{selected.example}</span></Row>}
            </div>
          </section>
        </div>

        {/* SAĞ PANEL — tek IBAN sonucu */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          {!iban ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 text-center">
              <Landmark size={40} className="text-[var(--border2)]" />
              <p className="text-sm text-[var(--muted)]">{t.emptyState}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* IBAN + copy */}
              <div className="flex items-start justify-between gap-3">
                <p className="break-all font-mono text-2xl font-bold tracking-wider text-[#22c55e] sm:text-3xl">{fmt(iban)}</p>
                <button
                  onClick={() => copy(fmt(iban), 'main')}
                  className="shrink-0 rounded-lg border border-[var(--border2)] p-2.5 text-[var(--muted2)] transition-all hover:border-[#16a34a] hover:text-[#16a34a]"
                  title={t.copy}
                >
                  {copied === 'main' ? <CheckCircle2 size={16} className="text-[#16a34a]" /> : <Copy size={16} />}
                </button>
              </div>

              {/* Renkli segment çubuğu */}
              <div className="flex flex-wrap gap-2">
                {parts.map((p, i) => (
                  <div key={i} className="flex min-w-[64px] flex-1 flex-col items-center rounded-xl px-2 py-3" style={{ background: p.bg }}>
                    <span className="break-all text-center font-mono text-sm font-semibold" style={{ color: p.fg }}>{p.v}</span>
                    <span className="mt-1 text-[10px] uppercase tracking-wide text-[var(--muted2)]">{p.label}</span>
                  </div>
                ))}
              </div>

              {/* Detay tablosu */}
              <div className="rounded-xl border border-[var(--border)] px-4 py-1">
                <Row label={t.country}>{selected.flag} {selected.name}</Row>
                <Row label={t.length}>{iban.length} {t.chars}</Row>
                <Row label={t.checkDigits}><span className="font-mono">{iban.slice(2, 4)}</span></Row>
                <Row label={t.bban}><span className="break-all font-mono text-xs">{iban.slice(4)}</span></Row>
                <Row label={t.sepaMember}>{selected.sepa ? t.yes : t.no}</Row>
                <Row label={t.formatPattern}><span className="break-all font-mono text-xs">{selected.format}</span></Row>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
