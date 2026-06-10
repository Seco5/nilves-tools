'use client'
import { useState, useRef, type CSSProperties } from 'react'
import Link from 'next/link'
import { Zap, ShieldCheck, Lock, Plus } from 'lucide-react'
import { useTT } from '@/lib/toolText'
import LineNumbers from '@/components/LineNumbers'

function syntaxHL(s: string) {
  return s.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],:])/g, m => {
    const esc = (x: string) => x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    if (/^"/.test(m)) return /:$/.test(m) ? `<span class="j-key">${esc(m)}</span>` : `<span class="j-str">${esc(m)}</span>`
    if (/true|false/.test(m)) return `<span class="j-bool">${m}</span>`
    if (/null/.test(m)) return `<span class="j-null">${m}</span>`
    if (/[{}\[\]]/.test(m)) return `<span class="j-punct">${m}</span>`
    if (/[:,]/.test(m)) return `<span class="j-punct">${m}</span>`
    return `<span class="j-num">${m}</span>`
  })
}

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
function countKeys(o: unknown, n = 0): number {
  if (Array.isArray(o)) return o.reduce((a, v) => a + countKeys(v), n)
  if (o && typeof o === 'object') return Object.keys(o as object).reduce((a, k) => a + 1 + countKeys((o as Record<string,unknown>)[k]), n)
  return n
}

const SAMPLE = JSON.stringify({
  name: 'Ada Lovelace',
  age: 36,
  email: 'ada@devonekit.com',
  active: true,
  roles: ['admin', 'engineer'],
  address: { city: 'London', zip: 'NW1 7TX' },
})

