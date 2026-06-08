'use client'
import { useState, useEffect } from 'react'

function ri(a: number, b: number) { return Math.floor(Math.random()*(b-a+1))+a }
function rdig() { return ri(0,9) }
function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

const CC_PREFIXES: Record<string,string[]> = {visa:['4'],mc:['51','52','53','54','55'],amex:['34','37'],troy:['9792']}
const CC_LENS: Record<string,number> = {visa:16,mc:16,amex:15,troy:16}

function luhn(digits: string) {
  let sum=0; const n=digits.length
  for(let i=0;i<n;i++){let d=parseInt(digits[n-1-i]);if(i%2===1){d*=2;if(d>9)d-=9}sum+=d}
  return sum%10===0
}

function genOneCC(type: string) {
  const prefix = CC_PREFIXES[type][ri(0,CC_PREFIXES[type].length-1)]
  const len = CC_LENS[type]
  let digits = prefix.split('')
  while(digits.length<len-1) digits.push(String(rdig()))
  for(let c=0;c<10;c++){
    const cand=[...digits,String(c)]
    if(luhn(cand.join(''))){digits=cand;break}
  }
  return digits.join('').replace(/(\d{4})(?=\d)/g,'$1 ')
}

export default function CreditCardGenerator() {
  const [type, setType] = useState('visa')
  const [count, setCount] = useState(6)
  const [grid, setGrid] = useState('')

  const expiry = () => String(ri(1,12)).padStart(2,'0')+'/'+(new Date().getFullYear()%100+ri(1,4))

  const gen = (t = type, n = count) => {
    setGrid(Array.from({length: Math.min(20, n)}, () => {
      const no = genOneCC(t), exp = expiry(), cvv = t==='amex' ? String(ri(1000,9999)) : String(ri(100,999))
      const click = `navigator.clipboard.writeText(${JSON.stringify(no)}).then(()=>{const t=document.getElementById('__toast');if(t){t.textContent='Copied!';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}})`.replace(/"/g, '&quot;')
      return `<div class="gen-card"><div class="gen-card-title">${t.toUpperCase()}</div><div class="gen-result" onclick="${click}"><span class="val">${esc(no)}</span><span class="copy-ic">⎘</span></div><div style="display:flex;gap:12px;font-family:var(--mono);font-size:.7rem;color:var(--muted)"><span>EXP <span style="color:var(--text)">${exp}</span></span><span>CVV <span style="color:var(--text)">${cvv}</span></span></div></div>`
    }).join(''))
  }

  const copyAll = () => {
    const vals = [...document.querySelectorAll('#cc-grid .val')].map(v => v.textContent).join('\n')
    navigator.clipboard.writeText(vals).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  useEffect(() => { gen() }, [])

  return (
    <>
      <div className="gen-wrap">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:'1.25rem' }}>
          <label className="gen-label">Type:</label>
          <select className="gen-sel" value={type} onChange={e => setType(e.target.value)}>
            <option value="visa">Visa</option>
            <option value="mc">Mastercard</option>
            <option value="amex">Amex</option>
            <option value="troy">Troy</option>
          </select>
          <label className="gen-label">Count:</label>
          <input type="number" min={1} max={20} value={count} className="gen-num" onChange={e => setCount(Number(e.target.value))} />
          <button className="btn primary" onClick={() => gen()}>Generate</button>
          <button className="btn" onClick={copyAll}>Copy all</button>
        </div>
        <div className="gen-grid" id="cc-grid" dangerouslySetInnerHTML={{ __html: grid }} />
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">CC</span>
        <span>Luhn-valid test card numbers — not real cards</span>
      </div>
    </>
  )
}
