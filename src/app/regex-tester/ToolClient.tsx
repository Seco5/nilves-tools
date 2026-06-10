'use client'
import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { Zap, Flag, Lock, Plus } from 'lucide-react'
import { useTT } from '@/lib/toolText'

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

// ── SEO content ────────────────────────────────────────────────────────────────
const SEO = {
  tr: {
    cards: [
      { title: 'Gerçek Zamanlı Test', desc: 'Yazdıkça eşleşmeler anında vurgulanır.' },
      { title: 'Flag Desteği', desc: 'g, i, m, s flaglerini serbestçe kombinleyebilirsiniz.' },
      { title: 'Gizlilik Önce', desc: 'Tamamen tarayıcıda çalışır, hiçbir veri sunucuya gönderilmez.' },
    ],
    whatTitle: 'Regex Nedir?',
    what: 'Regex (Regular Expression — Düzenli İfade), metin içinde belirli kalıpları aramak, doğrulamak veya değiştirmek için kullanılan güçlü bir desen dilidir. Form doğrulamadan log analizine, veri temizleme işlemlerinden metin dönüşümlerine kadar yazılım geliştirmenin her alanında kullanılır.',
    patTitle: 'Sık Kullanılan Regex Kalıpları',
    patCols: ['Pattern', 'Açıklama', 'Örnek'],
    patterns: [
      ['^[a-zA-Z]+$', 'Sadece harf', 'Kelimeleri doğrula'],
      ['^\\d+$', 'Sadece rakam', 'Sayı kontrolü'],
      ['^[\\w.-]+@[\\w.-]+\\.\\w{2,}$', 'E-posta formatı', 'E-posta doğrulama'],
      ['^(\\+90|0)?[0-9]{10}$', 'Türk telefon numarası', '05XX XXX XX XX'],
      ['https?:\\/\\/[^\\s]+', 'URL kalıbı', 'Link tespiti'],
      ['^\\d{4}-\\d{2}-\\d{2}$', 'ISO tarih formatı', 'YYYY-AA-GG'],
      ['^[1-9]\\d{10}$', 'TCKN formatı', 'TC kimlik doğrulama'],
      ['<[^>]+>', 'HTML etiketi', 'Tag tespiti'],
      ['^\\s+|\\s+$', 'Baştaki/sondaki boşluk', 'Trim işlemi'],
      ['[A-Z][a-z]+', 'Büyük harfle başlayan kelime', 'İsim tespiti'],
    ],
    flagTitle: 'Regex Flagleri',
    flagCols: ['Flag', 'Adı', 'Açıklama'],
    flags: [
      ['g', 'Global', 'Tüm eşleşmeleri bul, sadece ilkini değil'],
      ['i', 'Büyük/küçük harf duyarsız', "A ile a'yı aynı kabul eder"],
      ['m', 'Çok satırlı', '^ ve $ her satır başı/sonu için çalışır'],
      ['s', 'Tek satır (dotAll)', 'Nokta (.) yeni satır karakterini de eşleştirir'],
      ['u', 'Unicode', 'Unicode karakterleri tam destekler'],
    ],
    faqTitle: 'Sık Sorulan Sorular',
    faq: [
      { q: 'Regex öğrenmek zor mu?', a: "Temel kalıpları öğrenmek birkaç saat alır. DevOneKit'teki hazır kalıplar iyi bir başlangıç noktasıdır. Kalıba tıklayarak editöre yükleyip nasıl çalıştığını anlayabilirsiniz." },
      { q: 'Regex hangi dillerde çalışır?', a: 'JavaScript, Python, Java, PHP, Ruby, Go ve daha pek çok dilde regex desteği bulunur. Sözdizimi diller arasında küçük farklılıklar gösterse de temel kavramlar aynıdır. Bu araç JavaScript regex motorunu kullanır.' },
      { q: 'g flag olmadan ne olur?', a: 'g flag olmadan regex yalnızca ilk eşleşmeyi bulur ve durur. Metindeki tüm eşleşmeleri bulmak için g (global) flagini kullanmanız gerekir.' },
      { q: "Türk karakterleri (ş, ğ, ı) regex'te nasıl kullanılır?", a: 'Türk karakterleri için \\p{L} (Unicode harf) kullanabilir veya u flagini etkinleştirip [\\u0130\\u015F\\u011F] gibi Unicode kod noktalarını kullanabilirsiniz.' },
      { q: 'Bu araç ücretsiz mi?', a: 'Evet, tamamen ücretsizdir. Kayıt, üyelik veya ödeme gerekmez. Tüm araçlar tarayıcınızda çalışır ve hiçbir veriniz sunucularımıza gönderilmez.' },
    ],
    relatedTitle: 'İlgili Araçlar',
    related: [
      { label: 'Formatlayıcı', name: 'JSON Formatlayıcı', desc: 'JSON formatla ve doğrula', href: '/json-formatter' },
      { label: 'Dönüştürücü', name: 'Base64', desc: 'Encode ve decode', href: '/base64' },
      { label: 'Üretici', name: 'Hash Üretici', desc: 'MD5, SHA-256, SHA-512', href: '/hash-generator' },
    ],
  },
  en: {
    cards: [
      { title: 'Real-time Testing', desc: 'Matches are highlighted instantly as you type.' },
      { title: 'Flag Support', desc: 'Freely combine g, i, m, s flags as needed.' },
      { title: 'Privacy First', desc: 'Runs entirely in browser, no data is sent to any server.' },
    ],
    whatTitle: 'What is Regex?',
    what: 'Regex (Regular Expression) is a powerful pattern language used to search, validate or replace specific patterns in text. It is used in every area of software development, from form validation to log analysis, data cleaning to text transformation.',
    patTitle: 'Common Regex Patterns',
    patCols: ['Pattern', 'Description', 'Example'],
    patterns: [
      ['^[a-zA-Z]+$', 'Letters only', 'Validate words'],
      ['^\\d+$', 'Digits only', 'Number check'],
      ['^[\\w.-]+@[\\w.-]+\\.\\w{2,}$', 'Email format', 'Email validation'],
      ['^(\\+90|0)?[0-9]{10}$', 'Turkish phone number', '05XX XXX XX XX'],
      ['https?:\\/\\/[^\\s]+', 'URL pattern', 'Link detection'],
      ['^\\d{4}-\\d{2}-\\d{2}$', 'ISO date format', 'YYYY-MM-DD'],
      ['^[1-9]\\d{10}$', 'TCKN format', 'Turkish ID validation'],
      ['<[^>]+>', 'HTML tag', 'Tag detection'],
      ['^\\s+|\\s+$', 'Leading/trailing space', 'Trim operation'],
      ['[A-Z][a-z]+', 'Word starting with capital', 'Name detection'],
    ],
    flagTitle: 'Regex Flags',
    flagCols: ['Flag', 'Name', 'Description'],
    flags: [
      ['g', 'Global', 'Find all matches, not just the first'],
      ['i', 'Case insensitive', 'Treats A and a as the same'],
      ['m', 'Multiline', '^ and $ work for each line start/end'],
      ['s', 'Single line (dotAll)', 'Dot (.) also matches newline characters'],
      ['u', 'Unicode', 'Full Unicode character support'],
    ],
    faqTitle: 'Frequently Asked Questions',
    faq: [
      { q: 'Is regex hard to learn?', a: 'Learning basic patterns takes a few hours. The ready-made patterns in DevOneKit are a good starting point. Click a pattern to load it into the editor and understand how it works.' },
      { q: 'Which languages support regex?', a: 'JavaScript, Python, Java, PHP, Ruby, Go and many more languages have regex support. While syntax varies slightly between languages, the basic concepts are the same. This tool uses the JavaScript regex engine.' },
      { q: 'What happens without the g flag?', a: 'Without the g flag, regex finds only the first match and stops. You need to use the g (global) flag to find all matches in the text.' },
      { q: 'How to use Turkish characters (ş, ğ, ı) in regex?', a: 'For Turkish characters, you can use \\p{L} (Unicode letter) or enable the u flag and use Unicode code points like [\\u0130\\u015F\\u011F].' },
      { q: 'Is this tool free?', a: 'Yes, completely free. No registration, membership or payment required. All tools run in your browser and none of your data is sent to our servers.' },
    ],
    relatedTitle: 'Related Tools',
    related: [
      { label: 'Formatter', name: 'JSON Formatter', desc: 'Format and validate JSON', href: '/json-formatter' },
      { label: 'Converter', name: 'Base64', desc: 'Encode and decode', href: '/base64' },
      { label: 'Generator', name: 'Hash Generator', desc: 'MD5, SHA-256, SHA-512', href: '/hash-generator' },
    ],
  },
} as const

