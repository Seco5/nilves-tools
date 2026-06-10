'use client'

import { useState, useCallback, useMemo } from 'react'
import { Copy, RefreshCw, CheckCircle2, Building2, Info, AlertTriangle, Globe } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// ── Türk banka kodları ────────────────────────────────────────────────────────
type Bank = { code: string; name: string }
const TURKISH_BANKS: Bank[] = [
  { code: '00061', name: 'Ziraat Bankası' },
  { code: '00062', name: 'Halk Bankası' },
  { code: '00064', name: 'İş Bankası' },
  { code: '00067', name: 'Yapı Kredi Bankası' },
  { code: '00046', name: 'Akbank' },
  { code: '00032', name: 'Garanti BBVA' },
  { code: '00015', name: 'Vakıfbank' },
  { code: '00059', name: 'Şekerbank' },
  { code: '00111', name: 'Finansbank (QNB)' },
  { code: '00134', name: 'Denizbank' },
  { code: '00099', name: 'ING Bank' },
  { code: '00123', name: 'HSBC Turkey' },
  { code: '00203', name: 'Türkiye Finans' },
  { code: '00205', name: 'Kuveyt Türk' },
  { code: '00206', name: 'Albaraka Türk' },
]
const bankName = (code: string) => TURKISH_BANKS.find((b) => b.code === code)?.name ?? '—'

