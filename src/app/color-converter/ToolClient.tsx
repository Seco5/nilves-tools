'use client'
import { useState, useEffect } from 'react'
import { useTT } from '@/lib/toolText'

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
function makeCard(val: string, sub: string) {
  const click = `navigator.clipboard.writeText(${JSON.stringify(val)}).then(()=>{const t=document.getElementById('__toast');if(t){t.textContent='Copied!';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}})`.replace(/"/g, '&quot;')
  return `<div class="gen-card"><div class="gen-card-title">${sub}</div><div class="gen-result" onclick="${click}"><span class="val">${esc(val)}</span><span class="copy-ic">⎘</span></div></div>`
}

function hexToRgb(hex: string) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16)
  return {r,g,b}
}
function rgbToHsl(r: number, g: number, b: number) {
  r/=255;g/=255;b/=255
  const max=Math.max(r,g,b),min=Math.min(r,g,b)
  let h=0,s=0
  const l=(max+min)/2
  if(max!==min){
    const d=max-min
    s=l>.5?d/(2-max-min):d/(max+min)
    switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4}
    h/=6
  }
  return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)}
}

export default function ColorConverter() {
  const { en } = useTT()
  const [hex, setHex] = useState('#1D9E75')
  const [pickerVal, setPickerVal] = useState('#1D9E75')
  const [out, setOut] = useState('')
  const [swatch, setSwatch] = useState('#1D9E75')

  const convert = (h: string) => {
    let val = h.trim()
    if (!val.startsWith('#')) val = '#' + val
    if (!/^#[0-9a-fA-F]{6}$/.test(val)) { setOut(`<div style="color:var(--red);font-size:.78rem">${en ? 'Invalid hex color' : 'Geçersiz hex renk'}</div>`); return }
    setSwatch(val)
    const {r,g,b} = hexToRgb(val)
    const {h: hh,s,l} = rgbToHsl(r,g,b)
    setOut([makeCard(val.toUpperCase(),'HEX'),makeCard(`rgb(${r}, ${g}, ${b})`,'RGB'),makeCard(`hsl(${hh}, ${s}%, ${l}%)`,'HSL'),makeCard(`rgba(${r}, ${g}, ${b}, 1)`,'RGBA')].join(''))
  }

  useEffect(() => { convert('#1D9E75') }, [])

  return (
    <>
      <div className="tool-wrap">
        <div className="tool-section">
          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:'1rem', flexWrap:'wrap' }}>
            <input type="color" value={pickerVal} onChange={e => { setPickerVal(e.target.value); setHex(e.target.value); convert(e.target.value) }} style={{ width:44, height:36, border:'1px solid var(--border2)', borderRadius:6, background:'none', cursor:'pointer', padding:2 }} />
            <input className="tool-input" style={{ width:130 }} placeholder="#1D9E75" value={hex} onChange={e => setHex(e.target.value)} />
            <button className="btn primary" onClick={() => convert(hex)}>{en ? 'Convert' : 'Dönüştür'}</button>
          </div>
          <div className="gen-grid" dangerouslySetInnerHTML={{ __html: out }} />
          <div style={{ marginTop:'1rem', height:60, borderRadius:10, border:'1px solid var(--border)', background: swatch, transition:'background .2s' }} />
        </div>
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">COLOR</span>
        <span>HEX · RGB · HSL · RGBA</span>
      </div>
    </>
  )
}
