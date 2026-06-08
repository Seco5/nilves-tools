'use client'
import { useState } from 'react'

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

export default function JwtDecoder() {
  const [input, setInput] = useState('')
  const [out, setOut] = useState('')
  const [status, setStatus] = useState('')
  const [chip, setChip] = useState<'idle'|'ok'|'err'>('idle')
  const [msg, setMsg] = useState('Paste a JWT token')

  const decode = (tok: string) => {
    if (!tok.trim()) { setOut(''); setChip('idle'); setMsg('Paste a JWT token'); return }
    try {
      const parts = tok.split('.')
      if (parts.length !== 3) throw new Error('Invalid JWT format')
      const dec = (p: string) => {
        try { return JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/'))) }
        catch { throw new Error('Invalid base64 in token') }
      }
      const header = dec(parts[0]), payload = dec(parts[1])
      const exp = payload.exp ? new Date(payload.exp * 1000) : null
      const expired = exp && exp < new Date()
      setOut(`<div class="gen-card"><div class="gen-card-title">Header</div><div class="result-box" style="font-size:.75rem;cursor:default;white-space:pre">${esc(JSON.stringify(header,null,2))}</div></div><div class="gen-card"><div class="gen-card-title">Payload</div><div class="result-box" style="font-size:.75rem;cursor:default;white-space:pre">${esc(JSON.stringify(payload,null,2))}</div></div>`)
      setStatus(exp ? `Expires: ${exp.toLocaleString()} <span style="color:${expired?'var(--red)':'var(--teal2)'}">${expired?'EXPIRED':'VALID'}</span>` : 'No expiry claim')
      setChip('ok'); setMsg('JWT decoded successfully')
    } catch(e: unknown) {
      setOut(''); setChip('err'); setMsg((e as Error).message)
    }
  }

  return (
    <>
      <div className="tool-wrap">
        <div className="tool-section">
          <label className="tool-label">JWT Token</label>
          <textarea className="tool-textarea" style={{ height:80 }} placeholder="Paste JWT token here…" value={input} onChange={e => { setInput(e.target.value); decode(e.target.value) }} spellCheck={false} />
          <div style={{ marginTop:'1rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }} dangerouslySetInnerHTML={{ __html: out }} />
          <div style={{ marginTop:'.75rem', fontFamily:'var(--mono)', fontSize:'.75rem', color:'var(--muted)' }} dangerouslySetInnerHTML={{ __html: status }} />
        </div>
      </div>
      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chip==='idle'?'IDLE':chip==='ok'?'DECODED':'ERROR'}</span>
        <span>{msg}</span>
      </div>
    </>
  )
}
