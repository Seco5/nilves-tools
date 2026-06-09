'use client'
import { useState, useEffect } from 'react'

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function toast(msg = 'Copied!') {
  const t = document.getElementById('__toast') as HTMLElement | null
  if (t) { t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
}

/* ─── Line-level LCS diff ────────────────────────────────────── */
type DiffLine = { t: 'same'|'add'|'del'; s: string; la?: number; lb?: number }

function lcsLines(a: string[], b: string[]): DiffLine[] {
  const m = a.length, n = b.length
  const dp: number[][] = []
  for (let i = 0; i <= m; i++) { dp[i] = new Array(n + 1).fill(0) }
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

/* ─── Character-level intra-line diff ────────────────────────── */
function charDiff(a: string, b: string): { left: string; right: string } {
  const m = a.length, n = b.length
  if (m * n > 40000) {
    return { left: `<span class="dc-del">${esc(a)}</span>`, right: `<span class="dc-add">${esc(b)}</span>` }
  }
  const dp: number[][] = []
  for (let i = 0; i <= m; i++) dp[i] = new Array(n + 1).fill(0)
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1])
  type Op = { t: 'eq'|'del'|'add'; ch: string }
  const ops: Op[] = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i-1] === b[j-1]) { ops.unshift({t:'eq',ch:a[i-1]}); i--; j-- }
    else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) { ops.unshift({t:'add',ch:b[j-1]}); j-- }
    else { ops.unshift({t:'del',ch:a[i-1]}); i-- }
  }
  let left = '', right = '', k = 0
  while (k < ops.length) {
    const t = ops[k].t
    let s = ''
    while (k < ops.length && ops[k].t === t) { s += ops[k].ch; k++ }
    const e = esc(s)
    if (t === 'eq') { left += e; right += e }
    else if (t === 'del') left += `<span class="dc-del">${e}</span>`
    else right += `<span class="dc-add">${e}</span>`
  }
  return { left, right }
}

/* ─── Align line diff into side-by-side rows ─────────────────── */
type Cell = { num: number; html: string; type: 'same'|'del'|'add' } | null
type Row = { left: Cell; right: Cell; changed: boolean }

function buildRows(diff: DiffLine[]): Row[] {
  const rows: Row[] = []
  let pendDel: DiffLine[] = [], pendAdd: DiffLine[] = []
  const flush = () => {
    const max = Math.max(pendDel.length, pendAdd.length)
    for (let k = 0; k < max; k++) {
      const d = pendDel[k], ad = pendAdd[k]
      if (d && ad) {
        const { left, right } = charDiff(d.s, ad.s)
        rows.push({ left: { num: d.la!, html: left, type: 'del' }, right: { num: ad.lb!, html: right, type: 'add' }, changed: true })
      } else if (d) {
        rows.push({ left: { num: d.la!, html: esc(d.s), type: 'del' }, right: null, changed: true })
      } else {
        rows.push({ left: null, right: { num: ad.lb!, html: esc(ad.s), type: 'add' }, changed: true })
      }
    }
    pendDel = []; pendAdd = []
  }
  diff.forEach(d => {
    if (d.t === 'del') pendDel.push(d)
    else if (d.t === 'add') pendAdd.push(d)
    else { flush(); rows.push({ left: { num: d.la!, html: esc(d.s), type: 'same' }, right: { num: d.lb!, html: esc(d.s), type: 'same' }, changed: false }) }
  })
  flush()
  return rows
}

function renderCell(cell: Cell, side: 'left'|'right') {
  if (!cell) return `<div class="dc-cell ${side} empty"></div>`
  return `<div class="dc-cell ${side} ${cell.type}"><span class="dc-num">${cell.num}</span><span class="dc-code">${cell.html || ' '}</span></div>`
}

function renderRows(rows: Row[], showCtx: boolean): string {
  const CTX = 3, n = rows.length
  const show = new Array(n).fill(showCtx)
  if (!showCtx) {
    rows.forEach((r, i) => {
      if (r.changed) for (let k = Math.max(0,i-CTX); k <= Math.min(n-1,i+CTX); k++) show[k] = true
    })
  }
  let html = '', last = -1
  rows.forEach((r, i) => {
    if (!show[i]) return
    if (last >= 0 && i-last > 1) html += `<div class="dc-sep">⋯ ${i-last-1} unchanged lines hidden ⋯</div>`
    last = i
    html += `<div class="dc-row">${renderCell(r.left,'left')}${renderCell(r.right,'right')}</div>`
  })
  if (!html) html = '<div class="dc-identical">No differences — the two texts are identical</div>'
  return html
}

