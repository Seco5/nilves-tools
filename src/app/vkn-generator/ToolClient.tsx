'use client'

import { useState, useCallback } from 'react'
import { Copy, RefreshCw, CheckCircle2, FlaskConical, ShieldCheck, Scale } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// ── Algoritma ─────────────────────────────────────────────────────────────────
function generateVKN(): string {
  const d: number[] = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
  const tmp: number[] = d.map((v, i) => (v + 9 - i) % 10)
  const check = tmp.reduce((acc, v, i) => {
    const x = (v * Math.pow(2, 9 - i)) % 9
    return acc + (x === 0 && v !== 0 ? 9 : x)
  }, 0)
  d[9] = check % 10 === 0 ? 0 : 10 - (check % 10)
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
    title: 'VKN Üretici',
    subtitle: 'Algoritma geçerli Vergi Kimlik Numarası üretin. Yalnızca test ve geliştirme amaçlıdır.',
    idLabel: 'Vergi Kimlik Numarası',
    idLabelShort: 'Vergi No',
    countLabel: 'Adet',
    generate: 'Üret',
    copy: 'Kopyala',
    copyAll: 'Tümünü Kopyala',
    copied: 'Kopyalandı',
    rulesTitle: 'Kullanım Kuralları',
    cards: [
      { title: 'Yalnızca Test Amaçlı', text: 'Yazılım geliştirme ve test süreçleri için tasarlanmıştır.' },
      { title: 'Gerçek Mükellef Yok', text: 'Hiçbir zaman gerçek bir mükellefe ait değildir.' },
      { title: 'Yasal Sorumluluk', text: 'Kötüye kullanımdan doğan sorumluluk kullanıcıya aittir.' },
    ],
    algoTitle: 'VKN Algoritması Nasıl Çalışır?',
    algoText:
      'Vergi Kimlik Numarası 10 haneli olup rastgele üretilmez. Her hane matematiksel kurallara göre hesaplanır; son hane kontrol basamağıdır ve hatalı numaralar sistemler tarafından anında reddedilir.',
    colDigit: 'Hane',
    colRule: 'Kural',
    rows: [
      ['1.–9. rakam', '0–9 arası rastgele belirlenir'],
      ['10. rakam', 'Kontrol basamağı — ilk 9 rakamdan türetilen algoritmik değer'],
    ],
    faqTitle: 'Sık Sorulan Sorular',
    faq: [
      { q: 'VKN üretmek yasal mı?', a: 'Yazılım geliştirme ve test süreçleri için algoritmaya uygun VKN üretmek meşru bir ihtiyaçtır. Ancak vergi kaçakçılığı veya sahte belge düzenleme gibi amaçlarla kullanmak ağır hukuki sonuçlar doğurur.' },
      { q: 'Üretilen numara gerçek bir mükellefe ait olabilir mi?', a: 'Matematiksel olarak mümkündür ancak olasılığı son derece düşüktür. Üretilen numaraları gerçek bir mükellefin verisi gibi işlemeyin.' },
      { q: 'VKN kaç haneli?', a: 'Türkiye Vergi Kimlik Numarası 10 haneden oluşur. Son hane algoritmik olarak hesaplanan kontrol basamağıdır.' },
      { q: 'Tek seferde kaç adet üretebilirim?', a: 'Adet alanına 1–50 arası bir değer girip Üret butonuna basabilirsiniz. Toplu kopyalama için “Tümünü Kopyala” butonunu kullanın.' },
      { q: 'Bu araç ücretsiz mi?', a: 'Evet. DevOneKit’teki tüm araçlar tamamen ücretsiz ve kayıt gerektirmez.' },
    ],
    relatedTitle: 'İlgili Araçlar',
    related: [
      { label: 'TCKN Üretici', href: '/tckn-generator' },
      { label: 'IBAN Üretici', href: '/tr-iban-generator' },
      { label: 'Kredi Kartı No', href: '/credit-card-generator' },
      { label: 'Sahte Kişi Verisi', href: '/fake-person-data' },
    ],
  },
  en: {
    badge: '🇹🇷 Turkey Tools',
    title: 'VKN Generator',
    subtitle: 'Generate algorithm-valid Turkish Tax ID numbers. For testing and development only.',
    idLabel: 'Tax Identification Number',
    idLabelShort: 'Tax No',
    countLabel: 'Count',
    generate: 'Generate',
    copy: 'Copy',
    copyAll: 'Copy All',
    copied: 'Copied',
    rulesTitle: 'Usage Rules',
    cards: [
      { title: 'For Testing Only', text: 'Designed for software development and testing processes.' },
      { title: 'No Real Taxpayer', text: 'Never belongs to a real taxpayer.' },
      { title: 'Legal Responsibility', text: 'Any liability arising from misuse rests with the user.' },
    ],
    algoTitle: 'How Does the VKN Algorithm Work?',
    algoText:
      'A Turkish Tax ID is 10 digits and is not random. Each digit follows mathematical rules; the last digit is a check digit, so invalid numbers are instantly rejected by systems.',
    colDigit: 'Digit',
    colRule: 'Rule',
    rows: [
      ['Digits 1–9', 'Randomly chosen between 0–9'],
      ['Digit 10', 'Check digit — algorithmic value derived from the first 9 digits'],
    ],
    faqTitle: 'Frequently Asked Questions',
    faq: [
      { q: 'Is generating a VKN legal?', a: 'Generating algorithm-valid tax IDs for software development and testing is a legitimate need. However, using them for tax evasion or forging documents leads to serious legal consequences.' },
      { q: 'Could a generated number belong to a real taxpayer?', a: 'It is mathematically possible but extremely unlikely. Never treat generated numbers as a real taxpayer’s data.' },
      { q: 'How many digits is a VKN?', a: 'A Turkish Tax ID consists of 10 digits. The last digit is an algorithmically calculated check digit.' },
      { q: 'How many can I generate at once?', a: 'Enter a value between 1–50 in the Count field and press Generate. Use “Copy All” for bulk copying.' },
      { q: 'Is this tool free?', a: 'Yes. Every tool on DevOneKit is completely free and requires no registration.' },
    ],
    relatedTitle: 'Related Tools',
    related: [
      { label: 'TCKN Generator', href: '/tckn-generator' },
      { label: 'IBAN Generator', href: '/tr-iban-generator' },
      { label: 'Credit Card No', href: '/credit-card-generator' },
      { label: 'Fake Person Data', href: '/fake-person-data' },
    ],
  },
} as const