// ── SEO content ────────────────────────────────────────────────────────────────
const SEO = {
  tr: {
    cards: [
      { title: 'Anında Formatlama', desc: 'Yapıştır ve anında güzel, okunabilir JSON formatı elde et.' },
      { title: 'Sözdizim Doğrulama', desc: "Geçersiz JSON'u anında tespit eder, hata satırını gösterir." },
      { title: 'Gizlilik Önce', desc: 'Verileriniz sunucuya gönderilmez, tamamen tarayıcıda çalışır.' },
    ],
    whatTitle: 'JSON Nedir?',
    what: 'JSON (JavaScript Object Notation), veri alışverişinde kullanılan hafif bir metin formatıdır. İnsan tarafından okunabilir yapısıyla API yanıtlarından yapılandırma dosyalarına kadar her yerde kullanılır. Doğru biçimlendirilmiş bir JSON dosyası hem makineler hem de geliştiriciler tarafından kolayca anlaşılabilir.',
    howTitle: 'Nasıl Kullanılır?',
    steps: [
      "Sol panele ham JSON'unuzu yapıştırın",
      '"Formatla" butonuna basın veya otomatik formatlama bekleyin',
      'Sağ panelde renkli, girintili çıktıyı görün',
      '"Kopyala" butonu ile sonucu panoya kopyalayın',
      'Küçültmek için "Küçült" butonunu kullanın',
    ],
    stepCol: 'Adım',
    actionCol: 'İşlem',
    faqTitle: 'Sık Sorulan Sorular',
    faq: [
      { q: 'JSON formatlayıcı ne işe yarar?', a: "Girintisiz veya tek satırda yazılmış JSON'u okunabilir, hiyerarşik formata dönüştürür. Aynı zamanda sözdizim hatalarını tespit eder." },
      { q: 'Verilerim güvende mi?', a: 'Evet. DevOneKit tamamen tarayıcıda çalışır. Yapıştırdığınız veriler hiçbir sunucuya gönderilmez, yalnızca kendi cihazınızda işlenir.' },
      { q: 'Geçersiz JSON nasıl düzeltilir?', a: 'Formatlayıcı hata mesajında sorunlu satırı ve hatanın açıklamasını gösterir. Yaygın hatalar: eksik tırnak işareti, fazladan virgül, kapanmayan parantez.' },
      { q: 'JSON minify ne demek?', a: "Minify, JSON'daki tüm boşluk ve satır sonlarını kaldırarak dosyayı küçültür. API isteklerinde bant genişliğini azaltmak için kullanılır." },
      { q: 'Kaç girinti seçeneği var?', a: '2 boşluk, 4 boşluk ve tab olmak üzere 3 farklı girinti seçeneği mevcuttur. Girinti seçicisinden istediğiniz formatı seçebilirsiniz.' },
    ],
    relatedTitle: 'İlgili Araçlar',
    related: [
      { label: 'Formatlayıcı', name: 'XML Formatlayıcı', desc: 'XML formatla ve doğrula', href: '/xml-formatter' },
      { label: 'Dönüştürücü', name: 'CSV ↔ JSON', desc: 'CSV ve JSON arası dönüştür', href: '/csv-json' },
      { label: 'Formatlayıcı', name: 'SQL Formatlayıcı', desc: 'SQL sorgularını formatla', href: '/sql-formatter' },
    ],
  },
  en: {
    cards: [
      { title: 'Instant Formatting', desc: 'Paste and instantly get beautiful, readable JSON format.' },
      { title: 'Syntax Validation', desc: 'Instantly detects invalid JSON and shows the error line.' },
      { title: 'Privacy First', desc: 'Your data is never sent to a server, runs entirely in browser.' },
    ],
    whatTitle: 'What is JSON?',
    what: 'JSON (JavaScript Object Notation) is a lightweight text format used for data exchange. With its human-readable structure, it is used everywhere from API responses to configuration files. A properly formatted JSON file can be easily understood by both machines and developers.',
    howTitle: 'How to Use?',
    steps: [
      'Paste your raw JSON into the left panel',
      'Press the "Format" button or wait for auto-formatting',
      'See the colored, indented output in the right panel',
      'Copy the result to clipboard with the "Copy" button',
      'Use the "Minify" button to compress',
    ],
    stepCol: 'Step',
    actionCol: 'Action',
    faqTitle: 'Frequently Asked Questions',
    faq: [
      { q: 'What does a JSON formatter do?', a: 'It converts unindented or single-line JSON into a readable, hierarchical format. It also detects syntax errors.' },
      { q: 'Is my data safe?', a: 'Yes. DevOneKit runs entirely in the browser. The data you paste is never sent to any server, it is only processed on your own device.' },
      { q: 'How to fix invalid JSON?', a: 'The formatter shows the problematic line and error description in the error message. Common errors: missing quotes, trailing commas, unclosed brackets.' },
      { q: 'What does JSON minify mean?', a: 'Minify removes all spaces and line breaks from JSON to reduce file size. Used to reduce bandwidth in API requests.' },
      { q: 'How many indent options are there?', a: 'There are 3 indent options: 2 spaces, 4 spaces and tab. You can select your preferred format from the indent selector.' },
    ],
    relatedTitle: 'Related Tools',
    related: [
      { label: 'Formatter', name: 'XML Formatter', desc: 'Format and validate XML', href: '/xml-formatter' },
      { label: 'Converter', name: 'CSV ↔ JSON', desc: 'Convert between CSV and JSON', href: '/csv-json' },
      { label: 'Formatter', name: 'SQL Formatter', desc: 'Format SQL queries', href: '/sql-formatter' },
    ],
  },
} as const

