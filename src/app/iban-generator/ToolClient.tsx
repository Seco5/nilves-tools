'use client'

import { useState, useMemo, type CSSProperties } from 'react'
import Link from 'next/link'
import {
  Copy, Check, RefreshCw, Landmark, ShieldCheck, Info, Globe, AlertTriangle, Plus,
} from 'lucide-react'
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
const randInt = (n: number) => Math.floor(Math.random() * n)
const randomDigits = (n: number) => Array.from({ length: n }, () => randInt(10)).join('')
const randomLetters = (n: number) => Array.from({ length: n }, () => ALPHA[randInt(26)]).join('')
function mod97(numeric: string): number {
  let r = 0
  for (const ch of numeric) r = (r * 10 + (ch.charCodeAt(0) - 48)) % 97
  return r
}
const toNumeric = (s: string) => s.split('').map((c) => (/[A-Z]/.test(c) ? (c.charCodeAt(0) - 55).toString() : c)).join('')
function calcCheckDigits(countryCode: string, bban: string): string {
  return String(98 - mod97(toNumeric(bban + countryCode + '00'))).padStart(2, '0')
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
const formatSpaced = (iban: string) => iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()

// ── i18n ──────────────────────────────────────────────────────────────────────
const T = {
  tr: {
    badge: '🌍 ULUSLARARASI',
    title: 'IBAN Üretici & Doğrulayıcı',
    subtitle: '20+ ülke için geçerli IBAN numarası üretin ve doğrulayın. Yalnızca test amaçlıdır.',
    genTitle: 'IBAN Üret', searchCountry: 'Ülke Ara', searchPh: 'Turkey, Germany, FR...',
    country: 'Ülke', format: 'Biçim', generate: 'Üret', copy: 'Kopyala', copied: 'Kopyalandı!',
    noIban: 'Bu ülke IBAN kullanmaz',
    valTitle: 'IBAN Doğrula', valPh: "Herhangi bir ülke IBAN'ı yapıştırın...",
    valid: 'Geçerli', invalid: 'Geçersiz',
    errCountry: 'Ülke kodu tanınmıyor', errLength: (c: string, n: number) => `Uzunluk hatalı — ${c} IBAN ${n} karakter olmalı`,
    errCheck: 'Kontrol hanesi doğrulaması başarısız',
    structTitle: 'IBAN Yapısı', segCountry: 'Ülke', segCheck: 'Kontrol', segBban: 'BBAN',
    totalLen: 'Toplam uzunluk', totalLenVal: 'Ülkeye göre 15–34 karakter', sepa: 'SEPA', sepaVal: 'Türkiye üye değil',
    emptyState: 'Ülke seçin ve Üret butonuna basın',
    rCountry: 'Ülke', rLength: 'Uzunluk', rCheck: 'Kontrol Hanesi', rBban: 'BBAN', rSepa: 'SEPA Üyesi', rFormat: 'Format',
    chars: 'karakter', yes: 'Evet', no: 'Hayır',
    cards: [
      { title: '20+ Ülke Desteği', desc: 'Türkiye, Almanya, İngiltere, Fransa ve daha fazlası.' },
      { title: 'mod97 Doğrulama', desc: 'Uluslararası IBAN standardına uygun kontrol algoritması.' },
      { title: 'Yalnızca Test Amaçlı', desc: 'Gerçek banka hesaplarına ait değildir, finansal işlemlerde kullanılamaz.' },
    ],
    faqTitle: 'Sık Sorulan Sorular',
    faq: [
      { q: 'IBAN nedir?', a: "IBAN (International Bank Account Number), uluslararası para transferlerinde kullanılan standart banka hesap numarası formatıdır. Ülke kodu, kontrol hanesi ve BBAN'dan oluşur." },
      { q: 'Türkiye SEPA üyesi mi?', a: 'Hayır. Türkiye SEPA (Single Euro Payments Area) üyesi değildir. Ancak TR IBAN, SWIFT/BIC ile birlikte uluslararası havale işlemlerinde yaygın olarak kullanılır.' },
      { q: 'Üretilen IBAN gerçek bir hesaba ait olabilir mi?', a: "Teorik olarak mümkündür ancak son derece düşük bir ihtimaldir. Bu nedenle üretilen IBAN'ları yalnızca test ortamlarında kullanmanızı öneririz." },
      { q: 'IBAN doğrulama nasıl çalışır?', a: "IBAN doğrulama mod97 algoritması kullanır. IBAN'ın ilk 4 karakteri sona alınır, harfler sayıya çevrilir ve büyük sayının 97'ye bölümünden kalan 1 ise IBAN geçerlidir." },
      { q: 'Bu araç ücretsiz mi?', a: 'Evet, tamamen ücretsizdir. Kayıt, üyelik veya ödeme gerekmez. Tüm araçlar tarayıcınızda çalışır ve hiçbir veriniz sunucularımıza gönderilmez.' },
    ],
    relatedTitle: 'İlgili Araçlar',
    related: [
      { name: 'TCKN Üretici', desc: 'TC Kimlik Numarası', href: '/tckn-generator' },
      { name: 'VKN Üretici', desc: 'Vergi Kimlik Numarası', href: '/vkn-generator' },
      { name: 'Kredi Kartı No', desc: 'Test kart numarası', href: '/credit-card-generator' },
    ],
  },
  en: {
    badge: '🌍 INTERNATIONAL',
    title: 'IBAN Generator & Validator',
    subtitle: 'Generate and validate IBAN numbers for 20+ countries. For testing purposes only.',
    genTitle: 'Generate IBAN', searchCountry: 'Search Country', searchPh: 'Turkey, Germany, FR...',
    country: 'Country', format: 'Format', generate: 'Generate', copy: 'Copy', copied: 'Copied!',
    noIban: 'This country does not use IBAN',
    valTitle: 'Validate IBAN', valPh: 'Paste any country IBAN...',
    valid: 'Valid', invalid: 'Invalid',
    errCountry: 'Unknown country code', errLength: (c: string, n: number) => `Wrong length — ${c} IBAN must be ${n} characters`,
    errCheck: 'Check-digit validation failed',
    structTitle: 'IBAN Structure', segCountry: 'Country', segCheck: 'Check', segBban: 'BBAN',
    totalLen: 'Total length', totalLenVal: '15–34 characters by country', sepa: 'SEPA', sepaVal: 'Turkey not a member',
    emptyState: 'Select a country and press Generate',
    rCountry: 'Country', rLength: 'Length', rCheck: 'Check Digits', rBban: 'BBAN', rSepa: 'SEPA Member', rFormat: 'Format',
    chars: 'characters', yes: 'Yes', no: 'No',
    cards: [
      { title: '20+ Country Support', desc: 'Turkey, Germany, UK, France and many more.' },
      { title: 'mod97 Validation', desc: 'Check algorithm compliant with international IBAN standard.' },
      { title: 'Testing Only', desc: 'Not linked to real bank accounts, cannot be used in financial transactions.' },
    ],
    faqTitle: 'Frequently Asked Questions',
    faq: [
      { q: 'What is IBAN?', a: 'IBAN (International Bank Account Number) is a standard bank account number format used in international money transfers. It consists of a country code, check digits and BBAN.' },
      { q: 'Is Turkey a SEPA member?', a: 'No. Turkey is not a SEPA member. However, TR IBAN is widely used in international wire transfers together with SWIFT/BIC codes.' },
      { q: 'Can a generated IBAN belong to a real account?', a: 'Theoretically possible but extremely unlikely. We recommend using generated IBANs only in test environments.' },
      { q: 'How does IBAN validation work?', a: 'IBAN validation uses the mod97 algorithm. The first 4 characters of the IBAN are moved to the end, letters are converted to numbers, and if the remainder when divided by 97 equals 1, the IBAN is valid.' },
      { q: 'Is this tool free?', a: 'Yes, completely free. No registration, membership or payment required. All tools run in your browser and none of your data is sent to our servers.' },
    ],
    relatedTitle: 'Related Tools',
    related: [
      { name: 'TCKN Generator', desc: 'Turkish National ID', href: '/tckn-generator' },
      { name: 'VKN Generator', desc: 'Tax ID Number', href: '/vkn-generator' },
      { name: 'Credit Card No', desc: 'Test card number', href: '/credit-card-generator' },
    ],
  },
} as const

const CARD_ICONS = [Globe, Check, AlertTriangle]

const sectionTitle: CSSProperties = {
  fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: '.875rem',
  paddingBottom: '.5rem', borderBottom: '0.5px solid var(--border)',
}
const cardLabel: CSSProperties = {
  fontSize: 13, fontWeight: 500, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text)',
}
const fieldLabel: CSSProperties = {
  fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em',
  color: 'var(--muted)', marginBottom: 5, display: 'block',
}
const inputStyle: CSSProperties = {
  width: '100%', padding: '8px 11px', borderRadius: 8, border: '0.5px solid var(--border)',
  background: 'var(--surface2)', color: 'var(--text)', fontSize: 13,
}
const SEG = [
  { bg: 'rgba(29,158,117,.16)', fg: 'var(--teal)' },
  { bg: 'rgba(96,165,250,.16)', fg: 'var(--blue)' },
  { bg: 'rgba(251,191,36,.16)', fg: 'var(--yellow)' },
  { bg: 'rgba(244,114,182,.16)', fg: '#e25fa6' },
]

