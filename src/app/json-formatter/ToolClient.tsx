'use client'
import { useState, useRef } from 'react'
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
    </>
  )
}
