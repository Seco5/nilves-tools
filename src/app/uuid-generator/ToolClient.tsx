'use client'
import { useState, useEffect } from 'react'
import { useTT } from '@/lib/toolText'

function ri(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a }
const NC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
function uuidv4() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r=Math.random()*16|0; return(c==='x'?r:(r&0x3|0x8)).toString(16) }) }
function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function makeCard(val: string, sub: string) {
  const click = `navigator.clipboard.writeText(${JSON.stringify(val)}).then(()=>{const t=document.getElementById('__toast');if(t){t.textContent='Copied!';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}})`.replace(/"/g, '&quot;')
  return `<div class="gen-card"><div class="gen-card-title">${sub}</div><div class="gen-result" onclick="${click}"><span class="val">${esc(val)}</span><span class="copy-ic">⎘</span></div></div>`
}

export default function UuidGenerator() {
  const { tt, en } = useTT()
  const [ver, setVer] = useState('4')
  const [count, setCount] = useState(8)
  const [grid, setGrid] = useState('')

  const gen = () => {
    const n = Math.min(50, count || 8)
    const generate = () => {
      if (ver === '4') return uuidv4()
      if (ver === 'nil') return '00000000-0000-0000-0000-000000000000'
      if (ver === 'short') return Math.random().toString(36).slice(2, 10)
      return Array.from({length:21}, () => NC[ri(0,63)]).join('')
    }
    setGrid(Array.from({length:n}, () => makeCard(generate(), ver.toUpperCase())).join(''))
  }

  useEffect(() => { gen() }, [])

  const copyAll = () => {
    const vals = [...document.querySelectorAll('#uuid-grid .val')].map(v => v.textContent).join('\n')
    navigator.clipboard.writeText(vals).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  return (
    <>
      <div className="gen-wrap">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:'1.25rem' }}>
          <label className="gen-label">{tt.type}:</label>
          <select className="gen-sel" value={ver} onChange={e => setVer(e.target.value)}>
            <option value="4">{en ? 'UUID v4 (random)' : 'UUID v4 (rastgele)'}</option>
            <option value="nil">NIL UUID</option>
            <option value="short">{en ? 'Short ID (8 chars)' : 'Kısa ID (8 karakter)'}</option>
            <option value="nano">{en ? 'NanoID (21 chars)' : 'NanoID (21 karakter)'}</option>
          </select>
          <label className="gen-label">{tt.count}:</label>
          <input type="number" min={1} max={50} value={count} onChange={e => setCount(Number(e.target.value))} className="gen-num" />
          <button className="btn primary" onClick={gen}>{tt.generate}</button>
          <button className="btn" onClick={copyAll}>{tt.copyAll}</button>
        </div>
        <div className="gen-grid" id="uuid-grid" dangerouslySetInnerHTML={{ __html: grid }} />
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">UUID</span>
        <span>{en ? 'Cryptographically random unique identifiers' : 'Kriptografik rastgele benzersiz kimlikler'}</span>
      </div>
    </>
  )
}