// ── IBAN üretimi / doğrulaması ────────────────────────────────────────────────
function mod97(numeric: string): bigint {
  let remainder = 0n
  for (const ch of numeric) remainder = (remainder * 10n + BigInt(ch)) % 97n
  return remainder
}
function toNumeric(s: string): string {
  return s
    .split('')
    .map((c) => (isNaN(Number(c)) ? (c.charCodeAt(0) - 55).toString() : c))
    .join('')
}
function checkDigits(bban: string): string {
  const rearranged = bban + 'TR00'
  const rem = mod97(toNumeric(rearranged))
  return String(98n - rem).padStart(2, '0')
}
function randomDigits(n: number): string {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')
}
function generateIBAN(bankCode?: string): string {
  const bank = bankCode ?? TURKISH_BANKS[Math.floor(Math.random() * TURKISH_BANKS.length)].code
  const bban = bank + '0' + randomDigits(16) // banka(5) + rezerv(1) + hesap(16)
  return 'TR' + checkDigits(bban) + bban
}
function validateIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  if (cleaned.length !== 26) return false
  if (!cleaned.startsWith('TR')) return false
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4)
  return mod97(toNumeric(rearranged)) === 1n
}
function formatSpaced(iban: string): string {
  return iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
}
type Parts = { country: string; check: string; bank: string; reserve: string; account: string }
function breakdown(iban: string): Parts {
  const c = iban.replace(/\s/g, '').toUpperCase()
  return { country: c.slice(0, 2), check: c.slice(2, 4), bank: c.slice(4, 9), reserve: c.slice(9, 10), account: c.slice(10, 26) }
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
    badge: '🇹🇷 Türkiye Araçları',
    title: 'TR IBAN Üretici & Doğrulayıcı',
    subtitle: 'Geçerli formatta TR IBAN üretin, dilediğiniz IBAN’ı doğrulayın. Yalnızca test amaçlıdır.',
    genTitle: 'IBAN Üret',
    bankLabel: 'Banka',
    randomBank: 'Rastgele Banka',
    countLabel: 'Adet',
    formatLabel: 'Biçim',
    spaced: 'Boşluklu',
    electronic: 'Elektronik',
    generate: 'Üret',
    copyAll: 'Tümünü Kopyala',
    copy: 'Kopyala',
    copied: 'Kopyalandı',
    resultsTitle: 'Üretilen IBAN’lar',
    emptyResults: 'Henüz IBAN üretilmedi.',
    valTitle: 'IBAN Doğrula',
    valPlaceholder: 'TR.. ile başlayan IBAN’ı yapıştırın',
    valid: 'GEÇERLİ',
    invalid: 'GEÇERSİZ',
    errLength: 'Uzunluk hatalı — TR IBAN 26 karakter olmalı',
    errCountry: 'Ülke kodu TR olmalı',
    errCheck: 'Kontrol hanesi doğrulaması başarısız',
    sepaMember: 'SEPA Üyesi',
    no: 'Hayır',
    formatInfo: 'TR IBAN (26 karakter)',
    bk: {
      country: 'Ülke Kodu',
      check: 'Kontrol Hanesi',
      bank: 'Banka Kodu',
      reserve: 'Rezerv',
      account: 'Hesap No',
      bankName: 'Banka Adı',
    },
    infoTitle: 'IBAN Hakkında',
    cards: [
      {
        h: 'TR IBAN Formatı',
        lines: ['TR (2) → Ülke kodu', 'XX (2) → Kontrol hanesi', 'XXXXX (5) → Banka kodu', '0 (1) → Rezerv karakter', 'XXXXXXXXXXXXXXXX (16) → Hesap numarası'],
      },
      {
        h: 'IBAN Nedir?',
        body: 'IBAN (International Bank Account Number), uluslararası para transferlerinde kullanılan standart banka hesap numarası formatıdır. Türkiye’de tüm bankalar TR ile başlayan 26 haneli IBAN kullanır.',
      },
      {
        h: '⚠️ Önemli Not',
        body: 'Bu araç yalnızca test amaçlı geçerli formatta IBAN üretir. Üretilen IBAN numaraları gerçek banka hesaplarına ait değildir ve herhangi bir finansal işlemde kullanılamaz.',
      },
      {
        h: 'SEPA',
        body: 'Türkiye SEPA (Single Euro Payments Area) üyesi değildir. Ancak TR IBAN, uluslararası havale işlemlerinde yaygın olarak kabul görür.',
      },
    ],
  },
  en: {
    badge: '🇹🇷 Turkey Tools',
    title: 'TR IBAN Generator & Validator',
    subtitle: 'Generate valid-format TR IBANs and validate any IBAN. For testing purposes only.',
    genTitle: 'Generate IBAN',
    bankLabel: 'Bank',
    randomBank: 'Random Bank',
    countLabel: 'Count',
    formatLabel: 'Format',
    spaced: 'Spaced',
    electronic: 'Electronic',
    generate: 'Generate',
    copyAll: 'Copy All',
    copy: 'Copy',
    copied: 'Copied',
    resultsTitle: 'Generated IBANs',
    emptyResults: 'No IBAN generated yet.',
    valTitle: 'Validate IBAN',
    valPlaceholder: 'Paste an IBAN starting with TR..',
    valid: 'VALID',
    invalid: 'INVALID',
    errLength: 'Wrong length — a TR IBAN must be 26 characters',
    errCountry: 'Country code must be TR',
    errCheck: 'Check-digit validation failed',
    sepaMember: 'SEPA Member',
    no: 'No',
    formatInfo: 'TR IBAN (26 characters)',
    bk: {
      country: 'Country Code',
      check: 'Check Digits',
      bank: 'Bank Identifier',
      reserve: 'Reserve',
      account: 'Account Number',
      bankName: 'Bank Name',
    },
    infoTitle: 'About IBAN',
    cards: [
      {
        h: 'TR IBAN Format',
        lines: ['TR (2) → Country code', 'XX (2) → Check digits', 'XXXXX (5) → Bank code', '0 (1) → Reserve character', 'XXXXXXXXXXXXXXXX (16) → Account number'],
      },
      {
        h: 'What is IBAN?',
        body: 'IBAN (International Bank Account Number) is the standard bank account number format used in international money transfers. In Turkey, all banks use a 26-character IBAN starting with TR.',
      },
      {
        h: '⚠️ Important Note',
        body: 'This tool only generates valid-format IBANs for testing. Generated IBANs do not belong to real bank accounts and cannot be used in any financial transaction.',
      },
      {
        h: 'SEPA',
        body: 'Turkey is not a SEPA (Single Euro Payments Area) member. However, TR IBANs are widely accepted in international wire transfers.',
      },
    ],
  },
} as const

