'use client'

import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { Copy, Check, RefreshCw, FlaskConical, ShieldOff, Scale, Plus } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// ── Algoritma ─────────────────────────────────────────────────────────────────
function genOneTCKN(): string {
  const d: number[] = []
  d[0] = Math.floor(Math.random() * 9) + 1
  for (let i = 1; i <= 8; i++) d[i] = Math.floor(Math.random() * 10)
  const d9 = ((d[0] + d[2] + d[4] + d[6] + d[8]) * 7 - (d[1] + d[3] + d[5] + d[7])) % 10
  if (d9 < 0) return genOneTCKN()
  d[9] = d9
  d[10] = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10
  return d.join('')
}

// ── i18n ──────────────────────────────────────────────────────────────────────
const T = {
  tr: {
    badge: '🇹🇷 TÜRKİYE ARAÇLARI',
    title: 'TCKN Üretici',
    subtitle: 'Algoritma geçerli TC Kimlik Numarası üretin. Yalnızca yazılım geliştirme ve test amaçlıdır.',
    displayLabel: 'TC KİMLİK NUMARASI',
    copy: 'Kopyala',
    copied: 'Kopyalandı!',
    count: 'Adet',
    generate: 'Üret',
    cards: [
      { title: 'Yalnızca Test Amaçlı', desc: 'Yazılım geliştirme ve test süreçleri için tasarlanmıştır.' },
      { title: 'Gerçek Kişi Yok', desc: 'Hiçbir zaman gerçek bir T.C. vatandaşına ait değildir.' },
      { title: 'Yasal Sorumluluk', desc: 'Kötüye kullanımdan doğan sorumluluk kullanıcıya aittir.' },
    ],
    algoTitle: 'Algoritma Nasıl Çalışır?',
    algoIntro:
      'TCKN rastgele bir sayı değildir. Her rakamın matematiksel bir anlamı vardır; son iki hane kontrol basamağıdır ve hatalı numaralar sistemler tarafından anında reddedilir.',
    colDigit: 'Hane',
    colRule: 'Kural',
    rows: [
      ['1. rakam', 'Her zaman 1–9 arası — sıfır olamaz'],
      ['2.–9. rakam', '0–9 arası rastgele belirlenir'],
      ['10. rakam', '(tek pozisyon toplamı × 7 − çift pozisyon toplamı) mod 10'],
      ['11. rakam', "İlk 10 rakamın toplamının mod 10'u"],
    ],
    faqTitle: 'Sık Sorulan Sorular',
    faq: [
      { q: 'TCKN üretmek yasal mı?', a: 'Test ve geliştirme amacıyla algoritma geçerli TCKN üretmek yasal bir faaliyettir. Ancak bu numaraları kimlik sahteciliği veya dolandırıcılık amacıyla kullanmak yasaktır ve suç teşkil eder.' },
      { q: 'Üretilen numara gerçek birine ait olabilir mi?', a: 'Teorik olarak algoritmaya uygun numaralar gerçek kişilerle örtüşebilir. Bu nedenle üretilen numaraları yalnızca test ortamlarında, izole sistemlerde kullanmanızı öneririz.' },
      { q: 'Neden ilk rakam sıfır olamaz?', a: 'TC Kimlik Numarası standardı, ilk rakamın 1-9 arasında olmasını zorunlu kılar. Bu kural, numaranın başında sıfır bulunmasını ve olası karışıklıkları önlemek için belirlenmiştir.' },
      { q: 'Tek seferde kaç adet üretebilirim?', a: 'DevOneKit ile tek seferde 50 adede kadar TCKN üretebilirsiniz. Daha fazlasına ihtiyaç duyuyorsanız birden fazla üretim yapabilirsiniz.' },
      { q: 'Bu araç ücretsiz mi?', a: 'Evet, tamamen ücretsizdir. Kayıt, üyelik veya ödeme gerekmez. Tüm araçlar tarayıcınızda çalışır ve hiçbir veriniz sunucularımıza gönderilmez.' },
    ],
    relatedTitle: 'İlgili Araçlar',
    related: [
      { label: 'Türkiye', name: 'VKN Üretici', desc: 'Vergi Kimlik Numarası', href: '/vkn-generator' },
      { label: 'Türkiye', name: 'IBAN Üretici', desc: 'TR IBAN numarası', href: '/iban-generator' },
      { label: 'Test', name: 'Kredi Kartı No', desc: 'Test kart numarası', href: '/credit-card-generator' },
    ],
  },
  en: {
    badge: '🇹🇷 TURKISH TOOLS',
    title: 'TCKN Generator',
    subtitle: 'Generate algorithm-valid Turkish National ID numbers. For software development and testing only.',
    displayLabel: 'TURKISH NATIONAL ID',
    copy: 'Copy',
    copied: 'Copied!',
    count: 'Count',
    generate: 'Generate',
    cards: [
      { title: 'Test Purpose Only', desc: 'Designed for software development and testing processes.' },
      { title: 'No Real Person', desc: 'Never belongs to a real Turkish citizen.' },
      { title: 'Legal Responsibility', desc: 'Responsibility for misuse belongs to the user.' },
    ],
    algoTitle: 'How Does the Algorithm Work?',
    algoIntro:
      'TCKN is not a random number. Each digit has a mathematical meaning; the last two digits are check digits and invalid numbers are instantly rejected by systems.',
    colDigit: 'Digit',
    colRule: 'Rule',
    rows: [
      ['1st digit', 'Always 1–9 — cannot be zero'],
      ['2nd–9th digits', 'Randomly determined between 0–9'],
      ['10th digit', '(odd position sum × 7 − even position sum) mod 10'],
      ['11th digit', 'mod 10 of the sum of first 10 digits'],
    ],
    faqTitle: 'Frequently Asked Questions',
    faq: [
      { q: 'Is generating TCKN legal?', a: 'Generating algorithm-valid TCKN for testing and development purposes is a legal activity. However, using these numbers for identity fraud or deception is prohibited and constitutes a crime.' },
      { q: 'Can a generated number belong to a real person?', a: 'Theoretically, algorithm-valid numbers may coincide with real persons. Therefore, we recommend using generated numbers only in test environments and isolated systems.' },
      { q: "Why can't the first digit be zero?", a: 'The Turkish National ID standard requires the first digit to be between 1-9. This rule was established to prevent leading zeros and potential confusion.' },
      { q: 'How many can I generate at once?', a: 'You can generate up to 50 TCKNs at once with DevOneKit. If you need more, you can generate multiple times.' },
      { q: 'Is this tool free?', a: 'Yes, completely free. No registration, membership or payment required. All tools run in your browser and none of your data is sent to our servers.' },
    ],
    relatedTitle: 'Related Tools',
    related: [
      { label: 'Turkish', name: 'VKN Generator', desc: 'Tax Identification Number', href: '/vkn-generator' },
      { label: 'Turkish', name: 'IBAN Generator', desc: 'TR IBAN number', href: '/iban-generator' },
      { label: 'Test', name: 'Credit Card No', desc: 'Test card number', href: '/credit-card-generator' },
    ],
  },
} as const

