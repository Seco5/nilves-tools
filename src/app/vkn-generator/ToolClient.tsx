'use client'

import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { Copy, Check, RefreshCw, Building2, ShieldOff, Scale, Plus } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// ── Algoritma ─────────────────────────────────────────────────────────────────
function genOneVKN(): string {
  const d = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
  const tmp = d.map((v, i) => {
    const p = (v + (9 - i)) % 10
    if (p === 0) return 0
    const mod = (p * Math.pow(2, 9 - i)) % 9
    return mod === 0 ? 9 : mod
  })
  d[9] = tmp.reduce((a, b) => a + b, 0) % 10
  return d.join('')
}

// ── i18n ──────────────────────────────────────────────────────────────────────
const T = {
  tr: {
    badge: '🇹🇷 TÜRKİYE ARAÇLARI',
    title: 'VKN Üretici',
    subtitle: 'Algoritma geçerli Vergi Kimlik Numarası üretin. Yalnızca yazılım geliştirme ve test amaçlıdır.',
    displayLabel: 'VERGİ KİMLİK NUMARASI',
    copy: 'Kopyala',
    copied: 'Kopyalandı!',
    count: 'Adet',
    generate: 'Üret',
    cards: [
      { title: 'Kurumsal Test Aracı', desc: 'Muhasebe ve ERP sistemlerini test etmek için tasarlanmıştır.' },
      { title: 'Gerçek Mükellef Yok', desc: 'Hiçbir zaman gerçek bir vergi mükellefi veya şirkete ait değildir.' },
      { title: 'Yasal Sorumluluk', desc: 'Kötüye kullanımdan doğan sorumluluk kullanıcıya aittir.' },
    ],
    algoTitle: 'VKN Algoritması Nasıl Çalışır?',
    algoIntro:
      'VKN rastgele bir sayı değildir. 10 haneden oluşur ve son hane kontrol basamağıdır. Türkiye Gelir İdaresi Başkanlığı tarafından belirlenen algoritmaya göre hesaplanır.',
    colDigit: 'Hane',
    colRule: 'Kural',
    rows: [
      ['1.–9. rakam', '0–9 arası rastgele belirlenir'],
      ['10. rakam', 'GİB algoritmasına göre hesaplanan kontrol hanesi'],
    ],
    algoExplain:
      "Her rakam için (rakam + (9 − pozisyon)) mod 10 hesaplanır. Bu değer 0'dan büyükse (değer × 2^(9−pozisyon)) mod 9 alınır; 0 ise 0 kalır. Bu değerlerin toplamının mod 10'u kontrol hanesidir.",
    faqTitle: 'Sık Sorulan Sorular',
    faq: [
      { q: 'VKN üretmek yasal mı?', a: 'Test ve geliştirme amacıyla algoritma geçerli VKN üretmek yasal bir faaliyettir. Ancak bu numaraları vergi kaçakçılığı veya sahte fatura düzenlemek amacıyla kullanmak yasaktır ve ağır cezai yaptırımları vardır.' },
      { q: 'VKN ile TCKN arasındaki fark nedir?', a: "TCKN bireysel vatandaşlara ait 11 haneli kimlik numarasıdır. VKN ise şirketler dahil tüm vergi mükelleflerine ait 10 haneli numaradır. Gerçek kişiler için VKN, TCKN'den türetilir." },
      { q: 'Üretilen VKN e-fatura sisteminde çalışır mı?', a: 'Hayır. Üretilen VKN yalnızca format olarak geçerlidir. GİB sistemlerinde gerçek bir mükellef kaydı bulunmadığı için e-fatura, e-arşiv veya benzeri sistemlerde kullanılamaz.' },
      { q: "Şirket VKN'si ile bireysel VKN farkı var mı?", a: "Evet. Bireysel vergi mükelleflerinde VKN, TCKN'nin belirli hanelerinden türetilir. Tüzel kişilerde (şirketler) ise GİB tarafından bağımsız olarak atanır. Bu araç her iki format için de geçerli numara üretir." },
      { q: 'Bu araç ücretsiz mi?', a: 'Evet, tamamen ücretsizdir. Kayıt, üyelik veya ödeme gerekmez. Tüm araçlar tarayıcınızda çalışır ve hiçbir veriniz sunucularımıza gönderilmez.' },
    ],
    relatedTitle: 'İlgili Araçlar',
    related: [
      { label: 'Türkiye', name: 'TCKN Üretici', desc: 'TC Kimlik Numarası', href: '/tckn-generator' },
      { label: 'Türkiye', name: 'IBAN Üretici', desc: 'TR IBAN numarası', href: '/iban-generator' },
      { label: 'Test', name: 'Kredi Kartı No', desc: 'Test kart numarası', href: '/credit-card-generator' },
    ],
  },
  en: {
    badge: '🇹🇷 TURKISH TOOLS',
    title: 'VKN Generator',
    subtitle: 'Generate algorithm-valid Turkish Tax Identification numbers. For software development and testing only.',
    displayLabel: 'TAX IDENTIFICATION NUMBER',
    copy: 'Copy',
    copied: 'Copied!',
    count: 'Count',
    generate: 'Generate',
    cards: [
      { title: 'Corporate Test Tool', desc: 'Designed for testing accounting and ERP systems.' },
      { title: 'No Real Taxpayer', desc: 'Never belongs to a real taxpayer or company.' },
      { title: 'Legal Responsibility', desc: 'Responsibility for misuse belongs to the user.' },
    ],
    algoTitle: 'How Does the VKN Algorithm Work?',
    algoIntro:
      'VKN is not a random number. It consists of 10 digits and the last digit is a check digit, calculated according to the algorithm set by the Turkish Revenue Administration.',
    colDigit: 'Digit',
    colRule: 'Rule',
    rows: [
      ['1st–9th digits', 'Randomly determined between 0–9'],
      ['10th digit', 'Check digit calculated by Revenue Administration algorithm'],
    ],
    algoExplain:
      'For each digit, (digit + (9 − position)) mod 10 is calculated. If this value is greater than 0, (value × 2^(9−position)) mod 9 is taken; if 0, it stays 0. The mod 10 of the sum of these values is the check digit.',
    faqTitle: 'Frequently Asked Questions',
    faq: [
      { q: 'Is generating VKN legal?', a: 'Generating algorithm-valid VKN for testing and development is legal. However, using these numbers for tax evasion or issuing fake invoices is prohibited and carries severe criminal penalties.' },
      { q: 'What is the difference between VKN and TCKN?', a: 'TCKN is an 11-digit ID number for individual citizens. VKN is a 10-digit number for all taxpayers including companies. For real individuals, VKN is derived from TCKN.' },
      { q: 'Does the generated VKN work in e-invoice systems?', a: 'No. Generated VKN is only format-valid. Since there is no real taxpayer record in Revenue Administration systems, it cannot be used in e-invoice, e-archive or similar systems.' },
      { q: 'Is there a difference between company VKN and individual VKN?', a: 'Yes. For individual taxpayers, VKN is derived from specific digits of TCKN. For legal entities (companies), it is independently assigned by Revenue Administration. This tool generates valid numbers for both formats.' },
      { q: 'Is this tool free?', a: 'Yes, completely free. No registration, membership or payment required. All tools run in your browser and none of your data is sent to our servers.' },
    ],
    relatedTitle: 'Related Tools',
    related: [
      { label: 'Turkish', name: 'TCKN Generator', desc: 'Turkish National ID', href: '/tckn-generator' },
      { label: 'Turkish', name: 'IBAN Generator', desc: 'TR IBAN number', href: '/iban-generator' },
      { label: 'Test', name: 'Credit Card No', desc: 'Test card number', href: '/credit-card-generator' },
    ],
  },
} as const

const CARD_ICONS = [Building2, ShieldOff, Scale]

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
export default function VknGeneratorClient() {
  const { lang } = useLanguage()
  const t = T[lang === 'en' ? 'en' : 'tr']
  const [list, setList] = useState<string[]>([genOneVKN()])
  const [count, setCount] = useState(1)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500)
  }
  const generate = () => {
    const n = Math.min(Math.max(1, count), 50)
    setList(Array.from({ length: n }, () => genOneVKN()))
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
            {list.map((vkn, i) => (
              <div
                key={i}
                onClick={() => copy(vkn, `b${i}`)}
                style={{ cursor: 'pointer', color: copiedKey === `b${i}` ? 'var(--teal)' : 'var(--text)' }}
                title={t.copy}
              >
                {vkn}
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
        <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7, marginTop: '1rem' }}>{t.algoExplain}</p>
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
