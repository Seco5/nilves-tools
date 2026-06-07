'use client'
import { useState } from 'react'

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

type DiffLine = { t: 'same'|'add'|'del'; s: string; la?: number; lb?: number }

function lcsD(a: string[], b: string[]): DiffLine[] {
  const m = a.length, n = b.length
  const dp: number[][] = []
  for (let i = 0; i <= m; i++) { dp[i] = []; for (let j = 0; j <= n; j++) dp[i][j] = 0 }
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1])
  const r: DiffLine[] = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i-1] === b[j-1]) { r.unshift({t:'same',s:a[i-1],la:i,lb:j}); i--; j-- }
    else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) { r.unshift({t:'add',s:b[j-1],lb:j}); j-- }
    else { r.unshift({t:'del',s:a[i-1],la:i}); i-- }
  }
  return r
}

function renderDiff(diff: DiffLine[], showCtx: boolean) {
  const CTX = 3, n = diff.length
  const show = new Array(n).fill(false)
  if (showCtx) diff.forEach((d,i) => { if (d.t !== 'same') for (let k = Math.max(0,i-CTX); k <= Math.min(n-1,i+CTX); k++) show[k] = true })
  else diff.forEach((d,i) => { if (d.t !== 'same') show[i] = true })
  let html = '', last = -1
  diff.forEach((d,i) => {
    if (!show[i]) return
    if (last >= 0 && i-last > 1) html += `<div class="diff-sep">@@ ${i-last-1} lines skipped @@</div>`
    last = i
    const sign = d.t==='add' ? '+' : d.t==='del' ? '−' : ' '
    const cls = d.t==='add' ? 'line-add' : d.t==='del' ? 'line-del' : 'line-same'
    html += `<div class="diff-line ${cls}"><span class="diff-lnum">${d.la||d.lb||''}</span><span class="diff-sign">${sign}</span><span class="diff-text">${esc(d.s)}</span></div>`
  })
  if (!html) html = '<div style="padding:1.5rem;text-align:center;color:var(--muted);font-family:var(--mono);font-size:.77rem">No differences — files are identical</div>'
  return html
}

export default function DiffChecker() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [showCtx, setShowCtx] = useState(true)
  const [chip, setChip] = useState<'idle'|'ok'|'err'>('idle')
  const [chipTxt, setChipTxt] = useState('IDLE')
  const [msg, setMsg] = useState('Paste text in both panels')
  const [diffHtml, setDiffHtml] = useState('')
  const [statsHtml, setStatsHtml] = useState('')
  const [show, setShow] = useState(false)

  const run = (av: string, bv: string, ctx: boolean) => {
    if (!av && !bv) { setShow(false); setChip('idle'); setChipTxt('IDLE'); setMsg('Paste text in both panels'); return }
    setShow(true)
    const la = av.split('\n'), lb = bv.split('\n')
    const diff = lcsD(la, lb)
    setDiffHtml(renderDiff(diff, ctx))
    const adds = diff.filter(d=>d.t==='add').length, dels = diff.filter(d=>d.t==='del').length, same = diff.filter(d=>d.t==='same').length
    setStatsHtml(`<span style="color:var(--teal2)">+${adds}</span><span style="color:var(--red)">−${dels}</span><span style="color:var(--muted)">${same} same</span>`)
    setChip(adds||dels ? 'err' : 'ok')
    setChipTxt(adds||dels ? 'CHANGES' : 'IDENTICAL')
    setMsg(adds||dels ? (adds+dels)+' changed lines' : 'Files are identical')
  }

  const handleA = (v: string) => { setA(v); run(v, b, showCtx) }
  const handleB = (v: string) => { setB(v); run(a, v, showCtx) }
  const toggleCtx = () => { const c = !showCtx; setShowCtx(c); run(a, b, c) }

  const copyDiff = () => {
    const el = document.getElementById('diff-body')
    navigator.clipboard.writeText(el?.innerText || '').then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  return (
    <>
      <div className="split" style={{ flex: '0 0 45%', minHeight: 0 }}>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">Original</span>
            <div className="btn-group"><button className="btn" onClick={() => handleA('')}>clear</button></div>
          </div>
          <textarea value={a} onChange={e => handleA(e.target.value)} placeholder="Paste original text…" spellCheck={false} />
        </div>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">Modified</span>
            <div className="btn-group"><button className="btn" onClick={() => handleB('')}>clear</button></div>
          </div>
          <textarea value={b} onChange={e => handleB(e.target.value)} placeholder="Paste modified text…" spellCheck={false} />
        </div>
      </div>
      <div className={`diff-result${show ? ' show' : ''}`}>
        <div className="pane-hdr">
          <span className="pane-label">Diff</span>
          <div id="diff-stats" style={{ display: 'flex', gap: 10, fontFamily: 'var(--mono)', fontSize: '.68rem', marginLeft: 10 }} dangerouslySetInnerHTML={{ __html: statsHtml }} />
          <div className="btn-group">
            <button className="btn" onClick={toggleCtx}>{showCtx ? 'hide unchanged' : 'show all'}</button>
            <button className="btn" onClick={copyDiff}>copy patch</button>
          </div>
        </div>
        <div className="diff-body" id="diff-body" dangerouslySetInnerHTML={{ __html: diffHtml }} />
      </div>
      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chipTxt}</span>
        <span>{msg}</span>
      </div>
    </>
  )
}
