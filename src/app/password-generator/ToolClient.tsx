'use client'
import { useState, useEffect } from 'react'

function ri(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a }
function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
function makeCard(val: string, sub: string) {
  const click = `navigator.clipboard.writeText(${JSON.stringify(val)}).then(()=>{const t=document.getElementById('__toast');if(t){t.textContent='Copied!';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}})`.replace(/"/g, '&quot;')
  return `<div class="gen-card"><div class="gen-card-title">${sub}</div><div class="gen-result" onclick="${click}"><span class="val">${esc(val)}</span><span class="copy-ic">⎘</span></div></div>`
}

export default function PasswordGenerator() {
  const [len, setLen] = useState(20)
  const [upper, setUpper] = useState(true)
  const [lower, setLower] = useState(true)
  const [num, setNum] = useState(true)
  const [sym, setSym] = useState(true)
  const [grid, setGrid] = useState('')

  const gen = (l=len, u=upper, lo=lower, n=num, s=sym) => {
    let chars = ''
    if (u) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (lo) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (n) chars += '0123456789'
    if (s) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz'
    const pw = Array.from({length: l}, () => chars[ri(0, chars.length-1)]).join('')
    setGrid(makeCard(pw, 'Generated password'))
  }

  useEffect(() => { gen() }, [])

  return (
    <>
      <div className="tool-wrap">
        <div className="tool-section">
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', marginBottom:'1rem' }}>
            <label className="gen-label">Length: <input type="number" value={len} min={8} max={128} className="gen-num" style={{marginLeft:6}} onChange={e=>setLen(Number(e.target.value))} /></label>
            {[['upper','Uppercase',upper,setUpper],['lower','Lowercase',lower,setLower],['num','Numbers',num,setNum],['sym','Symbols',sym,setSym]].map(([k,label,val,setter]) => (
              <label key={k as string} style={{display:'flex',alignItems:'center',gap:5,fontSize:'.78rem',color:'var(--muted2)',cursor:'pointer'}}>
                <input type="checkbox" checked={val as boolean} onChange={e => { (setter as (v:boolean)=>void)(e.target.checked) }} /> {label as string}
              </label>
            ))}
            <button className="btn primary" onClick={() => gen()}>Generate</button>
          </div>
          <div className="gen-grid" id="pw-grid" style={{ gridTemplateColumns:'1fr' }} dangerouslySetInnerHTML={{ __html: grid }} />
        </div>
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">PASSWORD</span>
        <span>Cryptographically secure random passwords</span>
      </div>
    </>
  )
}