// ── Breakdown table (paylaşılan) ──────────────────────────────────────────────
type BkLabels = { country: string; check: string; bank: string; reserve: string; account: string; bankName: string }
function Breakdown({ parts, bk, extra }: { parts: Parts; bk: BkLabels; extra?: [string, string][] }) {
  const rows: { ic: string; label: string; value: string; color: string }[] = [
    { ic: '🌍', label: bk.country, value: parts.country, color: 'var(--teal)' },
    { ic: '✓', label: bk.check, value: parts.check, color: 'var(--teal2)' },
    { ic: '🏦', label: bk.bank, value: parts.bank, color: 'var(--teal3)' },
    { ic: '0', label: bk.reserve, value: parts.reserve, color: 'var(--muted2)' },
    { ic: '#', label: bk.account, value: parts.account, color: 'var(--teal2)' },
    { ic: '🏛', label: bk.bankName, value: bankName(parts.bank), color: 'var(--text)' },
  ]
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)]">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-[var(--border)] last:border-0">
              <td className="w-1/2 px-4 py-2.5 text-xs text-[var(--muted2)]">
                <span className="mr-1.5">{r.ic}</span>
                {r.label}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-sm" style={{ color: r.color }}>
                {r.value}
              </td>
            </tr>
          ))}
          {extra?.map(([k, v]) => (
            <tr key={k} className="border-b border-[var(--border)] last:border-0">
              <td className="px-4 py-2.5 text-xs text-[var(--muted2)]">{k}</td>
              <td className="px-4 py-2.5 text-right text-sm text-[var(--text)]">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Info Card ─────────────────────────────────────────────────────────────────
function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-2 text-[var(--text)]">
        <span className="text-[var(--teal)]">{icon}</span>
        <p className="text-base font-semibold">{title}</p>
      </div>
      <div className="text-sm leading-7 text-[var(--muted2)]">{children}</div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function IbanToolClient() {
  const { lang } = useLanguage()
  const t = T[lang === 'en' ? 'en' : 'tr']
  const { copied, copy } = useCopy()

  const [bank, setBank] = useState('random')
  const [count, setCount] = useState(6)
  const [spaced, setSpaced] = useState(true)
  const [list, setList] = useState<string[]>([])

  const [valInput, setValInput] = useState('')

  const generate = () => {
    const n = Math.min(Math.max(1, count), 50)
    setList(Array.from({ length: n }, () => generateIBAN(bank === 'random' ? undefined : bank)))
  }

  const fmt = (iban: string) => (spaced ? formatSpaced(iban) : iban.replace(/\s/g, ''))

  // ── Validator (real-time) ──
  const val = useMemo(() => {
    const cleaned = valInput.replace(/\s/g, '').toUpperCase()
    if (!cleaned) return null
    if (cleaned.length !== 26) return { ok: false as const, err: t.errLength }
    if (!cleaned.startsWith('TR')) return { ok: false as const, err: t.errCountry }
    if (!validateIBAN(cleaned)) return { ok: false as const, err: t.errCheck }
    return { ok: true as const, parts: breakdown(cleaned) }
  }, [valInput, t])

  const onValChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9a-zA-Z]/g, '').toUpperCase().slice(0, 26)
    setValInput(formatSpaced(cleaned))
  }

  return (
    <main className="mx-auto max-w-5xl space-y-16 px-6 py-16 md:px-10">
      {/* Hero */}
      <section className="space-y-4 text-center">
        <span className="inline-block rounded-full bg-[var(--teal-dim)] px-3 py-1 text-xs font-medium uppercase tracking-widest text-[var(--teal)]">
          {t.badge}
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text)]">{t.title}</h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-[var(--muted2)]">{t.subtitle}</p>
      </section>

      {/* İki sütun: sol üretici+doğrulayıcı, sağ sonuçlar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* SOL ÜST — Üretici */}
        <div className="space-y-6">
          <section className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-lg font-bold text-[var(--text)]">{t.genTitle}</h2>

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{t.bankLabel}</span>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[#16a34a] focus:outline-none"
                >
                  <option value="random">{t.randomBank}</option>
                  {TURKISH_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap items-end gap-4">
                <label className="space-y-1.5">
                  <span className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{t.countLabel}</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-20 rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-3 py-2.5 text-center text-sm text-[var(--text)] focus:border-[#16a34a] focus:outline-none"
                  />
                </label>

                <div className="space-y-1.5">
                  <span className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{t.formatLabel}</span>
                  <div className="inline-flex rounded-xl border border-[var(--border)] p-0.5">
                    <button
                      onClick={() => setSpaced(true)}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${spaced ? 'bg-[#16a34a] text-white' : 'text-[var(--muted2)]'}`}
                    >
                      {t.spaced}
                    </button>
                    <button
                      onClick={() => setSpaced(false)}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${!spaced ? 'bg-[#16a34a] text-white' : 'text-[var(--muted2)]'}`}
                    >
                      {t.electronic}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={generate}
                  className="flex min-w-[100px] items-center justify-center gap-2 rounded-xl bg-[#16a34a] px-7 py-3 text-[15px] font-semibold text-white transition-all duration-150 hover:bg-[#15803d] active:scale-[0.98]"
                >
                  <RefreshCw size={16} />
                  {t.generate}
                </button>
                {list.length > 0 && (
                  <button
                    onClick={() => copy(list.map(fmt).join('\n'), 'all')}
                    className="flex items-center gap-2 rounded-xl border border-[var(--border2)] px-4 py-3 text-sm text-[var(--muted2)] transition-colors hover:border-[#16a34a] hover:text-[#16a34a]"
                  >
                    {copied === 'all' ? (
                      <>
                        <CheckCircle2 size={14} className="text-[#16a34a]" />
                        <span className="text-[#16a34a]">{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        {t.copyAll}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* SOL ALT — Doğrulayıcı */}
          <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-lg font-bold text-[var(--text)]">{t.valTitle}</h2>
            <textarea
              value={valInput}
              onChange={(e) => onValChange(e.target.value)}
              placeholder={t.valPlaceholder}
              rows={2}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-4 py-3 font-mono text-sm tracking-wider text-[var(--text)] focus:border-[#16a34a] focus:outline-none"
            />
            {val && (
              <div className="space-y-4">
                {val.ok ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--teal-dim)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
                      <CheckCircle2 size={13} /> {t.valid}
                    </span>
                    <Breakdown
                      parts={val.parts}
                      bk={t.bk}
                      extra={[
                        [t.sepaMember, t.no],
                        [t.formatLabel, t.formatInfo],
                      ]}
                    />
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
        </div>

        {/* SAĞ — Üretilen IBAN’lar */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--text)]">{t.resultsTitle}</h2>
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border2)] p-10 text-center text-sm text-[var(--muted)]">
              {t.emptyResults}
            </div>
          ) : (
            <div className="space-y-4">
              {list.map((iban, i) => (
                <div key={i} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="break-all font-mono text-lg font-bold tracking-wider text-[#22c55e]">{fmt(iban)}</p>
                    <button
                      onClick={() => copy(fmt(iban), `c${i}`)}
                      className="shrink-0 rounded-lg border border-[var(--border2)] p-2.5 text-[var(--muted2)] transition-all hover:border-[#16a34a] hover:text-[#16a34a]"
                      title={t.copy}
                    >
                      {copied === `c${i}` ? <CheckCircle2 size={15} className="text-[#16a34a]" /> : <Copy size={15} />}
                    </button>
                  </div>
                  <Breakdown parts={breakdown(iban)} bk={t.bk} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Bilgi kartları */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{t.infoTitle}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoCard icon={<Info size={18} />} title={t.cards[0].h}>
            <ul className="space-y-1.5 font-mono text-xs">
              {t.cards[0].lines!.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </InfoCard>
          <InfoCard icon={<Globe size={18} />} title={t.cards[1].h}>
            {t.cards[1].body}
          </InfoCard>
          <InfoCard icon={<AlertTriangle size={18} />} title={t.cards[2].h}>
            {t.cards[2].body}
          </InfoCard>
          <InfoCard icon={<Building2 size={18} />} title={t.cards[3].h}>
            {t.cards[3].body}
          </InfoCard>
        </div>
      </section>
    </main>
  )
}