const CARD_ICONS = [FlaskConical, ShieldOff, Scale]

const sectionTitle: CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  color: 'var(--text)',
  marginBottom: '.875rem',
  paddingBottom: '.5rem',
  borderBottom: '0.5px solid var(--border)',
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
        <Plus
          size={16}
          style={{
            flexShrink: 0, marginLeft: 16,
            color: open ? 'var(--teal)' : 'var(--muted)',
            transform: open ? 'rotate(45deg)' : 'none',
            transition: 'transform .2s, color .2s',
          }}
        />
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
export default function TcknGeneratorClient() {
  const { lang } = useLanguage()
  const t = T[lang === 'en' ? 'en' : 'tr']
  const [list, setList] = useState<string[]>([genOneTCKN()])
  const [count, setCount] = useState(1)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500)
  }
  const generate = () => {
    const n = Math.min(Math.max(1, count), 50)
    setList(Array.from({ length: n }, () => genOneTCKN()))
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* HERO */}
      <section style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span
          style={{
            display: 'inline-flex', background: 'var(--teal-dim)', color: 'var(--teal)',
            fontSize: 11, padding: '3px 12px', borderRadius: 20, letterSpacing: '.04em', fontWeight: 500,
          }}
        >
          {t.badge}
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 500, margin: '.75rem 0 .5rem', color: 'var(--text)' }}>{t.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted2)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>{t.subtitle}</p>
      </section>

      {/* GENERATOR CARD */}
      <section
        style={{
          background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14,
          padding: '1.5rem', marginBottom: '1.5rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              fontSize: 10, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase',
              color: 'var(--muted)', marginBottom: '.5rem',
            }}
          >
            {t.displayLabel}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 36, fontWeight: 500, color: 'var(--teal)', letterSpacing: '.12em' }}>
              {list[0]}
            </span>
            <button
              onClick={() => copy(list[0], 'main')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, border: '0.5px solid var(--border2)',
                borderRadius: 8, padding: '6px 14px', background: 'transparent', fontSize: 12, cursor: 'pointer',
                color: copiedKey === 'main' ? 'var(--teal)' : 'var(--muted2)',
              }}
            >
              {copiedKey === 'main' ? <Check size={14} /> : <Copy size={14} />}
              {copiedKey === 'main' ? t.copied : t.copy}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--muted2)' }}>{t.count}</label>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{
              width: 64, textAlign: 'center', padding: '7px 8px', borderRadius: 8,
              border: '0.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13,
            }}
          />
          <button
            onClick={generate}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 24px', background: 'var(--teal)',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            {t.generate}
          </button>
        </div>

        {list.length > 1 && (
          <div
            style={{
              marginTop: '1rem', background: 'var(--surface2)', borderRadius: 8, padding: 12,
              fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 2, color: 'var(--text)',
            }}
          >
            {list.map((tc, i) => (
              <div
                key={i}
                onClick={() => copy(tc, `b${i}`)}
                style={{ cursor: 'pointer', color: copiedKey === `b${i}` ? 'var(--teal)' : 'var(--text)' }}
                title={t.copy}
              >
                {tc}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* INFO CARDS */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
        {t.cards.map((c, i) => {
          const Icon = CARD_ICONS[i]
          return (
            <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '1rem' }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: 8, background: 'var(--teal-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '.625rem',
                }}
              >
                <Icon size={16} style={{ color: 'var(--teal)' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          )
        })}
      </section>

      {/* ALGORITHM */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={sectionTitle}>{t.algoTitle}</h2>
        <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7, marginBottom: '1rem' }}>{t.algoIntro}</p>
        <table className="tckn-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th>{t.colDigit}</th>
              <th>{t.colRule}</th>
            </tr>
          </thead>
          <tbody>
            {t.rows.map(([digit, rule], i) => (
              <tr key={i}>
                <td className="mono-cell">{digit}</td>
                <td>{rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
              <div
                style={{
                  fontSize: 10, fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase',
                  color: 'var(--muted)', marginBottom: 4,
                }}
              >
                {r.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{r.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
