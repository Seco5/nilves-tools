'use client'
import { useState } from 'react'

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
function makeCard(val: string, sub: string) {
  const click = `navigator.clipboard.writeText(${JSON.stringify(val)}).then(()=>{const t=document.getElementById('__toast');if(t){t.textContent='Copied!';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}})`.replace(/"/g, '&quot;')
  return `<div class="gen-card"><div class="gen-card-title">${sub}</div><div class="gen-result" onclick="${click}"><span class="val">${esc(val)}</span><span class="copy-ic">⎘</span></div></div>`
}

async function sha(alg: string, msg: string) {
  const buf = await crypto.subtle.digest(alg, new TextEncoder().encode(msg))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('')
}

function md5(s: string) {
  function T(k: number) { return Math.floor(Math.abs(Math.sin(k+1))*4294967296) }
  let h0=0x67452301,h1=0xEFCDAB89,h2=0x98BADCFE,h3=0x10325476
  const msg2 = unescape(encodeURIComponent(s))
  const bytes: number[] = msg2.split('').map(c=>c.charCodeAt(0))
  bytes.push(0x80)
  while(bytes.length%64!==56) bytes.push(0)
  const bl = s.length*8
  bytes.push(bl&0xff,(bl>>8)&0xff,(bl>>16)&0xff,(bl>>24)&0xff,0,0,0,0)
  const S=[7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21]
  for(let i=0;i<bytes.length;i+=64){
    const M=[]
    for(let j=0;j<16;j++) M[j]=(bytes[i+j*4])|(bytes[i+j*4+1]<<8)|(bytes[i+j*4+2]<<16)|(bytes[i+j*4+3]<<24)
    let a=h0,b=h1,c=h2,d=h3
    for(let j=0;j<64;j++){
      let f,g
      if(j<16){f=(b&c)|(~b&d);g=j}else if(j<32){f=(d&b)|(~d&c);g=(5*j+1)%16}else if(j<48){f=b^c^d;g=(3*j+5)%16}else{f=c^(b|~d);g=(7*j)%16}
      const tmp=d;d=c;c=b;const x=(a+f+T(j)+M[g])>>>0;b=(b+(x<<S[j]|x>>>(32-S[j])))>>>0;a=tmp
    }
    h0=(h0+a)>>>0;h1=(h1+b)>>>0;h2=(h2+c)>>>0;h3=(h3+d)>>>0
  }
  return [h0,h1,h2,h3].map(h=>h.toString(16).padStart(8,'0').match(/../g)!.reverse().join('')).join('')
}

export default function HashGenerator() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState('')

  const compute = async (txt: string) => {
    if (!txt) { setResults(''); return }
    const [s1,s256,s512] = await Promise.all([sha('SHA-1',txt),sha('SHA-256',txt),sha('SHA-512',txt)])
    setResults([makeCard(md5(txt),'MD5'),makeCard(s1,'SHA-1'),makeCard(s256,'SHA-256'),makeCard(s512,'SHA-512')].join(''))
  }

  return (
    <>
      <div className="tool-wrap">
        <div className="tool-section">
          <label className="tool-label">Input text</label>
          <textarea className="tool-textarea" style={{ height:80 }} placeholder="Text to hash…" value={input} onChange={e => { setInput(e.target.value); compute(e.target.value) }} spellCheck={false} />
          <div className="gen-grid" style={{ marginTop:'1rem' }} dangerouslySetInnerHTML={{ __html: results }} />
        </div>
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">HASH</span>
        <span>MD5 · SHA-1 · SHA-256 · SHA-512</span>
      </div>
    </>
  )
}
