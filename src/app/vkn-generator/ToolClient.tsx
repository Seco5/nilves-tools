'use client'
import { useState, useEffect } from 'react'

function ri(a: number, b: number) { return Math.floor(Math.random()*(b-a+1))+a }
function rdig() { return ri(0,9) }
function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
function makeCard(val: string, sub: string) {
  return `<div class="gen-card"><div class="gen-card-title">${sub}</div><div class="gen-result" onclick="navigator.clipboard.writeText(${JSON.stringify(val)}).then(()=>{const t=document.getElementById('__toast');if(t){t.textContent='Copied!';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}})"><span class="val">${esc(val)}</span><span class="copy-ic">⎘</span></div></div>`
}

function genOne() {
  const d = Array.from({length:9}, () => rdig())
  const tmp = d.map((v,i) => { const p=(v+(9-i))%10; return p!==0 ? (p*Math.pow(2,9-i))%9===0 ? 9 : (p*Math.pow(2,9-i))%9 : 0 })
  const d9 = tmp.reduce((a,b)=>a+b,0)%10
  return [...d, d9].join('')
}

export default function VknGenerator() {
  const [count, setCount] = useState(6)
  const [grid, setGrid] = useState('')

  const gen = (n = count) => {
    setGrid(Array.from({length: Math.min(50, n)}, () => makeCard(genOne(), 'Turkish Tax ID (VKN)')).join(''))
  }

  const copyAll = () => {
    const vals = [...document.querySelectorAll('#vkn-grid .val')].map(v => v.textContent).join('\n')
    navigator.clipboard.writeText(vals).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  useEffect(() => { gen() }, [])

  return (
    <>
      <div className="gen-wrap">
        <div className="gen-grid" id="vkn-grid" dangerouslySetInnerHTML={{ __html: grid }} />
        <div className="gen-count-row">
          <label className="gen-label">Count:</label>
          <input type="number" min={1} max={50} value={count} className="gen-num" onChange={e => setCount(Number(e.target.value))} />
          <button className="btn primary" onClick={() => gen()}>Generate</button>
          <button className="btn" onClick={copyAll}>Copy all</button>
        </div>
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">VKN</span>
        <span>Algorithm-valid Turkish tax ID — not real taxpayers</span>
      </div>
    </>
  )
}
