'use client'
import { useState, useRef } from 'react'
import type { Metadata } from 'next'

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

function toast(msg = 'Copied!') {
  navigator.clipboard.writeText(msg).catch(()=>{})
  const t = document.getElementById('__toast') as HTMLElement
  if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
}

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [chip, setChip] = useState<'idle'|'ok'|'err'>('idle')
  const [chipTxt, setChipTxt] = useState('IDLE')
  const [msg, setMsg] = useState('Paste JSON to begin')
  const [stats, setStats] = useState('')
  const [indent, setIndent] = useState('2')
  const outRef = useRef<HTMLDivElement>(null)

  const getIndent = () => indent === '1' ? '\t' : Number(indent)

  const format = (raw: string) => {
    if (!raw.trim()) {
      setOutput('')
      setChip('idle'); setChipTxt('IDLE'); setMsg('Paste JSON to begin'); setStats('')
      return
    }
    try {
      const p = JSON.parse(raw)
      const fmt = JSON.stringify(p, null, getIndent())
      setOutput('<pre style="font-family:inherit;font-size:inherit;line-height:inherit;background:none;border:none;padding:0;margin:0">' + syntaxHL(esc(fmt)) + '</pre>')
      setChip('ok'); setChipTxt('VALID'); setMsg('Valid JSON')
      setStats(fmt.split('\n').length + ' lines · ' + countKeys(p) + ' keys · ' + raw.length + ' chars')
    } catch(e: unknown) {
      const err = (e as Error).message
      setOutput('<span style="color:var(--red)">' + esc(err) + '</span>')
      setChip('err'); setChipTxt('ERROR'); setMsg(err); setStats('')
    }
  }

  const handleInput = (v: string) => { setInput(v); format(v) }

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

  return (
    <>
      <div className="split" style={{ flex: 1 }}>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">Input</span>
            <div className="btn-group">
              <select className="indent-sel" value={indent} onChange={e => { setIndent(e.target.value); format(input) }}>
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="1">tab</option>
              </select>
              <button className="btn" onClick={() => handleInput('')}>clear</button>
              <button className="btn primary" onClick={() => format(input)}>format ↵</button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => handleInput(e.target.value)}
            placeholder={'Paste JSON here…\n{"name":"nilves","version":1}'}
            spellCheck={false}
          />
        </div>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">Output</span>
            <div className="btn-group">
              <button className="btn" onClick={minify}>minify</button>
              <button className="btn" onClick={copyOut}>copy</button>
            </div>
          </div>
          <div className="output-box" ref={outRef} dangerouslySetInnerHTML={{ __html: output }} />
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
