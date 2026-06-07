'use client'
import { useState, useEffect } from 'react'

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

const CRON_EX = [['* * * * *','Every minute'],['0 * * * *','Every hour'],['0 9 * * 1-5','Weekdays at 9am'],['0 0 * * *','Every midnight'],['0 0 * * 0','Every Sunday'],['*/15 * * * *','Every 15 minutes'],['0 0 1 * *','1st of month'],['0 0 1 1 *','Once a year']]

function cronDesc(p: string[]) {
  const [min,hr,dom,mon,dow] = p
  const parts: string[] = []
  if (min==='*'&&hr==='*') parts.push('Every minute')
  else if (min.startsWith('*/')&&hr==='*') parts.push(`Every ${min.slice(2)} minutes`)
  else parts.push(hr==='*' ? `At minute ${min}` : `At ${hr.padStart(2,'0')}:${min.padStart(2,'0')}`)
  if (dow!=='*') parts.push(`on ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][parseInt(dow)]||dow}`)
  if (dom!=='*') parts.push(`on day ${dom}`)
  if (mon!=='*') parts.push(`in month ${mon}`)
  return parts.join(', ')
}

export default function CronExpression() {
  const [input, setInput] = useState('')
  const [out, setOut] = useState('')
  const [fields, setFields] = useState('')
  const [chip, setChip] = useState<'idle'|'ok'|'err'>('idle')
  const [msg, setMsg] = useState('Enter a cron expression')

  const parse = (v: string) => {
    if (!v.trim()) { setOut(''); setChip('idle'); setMsg('Enter a cron expression'); return }
    const p = v.split(/\s+/)
    if (p.length !== 5) { setChip('err'); setMsg('Cron must have 5 fields'); setOut('Expected: minute hour day-of-month month day-of-week'); return }
    const labels = ['Minute','Hour','Day of month','Month','Day of week']
    const descs = ['0-59','0-23','1-31','1-12','0-7 (0=Sun)']
    setChip('ok'); setMsg('Valid expression')
    setOut(cronDesc(p))
    setFields(p.map((f,i) => `<div style="background:var(--surface);border:1px solid var(--border);border-radius:7px;padding:8px"><div style="font-size:.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">${labels[i]}</div><div style="font-family:var(--mono);font-size:.85rem;color:var(--teal2)">${esc(f)}</div><div style="font-size:.65rem;color:var(--muted)">${descs[i]}</div></div>`).join(''))
  }

  const setEx = (ex: string) => { setInput(ex); parse(ex) }

  return (
    <>
      <div className="tool-wrap">
        <div className="tool-section">
          <label className="tool-label">Cron expression</label>
          <input className="tool-input" placeholder="0 9 * * 1-5" value={input} onChange={e => { setInput(e.target.value); parse(e.target.value) }} style={{ marginBottom:'1rem', fontFamily:'var(--mono)', fontSize:'.9rem' }} />
          <div className="result-box" style={{ fontFamily:'var(--sans)', fontSize:'.88rem', cursor:'default', marginBottom:'1rem' }}>{out}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, fontFamily:'var(--mono)', fontSize:'.7rem' }} dangerouslySetInnerHTML={{ __html: fields }} />
          <div style={{ marginTop:'1rem' }}>
            <div className="gen-label" style={{ marginBottom:'.5rem' }}>Common examples</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {CRON_EX.map(([ex,desc]) => (
                <div key={ex} className="sql-tip" onClick={() => setEx(ex)} title={desc}>{ex}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chip==='idle'?'IDLE':chip==='ok'?'OK':'ERROR'}</span>
        <span>{msg}</span>
      </div>
    </>
  )
}