/* ─── Explain summary ─────────────────────────────────────────── */
function buildExplain(diff: DiffLine[]): string {
  const dels = diff.filter(d => d.t === 'del')
  const adds = diff.filter(d => d.t === 'add')
  const same = diff.filter(d => d.t === 'same')
  const origLines = dels.length + same.length
  const modLines  = adds.length + same.length

  if (dels.length === 0 && adds.length === 0)
    return 'The two texts are identical — no differences were found.'

  const parts: string[] = []
  parts.push(`The original has ${origLines} line${origLines !== 1 ? 's' : ''} and the modified version has ${modLines} line${modLines !== 1 ? 's' : ''}.`)

  const bullets: string[] = []
  if (dels.length) bullets.push(`${dels.length} line${dels.length !== 1 ? 's' : ''} removed from the original`)
  if (adds.length) bullets.push(`${adds.length} line${adds.length !== 1 ? 's' : ''} added in the modified version`)
  if (same.length) bullets.push(`${same.length} line${same.length !== 1 ? 's' : ''} unchanged`)

  parts.push(bullets.join(' • '))

  // Describe small diffs in detail
  if (dels.length <= 3 && adds.length <= 3 && dels.length > 0) {
    const examples = dels.slice(0, 2).map(d => `"${d.s.trim().slice(0, 60)}${d.s.length > 60 ? '…' : ''}"`)
    parts.push(`Removed line${examples.length > 1 ? 's' : ''}: ${examples.join(', ')}`)
  }
  if (adds.length <= 3 && adds.length > 0) {
    const examples = adds.slice(0, 2).map(d => `"${d.s.trim().slice(0, 60)}${d.s.length > 60 ? '…' : ''}"`)
    parts.push(`Added line${examples.length > 1 ? 's' : ''}: ${examples.join(', ')}`)
  }

  return parts.join('\n\n')
}

