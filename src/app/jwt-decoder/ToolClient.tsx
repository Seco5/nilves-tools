'use client'
import { useState } from 'react'
import { useTT } from '@/lib/toolText'

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

export default function JwtDecoder() {
  const { en } = useTT()
  const pasteMsg = en ? 'Paste a JWT token' : 'Bir JWT token yapıştırın'
  const [input, setInput] = useState('')
  const [out, setOut] = useState('')
  const [status, setStatus] = useState('')
  const [chip, setChip] = useState<'idle'|'ok'|'err'>('idle')
  const [msg, setMsg] = useState<string>(pasteMsg)

  const decode = (tok: string) => {
    if (!tok.trim()) { setOut(''); setChip('idle'); setMsg(pasteMsg); return }
    try {
      const parts = tok.split('.')
      if (parts.length !== 3) throw new Error(en ? 'Invalid JWT format' : 'Geçersiz JWT formatı')
      const dec = (p: string) => {
        try { return JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/'))) }
        catch { throw new Error(en ? 'Invalid base64 in token' : 'Token içinde geçersiz base64') }
      }
      const header = dec(parts[0]), payload = dec(parts[1])
      const exp = payload.exp ? new Date(payload.exp * 1000) : null
      const expired = exp && exp < new Date()
      setOut(`<div class="gen-card"><div class="gen-card-title">Header</div><div class="result-box" style="font-size:.75rem;cursor:default;white-space:pre">${esc(JSON.stringify(header,null,2))}</div></div><div class="gen-card"><div class="gen-card-title">Payload</div><div class="result-box" style="font-size:.75rem;cursor:default;white-space:pre">${esc(JSON.stringify(payload,null,2))}</div></div>`)
      setStatus(exp ? `${en ? 'Expires' : 'Bitiş'}: ${exp.toLocaleString()} <span style="color:${expired?'var(--red)':'var(--teal2)'}">${expired?(en?'EXPIRED':'SÜRESİ DOLMUŞ'):(en?'VALID':'GEÇERLİ')}</span>` : (en ? 'No expiry claim' : 'Bitiş tarihi yok'))
      setChip('ok'); setMsg(en ? 'JWT decoded successfully' : 'JWT başarıyla çözüldü')
    } catch(e: unknown) {
      setOut(''); setChip('err'); setMsg((e as Error).message)
    }
  }

  return (
    <>
      <div className="tool-wrap">
        <div className="tool-section">
          <label className="tool-label">{en ? 'JWT Token' : 'JWT Token'}</label>
          <textarea className="tool-textarea" style={{ height:80 }} placeholder={en ? 'Paste JWT token here…' : 'JWT token’ı buraya yapıştırın…'} value={input} onChange={e => { setInput(e.target.value); decode(e.target.value) }} spellCheck={false} />
          <div style={{ marginTop:'1rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }} dangerouslySetInnerHTML={{ __html: out }} />
          <div style={{ marginTop:'.75rem', fontFamily:'var(--mono)', fontSize:'.75rem', color:'var(--muted)' }} dangerouslySetInnerHTML={{ __html: status }} />
        </div>
      </div>
      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chip==='idle'?(en?'IDLE':'BEKLEMEDE'):chip==='ok'?(en?'DECODED':'ÇÖZÜLDÜ'):(en?'ERROR':'HATA')}</span>
        <span>{msg}</span>
      </div>
    </>
  )
}
