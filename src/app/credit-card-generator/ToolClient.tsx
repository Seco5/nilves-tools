'use client'

import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import {
  Copy, Check, RefreshCw, CreditCard, Info, ShieldCheck, MonitorCheck, Ban, ChevronDown, Plus,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// ── Kart üretimi (Luhn) ───────────────────────────────────────────────────────
const CC_PREFIXES: Record<string, string[]> = { visa: ['4'], mc: ['51', '52', '53', '54', '55'], amex: ['34', '37'], troy: ['9792'] }
const CC_LENS: Record<string, number> = { visa: 16, mc: 16, amex: 15, troy: 16 }
const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a

function luhn(digits: string) {
  let sum = 0
  const n = digits.length
  for (let i = 0; i < n; i++) {
    let d = parseInt(digits[n - 1 - i])
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9 }
    sum += d
  }
  return sum % 10 === 0
}
function genOneCC(type: string): string {
  const prefix = CC_PREFIXES[type][ri(0, CC_PREFIXES[type].length - 1)]
  const len = CC_LENS[type]
  let digits = prefix.split('')
  while (digits.length < len - 1) digits.push(String(ri(0, 9)))
  for (let c = 0; c < 10; c++) {
    const cand = [...digits, String(c)]
    if (luhn(cand.join(''))) { digits = cand; break }
  }
  return digits.join('')
}
function expiry() {
  const y = (new Date().getFullYear() % 100) + ri(1, 4)
  return `${String(ri(1, 12)).padStart(2, '0')}/${y}`
}
type Card = { number: string; exp: string; cvv: string }
function genCard(type: string): Card {
  return { number: genOneCC(type), exp: expiry(), cvv: type === 'amex' ? String(ri(1000, 9999)) : String(ri(100, 999)) }
}
function fmtNumber(num: string, type: string): string {
  if (type === 'amex') return num.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
  return num.replace(/(\d{4})(?=\d)/g, '$1 ')
}

// ── Kart tipi meta ────────────────────────────────────────────────────────────
const CARD_TYPES = ['visa', 'mc', 'amex', 'troy'] as const
type CType = (typeof CARD_TYPES)[number]
const CARD_META: Record<CType, { name: string; color: string; gradient: string; len: number; prefix: string; cvv: number; intl: boolean }> = {
  visa: { name: 'Visa', color: '#1a1f71', gradient: 'linear-gradient(135deg, #1a1f71, #2c3699)', len: 16, prefix: '4', cvv: 3, intl: true },
  mc: { name: 'Mastercard', color: '#eb001b', gradient: 'linear-gradient(135deg, #1a1a1a, #eb001b)', len: 16, prefix: '51-55', cvv: 3, intl: true },
  amex: { name: 'Amex', color: '#007bc1', gradient: 'linear-gradient(135deg, #007bc1, #00498a)', len: 15, prefix: '34, 37', cvv: 4, intl: true },
  troy: { name: 'Troy', color: '#1D9E75', gradient: 'linear-gradient(135deg, #085041, #1D9E75)', len: 16, prefix: '9792', cvv: 3, intl: false },
}

