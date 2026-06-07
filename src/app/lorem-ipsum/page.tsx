'use client'
import { useState, useEffect } from 'react'

function ri(a: number, b: number) { return Math.floor(Math.random() * (b-a+1)) + a }
const WORDS = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum']
function loremWords(n: number) { return Array.from({length:n},(_,i) => i===0 ? WORDS[0].charAt(0).toUpperCase()+WORDS[0].slice(1) : WORDS[ri(0,WORDS.length-1)]).join(' ') }
function loremSent() { return loremWords(ri(8,18)) + '.' }
function loremPara() { return Array.from({length:ri(4,7)}, loremSent).join(' ') }

export default function LoremIpsum() {
  const [type, setType] = useState('paragraphs')
  const [count, setCount] = useState(3)
  const [out, setOut] = useState('')

  const gen = (t=type, n=count) => {
    if (t === 'words') setOut(loremWords(n))
    else if (t === 'sentences') setOut(Array.from({length:n}, loremSent).join(' '))
    else setOut(Array.from({length:n}, loremPara).join('\n\n'))
  }

  useEffect(() => { gen() }, [])

  const copy = () => {
    navigator.clipboard.writeText(out).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  return (
    <>
      <div className="tool-wrap">
        <div className="tool-section">
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:'1rem' }}>
            <label className="gen-label">Type:</label>
            <select className="gen-sel" value={type} onChange={e => { setType(e.target.value); gen(e.target.value, count) }}>
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
            <label className="gen-label">Count:</label>
            <input type="number" className="gen-num" value={count} min={1} max={20} onChange={e => setCount(Number(e.target.value))} />
            <button className="btn primary" onClick={() => gen()}>Generate</button>
            <button className="btn" onClick={copy}>Copy</button>
          </div>
          <div className="result-box" style={{ minHeight:120, lineHeight:1.8, fontFamily:'var(--sans)', fontSize:'.84rem', cursor:'default', whiteSpace:'pre-wrap' }}>
            {out}
          </div>
        </div>
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">LOREM</span>
        <span>Classic Lorem Ipsum placeholder text</span>
      </div>
    </>
  )
}
