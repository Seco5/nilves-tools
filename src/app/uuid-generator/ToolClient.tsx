'use client'
import { useState, useEffect, type CSSProperties } from 'react'
import Link from 'next/link'
import { RefreshCw, Copy, Lock, Plus } from 'lucide-react'
import { useTT } from '@/lib/toolText'

function ri(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a }
const NC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
function uuidv4() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r=Math.random()*16|0; return(c==='x'?r:(r&0x3|0x8)).toString(16) }) }
function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function makeCard(val: string, sub: string) {
  const click = `navigator.clipboard.writeText(${JSON.stringify(val)}).then(()=>{const t=document.getElementById('__toast');if(t){t.textContent='Copied!';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}})`.replace(/"/g, '&quot;')
  return `<div class="gen-card"><div class="gen-card-title">${sub}</div><div class="gen-result" onclick="${click}"><span class="val">${esc(val)}</span><span class="copy-ic">⎘</span></div></div>`
}

// ── SEO content ────────────────────────────────────────────────────────────────
const SEO = {
  tr: {
    cards: [
      { title: 'Kriptografik Rastgelelik', desc: 'Web Crypto API kullanarak güvenli rastgele UUID üretir.' },
      { title: 'Anında Kopyala', desc: "Her UUID'ye tıklayarak anında panoya kopyalayın." },
      { title: 'Gizlilik Önce', desc: 'Tamamen tarayıcıda çalışır, hiçbir veri sunucuya gönderilmez.' },
    ],
    whatTitle: 'UUID Nedir?',
    what: 'UUID (Universally Unique Identifier), yazılım sistemlerinde nesneleri benzersiz şekilde tanımlamak için kullanılan 128 bitlik bir tanımlayıcıdır. 8-4-4-4-12 formatındaki 36 karakterden oluşur. Veritabanı kayıtları, API anahtarları, oturum kimlikleri ve daha pek çok alanda kullanılır.',
    verTitle: 'UUID Versiyonları',
    verCols: ['Versiyon', 'Açıklama', 'Kullanım'],
    versions: [
      ['UUID v1', 'Zaman ve MAC adresine dayalı', 'Sıralı kayıtlar'],
      ['UUID v4', 'Tamamen rastgele (en yaygın)', 'Genel amaçlı ID'],
      ['UUID v5', 'İsim tabanlı, SHA-1 hash', 'Tekrarlanabilir ID'],
      ['NanoID', 'URL-güvenli, özelleştirilebilir', 'Kısa benzersiz ID'],
      ['Short ID', '8 karakterli kısa ID', 'Okunabilir referans'],
    ],
    faqTitle: 'Sık Sorulan Sorular',
    faq: [
      { q: 'UUID v4 neden en çok tercih edilir?', a: 'UUID v4 tamamen rastgele üretilir ve zaman veya makine bilgisi içermez. Bu sayede gizlilik açısından güvenlidir ve herhangi bir ortamda çakışma riski neredeyse sıfırdır.' },
      { q: 'İki aynı UUID üretilmesi mümkün mü?', a: 'Teorik olarak mümkün ancak ihtimali astronomik düzeyde düşüktür. UUID v4 için çakışma olasılığı 1/(2^122) civarındadır. Pratikte imkânsız kabul edilir.' },
      { q: 'UUID veritabanında primary key olarak kullanılabilir mi?', a: "Evet, yaygın bir kullanım şeklidir. Ancak UUID'ler sıralı olmadığı için büyük tablolarda index performansı düşebilir. Bu durumda ULID veya sıralı UUID kullanmak daha iyi olabilir." },
      { q: 'NanoID ile UUID arasındaki fark nedir?', a: "NanoID daha kısa (varsayılan 21 karakter), URL-güvenli karakterler kullanır ve UUID'ye kıyasla daha az yer kaplar. Modern web uygulamalarında giderek daha popüler hale gelmektedir." },
      { q: 'Bu araç ücretsiz mi?', a: 'Evet, tamamen ücretsizdir. Kayıt, üyelik veya ödeme gerekmez. Tüm araçlar tarayıcınızda çalışır ve hiçbir veriniz sunucularımıza gönderilmez.' },
    ],
    relatedTitle: 'İlgili Araçlar',
    related: [
      { label: 'Üretici', name: 'Şifre Üretici', desc: 'Güçlü rastgele şifre', href: '/password-generator' },
      { label: 'Üretici', name: 'Hash Üretici', desc: 'MD5, SHA-256, SHA-512', href: '/hash-generator' },
      { label: 'Kodlayıcı', name: 'Base64', desc: 'Encode ve decode', href: '/base64' },
    ],
  },
  en: {
    cards: [
      { title: 'Cryptographic Randomness', desc: 'Generates secure random UUIDs using the Web Crypto API.' },
      { title: 'Instant Copy', desc: 'Click any UUID to instantly copy it to clipboard.' },
      { title: 'Privacy First', desc: 'Runs entirely in browser, no data is sent to any server.' },
    ],
    whatTitle: 'What is UUID?',
    what: 'UUID (Universally Unique Identifier) is a 128-bit identifier used to uniquely identify objects in software systems. It consists of 36 characters in 8-4-4-4-12 format. It is used in database records, API keys, session IDs and many more areas.',
    verTitle: 'UUID Versions',
    verCols: ['Version', 'Description', 'Use Case'],
    versions: [
      ['UUID v1', 'Based on time and MAC address', 'Sequential records'],
      ['UUID v4', 'Completely random (most common)', 'General purpose ID'],
      ['UUID v5', 'Name-based, SHA-1 hash', 'Reproducible ID'],
      ['NanoID', 'URL-safe, customizable', 'Short unique ID'],
      ['Short ID', '8-character short ID', 'Readable reference'],
    ],
    faqTitle: 'Frequently Asked Questions',
    faq: [
      { q: 'Why is UUID v4 most preferred?', a: 'UUID v4 is completely randomly generated and contains no time or machine information. This makes it privacy-safe and the risk of collision in any environment is nearly zero.' },
      { q: 'Is it possible to generate two identical UUIDs?', a: 'Theoretically possible but the probability is astronomically low. For UUID v4, the collision probability is around 1/(2^122). It is considered practically impossible.' },
      { q: 'Can UUID be used as a primary key in a database?', a: 'Yes, it\'s a common use case. However, since UUIDs are not sequential, index performance may decrease in large tables. In this case, using ULID or sequential UUID may be better.' },
      { q: 'What is the difference between NanoID and UUID?', a: 'NanoID is shorter (default 21 characters), uses URL-safe characters and takes up less space compared to UUID. It is becoming increasingly popular in modern web applications.' },
      { q: 'Is this tool free?', a: 'Yes, completely free. No registration, membership or payment required. All tools run in your browser and none of your data is sent to our servers.' },
    ],
    relatedTitle: 'Related Tools',
    related: [
      { label: 'Generator', name: 'Password Generator', desc: 'Strong random password', href: '/password-generator' },
      { label: 'Generator', name: 'Hash Generator', desc: 'MD5, SHA-256, SHA-512', href: '/hash-generator' },
      { label: 'Encoder', name: 'Base64', desc: 'Encode and decode', href: '/base64' },
    ],
  },
} as const

const SEO_ICONS = [RefreshCw, Copy, Lock]

const seoSectionTitle: CSSProperties = {
  fontSize: 16, fontWeight: 500, color: 'var(--text)',
  marginBottom: '.875rem', paddingBottom: '.5rem', borderBottom: '0.5px solid var(--border)',
}

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

function SeoContent({ en }: { en: boolean }) {
  const s = SEO[en ? 'en' : 'tr']
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem 3rem' }}>
      {/* INFO CARDS */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '2rem' }}>
        {s.cards.map((c, i) => {
          const Icon = SEO_ICONS[i]
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

      {/* WHAT IS UUID */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={seoSectionTitle}>{s.whatTitle}</h2>
        <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7 }}>{s.what}</p>
      </section>

      {/* VERSIONS TABLE */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={seoSectionTitle}>{s.verTitle}</h2>
        <table className="tckn-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>{s.verCols.map((c, i) => <th key={i}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {s.versions.map((row, i) => (
              <tr key={i}>
                <td className="mono-cell">{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={seoSectionTitle}>{s.faqTitle}</h2>
        {s.faq.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} last={i === s.faq.length - 1} />
        ))}
      </section>

      {/* RELATED */}
      <section>
        <h2 style={seoSectionTitle}>{s.relatedTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {s.related.map((r) => (
            <Link key={r.href} href={r.href} className="tckn-related-card">
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{r.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function UuidGenerator() {
  const { tt, en } = useTT()
  const [ver, setVer] = useState('4')
  const [count, setCount] = useState(8)
  const [grid, setGrid] = useState('')

  const gen = () => {
    const n = Math.min(50, count || 8)
    const generate = () => {
      if (ver === '4') return uuidv4()
      if (ver === 'nil') return '00000000-0000-0000-0000-000000000000'
      if (ver === 'short') return Math.random().toString(36).slice(2, 10)
      return Array.from({length:21}, () => NC[ri(0,63)]).join('')
    }
    setGrid(Array.from({length:n}, () => makeCard(generate(), ver.toUpperCase())).join(''))
  }

  useEffect(() => { gen() }, [])

  const copyAll = () => {
    const vals = [...document.querySelectorAll('#uuid-grid .val')].map(v => v.textContent).join('\n')
    navigator.clipboard.writeText(vals).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  return (
    <>
      <div style={{ height: 'calc(100vh - var(--header-h))', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="gen-wrap">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:'1.25rem' }}>
          <label className="gen-label">{tt.type}:</label>
          <select className="gen-sel" value={ver} onChange={e => setVer(e.target.value)}>
            <option value="4">{en ? 'UUID v4 (random)' : 'UUID v4 (rastgele)'}</option>
            <option value="nil">NIL UUID</option>
            <option value="short">{en ? 'Short ID (8 chars)' : 'Kısa ID (8 karakter)'}</option>
            <option value="nano">{en ? 'NanoID (21 chars)' : 'NanoID (21 karakter)'}</option>
          </select>
          <label className="gen-label">{tt.count}:</label>
          <input type="number" min={1} max={50} value={count} onChange={e => setCount(Number(e.target.value))} className="gen-num" />
          <button className="btn primary" onClick={gen}>{tt.generate}</button>
          <button className="btn" onClick={copyAll}>{tt.copyAll}</button>
        </div>
        <div className="gen-grid" id="uuid-grid" dangerouslySetInnerHTML={{ __html: grid }} />
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">UUID</span>
        <span>{en ? 'Cryptographically random unique identifiers' : 'Kriptografik rastgele benzersiz kimlikler'}</span>
      </div>
      </div>
      <SeoContent en={en} />
    </>
  )
}
