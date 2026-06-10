'use client'

import { useState, useCallback } from 'react'
import { Copy, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// ── Algoritma ─────────────────────────────────────────────────────────────────
function generateTCKN(): string {
  const d: number[] = []
  d[0] = Math.floor(Math.random() * 9) + 1
  for (let i = 1; i <= 8; i++) d[i] = Math.floor(Math.random() * 10)
  const odd = d[0] + d[2] + d[4] + d[6] + d[8]
  const even = d[1] + d[3] + d[5] + d[7]
  let d9 = (odd * 7 - even) % 10
  if (d9 < 0) d9 += 10
  d[9] = d9
  d[10] = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10
  return d.join('')
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
    title: 'TCKN Üretici',
    subtitle: 'Algoritma geçerli TC Kimlik Numarası üretin. Yalnızca test ve geliştirme amaçlıdır.',
    idLabel: 'TC Kimlik Numarası',
    idLabelShort: 'TC Kimlik No',
    countLabel: 'Adet',
    generate: 'Üret',
    copy: 'Kopyala',
    copyAll: 'Tümünü Kopyala',
    copied: 'Kopyalandı',
    legalTitle: 'Yasal Uyarı',
    legal: [
      'Üretilen numaralar yalnızca yazılım testi ve eğitim amaçlıdır, resmi işlemlerde kullanılamaz.',
      'Algoritmaya uygun olsa da gerçek bir T.C. vatandaşına ait değildir.',
      'Kötüye kullanımdan doğan yasal sorumluluk kullanıcıya aittir.',
    ],
    algoTitle: 'Algoritma Nasıl Çalışır?',
    algoText:
      'TCKN rastgele bir sayı değildir. Her rakamın matematiksel bir anlamı vardır; son iki hane kontrol basamağıdır ve hatalı numaralar sistemler tarafından anında reddedilir.',
    colDigit: 'Hane',
    colRule: 'Kural',
    rows: [
      ['1. rakam', 'Her zaman 1–9 arası — sıfır olamaz'],
      ['2.–9. rakam', '0–9 arası rastgele belirlenir'],
      ['10. rakam', '(tek pozisyon toplamı × 7 − çift pozisyon toplamı) mod 10'],
      ['11. rakam', 'İlk 10 rakamın toplamının mod 10’u'],
    ],
    faqTitle: 'Sık Sorulan Sorular',
    faq: [
      { q: 'TCKN üretmek yasal mı?', a: 'Test ve yazılım geliştirme için algoritmaya uygun numara üretmek meşru bir ihtiyaçtır. Ancak sahte kimlik oluşturma veya dolandırıcılık gibi amaçlarla kullanmak yasal sorumluluk doğurur.' },
      { q: 'Üretilen numara gerçek birine ait olabilir mi?', a: 'Matematiksel olarak mümkündür, ancak olasılığı son derece düşüktür. Bu nedenle üretilen numaraları gerçek bir kişinin verisi gibi işlemeyin.' },
      { q: 'Neden ilk rakam sıfır olamaz?', a: 'TCKN sayısal değer olarak tanımlanır. Baştaki sıfır, 11 haneli sayıyı 10 haneye düşüreceğinden sistem geçersiz sayar.' },
      { q: 'Tek seferde kaç adet üretebilirim?', a: 'Adet alanına 1–50 arası bir değer girip Üret butonuna basabilirsiniz. Toplu kopyalama için “Tümünü Kopyala” butonunu kullanın.' },
      { q: 'Bu araç ücretsiz mi?', a: 'Evet. DevOneKit’teki tüm araçlar tamamen ücretsiz ve kayıt gerektirmez.' },
    ],
    relatedTitle: 'İlgili Araçlar',
    related: [
      { label: 'VKN Üretici', href: '/vkn-generator' },
      { label: 'IBAN Üretici', href: '/tr-iban-generator' },
      { label: 'Kredi Kartı No', href: '/credit-card-generator' },
      { label: 'Sahte Kişi Verisi', href: '/fake-person-data' },
    ],
  },
  en: {
    badge: '🇹🇷 Turkey Tools',
    title: 'TCKN Generator',
    subtitle: 'Generate algorithm-valid Turkish National ID numbers. For testing and development only.',
    idLabel: 'National ID Number',
    idLabelShort: 'National ID',
    countLabel: 'Count',
    generate: 'Generate',
    copy: 'Copy',
    copyAll: 'Copy All',
    copied: 'Copied',
    legalTitle: 'Legal Notice',
    legal: [
      'Generated numbers are for software testing and educational use only; they cannot be used in official procedures.',
      'Although algorithm-valid, they never belong to a real Turkish citizen.',
      'Any legal liability arising from misuse rests with the user.',
    ],
    algoTitle: 'How Does the Algorithm Work?',
    algoText:
      'A TCKN is not a random number. Each digit has a mathematical meaning; the last two are check digits, so invalid numbers are instantly rejected by systems.',
    colDigit: 'Digit',
    colRule: 'Rule',
    rows: [
      ['Digit 1', 'Always 1–9 — cannot be zero'],
      ['Digits 2–9', 'Randomly chosen between 0–9'],
      ['Digit 10', '(sum of odd positions × 7 − sum of even positions) mod 10'],
      ['Digit 11', 'Mod 10 of the sum of the first 10 digits'],
    ],
    faqTitle: 'Frequently Asked Questions',
    faq: [
      { q: 'Is generating a TCKN legal?', a: 'Generating algorithm-valid numbers for testing and software development is a legitimate need. However, using them to create fake identities or commit fraud creates legal liability.' },
      { q: 'Could a generated number belong to a real person?', a: 'It is mathematically possible but extremely unlikely. So never treat generated numbers as a real person’s data.' },
      { q: 'Why can’t the first digit be zero?', a: 'A TCKN is defined as a numeric value. A leading zero would reduce the 11-digit number to 10 digits, so the system considers it invalid.' },
      { q: 'How many can I generate at once?', a: 'Enter a value between 1–50 in the Count field and press Generate. Use “Copy All” for bulk copying.' },
      { q: 'Is this tool free?', a: 'Yes. Every tool on DevOneKit is completely free and requires no registration.' },
    ],
    relatedTitle: 'Related Tools',
    related: [
      { label: 'VKN Generator', href: '/vkn-generator' },
      { label: 'IBAN Generator', href: '/tr-iban-generator' },
      { label: 'Credit Card No', href: '/credit-card-generator' },
      { label: 'Fake Person Data', href: '/fake-person-data' },
    ],
  },
} as const

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm text-[var(--text)] transition-colors hover:text-[var(--teal)]"
      >
        <span>{q}</span>
        <span className="ml-6 shrink-0 text-[var(--teal)]">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-[var(--muted2)]">{a}</p>}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TCKNToolClient() {
  const { lang } = useLanguage()
  const t = T[lang === 'en' ? 'en' : 'tr']
  const [list, setList] = useState<string[]>([generateTCKN()])
  const [count, setCount] = useState(1)
  const { copied, copy } = useCopy()
  const single = list.length === 1

  const generate = () => {
    const n = Math.min(Math.max(1, count), 50)
    setList(Array.from({ length: n }, () => generateTCKN()))
  }

  return (
    <main className="mx-auto max-w-2xl space-y-16 px-4 py-16">
      {/* Hero */}
      <section className="space-y-3 text-center">
        <span className="inline-block rounded-full bg-[var(--teal-dim)] px-3 py-1 text-xs font-medium uppercase tracking-widest text-[var(--teal)]">
          {t.badge}
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text)]">{t.title}</h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--muted2)]">{t.subtitle}</p>
      </section>

      {/* Ana Kart */}
      <section className="space-y-4">
        {single && (
          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-8 py-8 text-center">
            <p className="mb-3 text-xs uppercase tracking-widest text-[var(--muted)]">{t.idLabel}</p>
            <p className="font-mono text-4xl font-bold tracking-[0.15em] text-[var(--teal)]">{list[0]}</p>
            <button
              onClick={() => copy(list[0], '0')}
              className="absolute right-4 top-4 rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface2)] hover:text-[var(--teal)]"
              title={t.copy}
            >
              {copied === '0' ? <CheckCircle2 size={16} className="text-[var(--teal)]" /> : <Copy size={16} />}
            </button>
          </div>
        )}

        {!single && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {list.map((tc, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
              >
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">{t.idLabelShort}</p>
                  <p className="font-mono text-lg font-semibold tracking-wider text-[var(--text)]">{tc}</p>
                </div>
                <button
                  onClick={() => copy(tc, String(i))}
                  className="ml-4 rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface2)] hover:text-[var(--teal)]"
                  title={t.copy}
                >
                  {copied === String(i) ? <CheckCircle2 size={15} className="text-[var(--teal)]" /> : <Copy size={15} />}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted2)]">{t.countLabel}</span>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-14 rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-2 py-1.5 text-center text-sm text-[var(--text)] focus:border-[var(--teal)] focus:outline-none"
            />
          </div>
          <button
            onClick={generate}
            className="flex items-center gap-2 rounded-xl bg-[var(--teal)] px-6 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          >
            <RefreshCw size={13} />
            {t.generate}
          </button>
          {!single && (
            <button
              onClick={() => copy(list.join('\n'), 'all')}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted2)] transition-colors hover:border-[var(--border2)] hover:text-[var(--text)]"
            >
              {copied === 'all' ? (
                <>
                  <CheckCircle2 size={13} className="text-[var(--teal)]" />
                  <span className="text-[var(--teal)]">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  {t.copyAll}
                </>
              )}
            </button>
          )}
        </div>
      </section>

      {/* Yasal Uyarı */}
      <section className="space-y-3 rounded-2xl border border-[var(--yellow)]/25 bg-[var(--yellow)]/10 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--yellow)]">{t.legalTitle}</p>
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--muted2)]">
          {t.legal.map((line, i) => (
            <li key={i} className="flex gap-2">
              <span className="shrink-0 text-[var(--yellow)]">—</span>
              {line}
            </li>
          ))}
        </ul>
      </section>

      {/* Algoritma */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[var(--text)]">{t.algoTitle}</h2>
          <p className="text-sm leading-relaxed text-[var(--muted2)]">{t.algoText}</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface2)]">
                <th className="w-36 px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  {t.colDigit}
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  {t.colRule}
                </th>
              </tr>
            </thead>
            <tbody>
              {t.rows.map(([digit, rule], i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-5 py-3.5 font-mono text-xs text-[var(--teal)]">{digit}</td>
                  <td className="px-5 py-3.5 text-[var(--muted2)]">{rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SSS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">{t.faqTitle}</h2>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6">
          {t.faq.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* İlgili Araçlar */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">{t.relatedTitle}</h2>
        <div className="flex flex-wrap gap-2">
          {t.related.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted2)] transition-colors hover:border-[var(--teal)]/40 hover:text-[var(--teal)]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
