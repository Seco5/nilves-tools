'use client'
import { useState } from 'react'
import { useTT } from '@/lib/toolText'

export default function Base64() {
  const { tt, en } = useTT()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const encode = () => {
    try { setOutput(btoa(unescape(encodeURIComponent(input)))) }
    catch(e: unknown) { setOutput('Error: ' + (e as Error).message) }
  }
  const decode = () => {
    try { setOutput(decodeURIComponent(escape(atob(input.trim())))) }
    catch { setOutput('Error: Invalid Base64') }
  }
  const copy = () => {
    navigator.clipboard.writeText(output).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  return (
    <>
      <div className="split" style={{ flex: 1 }}>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">{tt.input}</span>
            <div className="btn-group">
              <button className="btn primary" onClick={encode}>{tt.encode} ↓</button>
              <button className="btn" onClick={decode}>{tt.decode} ↑</button>
            </div>
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={en ? 'Paste text or Base64…' : 'Metin veya Base64 yapıştırın…'} spellCheck={false} />
        </div>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">{tt.output}</span>
            <div className="btn-group"><button className="btn" onClick={copy}>{tt.copy}</button></div>
          </div>
          <textarea value={output} readOnly />
        </div>
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">BASE64</span>
        <span>{tt.encode} / {tt.decode}</span>
      </div>
    </>
  )
}
