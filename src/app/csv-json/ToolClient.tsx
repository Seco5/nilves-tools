'use client'
import { useState } from 'react'

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
function syntaxHL(s: string) {
  return s.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],:])/g, m => {
    if (/^"/.test(m)) return /:$/.test(m) ? `<span class="j-key">${esc(m)}</span>` : `<span class="j-str">${esc(m)}</span>`
    if (/true|false/.test(m)) return `<span class="j-bool">${m}</span>`
    if (/null/.test(m)) return `<span class="j-null">${m}</span>`
    if (/[{}\[\]]/.test(m)) return `<span class="j-punct">${m}</span>`
    if (/[:,]/.test(m)) return `<span class="j-punct">${m}</span>`
    return `<span class="j-num">${m}</span>`
  })
}

export default function CsvJson() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [chip, setChip] = useState<'idle'|'ok'|'err'>('idle')
  const [msg, setMsg] = useState('Choose a conversion direction')

  const copyOut = () => {
    const el = document.getElementById('csv-out')
    navigator.clipboard.writeText(el?.textContent || '').then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  const csvToJson = () => {
    const raw = input.trim()
    if (!raw) { setMsg('Paste CSV first'); return }
    try {
      const lines = raw.split('\n').filter(l => l.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,''))
      const rows = lines.slice(1).map(l => {
        const vals = l.split(',').map(v => v.trim().replace(/^"|"$/g,''))
        const obj: Record<string,string> = {}
        headers.forEach((h,i) => obj[h] = vals[i] ?? '')
        return obj
      })
      const out = JSON.stringify(rows, null, 2)
      setOutput('<pre style="font-family:inherit;font-size:inherit;line-height:inherit;background:none;border:none;padding:0;margin:0">' + syntaxHL(esc(out)) + '</pre>')
      setChip('ok'); setMsg(rows.length + ' rows converted')
    } catch(e: unknown) { setChip('err'); setMsg((e as Error).message) }
  }

  const jsonToCsv = () => {
    try {
      const data = JSON.parse(input)
      if (!Array.isArray(data)) { setMsg('Input must be a JSON array'); return }
      const headers = Object.keys(data[0])
      const csv = [headers.join(','), ...data.map((r: Record<string,unknown>) => headers.map(h => `"${String(r[h]??'').replace(/"/g,'""')}"`).join(','))].join('\n')
      setOutput('<span style="white-space:pre;display:block">' + esc(csv) + '</span>')
      setChip('ok'); setMsg(data.length + ' rows converted')
    } catch(e: unknown) { setChip('err'); setMsg((e as Error).message) }
  }

  return (
    <>
      <div className="split" style={{ flex: 1 }}>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">Input</span>
            <div className="btn-group">
              <button className="btn primary" onClick={csvToJson}>CSV → JSON</button>
              <button className="btn" onClick={jsonToCsv}>JSON → CSV</button>
            </div>
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste CSV or JSON here…" spellCheck={false} />
        </div>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">Output</span>
            <div className="btn-group"><button className="btn" onClick={copyOut}>copy</button></div>
          </div>
          <div className="output-box" id="csv-out" dangerouslySetInnerHTML={{ __html: output }} />
        </div>
      </div>
      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chip === 'idle' ? 'IDLE' : chip === 'ok' ? 'OK' : 'ERROR'}</span>
        <span>{msg}</span>
      </div>
    </>
  )
}