const SEO_ICONS = [Zap, ShieldCheck, Lock]

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

      {/* WHAT IS JSON */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={seoSectionTitle}>{s.whatTitle}</h2>
        <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7 }}>{s.what}</p>
      </section>

      {/* HOW TO USE */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={seoSectionTitle}>{s.howTitle}</h2>
        <table className="tckn-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr><th>{s.stepCol}</th><th>{s.actionCol}</th></tr>
          </thead>
          <tbody>
            {s.steps.map((step, i) => (
              <tr key={i}><td className="mono-cell">{i + 1}</td><td>{step}</td></tr>
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

export default function JsonFormatter() {
  const { tt, en } = useTT()
  const pasteMsg = en ? 'Paste JSON to begin' : 'Başlamak için JSON yapıştırın'
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [chip, setChip] = useState<'idle'|'ok'|'err'>('idle')
  const [chipTxt, setChipTxt] = useState<string>(en ? 'IDLE' : 'BEKLEMEDE')
  const [msg, setMsg] = useState<string>(pasteMsg)
  const [stats, setStats] = useState('')
  const [indent, setIndent] = useState('2')
  const [outLines, setOutLines] = useState(1)
  const outRef = useRef<HTMLDivElement>(null)
  const inGutter = useRef<HTMLDivElement>(null)
  const outGutter = useRef<HTMLDivElement>(null)

  const getIndent = () => indent === '1' ? '\t' : Number(indent)

  const format = (raw: string) => {
    if (!raw.trim()) {
      setOutput(''); setOutLines(1)
      setChip('idle'); setChipTxt(en ? 'IDLE' : 'BEKLEMEDE'); setMsg(pasteMsg); setStats('')
      return
    }
    try {
      const p = JSON.parse(raw)
      const fmt = JSON.stringify(p, null, getIndent())
      setOutput('<pre style="font-family:inherit;font-size:inherit;line-height:inherit;background:none;border:none;padding:0;margin:0">' + syntaxHL(esc(fmt)) + '</pre>')
      setOutLines(fmt.split('\n').length)
      setChip('ok'); setChipTxt(en ? 'VALID' : 'GEÇERLİ'); setMsg(en ? 'Valid JSON' : 'Geçerli JSON')
      setStats(fmt.split('\n').length + (en ? ' lines · ' : ' satır · ') + countKeys(p) + (en ? ' keys · ' : ' anahtar · ') + raw.length + (en ? ' chars' : ' karakter'))
    } catch(e: unknown) {
      const err = (e as Error).message
      setOutput('<span style="color:var(--red)">' + esc(err) + '</span>'); setOutLines(1)
      setChip('err'); setChipTxt(en ? 'ERROR' : 'HATA'); setMsg(err); setStats('')
    }
  }

  const handleInput = (v: string) => { setInput(v); format(v) }
  const loadSample = () => { setInput(SAMPLE); format(SAMPLE) }
  const minify = () => {
    try { const v = JSON.stringify(JSON.parse(input)); setInput(v); format(v) } catch {}
  }

  const copyOut = () => {
    const pre = outRef.current?.querySelector('pre')
    const txt = pre ? pre.textContent || '' : outRef.current?.textContent || ''
    navigator.clipboard.writeText(txt).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  const syncIn = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (inGutter.current) inGutter.current.scrollTop = e.currentTarget.scrollTop
  }
  const syncOut = (e: React.UIEvent<HTMLDivElement>) => {
    if (outGutter.current) outGutter.current.scrollTop = e.currentTarget.scrollTop
  }

  return (
    <>
      <div style={{ height: 'calc(100vh - var(--header-h))', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="split" style={{ flex: 1 }}>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">{tt.input}</span>
            <div className="btn-group">
              <select className="indent-sel" value={indent} onChange={e => { setIndent(e.target.value); format(input) }}>
                <option value="2">{en ? '2 spaces' : '2 boşluk'}</option>
                <option value="4">{en ? '4 spaces' : '4 boşluk'}</option>
                <option value="1">tab</option>
              </select>
              <button className="btn-action ghost" onClick={loadSample}>{tt.sample}</button>
              <button className="btn-action ghost" onClick={() => handleInput('')}>{tt.clear}</button>
              <button className="btn-action format" onClick={() => format(input)}>{tt.format} ↵</button>
            </div>
          </div>
          <div className="code-area">
            <LineNumbers ref={inGutter} count={input.split('\n').length} />
            <textarea
              value={input}
              onChange={e => handleInput(e.target.value)}
              onScroll={syncIn}
              placeholder={(en ? 'Paste JSON here…' : 'JSON yapıştırın…') + '\n{"name":"devonekit","version":1}'}
              spellCheck={false}
            />
          </div>
        </div>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">{tt.output}</span>
            <div className="btn-group">
              <button className="btn-action minify" onClick={minify}>{tt.minify}</button>
              <button className="btn-action copy" onClick={copyOut}>{tt.copy}</button>
            </div>
          </div>
          <div className="code-area">
            <LineNumbers ref={outGutter} count={outLines} />
            <div className="output-box" ref={outRef} onScroll={syncOut} dangerouslySetInnerHTML={{ __html: output }} />
          </div>
        </div>
      </div>
      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chipTxt}</span>
        <span>{msg}</span>
        <span style={{ marginLeft: 'auto' }}>{stats}</span>
      </div>
      </div>
      <SeoContent en={en} />
    </>
  )
}
