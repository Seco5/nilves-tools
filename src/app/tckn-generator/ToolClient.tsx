'use client'

import { useState, useCallback } from 'react'
import { Copy, RefreshCw, CheckCircle2, FlaskConical, ShieldCheck, Scale } from 'lucide-react'
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
    subtitle:
      'Algoritma geçerli TC Kimlik Numarası üretin. Yalnızca test ve yazılım geliştirme amaçlıdır — gerçek kişilerle ilişkili değildir.',
    idLabel: 'TC Kimlik No',
    count: 'Adet:',
    generate: 'Üret',
    copy: 'Kopyala',
    copyAll: 'Tümünü Kopyala',
    copied: 'Kopyalandı',
    rulesTitle: 'Kullanım Kuralları',
    cards: [
      {
        title: 'Yalnızca Test Amaçlı',
        text: 'Üretilen numaralar yazılım geliştirme ve test süreçleri için tasarlanmıştır. Resmi işlemlerde kullanılamaz.',
      },
      {
        title: 'Gerçek Kişilerle İlgisi Yok',
        text: 'Algoritmaya uygun üretilir ancak hiçbir zaman gerçek bir T.C. vatandaşına ait değildir.',
      },
      {
        title: 'Yasal Sorumluluk',
        text: 'Bu araçtan üretilen numaraların kötüye kullanımından doğan yasal sorumluluk kullanıcıya aittir.',
      },
    ],
    algoTitle: 'TCKN Algoritması Nasıl Çalışır?',
    algoText:
      'TC Kimlik Numarası rastgele üretilmez. 11 haneli bu sayıda her rakamın matematiksel bir anlamı vardır. İlk rakam asla sıfır olamaz. Son iki rakam ise önceki rakamlardan türetilen kontrol basamaklarıdır — bu sayede sistemler yanlış girilen numaraları anında tespit edebilir.',
    colDigit: 'Hane',
    colDesc: 'Açıklama',
    rows: [
      ['1. rakam', 'Her zaman 1–9 arasındadır, sıfır olamaz'],
      ['2.–9. rakam', '0–9 arasında rastgele belirlenir'],
      ['10. rakam (d10)', '(tek sıralı toplam × 7 − çift sıralı toplam) mod 10'],
      ['11. rakam (d11)', 'İlk 10 rakamın toplamının mod 10’u'],
    ],
    faqTitle: 'Sık Sorulan Sorular',
    faq: [
      {
        q: 'TCKN üretmek yasal mı?',
        a: 'Algoritma geçerli TC kimlik numarası üretmek, yazılım geliştirme ve test süreçleri için meşru bir ihtiyaçtır. Ancak üretilen numaraların sahte kimlik oluşturma, dolandırıcılık veya herhangi bir yasa dışı amaçla kullanılması hukuki sorumluluk doğurur.',
      },
      {
        q: 'Üretilen numaralar gerçek kişilere ait olabilir mi?',
        a: 'Matematiksel olasılık kapsamında, algoritmaya uygun bir sayının tesadüfen mevcut bir vatandaşın numarasıyla örtüşmesi mümkündür. Bu nedenle üretilen numaralara gerçek bir kişinin verisi gibi davranılmamalıdır.',
      },
      {
        q: 'Neden ilk rakam sıfır olamaz?',
        a: 'TCKN sayısal değer olarak tanımlandığından, baştaki sıfır hane sayısını 10’a düşürür. Sistem tutarlılığı için ilk hane her zaman 1–9 arasındadır.',
      },
      {
        q: 'Tek seferde kaç adet üretebilirim?',
        a: 'Bu araçta bir seferde en fazla 50 TCKN üretebilirsiniz. Daha fazlasına ihtiyaç duyarsanız birden fazla kez üretip “Tümünü Kopyala” butonunu kullanabilirsiniz.',
      },
      {
        q: 'Bu araç ücretsiz mi?',
        a: 'Evet, tamamen ücretsizdir. DevOneKit’teki tüm araçlar kayıt gerektirmeksizin kullanılabilir.',
      },
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
    subtitle:
      'Generate algorithm-valid Turkish National ID numbers. For testing and software development only — not related to real people.',
    idLabel: 'National ID',
    count: 'Count:',
    generate: 'Generate',
    copy: 'Copy',
    copyAll: 'Copy All',
    copied: 'Copied',
    rulesTitle: 'Usage Rules',
    cards: [
      {
        title: 'For Testing Only',
        text: 'Generated numbers are designed for software development and testing. They cannot be used in official procedures.',
      },
      {
        title: 'Not Tied to Real People',
        text: 'Numbers follow the algorithm but never belong to an actual Turkish citizen.',
      },
      {
        title: 'Legal Responsibility',
        text: 'Any legal liability arising from misuse of these generated numbers rests with the user.',
      },
    ],
    algoTitle: 'How Does the TCKN Algorithm Work?',
    algoText:
      'A Turkish National ID is not random. Each of its 11 digits has a mathematical meaning. The first digit can never be zero. The last two digits are check digits derived from the preceding ones — letting systems instantly detect mistyped numbers.',
    colDigit: 'Digit',
    colDesc: 'Description',
    rows: [
      ['Digit 1', 'Always between 1–9, never zero'],
      ['Digits 2–9', 'Randomly chosen between 0–9'],
      ['Digit 10 (d10)', '(sum of odd positions × 7 − sum of even positions) mod 10'],
      ['Digit 11 (d11)', 'Mod 10 of the sum of the first 10 digits'],
    ],
    faqTitle: 'Frequently Asked Questions',
    faq: [
      {
        q: 'Is generating a TCKN legal?',
        a: 'Generating algorithm-valid national ID numbers is a legitimate need for software development and testing. However, using them to create fake identities, commit fraud or any unlawful purpose creates legal liability.',
      },
      {
        q: 'Could generated numbers belong to real people?',
        a: 'Mathematically, an algorithm-valid number could coincidentally match an existing citizen’s number. So generated numbers should never be treated as a real person’s data.',
      },
      {
        q: 'Why can’t the first digit be zero?',
        a: 'Since a TCKN is defined as a numeric value, a leading zero would reduce it to 10 digits. For consistency the first digit is always between 1–9.',
      },
      {
        q: 'How many can I generate at once?',
        a: 'This tool generates up to 50 TCKNs at a time. If you need more, generate multiple times and use the “Copy All” button.',
      },
      {
        q: 'Is this tool free?',
        a: 'Yes, completely free. Every tool on DevOneKit works without registration.',
      },
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

// ── Info Card ─────────────────────────────────────────────────────────────────
function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mt-0.5 shrink-0 text-[var(--teal)]">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-[var(--muted2)]">{text}</p>
      </div>
    </div>
  )
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-[var(--text)] transition-colors hover:text-[var(--teal)]"
      >
        <span>{q}</span>
        <span className="ml-4 shrink-0 text-base leading-none text-[var(--teal)]">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-[var(--muted2)]">{a}</p>}
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

  const generate = () => {
    const n = Math.min(Math.max(1, count), 50)
    setList(Array.from({ length: n }, () => generateTCKN()))
  }

  const single = list.length === 1

  return (
    <main className="mx-auto max-w-3xl space-y-12 px-4 py-10">
      {/* Hero */}
      <section className="space-y-2 text-center">
        <span className="inline-block rounded-full bg-[var(--teal-dim)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--teal)]">
          {t.badge}
        </span>
        <h1 className="text-3xl font-bold text-[var(--text)]">{t.title}</h1>
        <p className="mx-auto max-w-md text-sm text-[var(--muted2)]">{t.subtitle}</p>
      </section>

      {/* Generator */}
      <section className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        {single ? (
          <div className="flex items-center justify-between rounded-xl border border-[var(--teal)]/40 bg-[var(--teal-glow)] px-5 py-4">
            <span className="font-mono text-2xl font-bold tracking-widest text-[var(--teal)]">{list[0]}</span>
            <button
              onClick={() => copy(list[0], '0')}
              className="ml-4 rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface2)] hover:text-[var(--teal)]"
              title={t.copy}
            >
              {copied === '0' ? <CheckCircle2 size={18} className="text-[var(--teal)]" /> : <Copy size={18} />}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {list.map((tc, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-4 py-3"
              >
                <div>
                  <p className="mb-0.5 text-[10px] uppercase tracking-widest text-[var(--muted)]">{t.idLabel}</p>
                  <span className="font-mono text-base font-semibold tracking-wider text-[var(--text)]">{tc}</span>
                </div>
                <button
                  onClick={() => copy(tc, String(i))}
                  className="ml-3 rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface3)] hover:text-[var(--teal)]"
                  title={t.copy}
                >
                  {copied === String(i) ? (
                    <CheckCircle2 size={16} className="text-[var(--teal)]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-[var(--muted2)]">{t.count}</label>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-16 rounded-lg border border-[var(--border)] bg-[var(--surface2)] px-3 py-1.5 text-center text-sm text-[var(--text)] focus:border-[var(--teal)] focus:outline-none"
          />
          <button
            onClick={generate}
            className="flex items-center gap-2 rounded-lg bg-[var(--teal)] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <RefreshCw size={14} /> {t.generate}
          </button>
          {!single && (
            <button
              onClick={() => copy(list.join('\n'), 'all')}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted2)] transition-colors hover:border-[var(--border2)] hover:text-[var(--text)]"
            >
              {copied === 'all' ? (
                <>
                  <CheckCircle2 size={14} className="text-[var(--teal)]" /> {t.copied}
                </>
              ) : (
                <>
                  <Copy size={14} /> {t.copyAll}
                </>
              )}
            </button>
          )}
        </div>
      </section>

      {/* Uyarı Kartları */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{t.rulesTitle}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoCard icon={<FlaskConical size={18} />} title={t.cards[0].title} text={t.cards[0].text} />
          <InfoCard icon={<ShieldCheck size={18} />} title={t.cards[1].title} text={t.cards[1].text} />
          <InfoCard icon={<Scale size={18} />} title={t.cards[2].title} text={t.cards[2].text} />
        </div>
      </section>

      {/* Algoritma */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">{t.algoTitle}</h2>
        <p className="text-sm leading-relaxed text-[var(--muted2)]">{t.algoText}</p>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  {t.colDigit}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  {t.colDesc}
                </th>
              </tr>
            </thead>
            <tbody>
              {t.rows.map(([digit, desc]) => (
                <tr key={digit} className="border-b border-[var(--border)] last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[var(--teal)]">{digit}</td>
                  <td className="px-4 py-3 text-[var(--muted2)]">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SSS */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text)]">{t.faqTitle}</h2>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5">
          {t.faq.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* İlgili Araçlar */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{t.relatedTitle}</h2>
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