export default function DiffChecker() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [showCtx, setShowCtx] = useState(true)
  const [chip, setChip] = useState<'idle'|'ok'|'err'>('idle')
  const [chipTxt, setChipTxt] = useState('IDLE')
  const [msg, setMsg] = useState('Paste text in both panels')
  const [bodyHtml, setBodyHtml] = useState('')
  const [adds, setAdds] = useState(0)
  const [dels, setDels] = useState(0)
  const [show, setShow] = useState(false)
  const [explainText, setExplainText] = useState('')
  const [showExplain, setShowExplain] = useState(false)

  /* Read shared URL params on mount */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pa = params.get('a'), pb = params.get('b')
    if (pa || pb) {
      try {
        const av = pa ? decodeURIComponent(atob(pa)) : ''
        const bv = pb ? decodeURIComponent(atob(pb)) : ''
        setA(av); setB(bv)
        runDiff(av, bv, true)
      } catch { /* ignore malformed params */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runDiff = (av: string, bv: string, showAll: boolean) => {
    if (!av && !bv) { setShow(false); setChip('idle'); setChipTxt('IDLE'); setMsg('Paste text in both panels'); setShowExplain(false); return }
    setShow(true)
    const diff = lcsLines(av.split('\n'), bv.split('\n'))
    const rows = buildRows(diff)
    setBodyHtml(renderRows(rows, showAll))
    const nAdd = diff.filter(d => d.t === 'add').length
    const nDel = diff.filter(d => d.t === 'del').length
    setAdds(nAdd); setDels(nDel)
    setChip(nAdd || nDel ? 'err' : 'ok')
    setChipTxt(nAdd || nDel ? 'CHANGES' : 'IDENTICAL')
    setMsg(nAdd || nDel ? `${nAdd + nDel} changed lines` : 'Files are identical')
    setExplainText(buildExplain(diff))
    return diff
  }

  const handleA = (v: string) => { setA(v); runDiff(v, b, showCtx) }
  const handleB = (v: string) => { setB(v); runDiff(a, v, showCtx) }
  const toggleCtx = () => { const c = !showCtx; setShowCtx(c); runDiff(a, b, c) }
  const swap = () => { setA(b); setB(a); runDiff(b, a, showCtx) }
  const clearAll = () => { setA(''); setB(''); setShow(false); setShowExplain(false); setChip('idle'); setChipTxt('IDLE'); setMsg('Paste text in both panels') }

  const copyText = (txt: string, label: string) => {
    if (!txt) return
    navigator.clipboard.writeText(txt).then(() => toast(`${label} copied`))
  }

  const exportPatch = () => {
    const diff = lcsLines(a.split('\n'), b.split('\n'))
    const patch = '--- original\n+++ modified\n' + diff.map(d => (d.t === 'add' ? '+' : d.t === 'del' ? '-' : ' ') + d.s).join('\n') + '\n'
    const blob = new Blob([patch], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'devonekit.diff'; link.click()
    URL.revokeObjectURL(url)
    toast('Exported devonekit.diff')
  }

  const exportPdf = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 40
    const colW = (pageW - margin * 2 - 10) / 2
    let y = 50

    doc.setFont('courier', 'normal')
    doc.setFontSize(14)
    doc.setTextColor(30, 30, 30)
    doc.text('Diff Report — devonekit.com', margin, y)
    y += 10
    doc.setDrawColor(180, 180, 180)
    doc.line(margin, y, pageW - margin, y)
    y += 16

    doc.setFontSize(7.5)
    const diff = lcsLines(a.split('\n'), b.split('\n'))
    const lineH = 11

    /* Track left/right line numbers */
    let la = 0, lb = 0
    diff.forEach(d => {
      if (y > 800) { doc.addPage(); y = 40 }
      if (d.t === 'same') { la++; lb++ }
      else if (d.t === 'del') la++
      else lb++

      const isLeft  = d.t === 'same' || d.t === 'del'
      const isRight = d.t === 'same' || d.t === 'add'
      const lNum = isLeft  ? la : 0
      const rNum = isRight ? lb : 0
      const lText = isLeft  ? String(lNum).padStart(3) + '  ' + d.s : ''
      const rText = isRight ? String(rNum).padStart(3) + '  ' + d.s : ''

      if (d.t === 'del')  { doc.setFillColor(255, 224, 224); doc.rect(margin,              y - 8, colW,     lineH, 'F') }
      if (d.t === 'add')  { doc.setFillColor(220, 255, 230); doc.rect(margin + colW + 10, y - 8, colW,     lineH, 'F') }

      doc.setTextColor(d.t === 'del' ? 180 : 80, 60, 60)
      if (lText) doc.text(doc.splitTextToSize(lText, colW - 6)[0] ?? '', margin + 3, y)

      doc.setTextColor(d.t === 'add' ? 30 : 80, d.t === 'add' ? 120 : 80, 60)
      if (rText) doc.text(doc.splitTextToSize(rText, colW - 6)[0] ?? '', margin + colW + 13, y)

      doc.setTextColor(200, 200, 200)
      doc.line(margin + colW + 5, y - 8, margin + colW + 5, y + 3)

      y += lineH
    })

    doc.save('devonekit-diff.pdf')
    toast('PDF exported')
  }

  const shareUrl = () => {
    try {
      const pa = btoa(encodeURIComponent(a))
      const pb = btoa(encodeURIComponent(b))
      const url = `${window.location.origin}${window.location.pathname}?a=${pa}&b=${pb}`
      if (url.length > 8000) { toast('Texts too large to share via URL'); return }
      navigator.clipboard.writeText(url).then(() => toast('Share link copied!'))
    } catch { toast('Failed to generate share link') }
  }

  return (
    <>
      {/* ── Inputs ── */}
      <div className="split" style={{ flex: '0 0 42%', minHeight: 0 }}>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">Original</span>
            <div className="btn-group">
              <button className="btn" onClick={() => copyText(a, 'Original')}>copy</button>
              <button className="btn" onClick={() => handleA('')}>clear</button>
            </div>
          </div>
          <textarea value={a} onChange={e => handleA(e.target.value)} placeholder="Paste original text…" spellCheck={false} />
        </div>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">Modified</span>
            <div className="btn-group">
              <button className="btn" onClick={() => copyText(b, 'Modified')}>copy</button>
              <button className="btn" onClick={() => handleB('')}>clear</button>
            </div>
          </div>
          <textarea value={b} onChange={e => handleB(e.target.value)} placeholder="Paste modified text…" spellCheck={false} />
        </div>
      </div>

      {/* ── Diff result ── */}
      <div className={`diff-result${show ? ' show' : ''}`}>
        {/* Rich toolbar */}
        <div className="dc-toolbar">
          <div className="dc-side">
            <span className="dc-rm">⊖ {dels} removal{dels === 1 ? '' : 's'}</span>
          </div>
          <button className="dc-swap" title="Swap sides" onClick={swap}>⇄</button>
          <div className="dc-side right">
            <span className="dc-ad">⊕ {adds} addition{adds === 1 ? '' : 's'}</span>
          </div>
          <div className="btn-group">
            <button className="btn" onClick={toggleCtx}>{showCtx ? 'hide unchanged' : 'show all'}</button>
            <button className="btn" onClick={() => copyText(b, 'Modified')}>copy result</button>
            <button className="btn" onClick={exportPatch}>export .diff</button>
            <button className="btn" onClick={exportPdf}>export PDF</button>
            <button className="btn" onClick={shareUrl} title="Copy shareable link">share</button>
            <button
              className={`btn${showExplain ? ' primary' : ''}`}
              onClick={() => setShowExplain(v => !v)}
              title="Explain the differences"
            >explain</button>
            <button className="btn" onClick={clearAll}>clear all</button>
          </div>
        </div>

        {/* Explain panel */}
        {showExplain && (
          <div className="dc-explain">
            <div className="dc-explain-hdr">
              <span>✦ Explain</span>
              <button className="dc-explain-close" onClick={() => setShowExplain(false)}>✕</button>
            </div>
            <div className="dc-explain-body">
              {explainText.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}

        <div className="dc-body" id="diff-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </div>

      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chipTxt}</span>
        <span>{msg}</span>
        <span style={{ marginLeft: 'auto' }}>
          {show && (adds || dels) ? <><span style={{ color: 'var(--add-text)' }}>+{adds}</span>{'  '}<span style={{ color: 'var(--del-text)' }}>−{dels}</span></> : null}
        </span>
      </div>
    </>
  )
}