// ── i18n ──────────────────────────────────────────────────────────────────────
const T = {
  tr: {
    badge: '💳 TEST ARAÇLARI',
    title: 'Kredi Kartı Numarası Üretici',
    subtitle: 'Luhn algoritmasıyla geçerli formatta test kart numarası üretin. Yalnızca yazılım geliştirme ve test amaçlıdır.',
    genTitle: 'Kart Üret', cardType: 'Kart Tipi', count: 'Adet', generate: 'Üret',
    infoTitle: 'Kart Bilgisi', length: 'Uzunluk', prefix: 'Başlangıç', cvvLen: 'CVV uzunluğu', origin: 'Köken',
    intl: 'Uluslararası', tr: 'Türkiye',
    emptyState: 'Kart tipi seçin ve Üret butonuna basın',
    copy: 'Kopyala', copied: 'Kopyalandı!', holder: 'KART SAHİBİ', testCard: 'TEST KART', expires: 'SON KUL.', cvv: 'CVV',
    cards: [
      { title: 'Luhn Algoritması', desc: 'Gerçek kartlarla aynı format doğrulamasını geçer.' },
      { title: 'Geliştirici Aracı', desc: 'Ödeme sistemleri ve form doğrulama testleri için idealdir.' },
      { title: 'Gerçek İşlem Yok', desc: 'Hiçbir bankada geçerli değildir, ödeme kabul etmez.' },
    ],
    seoHeading: 'Kredi Kartı Numarası Üretici Hakkında',
    seoIntro: 'DevOneKit Kredi Kartı Üretici, yazılım geliştiricilerin ve test uzmanlarının ödeme sistemlerini güvenli bir ortamda test etmesine yardımcı olmak amacıyla tasarlanmış ücretsiz bir araçtır.',
    acc: [
      { title: 'Luhn Algoritması ile Geçerli Formatta Numara Üretimi', body: 'Üretilen kart numaraları, gerçek kredi kartlarında kullanılan Luhn (mod 10) algoritmasını kullanır. Bu sayede numara formatı geçerlidir; ancak gerçek bir banka hesabına bağlı değildir ve herhangi bir finansal işlemde kullanılamaz.' },
      { title: 'Hangi Kart Tipleri Destekleniyor?', list: ['Visa — 4 ile başlayan 16 haneli kart numaraları', 'Mastercard — 51-55 arasıyla başlayan 16 haneli numaralar', 'American Express — 34 veya 37 ile başlayan 15 haneli numaralar', "Troy — Türkiye'ye özgü 9792 ile başlayan 16 haneli numaralar"] },
      { title: 'Kimler Kullanabilir?', list: ['Ödeme entegrasyonu geliştiren backend ve frontend geliştiriciler', 'E-ticaret sistemlerini test eden QA mühendisleri', 'Ödeme akışlarını öğrencilere anlatan eğitimciler', 'Sandbox ortamlarında form doğrulama yapan tasarımcılar', 'Stripe, Iyzico, PayTR gibi ödeme altyapılarını entegre eden ekipler'] },
    ],
    faqTitle: 'Sık Sorulan Sorular',
    faq: [
      { q: 'Bu numaralar gerçek alışverişlerde çalışır mı?', a: 'Hayır. Üretilen numaralar yalnızca format olarak geçerlidir. Gerçek bir banka hesabına bağlı olmadığı için herhangi bir ödeme işleminde çalışmaz.' },
      { q: 'CVV ve son kullanma tarihi gerçek mi?', a: 'Hayır. Tüm detaylar rastgele üretilir. Gerçek dünyada hiçbir değeri yoktur.' },
      { q: 'Stripe sandbox testlerinde kullanabilir miyim?', a: 'Hayır. Stripe ve benzeri sistemlerin kendi test kart numaraları bulunur. Stripe için 4242 4242 4242 4242 gibi özel test kartlarını kullanmanız gerekir.' },
      { q: 'Troy kartı nedir?', a: "Troy, Türkiye'nin ulusal ödeme sistemidir. Bankalararası Kart Merkezi (BKM) tarafından geliştirilmiş olup Türk bankalarının çıkardığı kartlarda yaygın olarak kullanılmaktadır." },
      { q: 'Bu araç ücretsiz mi?', a: 'Evet, tamamen ücretsizdir. Kayıt, üyelik veya ödeme gerekmez. Tüm araçlar tarayıcınızda çalışır ve hiçbir veriniz sunucularımıza gönderilmez.' },
    ],
    warning: 'Yasal Uyarı: Bu araçla üretilen tüm kart numaraları, son kullanma tarihleri ve CVV kodları tamamen rastgele oluşturulur. Gerçek bir kart sahibine, banka hesabına veya finansal kuruma ait değildir. DevOneKit bir finansal kuruluş değildir. Üretilen bilgilerin gerçek işlemlerde kullanılması yasaktır.',
    relatedTitle: 'İlgili Araçlar',
    related: [
      { name: 'TCKN Üretici', desc: 'TC Kimlik Numarası', href: '/tckn-generator' },
      { name: 'VKN Üretici', desc: 'Vergi Kimlik Numarası', href: '/vkn-generator' },
      { name: 'IBAN Üretici', desc: 'Uluslararası banka hesabı', href: '/iban-generator' },
    ],
  },
  en: {
    badge: '💳 TEST TOOLS',
    title: 'Credit Card Number Generator',
    subtitle: 'Generate test card numbers in valid format using the Luhn algorithm. For software development and testing only.',
    genTitle: 'Generate Card', cardType: 'Card Type', count: 'Count', generate: 'Generate',
    infoTitle: 'Card Info', length: 'Length', prefix: 'Prefix', cvvLen: 'CVV length', origin: 'Origin',
    intl: 'International', tr: 'Turkey',
    emptyState: 'Select card type and press Generate',
    copy: 'Copy', copied: 'Copied!', holder: 'CARD HOLDER', testCard: 'TEST CARD', expires: 'EXPIRES', cvv: 'CVV',
    cards: [
      { title: 'Luhn Algorithm', desc: 'Passes the same format validation as real cards.' },
      { title: 'Developer Tool', desc: 'Ideal for payment system and form validation testing.' },
      { title: 'No Real Transaction', desc: 'Not valid at any bank, cannot accept payments.' },
    ],
    seoHeading: 'About Credit Card Number Generator',
    seoIntro: 'DevOneKit Credit Card Generator is a free tool designed to help software developers and QA engineers test payment systems in a safe environment.',
    acc: [
      { title: 'Valid Format Numbers with Luhn Algorithm', body: 'Generated card numbers use the Luhn (mod 10) algorithm found in real credit cards. The format is valid, but the numbers are not linked to any real bank account and cannot be used in financial transactions.' },
      { title: 'Which Card Types Are Supported?', list: ['Visa — 16-digit numbers starting with 4', 'Mastercard — 16-digit numbers starting with 51-55', 'American Express — 15-digit numbers starting with 34 or 37', 'Troy — 16-digit Turkish card numbers starting with 9792'] },
      { title: 'Who Can Use This Tool?', list: ['Backend and frontend developers building payment integrations', 'QA engineers testing e-commerce systems', 'Educators teaching payment flows to students', 'Designers doing form validation in sandbox environments', 'Teams integrating payment providers like Stripe, PayTR, Iyzico'] },
    ],
    faqTitle: 'Frequently Asked Questions',
    faq: [
      { q: 'Do these numbers work for real purchases?', a: "No. Generated numbers are format-valid only. They won't work in any payment transaction since they're not linked to a real bank account." },
      { q: 'Are the CVV and expiry date real?', a: 'No. All details are randomly generated and have no real-world value.' },
      { q: 'Can I use them in Stripe sandbox tests?', a: 'No. Stripe and similar systems have their own test card numbers. For Stripe, use dedicated test cards like 4242 4242 4242 4242.' },
      { q: 'What is a Troy card?', a: "Troy is Turkey's national payment system, developed by the Interbank Card Center (BKM). It is widely used on cards issued by Turkish banks." },
      { q: 'Is this tool free?', a: 'Yes, completely free. No registration, membership or payment required. All tools run in your browser and none of your data is sent to our servers.' },
    ],
    warning: 'Legal Notice: All card numbers, expiry dates and CVV codes generated by this tool are randomly generated. They do not belong to any real cardholder, bank account or financial institution. DevOneKit is not a financial institution. Using generated information in real transactions is prohibited.',
    relatedTitle: 'Related Tools',
    related: [
      { name: 'TCKN Generator', desc: 'Turkish National ID', href: '/tckn-generator' },
      { name: 'VKN Generator', desc: 'Tax ID Number', href: '/vkn-generator' },
      { name: 'IBAN Generator', desc: 'International bank account', href: '/iban-generator' },
    ],
  },
} as const

