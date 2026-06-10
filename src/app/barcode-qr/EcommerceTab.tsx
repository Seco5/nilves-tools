'use client'
import { useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import BarcodeSvg from './BarcodeSvg'
import { BarcodeFormat, validateBarcode, analyzeEan13 } from './barcode-utils'
import { barcodeToCanvas, canvasToPngBlob, downloadBlob } from './bq-render'
import { useTT } from '@/lib/toolText'

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
  const { en } = useTT()
  const E = en
    ? { bulkTitle: 'Bulk Barcode Generator', manual: 'Manual Entry', csv: 'CSV Upload', useValueLabel: '(use "value,label" per line)', rows: 'rows', dragDrop: 'Drag & drop a CSV, or click to browse', moreRows: (n: number) => `More than ${n} rows — only the first ${n} will be generated.`, moreRows2: 'more rows', format: 'Format', labelSize: 'Label size', custom: 'Custom', widthMm: 'Width (mm)', heightMm: 'Height (mm)', showName: 'Show product name below barcode', genBtn: 'Generate Barcodes', previewExport: 'Preview & Export', generated: 'generated', invalidSkipped: 'invalid skipped', emptyGrid: 'Generate barcodes to preview them here', dlZip: 'Download All as ZIP', dlPdf: 'Download PDF Sheet', dlExcel: 'Export to Excel', eanValidator: 'EAN-13 Validator', eanPh: '13-digit EAN', valid: 'Valid', checkIs: (c: string) => ` — check digit is ${c}`, invalidCheck: (c: string) => `Invalid — correct check digit is ${c}`, countryPrefix: 'Country prefix', manufacturer: 'Manufacturer', product: 'Product', checkDigit: 'Check digit' }
    : { bulkTitle: 'Toplu Barkod Üretici', manual: 'Elle Giriş', csv: 'CSV Yükle', useValueLabel: '(her satırda "değer,etiket" kullanın)', rows: 'satır', dragDrop: 'CSV sürükleyip bırakın veya tıklayıp seçin', moreRows: (n: number) => `${n} satırdan fazla — yalnızca ilk ${n} tanesi üretilecek.`, moreRows2: 'satır daha', format: 'Biçim', labelSize: 'Etiket boyutu', custom: 'Özel', widthMm: 'Genişlik (mm)', heightMm: 'Yükseklik (mm)', showName: 'Barkodun altında ürün adını göster', genBtn: 'Barkod Üret', previewExport: 'Önizleme & Dışa Aktar', generated: 'üretildi', invalidSkipped: 'geçersiz atlandı', emptyGrid: 'Önizlemek için barkod üretin', dlZip: 'Tümünü ZIP indir', dlPdf: 'PDF Sayfası indir', dlExcel: "Excel'e Aktar", eanValidator: 'EAN-13 Doğrulayıcı', eanPh: '13 haneli EAN', valid: 'Geçerli', checkIs: (c: string) => ` — kontrol hanesi ${c}`, invalidCheck: (c: string) => `Geçersiz — doğru kontrol hanesi ${c}`, countryPrefix: 'Ülke ön eki', manufacturer: 'Üretici', product: 'Ürün', checkDigit: 'Kontrol hanesi' }
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
    toast(`${out.filter(g => g.valid).length} ${E.generated}`)
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
          <div className="bq-section-title">{E.bulkTitle}</div>

          <div className="bq-pills" style={{ marginBottom: 10 }}>
            <button className={`bq-pill${method === 'manual' ? ' active' : ''}`} onClick={() => setMethod('manual')}>{E.manual}</button>
            <button className={`bq-pill${method === 'csv' ? ' active' : ''}`} onClick={() => setMethod('csv')}>{E.csv}</button>
          </div>

          {method === 'manual' ? (
            <textarea className="tool-textarea" style={{ height: 120 }} value={manual} onChange={e => setManual(e.target.value)}
              placeholder={'123456789012\n987654321098\n…' + (showName ? '\n' + E.useValueLabel : '')} />
          ) : (
            <div>
              <div className="bq-drop" onDragOver={e => e.preventDefault()} onDrop={onDrop} onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={e => { const f = e.target.files?.[0]; if (f) parseCsv(f) }} />
                {csvName ? <span>{csvName} · {csvRows.length} {E.rows}</span> : <span>{E.dragDrop}</span>}
              </div>
              {overflow && <div className="bq-inline-err">⚠ {E.moreRows(MAX)}</div>}
              {csvRows.length > 0 && (
                <div className="bq-csvprev">
                  {csvRows.slice(0, 5).map((r, i) => (
                    <div key={i} className="bq-csvrow"><span className="bq-csvcell">{r[0]}</span>{showName && <span className="bq-csvcell dim">{r[1] || ''}</span>}</div>
                  ))}
                  {csvRows.length > 5 && <div className="bq-csvmore">+{csvRows.length - 5} {E.moreRows2}</div>}
                </div>
              )}
            </div>
          )}

          <div className="bq-field" style={{ marginTop: 10 }}>
            <span className="bq-flabel">{E.format}</span>
            <div className="bq-pills">
              {BULK_FORMATS.map(f => <button key={f} className={`bq-pill sm${format === f ? ' active' : ''}`} onClick={() => setFormat(f)}>{f}</button>)}
            </div>
          </div>

          <div className="bq-field">
            <span className="bq-flabel">{E.labelSize}</span>
            <div className="bq-pills">
              {(['30x20', '50x30', '100x60', 'custom'] as LabelSize[]).map(s => (
                <button key={s} className={`bq-pill sm${labelSize === s ? ' active' : ''}`} onClick={() => setLabelSize(s)}>
                  {s === '30x20' ? '30×20' : s === '50x30' ? '50×30' : s === '100x60' ? '100×60' : E.custom}
                </button>
              ))}
            </div>
          </div>
          {labelSize === 'custom' && (
            <div className="bq-row3">
              <label className="bq-field"><span className="bq-flabel">{E.widthMm}</span><input type="number" className="tool-input" value={customW} min={10} onChange={e => setCustomW(+e.target.value)} /></label>
              <label className="bq-field"><span className="bq-flabel">{E.heightMm}</span><input type="number" className="tool-input" value={customH} min={10} onChange={e => setCustomH(+e.target.value)} /></label>
            </div>
          )}

          <label className="bq-check" style={{ margin: '6px 0 12px' }}>
            <input type="checkbox" checked={showName} onChange={e => setShowName(e.target.checked)} /> {E.showName}
          </label>

          <button className="pp-btn primary" style={{ width: '100%' }} onClick={generate}>{E.genBtn}</button>
        </div>

        {/* B — preview grid */}
        <div className="bq-ecard">
          <div className="bq-section-title">{E.previewExport}</div>
          <div className="bq-statsbar">
            <span className="chip chip-ok">{valids.length} {E.generated}</span>
            {invalidCount > 0 && <span className="chip chip-err">{invalidCount} {E.invalidSkipped}</span>}
          </div>

          {valids.length === 0 ? (
            <div className="bq-empty-grid">{E.emptyGrid}</div>
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
              <button className="btn" onClick={dlZip}>{E.dlZip}</button>
              <button className="btn" onClick={dlPdf}>{E.dlPdf}</button>
              <button className="btn" onClick={dlExcel}>{E.dlExcel}</button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION C — EAN-13 validator */}
      <div className="bq-ecard">
        <div className="bq-section-title">{E.eanValidator}</div>
        <div className="bq-eanval">
          <input className="tool-input" style={{ maxWidth: 260, fontFamily: 'var(--mono)' }} value={eanInput}
            onChange={e => setEanInput(e.target.value.replace(/\s/g, ''))} placeholder={E.eanPh} maxLength={13} />
          {'reason' in ean ? (
            <span className="bq-eanmsg muted">{ean.reason}</span>
          ) : ean.valid ? (
            <span className="bq-eanmsg ok">✓ {E.valid}{ean.hasCheck ? '' : E.checkIs(String(ean.expected))}</span>
          ) : (
            <span className="bq-eanmsg bad">✗ {E.invalidCheck(String(ean.expected))}</span>
          )}
        </div>

        {!('reason' in ean) && (
          <div className="bq-breakdown">
            <div className="bq-bd"><span className="bq-bdv" style={{ color: 'var(--teal2)' }}>{ean.countryPrefix}</span><span className="bq-bdl">{E.countryPrefix}<br />{ean.country}</span></div>
            <div className="bq-bd"><span className="bq-bdv" style={{ color: 'var(--blue)' }}>{ean.manufacturer}</span><span className="bq-bdl">{E.manufacturer}</span></div>
            <div className="bq-bd"><span className="bq-bdv" style={{ color: 'var(--purple)' }}>{ean.product}</span><span className="bq-bdl">{E.product}</span></div>
            <div className="bq-bd"><span className="bq-bdv" style={{ color: ean.valid ? 'var(--add-text)' : 'var(--red)' }}>{ean.hasCheck ? ean.check : ean.expected}</span><span className="bq-bdl">{E.checkDigit}</span></div>
          </div>
        )}
      </div>
    </div>
  )
}
