'use client'
import { useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import BarcodeSvg from './BarcodeSvg'
import { BarcodeFormat, validateBarcode, analyzeEan13 } from './barcode-utils'
import { barcodeToCanvas, canvasToPngBlob, downloadBlob } from './bq-render'

const BULK_FORMATS: BarcodeFormat[] = ['EAN-13', 'EAN-8', 'UPC-A', 'Code128', 'ITF-14']
const MAX = 200

type LabelSize = '30x20' | '50x30' | '100x60' | 'custom'
const LABEL_DIMS: Record<Exclude<LabelSize, 'custom'>, { w: number; h: number }> = {
  '30x20': { w: 30, h: 20 }, '50x30': { w: 50, h: 30 }, '100x60': { w: 100, h: 60 },
}

interface Gen { value: string; label: string; valid: boolean; error: string }

function toast(m: string) {
  const t = document.getElementById('__toast') as HTMLElement | null
  if (t) { t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
}

export default function EcommerceTab() {
  const [method, setMethod] = useState<'manual' | 'csv'>('manual')
  const [manual, setManual] = useState('8691234567890\n869987654321\n978014300723')
  const [csvRows, setCsvRows] = useState<string[][]>([])
  const [csvName, setCsvName] = useState('')
  const [format, setFormat] = useState<BarcodeFormat>('EAN-13')
  const [labelSize, setLabelSize] = useState<LabelSize>('50x30')
  const [customW, setCustomW] = useState(50)
  const [customH, setCustomH] = useState(30)
  const [showName, setShowName] = useState(false)
  const [generated, setGenerated] = useState<Gen[]>([])
  const [overflow, setOverflow] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  /* EAN-13 validator */
  const [eanInput, setEanInput] = useState('8691234567890')
  const ean = useMemo(() => analyzeEan13(eanInput), [eanInput])

  const dims = labelSize === 'custom' ? { w: customW, h: customH } : LABEL_DIMS[labelSize]

  /* CSV parsing */
  const parseCsv = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const txt = String(reader.result || '')
      const rows = txt.split(/\r?\n/).filter(l => l.trim()).map(l => l.split(','))
      setCsvRows(rows)
      setCsvName(file.name)
      setOverflow(rows.length > MAX)
    }
    reader.readAsText(file)
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) parseCsv(f)
  }

  /* Build source rows from the active input method */
  const sourceRows = (): [string, string][] => {
    let rows: [string, string][]
    if (method === 'manual') {
      rows = manual.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
        if (showName) { const i = line.indexOf(','); if (i >= 0) return [line.slice(0, i).trim(), line.slice(i + 1).trim()] as [string, string] }
        return [line, ''] as [string, string]
      })
    } else {
      rows = csvRows.map(r => [(r[0] || '').trim(), showName ? (r[1] || '').trim() : ''] as [string, string])
        .filter(r => r[0])
    }
    return rows
  }

  const generate = () => {
    const rows = sourceRows()
    if (rows.length > MAX) { setOverflow(true) }
    const capped = rows.slice(0, MAX)
    const out: Gen[] = capped.map(([value, label]) => {
      const v = validateBarcode(format, value)
      return { value, label, valid: v.ok, error: v.error }
    })
    setGenerated(out)
    toast(`${out.filter(g => g.valid).length} generated`)
  }

  const valids = generated.filter(g => g.valid)
  const invalidCount = generated.length - valids.length

  /* Individual PNG download */
  const dlOnePng = async (g: Gen) => {
    const c = barcodeToCanvas(g.value, format, { displayValue: true, height: 70, width: 2, lineColor: '#000000', background: '#ffffff' })
    if (!c) return
    const b = await canvasToPngBlob(c)
    if (b) downloadBlob(b, `${g.value}.png`)
  }

  /* Bulk: ZIP */
  const dlZip = async () => {
    if (!valids.length) return
    const zip = new JSZip()
    for (const g of valids) {
      const c = barcodeToCanvas(g.value, format, { displayValue: true, height: 70, width: 2, lineColor: '#000000', background: '#ffffff' })
      if (!c) continue
      const b = await canvasToPngBlob(c)
      if (b) zip.file(`${g.value}.png`, b)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, 'barcodes.zip')
  }

  /* Bulk: PDF label sheet */
  const dlPdf = () => {
    if (!valids.length) return
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = 210, pageH = 297, margin = 10, gap = 4
    const cellW = dims.w, cellH = dims.h + (showName ? 5 : 0)
    let x = margin, y = margin
    for (const g of valids) {
      const c = barcodeToCanvas(g.value, format, { displayValue: true, height: 60, width: 2, lineColor: '#000000', background: '#ffffff' })
      if (!c) continue
      const data = c.toDataURL('image/png')
      if (x + cellW > pageW - margin) { x = margin; y += cellH + gap }
      if (y + cellH > pageH - margin) { doc.addPage(); x = margin; y = margin }
      doc.addImage(data, 'PNG', x, y, cellW, dims.h)
      if (showName && g.label) { doc.setFontSize(7); doc.text(g.label.slice(0, 36), x, y + dims.h + 3.5) }
      x += cellW + gap
    }
    doc.save('barcode-sheet.pdf')
  }

  /* Bulk: Excel */
  const dlExcel = () => {
    if (!generated.length) return
    const rows = generated.map(g => ({ Value: g.value, Valid: g.valid ? 'Yes' : 'No', Format: format, Label: g.label }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [{ wch: 20 }, { wch: 8 }, { wch: 10 }, { wch: 24 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Barcodes')
    XLSX.writeFile(wb, 'barcodes.xlsx')
  }

  return (
    <div className="bq-ecom">
      {/* SECTION A + B */}
      <div className="bq-ecom-top">
        {/* A — generator */}
        <div className="bq-ecard">
          <div className="bq-section-title">Bulk Barcode Generator</div>

          <div className="bq-pills" style={{ marginBottom: 10 }}>
            <button className={`bq-pill${method === 'manual' ? ' active' : ''}`} onClick={() => setMethod('manual')}>Manual Entry</button>
            <button className={`bq-pill${method === 'csv' ? ' active' : ''}`} onClick={() => setMethod('csv')}>CSV Upload</button>
          </div>

          {method === 'manual' ? (
            <textarea className="tool-textarea" style={{ height: 120 }} value={manual} onChange={e => setManual(e.target.value)}
              placeholder={'123456789012\n987654321098\n…' + (showName ? '\n(use "value,label" per line)' : '')} />
          ) : (
            <div>
              <div className="bq-drop" onDragOver={e => e.preventDefault()} onDrop={onDrop} onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={e => { const f = e.target.files?.[0]; if (f) parseCsv(f) }} />
                {csvName ? <span>{csvName} · {csvRows.length} rows</span> : <span>Drag &amp; drop a CSV, or click to browse</span>}
              </div>
              {overflow && <div className="bq-inline-err">⚠ More than {MAX} rows — only the first {MAX} will be generated.</div>}
              {csvRows.length > 0 && (
                <div className="bq-csvprev">
                  {csvRows.slice(0, 5).map((r, i) => (
                    <div key={i} className="bq-csvrow"><span className="bq-csvcell">{r[0]}</span>{showName && <span className="bq-csvcell dim">{r[1] || ''}</span>}</div>
                  ))}
                  {csvRows.length > 5 && <div className="bq-csvmore">+{csvRows.length - 5} more rows</div>}
                </div>
              )}
            </div>
          )}

          <div className="bq-field" style={{ marginTop: 10 }}>
            <span className="bq-flabel">Format</span>
            <div className="bq-pills">
              {BULK_FORMATS.map(f => <button key={f} className={`bq-pill sm${format === f ? ' active' : ''}`} onClick={() => setFormat(f)}>{f}</button>)}
            </div>
          </div>

          <div className="bq-field">
            <span className="bq-flabel">Label size</span>
            <div className="bq-pills">
              {(['30x20', '50x30', '100x60', 'custom'] as LabelSize[]).map(s => (
                <button key={s} className={`bq-pill sm${labelSize === s ? ' active' : ''}`} onClick={() => setLabelSize(s)}>
                  {s === '30x20' ? '30×20' : s === '50x30' ? '50×30' : s === '100x60' ? '100×60' : 'Custom'}
                </button>
              ))}
            </div>
          </div>
          {labelSize === 'custom' && (
            <div className="bq-row3">
              <label className="bq-field"><span className="bq-flabel">Width (mm)</span><input type="number" className="tool-input" value={customW} min={10} onChange={e => setCustomW(+e.target.value)} /></label>
              <label className="bq-field"><span className="bq-flabel">Height (mm)</span><input type="number" className="tool-input" value={customH} min={10} onChange={e => setCustomH(+e.target.value)} /></label>
            </div>
          )}

          <label className="bq-check" style={{ margin: '6px 0 12px' }}>
            <input type="checkbox" checked={showName} onChange={e => setShowName(e.target.checked)} /> Show product name below barcode
          </label>

          <button className="pp-btn primary" style={{ width: '100%' }} onClick={generate}>Generate Barcodes</button>
        </div>

        {/* B — preview grid */}
        <div className="bq-ecard">
          <div className="bq-section-title">Preview &amp; Export</div>
          <div className="bq-statsbar">
            <span className="chip chip-ok">{valids.length} generated</span>
            {invalidCount > 0 && <span className="chip chip-err">{invalidCount} invalid skipped</span>}
          </div>

          {valids.length === 0 ? (
            <div className="bq-empty-grid">Generate barcodes to preview them here</div>
          ) : (
            <div className="bq-grid">
              {valids.map((g, i) => (
                <div key={i} className="bq-gcard">
                  <BarcodeSvg value={g.value} format={format} displayValue height={50} width={1.6} lineColor="#000000" background="#ffffff" className="bq-gsvg" />
                  <div className="bq-gval">{g.value}</div>
                  {showName && g.label && <div className="bq-gname">{g.label}</div>}
                  <button className="btn" onClick={() => dlOnePng(g)}>PNG</button>
                </div>
              ))}
            </div>
          )}

          {valids.length > 0 && (
            <div className="bq-bulkbtns">
              <button className="btn" onClick={dlZip}>Download All as ZIP</button>
              <button className="btn" onClick={dlPdf}>Download PDF Sheet</button>
              <button className="btn" onClick={dlExcel}>Export to Excel</button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION C — EAN-13 validator */}
      <div className="bq-ecard">
        <div className="bq-section-title">EAN-13 Validator</div>
        <div className="bq-eanval">
          <input className="tool-input" style={{ maxWidth: 260, fontFamily: 'var(--mono)' }} value={eanInput}
            onChange={e => setEanInput(e.target.value.replace(/\s/g, ''))} placeholder="13-digit EAN" maxLength={13} />
          {'reason' in ean ? (
            <span className="bq-eanmsg muted">{ean.reason}</span>
          ) : ean.valid ? (
            <span className="bq-eanmsg ok">✓ Valid{ean.hasCheck ? '' : ` — check digit is ${ean.expected}`}</span>
          ) : (
            <span className="bq-eanmsg bad">✗ Invalid — correct check digit is {ean.expected}</span>
          )}
        </div>

        {!('reason' in ean) && (
          <div className="bq-breakdown">
            <div className="bq-bd"><span className="bq-bdv" style={{ color: 'var(--teal2)' }}>{ean.countryPrefix}</span><span className="bq-bdl">Country prefix<br />{ean.country}</span></div>
            <div className="bq-bd"><span className="bq-bdv" style={{ color: 'var(--blue)' }}>{ean.manufacturer}</span><span className="bq-bdl">Manufacturer</span></div>
            <div className="bq-bd"><span className="bq-bdv" style={{ color: 'var(--purple)' }}>{ean.product}</span><span className="bq-bdl">Product</span></div>
            <div className="bq-bd"><span className="bq-bdv" style={{ color: ean.valid ? 'var(--add-text)' : 'var(--red)' }}>{ean.hasCheck ? ean.check : ean.expected}</span><span className="bq-bdl">Check digit</span></div>
          </div>
        )}
      </div>
    </div>
  )
}