const INFO_ICONS = [ShieldCheck, MonitorCheck, Ban]

const sectionTitle: CSSProperties = {
  fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: '.875rem',
  paddingBottom: '.5rem', borderBottom: '0.5px solid var(--border)',
}
const cardLabel: CSSProperties = {
  fontSize: 13, fontWeight: 500, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text)',
}
const fieldLabel: CSSProperties = {
  fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em',
  color: 'var(--muted)', marginBottom: 6, display: 'block',
}
const chipStyle: CSSProperties = {
  background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px',
  fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)', cursor: 'pointer',
}

// ── Accordion (text/list) ─────────────────────────────────────────────────────
function Accordion({ title, body, list, defaultOpen }: { title: string; body?: string; list?: readonly string[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '14px 0', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: 'var(--text)', background: 'none', border: 'none', textAlign: 'left' }}>
        <span>{title}</span>
        <ChevronDown size={16} style={{ flexShrink: 0, marginLeft: 16, color: open ? 'var(--teal)' : 'var(--muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .25s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7, paddingBottom: 14 }}>
            {body && <p>{body}</p>}
            {list && (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                {list.map((li, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10 }}>
                    <span style={{ marginTop: 7, width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', flexShrink: 0 }} />
                    <span>{li}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── FAQ item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a, last }: { q: string; a: string; last: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: last ? 'none' : '0.5px solid var(--border)' }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '12px 0', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text)', background: 'none', border: 'none', textAlign: 'left' }}>
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
export default function CreditCardClient() {
  const { lang } = useLanguage()
  const t = T[lang === 'en' ? 'en' : 'tr']

  const [type, setType] = useState<CType>('visa')
  const [count, setCount] = useState(1)
  const [list, setList] = useState<Card[]>([])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const meta = CARD_META[type]

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500)
  }
  const generate = () => {
    const n = Math.min(Math.max(1, count), 20)
    setList(Array.from({ length: n }, () => genCard(type)))
  }
  const single = list.length === 1 ? list[0] : null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* HERO */}
      <section style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ display: 'inline-flex', background: 'var(--teal-dim)', color: 'var(--teal)', fontSize: 11, padding: '3px 12px', borderRadius: 20, letterSpacing: '.04em', fontWeight: 500 }}>{t.badge}</span>
        <h1 style={{ fontSize: 28, fontWeight: 500, margin: '.75rem 0 .5rem', color: 'var(--text)' }}>{t.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted2)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>{t.subtitle}</p>
      </section>

      {/* MAIN — two columns */}
      <div className="iban-grid" style={{ marginBottom: '1.5rem' }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* CARD 1 — Generator */}
          <section style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
            <div style={cardLabel}><CreditCard size={16} style={{ color: 'var(--muted2)' }} /> {t.genTitle}</div>

            <label style={fieldLabel}>{t.cardType}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {CARD_TYPES.map((ct) => (
                <button key={ct} onClick={() => setType(ct)}
                  style={{ padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: type === ct ? 'none' : '0.5px solid var(--border)', background: type === ct ? 'var(--teal)' : 'transparent', color: type === ct ? '#fff' : 'var(--muted2)' }}>
                  {CARD_META[ct].name}
                </button>
              ))}
            </div>

            <label style={fieldLabel}>{t.count}</label>
            <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))}
              style={{ width: '100%', padding: '8px 11px', borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13, marginBottom: 14 }} />

            <button onClick={generate}
              style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <RefreshCw size={14} /> {t.generate}
            </button>
          </section>

          {/* CARD 2 — Card Info */}
          <section style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
            <div style={cardLabel}><Info size={16} style={{ color: 'var(--muted2)' }} /> {t.infoTitle}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: meta.color, marginBottom: 12 }}>{meta.name}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                [t.length, String(meta.len)],
                [t.prefix, meta.prefix],
                [t.cvvLen, String(meta.cvv)],
                [t.origin, meta.intl ? t.intl : t.tr],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)' }}>{k}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 1 }}>{v}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT — result */}
        <section style={{ background: list.length ? 'transparent' : 'var(--surface)', border: list.length ? 'none' : '0.5px solid var(--border)', borderRadius: 14 }}>
          {list.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <CreditCard size={48} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px', color: 'var(--text)' }} />
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{t.emptyState}</p>
            </div>
          )}

          {single && (
            <div>
              {/* Card visual */}
              <div
                onClick={() => copy(single.number, 'num')}
                style={{
                  width: '100%', aspectRatio: '1.586', borderRadius: 16, padding: '1.5rem',
                  background: meta.gradient, display: 'flex', flexDirection: 'column', cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(0,0,0,.18)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 24, color: 'rgba(255,255,255,.8)' }}>◈</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', opacity: 0.9 }}>{meta.name}</span>
                </div>
                <div style={{ marginTop: 'auto', fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 500, color: '#fff', letterSpacing: '.15em' }}>
                  {fmtNumber(single.number, type)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, opacity: 0.6, color: '#fff' }}>{t.holder}</div>
                    <div style={{ fontSize: 12, color: '#fff' }}>{t.testCard}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, opacity: 0.6, color: '#fff' }}>{t.expires}</div>
                    <div style={{ fontSize: 12, color: '#fff' }}>{single.exp}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, opacity: 0.6, color: '#fff' }}>{t.cvv}</div>
                    <div style={{ fontSize: 12, color: '#fff' }}>{single.cvv}</div>
                  </div>
                </div>
              </div>

              {/* Detail chips */}
              <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                <span style={chipStyle} onClick={() => copy(single.number, 'num')}>{copiedKey === 'num' ? '✓ ' : ''}{fmtNumber(single.number, type)}</span>
                <span style={chipStyle} onClick={() => copy(single.exp, 'exp')}>{copiedKey === 'exp' ? '✓ ' : ''}{single.exp}</span>
                <span style={chipStyle} onClick={() => copy(single.cvv, 'cvv')}>{copiedKey === 'cvv' ? '✓ ' : ''}{single.cvv}</span>
              </div>
            </div>
          )}

          {list.length > 1 && (
            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12, fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 2, color: 'var(--text)' }}>
              {list.map((c, i) => (
                <div key={i} onClick={() => copy(`${c.number}  ${c.exp}  ${c.cvv}`, `b${i}`)}
                  style={{ cursor: 'pointer', color: copiedKey === `b${i}` ? 'var(--teal)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.copy}>
                  {fmtNumber(c.number, type)} · {c.exp} · {c.cvv}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* INFO CARDS */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
        {t.cards.map((c, i) => {
          const Icon = INFO_ICONS[i]
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

      {/* SEO ACCORDION */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={sectionTitle}>{t.seoHeading}</h2>
        <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7, marginBottom: '.5rem' }}>{t.seoIntro}</p>
        {t.acc.map((a, i) => (
          <Accordion key={i} title={a.title} body={'body' in a ? a.body : undefined} list={'list' in a ? a.list : undefined} defaultOpen={i === 0} />
        ))}
        {/* FAQ as nested accordion group */}
        <div style={{ paddingTop: 4 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', margin: '14px 0 4px' }}>{t.faqTitle}</h3>
          {t.faq.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} last={i === t.faq.length - 1} />
          ))}
        </div>

        {/* Warning box */}
        <div style={{ marginTop: '1.5rem', background: 'rgba(251,191,36,0.08)', borderLeft: '3px solid #fbbf24', borderRadius: '0 8px 8px 0', padding: '12px 16px', fontSize: 12, color: 'var(--muted2)', lineHeight: 1.6 }}>
          ⚠️ {t.warning}
        </div>
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
