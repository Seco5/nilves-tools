'use client'
import { useState, useEffect } from 'react'
import { useTT } from '@/lib/toolText'

export default function Timestamp() {
  const { en } = useTT()
  const nowLbl = en ? 'Now: ' : 'Şimdi: '
  const [live, setLive] = useState('')
  const [unixIn, setUnixIn] = useState('')
  const [unixOut, setUnixOut] = useState('')
  const [dateIn, setDateIn] = useState('')
  const [dateOut, setDateOut] = useState('')

  useEffect(() => {
    const iv = setInterval(() => setLive(nowLbl + Math.floor(Date.now()/1000)), 1000)
    return () => clearInterval(iv)
  }, [])

  const tsNow = () => {
    const now = Math.floor(Date.now()/1000)
    setUnixIn(String(now))
    fromUnix(String(now))
  }

  const fromUnix = (v: string) => {
    if (!v) { setUnixOut(''); return }
    const ms = v.length > 10 ? parseInt(v) : parseInt(v)*1000
    const d = new Date(ms)
    setUnixOut(isNaN(d.getTime()) ? (en ? 'Invalid timestamp' : 'Geçersiz zaman damgası') : `${d.toUTCString()}\n${d.toLocaleString()}`)
  }

  const fromDate = (v: string) => {
    if (!v) return
    setDateOut(String(Math.floor(new Date(v).getTime()/1000)))
  }

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  return (
    <>
      <div className="tool-wrap">
        <div className="tool-section">
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:'1rem', flexWrap:'wrap' }}>
            <button className="btn primary" onClick={tsNow}>{en ? 'Now' : 'Şimdi'}</button>
            <span style={{ fontFamily:'var(--mono)', fontSize:'.75rem', color:'var(--muted2)' }}>{live}</span>
          </div>
          <label className="tool-label">{en ? 'Unix Timestamp → Date' : 'Unix Zaman Damgası → Tarih'}</label>
          <div style={{ display:'flex', gap:8, marginBottom:'1rem' }}>
            <input className="tool-input" placeholder="1700000000" value={unixIn} onChange={e => { setUnixIn(e.target.value); fromUnix(e.target.value) }} />
          </div>
          <div className="result-box" style={{ marginBottom:'1.25rem', cursor:'default', fontFamily:'var(--sans)', whiteSpace:'pre-wrap' }}>{unixOut}</div>
          <label className="tool-label">{en ? 'Date → Unix Timestamp' : 'Tarih → Unix Zaman Damgası'}</label>
          <div style={{ display:'flex', gap:8, marginBottom:'1rem' }}>
            <input className="tool-input" type="datetime-local" value={dateIn} onChange={e => { setDateIn(e.target.value); fromDate(e.target.value) }} />
          </div>
          <div className="result-box" onClick={() => copy(dateOut)}>{dateOut}</div>
        </div>
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">TIMESTAMP</span>
        <span>{en ? 'Unix ↔ human-readable date' : 'Unix ↔ okunabilir tarih'}</span>
      </div>
    </>
  )
}
