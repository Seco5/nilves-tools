'use client'
import { useState, useEffect } from 'react'

function ri(a: number, b: number) { return Math.floor(Math.random()*(b-a+1))+a }
function rdig() { return ri(0,9) }
function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
function makeCard(val: string, sub: string) {
  const click = `navigator.clipboard.writeText(${JSON.stringify(val)}).then(()=>{const t=document.getElementById('__toast');if(t){t.textContent='Copied!';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}})`.replace(/"/g, '&quot;')
  return `<div class="gen-card"><div class="gen-card-title">${sub}</div><div class="gen-result" onclick="${click}"><span class="val">${esc(val)}</span><span class="copy-ic">⎘</span></div></div>`
}

function genOne(): string {
  const d: number[] = []
  d[0]=ri(1,9)
  for(let i=1;i<9;i++) d[i]=rdig()
  const d10=(((d[0]+d[2]+d[4]+d[6]+d[8])*7)-(d[1]+d[3]+d[5]+d[7]))%10
  if(d10<0) return genOne()
  d[9]=d10
  d[10]=(d[0]+d[1]+d[2]+d[3]+d[4]+d[5]+d[6]+d[7]+d[8]+d[9])%10
  return d.join('')
}

export default function TcknGenerator() {
  const [count, setCount] = useState(6)
  const [grid, setGrid] = useState('')

  const gen = (n = count) => {
    setGrid(Array.from({length: Math.min(50, n)}, () => makeCard(genOne(), 'Turkish National ID (TCKN)')).join(''))
  }

  const copyAll = () => {
    const vals = [...document.querySelectorAll('#tckn-grid .val')].map(v => v.textContent).join('\n')
    navigator.clipboard.writeText(vals).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  useEffect(() => { gen() }, [])

  return (
    <>
      <div className="gen-wrap">
        <div className="gen-grid" id="tckn-grid" dangerouslySetInnerHTML={{ __html: grid }} />
        <div className="gen-count-row">
          <label className="gen-label">Count:</label>
          <input type="number" min={1} max={50} value={count} className="gen-num" onChange={e => setCount(Number(e.target.value))} />
          <button className="btn primary" onClick={() => gen()}>Generate</button>
          <button className="btn" onClick={copyAll}>Copy all</button>
        </div>
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">TCKN</span>
        <span>Algorithm-valid Turkish national ID — not real persons</span>
      </div>
    </>
  )
}