// ── Info Card ─────────────────────────────────────────────────────────────────
function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="text-[var(--teal)]">{icon}</div>
      <p className="text-base font-semibold text-[var(--text)]">{title}</p>
      <p className="text-sm leading-7 text-[var(--muted2)]">{text}</p>
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
        className="flex w-full items-center justify-between py-4 text-left text-[15px] text-[var(--text)] transition-colors hover:text-[var(--teal)]"
      >
        <span>{q}</span>
        <span className="ml-6 shrink-0 text-lg text-[var(--teal)]">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="pb-4 text-sm leading-7 text-[var(--muted2)]">{a}</p>}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function VKNToolClient() {
  const { lang } = useLanguage()
  const t = T[lang === 'en' ? 'en' : 'tr']
  const [list, setList] = useState<string[]>([generateVKN()])
  const [count, setCount] = useState(1)
  const [genKey, setGenKey] = useState(0)
  const { copied, copy } = useCopy()
  const single = list.length === 1

  const generate = () => {
    const n = Math.min(Math.max(1, count), 50)
    setList(Array.from({ length: n }, () => generateVKN()))
    setGenKey((k) => k + 1)
  }

  return (
    <main className="mx-auto max-w-3xl space-y-20 px-6 py-16 md:px-10">
      {/* Hero */}
      <section className="space-y-4 text-center">
        <span className="inline-block rounded-full bg-[var(--teal-dim)] px-3 py-1 text-xs font-medium uppercase tracking-widest text-[var(--teal)]">
          {t.badge}
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text)]">{t.title}</h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--muted2)]">{t.subtitle}</p>
      </section>

      {/* Üretici + Kullanım Kuralları — bağlamsal grup */}
      <div className="space-y-6">
        <section className="space-y-4">
          {single && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
              <p className="mb-5 text-xs uppercase tracking-widest text-[var(--muted)]">{t.idLabel}</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <p
                  key={genKey}
                  className="tckn-flash rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-8 py-6 font-mono text-4xl font-bold tabular-nums tracking-[0.15em] text-[#22c55e] sm:text-5xl"
                >
                  {list[0]}
                </p>
                <button
                  onClick={() => copy(list[0], '0')}
                  className="flex items-center gap-2 rounded-xl border border-[var(--border2)] bg-[var(--surface2)] px-4 py-2.5 text-sm font-medium text-[var(--muted2)] transition-all hover:border-[#16a34a] hover:text-[#16a34a]"
                  title={t.copy}
                >
                  {copied === '0' ? (
                    <>
                      <CheckCircle2 size={16} className="text-[#16a34a]" />
                      <span className="text-[#16a34a]">{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      {t.copy}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {!single && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {list.map((vkn, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
                >
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">{t.idLabelShort}</p>
                    <p className="font-mono text-lg font-semibold tracking-wider text-[var(--text)]">{vkn}</p>
                  </div>
                  <button
                    onClick={() => copy(vkn, String(i))}
                    className="ml-4 rounded-lg border border-[var(--border2)] p-2.5 text-[var(--muted2)] transition-all hover:border-[#16a34a] hover:text-[#16a34a]"
                    title={t.copy}
                  >
                    {copied === String(i) ? <CheckCircle2 size={15} className="text-[#16a34a]" /> : <Copy size={15} />}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted2)]">{t.countLabel}</span>
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-16 rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-2 py-3 text-center text-sm text-[var(--text)] focus:border-[#16a34a] focus:outline-none"
              />
            </div>
            <button
              onClick={generate}
              className="flex min-w-[100px] items-center justify-center gap-2 rounded-xl bg-[#16a34a] px-7 py-3 text-[15px] font-semibold text-white transition-all duration-150 hover:bg-[#15803d] active:scale-[0.98]"
            >
              <RefreshCw size={16} />
              {t.generate}
            </button>
            {!single && (
              <button
                onClick={() => copy(list.join('\n'), 'all')}
                className="flex items-center gap-2 rounded-xl border border-[var(--border2)] px-4 py-3 text-sm text-[var(--muted2)] transition-colors hover:border-[#16a34a] hover:text-[#16a34a]"
              >
                {copied === 'all' ? (
                  <>
                    <CheckCircle2 size={14} className="text-[#16a34a]" />
                    <span className="text-[#16a34a]">{t.copied}</span>
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

        {/* Kullanım Kuralları */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{t.rulesTitle}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InfoCard icon={<FlaskConical size={20} />} title={t.cards[0].title} text={t.cards[0].text} />
            <InfoCard icon={<ShieldCheck size={20} />} title={t.cards[1].title} text={t.cards[1].text} />
            <InfoCard icon={<Scale size={20} />} title={t.cards[2].title} text={t.cards[2].text} />
          </div>
        </section>
      </div>

      {/* Algoritma */}
      <section className="space-y-4 pt-8">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[var(--text)]">{t.algoTitle}</h2>
          <p className="text-sm leading-7 text-[var(--muted2)]">{t.algoText}</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface2)]">
                <th className="w-40 px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
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
                  <td className="px-5 py-4 font-mono text-xs text-[var(--muted2)]">{digit}</td>
                  <td className="px-5 py-4 leading-6 text-[var(--muted2)]">{rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SSS */}
      <section className="space-y-4 pt-8">
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