function Segment({ value, label, idx }: { value: string; label: string; idx: number }) {
  const s = SEG[idx]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 4px', flex: 1, background: s.bg }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: s.fg, wordBreak: 'break-all', textAlign: 'center' }}>{value}</span>
      <span style={{ fontSize: 9, marginTop: 2, opacity: 0.7, color: 'var(--muted2)' }}>{label}</span>
    </div>
  )
}

// ── FAQ item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a, last }: { q: string; a: string; last: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: last ? 'none' : '0.5px solid var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
          padding: '12px 0', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text)',
          background: 'none', border: 'none', textAlign: 'left',
        }}
      >
        <span>{q}</span>
        <Plus size={16} style={{ flexShrink: 0, marginLeft: 16, color: open ? 'var(--teal)' : 'var(--muted)', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s, color .2s' }} />
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .25s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7, paddingBottom: 12 }}>{a}</p>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function IbanGeneratorClient() {
  const { lang } = useLanguage()
  const t = T[lang === 'en' ? 'en' : 'tr']

  const [search, setSearch] = useState('')
  const [code, setCode] = useState('TR')
  const [spaced, setSpaced] = useState(true)
  const [iban, setIban] = useState('')
  const [valInput, setValInput] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const selected = byCode(code)!
  const usesIban = selected.len > 0

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return COUNTRIES.filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
  }, [search])

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500)
  }
  const generate = () => { if (usesIban) setIban(genIBAN(selected)) }
  const fmt = (s: string) => (spaced ? formatSpaced(s) : s.replace(/\s/g, ''))

  const val = useMemo(() => {
    const cleaned = valInput.replace(/\s/g, '').toUpperCase()
    if (!cleaned) return null
    const c = byCode(cleaned.slice(0, 2))
    if (!c || c.len === 0) return { ok: false as const, err: t.errCountry }
    if (cleaned.length !== c.len) return { ok: false as const, err: t.errLength(c.code, c.len) }
    if (mod97(toNumeric(cleaned.slice(4) + cleaned.slice(0, 4))) !== 1) return { ok: false as const, err: t.errCheck }
    return { ok: true as const, country: c, check: cleaned.slice(2, 4), bban: cleaned.slice(4) }
  }, [valInput, t])

  const onValChange = (raw: string) => setValInput(formatSpaced(raw.replace(/[^0-9a-zA-Z]/g, '').toUpperCase().slice(0, 34)))

  const half = iban ? 4 + Math.ceil((iban.length - 4) / 2) : 0

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* HERO */}
      <section style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ display: 'inline-flex', background: 'var(--teal-dim)', color: 'var(--teal)', fontSize: 11, padding: '3px 12px', borderRadius: 20, letterSpacing: '.04em', fontWeight: 500 }}>
          {t.badge}
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 500, margin: '.75rem 0 .5rem', color: 'var(--text)' }}>{t.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted2)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>{t.subtitle}</p>
      </section>

      {/* MAIN — two columns */}
      <div className="iban-grid" style={{ marginBottom: '1.5rem' }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* CARD 1 — Generator */}
          <section style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
            <div style={cardLabel}><Landmark size={16} style={{ color: 'var(--muted2)' }} /> {t.genTitle}</div>

            <label style={fieldLabel}>{t.searchCountry}</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPh} style={{ ...inputStyle, marginBottom: 10 }} />

            <label style={fieldLabel}>{t.country}</label>
            <select value={code} onChange={(e) => setCode(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }}>
              {filtered.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code}){c.len === 0 ? ' — ✕' : ''}</option>
              ))}
            </select>

            {/* Country info box */}
            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{selected.flag}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{selected.name}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>
                {usesIban ? `${selected.len} ${t.chars}` : '—'} · SEPA: {selected.sepa ? t.yes : t.no}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--teal)', background: 'var(--surface)', padding: '5px 8px', borderRadius: 5, marginTop: 6, wordBreak: 'break-all' }}>
                {selected.format}
              </div>
              {selected.example && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, wordBreak: 'break-all' }}>{selected.example}</div>}
            </div>

            {/* Format toggle */}
            <label style={fieldLabel}>{t.format}</label>
            <div style={{ display: 'flex', border: '0.5px solid var(--border)', borderRadius: 8, padding: 2, marginBottom: 12 }}>
              {[true, false].map((sp) => (
                <button key={String(sp)} onClick={() => setSpaced(sp)}
                  style={{ flex: 1, padding: '7px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'var(--mono)', background: spaced === sp ? 'var(--teal)' : 'transparent', color: spaced === sp ? '#fff' : 'var(--muted2)' }}>
                  {sp ? 'TR33 0006...' : 'TR330006...'}
                </button>
              ))}
            </div>

            <button onClick={generate} disabled={!usesIban}
              style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: usesIban ? 'pointer' : 'not-allowed', opacity: usesIban ? 1 : 0.4 }}>
              <RefreshCw size={14} /> {t.generate}
            </button>
            {!usesIban && <p style={{ fontSize: 11, color: 'var(--del-text)', textAlign: 'center', marginTop: 8 }}>{t.noIban}</p>}
          </section>

          {/* CARD 2 — Validator */}
          <section style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
            <div style={cardLabel}><ShieldCheck size={16} style={{ color: 'var(--muted2)' }} /> {t.valTitle}</div>
            <textarea value={valInput} onChange={(e) => onValChange(e.target.value)} placeholder={t.valPh} rows={2}
              style={{ width: '100%', resize: 'none', fontFamily: 'var(--mono)', fontSize: 12, padding: '9px 11px', borderRadius: 8, border: '0.5px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text)', letterSpacing: '.05em' }} />
            {val && (
              <div style={{ marginTop: 12 }}>
                {val.ok ? (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--teal-dim)', color: 'var(--teal)', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
                      <Check size={13} /> {t.valid} {val.country.flag} {val.country.name}
                    </span>
                    <div style={{ marginTop: 10 }}>
                      <table className="tckn-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <tbody>
                          <tr><td className="mono-cell">{t.rCheck}</td><td style={{ fontFamily: 'var(--mono)' }}>{val.check}</td></tr>
                          <tr><td className="mono-cell">{t.rBban}</td><td style={{ fontFamily: 'var(--mono)', fontSize: 11, wordBreak: 'break-all' }}>{val.bban}</td></tr>
                          <tr><td className="mono-cell">{t.rSepa}</td><td>{val.country.sepa ? t.yes : t.no}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--del-bg)', color: 'var(--del-text)', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>✗ {t.invalid}</span>
                    <p style={{ fontSize: 13, color: 'var(--del-text)', marginTop: 8 }}>{val.err}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* CARD 3 — Structure */}
          <section style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
            <div style={cardLabel}><Info size={16} style={{ color: 'var(--muted2)' }} /> {t.structTitle}</div>
            <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden' }}>
              <Segment value="TR" label={t.segCountry} idx={0} />
              <Segment value="XX" label={t.segCheck} idx={1} />
              <Segment value="BBAN..." label={t.segBban} idx={2} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)' }}>{t.totalLen}</div>
                <div style={{ fontSize: 11, color: 'var(--muted2)' }}>{t.totalLenVal}</div>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)' }}>{t.sepa}</div>
                <div style={{ fontSize: 11, color: 'var(--muted2)' }}>{t.sepaVal}</div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT — result */}
        <section style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: iban ? '1.5rem' : 0 }}>
          {!iban ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Landmark size={48} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px', color: 'var(--text)' }} />
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{t.emptyState}</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 500, color: 'var(--teal)', letterSpacing: '.08em', wordBreak: 'break-all' }}>{fmt(iban)}</span>
                <button onClick={() => copy(fmt(iban), 'main')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '0.5px solid var(--border2)', borderRadius: 8, padding: '6px 14px', background: 'transparent', fontSize: 12, cursor: 'pointer', color: copiedKey === 'main' ? 'var(--teal)' : 'var(--muted2)' }}>
                  {copiedKey === 'main' ? <Check size={14} /> : <Copy size={14} />} {copiedKey === 'main' ? t.copied : t.copy}
                </button>
              </div>

              <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', marginBottom: 14 }}>
                <Segment value={iban.slice(0, 2)} label={t.segCountry} idx={0} />
                <Segment value={iban.slice(2, 4)} label={t.segCheck} idx={1} />
                <Segment value={iban.slice(4, half)} label="BBAN ¹" idx={2} />
                <Segment value={iban.slice(half)} label="BBAN ²" idx={3} />
              </div>

              <table className="tckn-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <tbody>
                  <tr><td className="mono-cell">{t.rCountry}</td><td style={{ color: 'var(--teal)' }}>{selected.flag} {selected.name}</td></tr>
                  <tr><td className="mono-cell">{t.rLength}</td><td>{iban.length} {t.chars}</td></tr>
                  <tr><td className="mono-cell">{t.rCheck}</td><td style={{ fontFamily: 'var(--mono)' }}>{iban.slice(2, 4)}</td></tr>
                  <tr><td className="mono-cell">{t.rBban}</td><td style={{ fontFamily: 'var(--mono)', fontSize: 11, wordBreak: 'break-all' }}>{iban.slice(4)}</td></tr>
                  <tr><td className="mono-cell">{t.rSepa}</td><td style={{ color: selected.sepa ? 'var(--teal)' : 'var(--muted)' }}>{selected.sepa ? t.yes : t.no}</td></tr>
                  <tr><td className="mono-cell">{t.rFormat}</td><td style={{ fontFamily: 'var(--mono)', fontSize: 11, wordBreak: 'break-all' }}>{selected.format}</td></tr>
                </tbody>
              </table>
            </>
          )}
        </section>
      </div>

      {/* INFO CARDS */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
        {t.cards.map((c, i) => {
          const Icon = CARD_ICONS[i]
          return (
            <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '1rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '.625rem' }}>
                <Icon size={16} style={{ color: 'var(--teal)' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          )
        })}
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={sectionTitle}>{t.faqTitle}</h2>
        {t.faq.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} last={i === t.faq.length - 1} />
        ))}
      </section>

      {/* RELATED */}
      <section>
        <h2 style={sectionTitle}>{t.relatedTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {t.related.map((r) => (
            <Link key={r.href} href={r.href} className="tckn-related-card">
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{r.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
