'use client'
import { useState } from 'react'

export default function NumberBase() {
  const [dec, setDec] = useState('')
  const [bin, setBin] = useState('')
  const [oct, setOct] = useState('')
  const [hex, setHex] = useState('')

  const convert = (from: string, val: string) => {
    if (!val) { setDec(''); setBin(''); setOct(''); setHex(''); return }
    try {
      let n: number
      if (from==='dec') n=parseInt(val,10)
      else if (from==='bin') n=parseInt(val,2)
      else if (from==='oct') n=parseInt(val,8)
      else n=parseInt(val,16)
      if (isNaN(n)) return
      if (from!=='dec') setDec(n.toString(10))
      if (from!=='bin') setBin(n.toString(2))
      if (from!=='oct') setOct(n.toString(8))
      if (from!=='hex') setHex(n.toString(16).toUpperCase())
    } catch {}
  }

  return (
    <>
      <div className="tool-wrap">
        <div className="tool-section">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div><label className="tool-label">Decimal</label><input className="tool-input" placeholder="255" value={dec} onChange={e => { setDec(e.target.value); convert('dec',e.target.value) }} /></div>
            <div><label className="tool-label">Binary</label><input className="tool-input" placeholder="11111111" value={bin} onChange={e => { setBin(e.target.value); convert('bin',e.target.value) }} /></div>
            <div><label className="tool-label">Octal</label><input className="tool-input" placeholder="377" value={oct} onChange={e => { setOct(e.target.value); convert('oct',e.target.value) }} /></div>
            <div><label className="tool-label">Hexadecimal</label><input className="tool-input" placeholder="FF" value={hex} onChange={e => { setHex(e.target.value); convert('hex',e.target.value) }} /></div>
          </div>
        </div>
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">BASE</span>
        <span>Decimal · Binary · Octal · Hexadecimal</span>
      </div>
    </>
  )
}
