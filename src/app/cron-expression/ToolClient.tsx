'use client'
import { useState, useEffect } from 'react'
import { useTT } from '@/lib/toolText'

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

const CRON_EX_EN = [['* * * * *','Every minute'],['0 * * * *','Every hour'],['0 9 * * 1-5','Weekdays at 9am'],['0 0 * * *','Every midnight'],['0 0 * * 0','Every Sunday'],['*/15 * * * *','Every 15 minutes'],['0 0 1 * *','1st of month'],['0 0 1 1 *','Once a year']]
const CRON_EX_TR = [['* * * * *','Her dakika'],['0 * * * *','Her saat'],['0 9 * * 1-5','Hafta içi 09:00'],['0 0 * * *','Her gece yarısı'],['0 0 * * 0','Her Pazar'],['*/15 * * * *','15 dakikada bir'],['0 0 1 * *','Ayın 1’i'],['0 0 1 1 *','Yılda bir']]

function cronDesc(p: string[], en: boolean) {
  const [min,hr,dom,mon,dow] = p
  const parts: string[] = []
  const days = en ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] : ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt']
  if (min==='*'&&hr==='*') parts.push(en ? 'Every minute' : 'Her dakika')
  else if (min.startsWith('*/')&&hr==='*') parts.push(en ? `Every ${min.slice(2)} minutes` : `${min.slice(2)} dakikada bir`)
  else parts.push(hr==='*' ? (en ? `At minute ${min}` : `${min}. dakikada`) : `${en ? 'At ' : ''}${hr.padStart(2,'0')}:${min.padStart(2,'0')}`)
  if (dow!=='*') parts.push((en ? 'on ' : '') + (days[parseInt(dow)]||dow) + (en ? '' : ' günü'))
  if (dom!=='*') parts.push(en ? `on day ${dom}` : `ayın ${dom}. günü`)
  if (mon!=='*') parts.push(en ? `in month ${mon}` : `${mon}. ayda`)
  return parts.join(', ')
}

export default function CronExpression() {
  const { en } = useTT()
  const CRON_EX = en ? CRON_EX_EN : CRON_EX_TR
  const enterMsg = en ? 'Enter a cron expression' : 'Bir cron ifadesi girin'
  const [input, setInput] = useState('')
  const [out, setOut] = useState('')
  const [fields, setFields] = useState('')
  const [chip, setChip] = useState<'idle'|'ok'|'err'>('idle')
  const [msg, setMsg] = useState<string>(enterMsg)

  const parse = (v: string) => {
    if (!v.trim()) { setOut(''); setChip('idle'); setMsg(enterMsg); return }
    const p = v.split(/\s+/)
    if (p.length !== 5) { setChip('err'); setMsg(en ? 'Cron must have 5 fields' : 'Cron 5 alandan oluşmalı'); setOut(en ? 'Expected: minute hour day-of-month month day-of-week' : 'Beklenen: dakika saat ayın-günü ay haftanın-günü'); return }
    const labels = en ? ['Minute','Hour','Day of month','Month','Day of week'] : ['Dakika','Saat','Ayın günü','Ay','Haftanın günü']
    const descs = en ? ['0-59','0-23','1-31','1-12','0-7 (0=Sun)'] : ['0-59','0-23','1-31','1-12','0-7 (0=Paz)']
    setChip('ok'); setMsg(en ? 'Valid expression' : 'Geçerli ifade')
    setOut(cronDesc(p, en))
    setFields(p.map((f,i) => `<div style="background:var(--surface);border:1px solid var(--border);border-radius:7px;padding:8px"><div style="font-size:.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">${labels[i]}</div><div style="font-family:var(--mono);font-size:.85rem;color:var(--teal2)">${esc(f)}</div><div style="font-size:.65rem;color:var(--muted)">${descs[i]}</div></div>`).join(''))
  }

  const setEx = (ex: string) => { setInput(ex); parse(ex) }

  return (
    <>
      <div className="tool-wrap">
        <div className="tool-section">
          <label className="tool-label">{en ? 'Cron expression' : 'Cron ifadesi'}</label>
          <input className="tool-input" placeholder="0 9 * * 1-5" value={input} onChange={e => { setInput(e.target.value); parse(e.target.value) }} style={{ marginBottom:'1rem', fontFamily:'var(--mono)', fontSize:'.9rem' }} />
          <div className="result-box" style={{ fontFamily:'var(--sans)', fontSize:'.88rem', cursor:'default', marginBottom:'1rem' }}>{out}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, fontFamily:'var(--mono)', fontSize:'.7rem' }} dangerouslySetInnerHTML={{ __html: fields }} />
          <div style={{ marginTop:'1rem' }}>
            <div className="gen-label" style={{ marginBottom:'.5rem' }}>{en ? 'Common examples' : 'Sık kullanılan örnekler'}</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {CRON_EX.map(([ex,desc]) => (
                <div key={ex} className="sql-tip" onClick={() => setEx(ex)} title={desc}>{ex}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chip==='idle'?(en?'IDLE':'BEKLEMEDE'):chip==='ok'?(en?'OK':'TAMAM'):(en?'ERROR':'HATA')}</span>
        <span>{msg}</span>
      </div>
    </>
  )
}
