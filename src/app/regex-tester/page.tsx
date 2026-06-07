'use client'
import { useState } from 'react'

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

export default function RegexTester() {
  const [pat, setPat] = useState('')
  const [flags, setFlags] = useState('gi')
  const [text, setText] = useState('')
  const [out, setOut] = useState('')
  const [matches, setMatches] = useState('')
  const [chip, setChip] = useState<'idle'|'ok'|'err'>('idle')
  const [msg, setMsg] = useState('Enter a pattern')

  const run = (p: string, f: string, t: string) => {
    if (!p) {
      setOut(esc(t) || '<span style="color:var(--muted)">Enter test string</span>')
      setMatches(''); setChip('idle'); setMsg('Enter a pattern'); return
    }
    try {
      const rx = new RegExp(p, f)
      const allMatches = [...t.matchAll(new RegExp(p, 'g' + f.replace('g','')))]
      const hl = esc(t).replace(new RegExp(esc(p).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), f),
        m => `<mark style="background:rgba(29,158,117,.3);color:var(--text);border-radius:2px">${m}</mark>`)
      setOut(hl || '<span style="color:var(--muted)">Enter test string</span>')
      const matchTexts = allMatches.map(m => '"'+m[0]+'"').slice(0,10).join(', ')
      setMatches(allMatches.length ? allMatches.length+' match'+(allMatches.length!==1?'es':'')+': '+matchTexts : 'No matches')
      setChip(allMatches.length ? 'ok' : 'err')
      setMsg(allMatches.length+' match'+(allMatches.length!==1?'es':''))
    } catch(e: unknown) {
      setChip('err'); setMsg((e as Error).message)
      setOut('<span style="color:var(--red)">' + esc((e as Error).message) + '</span>')
    }
  }

  return (
    <>
      <div className="tool-wrap" style={{ maxWidth: 700 }}>
        <label className="tool-label">Pattern</label>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:'1rem' }}>
          <span style={{ color:'var(--muted)', fontFamily:'var(--mono)' }}>/</span>
          <input className="tool-input" style={{ flex:1 }} placeholder="[a-z]+" value={pat} onChange={e => { setPat(e.target.value); run(e.target.value, flags, text) }} />
          <span style={{ color:'var(--muted)', fontFamily:'var(--mono)' }}>/</span>
          <input className="tool-input" style={{ width:60 }} value={flags} onChange={e => { setFlags(e.target.value); run(pat, e.target.value, text) }} />
        </div>
        <label className="tool-label">Test string</label>
        <textarea className="tool-textarea" style={{ height:100, marginBottom:'1rem' }} placeholder="Type or paste test text…" value={text} onChange={e => { setText(e.target.value); run(pat, flags, e.target.value) }} spellCheck={false} />
        <div className="result-box" style={{ minHeight:48, fontFamily:'var(--mono)', fontSize:'.79rem', lineHeight:1.8, cursor:'default' }} dangerouslySetInnerHTML={{ __html: out || '<span style="color:var(--muted)">Enter test string</span>' }} />
        <div style={{ marginTop:8, fontFamily:'var(--mono)', fontSize:'.72rem', color:'var(--muted)' }}>{matches}</div>
      </div>
      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chip==='idle'?'IDLE':chip==='ok'?'MATCH':'NO MATCH'}</span>
        <span>{msg}</span>
      </div>
    </>
  )
}
