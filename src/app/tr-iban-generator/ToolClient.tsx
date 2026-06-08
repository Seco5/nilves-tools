'use client'
import { useState, useEffect } from 'react'

function ri(a: number, b: number) { return Math.floor(Math.random()*(b-a+1))+a }
function rdig() { return ri(0,9) }
function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
function makeCard(val: string, sub: string) {
  const click = `navigator.clipboard.writeText(${JSON.stringify(val)}).then(()=>{const t=document.getElementById('__toast');if(t){t.textContent='Copied!';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}})`.replace(/"/g, '&quot;')
  return `<div class="gen-card"><div class="gen-card-title">${sub}</div><div class="gen-result" onclick="${click}"><span class="val">${esc(val)}</span><span class="copy-ic">⎘</span></div></div>`
}

function genOne() {
  let bban = ''
  for(let i=0;i<22;i++) bban+=rdig()
  const num = 'TR'+bban
  const rearr = num.slice(2)+num.slice(0,2)
  const numeric = rearr.split('').map(c=>/[A-Z]/.test(c)?c.charCodeAt(0)-55:c).join('')
  let r = BigInt(0)
  for(const ch of numeric) r=(r*10n+BigInt(ch))%97n
  const check = String(98-Number(r)).padStart(2,'0')
  return ('TR'+check+bban).replace(/(.{4})/g,'$1 ').trim()
}

export default function IbanGenerator() {
  const [count, setCount] = useState(6)
  const [grid, setGrid] = useState('')

  const gen = (n = count) => {
    setGrid(Array.from({length: Math.min(50, n)}, (_,i) => makeCard(genOne(), 'TR IBAN '+(i+1))).join(''))
  }

  const copyAll = () => {
    const vals = [...document.querySelectorAll('#iban-grid .val')].map(v => v.textContent).join('\n')
    navigator.clipboard.writeText(vals).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  useEffect(() => { gen() }, [])

  return (
    <>
      <div className="gen-wrap">
        <div className="gen-grid" id="iban-grid" dangerouslySetInnerHTML={{ __html: grid }} />
        <div className="gen-count-row">
          <label className="gen-label">Count:</label>
          <input type="number" min={1} max={50} value={count} className="gen-num" onChange={e => setCount(Number(e.target.value))} />
          <button className="btn primary" onClick={() => gen()}>Generate</button>
          <button className="btn" onClick={copyAll}>Copy all</button>
        </div>
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">IBAN</span>
        <span>mod97-valid TR IBAN — not real accounts</span>
      </div>
    </>
  )
}