const SEO_ICONS = [Zap, Flag, Lock]

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

function SeoContent({ en, onLoadPattern }: { en: boolean; onLoadPattern: (p: string) => void }) {
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

      {/* WHAT IS REGEX */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={seoSectionTitle}>{s.whatTitle}</h2>
        <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7 }}>{s.what}</p>
      </section>

      {/* COMMON PATTERNS (clickable) */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={seoSectionTitle}>{s.patTitle}</h2>
        <table className="tckn-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>{s.patCols.map((c, i) => <th key={i}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {s.patterns.map((row, i) => (
              <tr key={i} className="regex-pat-row" style={{ cursor: 'pointer' }} onClick={() => onLoadPattern(row[0])} title={en ? 'Load into tester' : 'Test aracına yükle'}>
                <td className="mono-cell">{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FLAGS */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={seoSectionTitle}>{s.flagTitle}</h2>
        <table className="tckn-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>{s.flagCols.map((c, i) => <th key={i}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {s.flags.map((row, i) => (
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

export default function RegexTester() {
  const { en } = useTT()
  const enterPat = en ? 'Enter a pattern' : 'Bir desen girin'
  const enterTest = en ? 'Enter test string' : 'Test metni girin'
  const matchWord = (n: number) => en ? `${n} match${n!==1?'es':''}` : `${n} eşleşme`
  const [pat, setPat] = useState('')
  const [flags, setFlags] = useState('gi')
  const [text, setText] = useState('')
  const [out, setOut] = useState('')
  const [matches, setMatches] = useState('')
  const [chip, setChip] = useState<'idle'|'ok'|'err'>('idle')
  const [msg, setMsg] = useState<string>(enterPat)

  const run = (p: string, f: string, t: string) => {
    if (!p) {
      setOut(esc(t) || `<span style="color:var(--muted)">${enterTest}</span>`)
      setMatches(''); setChip('idle'); setMsg(enterPat); return
    }
    try {
      const allMatches = [...t.matchAll(new RegExp(p, 'g' + f.replace('g','')))]
      const hl = esc(t).replace(new RegExp(esc(p).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), f),
        m => `<mark style="background:rgba(29,158,117,.3);color:var(--text);border-radius:2px">${m}</mark>`)
      setOut(hl || `<span style="color:var(--muted)">${enterTest}</span>`)
      const matchTexts = allMatches.map(m => '"'+m[0]+'"').slice(0,10).join(', ')
      setMatches(allMatches.length ? matchWord(allMatches.length)+': '+matchTexts : (en ? 'No matches' : 'Eşleşme yok'))
      setChip(allMatches.length ? 'ok' : 'err')
      setMsg(matchWord(allMatches.length))
    } catch(e: unknown) {
      setChip('err'); setMsg((e as Error).message)
      setOut('<span style="color:var(--red)">' + esc((e as Error).message) + '</span>')
    }
  }

  const loadPattern = (p: string) => {
    setPat(p); run(p, flags, text)
    document.querySelector('.content')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div style={{ height: 'calc(100vh - var(--header-h))', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="tool-wrap" style={{ maxWidth: 700 }}>
        <label className="tool-label">{en ? 'Pattern' : 'Desen'}</label>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:'1rem' }}>
          <span style={{ color:'var(--muted)', fontFamily:'var(--mono)' }}>/</span>
          <input className="tool-input" style={{ flex:1 }} placeholder="[a-z]+" value={pat} onChange={e => { setPat(e.target.value); run(e.target.value, flags, text) }} />
          <span style={{ color:'var(--muted)', fontFamily:'var(--mono)' }}>/</span>
          <input className="tool-input" style={{ width:60 }} value={flags} onChange={e => { setFlags(e.target.value); run(pat, e.target.value, text) }} />
        </div>
        <label className="tool-label">{en ? 'Test string' : 'Test metni'}</label>
        <textarea className="tool-textarea" style={{ height:100, marginBottom:'1rem' }} placeholder={en ? 'Type or paste test text…' : 'Test metni yazın veya yapıştırın…'} value={text} onChange={e => { setText(e.target.value); run(pat, flags, e.target.value) }} spellCheck={false} />
        <div className="result-box" style={{ minHeight:48, fontFamily:'var(--mono)', fontSize:'.79rem', lineHeight:1.8, cursor:'default' }} dangerouslySetInnerHTML={{ __html: out || `<span style="color:var(--muted)">${enterTest}</span>` }} />
        <div style={{ marginTop:8, fontFamily:'var(--mono)', fontSize:'.72rem', color:'var(--muted)' }}>{matches}</div>
      </div>
      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chip==='idle'?(en?'IDLE':'BEKLEMEDE'):chip==='ok'?(en?'MATCH':'EŞLEŞME'):(en?'NO MATCH':'EŞLEŞME YOK')}</span>
        <span>{msg}</span>
      </div>
      </div>
      <SeoContent en={en} onLoadPattern={loadPattern} />
    </>
  )
}
