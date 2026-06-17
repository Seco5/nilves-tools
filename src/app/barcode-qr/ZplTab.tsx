'use client'

import { useState, useRef, type CSSProperties } from 'react'
import { Eye, Download, Printer, Loader2, Info } from 'lucide-react'
import { useTT } from '@/lib/toolText'

// ── ZPL templates (language-agnostic) ─────────────────────────────────────────
const TEMPLATES = {
  shipping: `^XA
^FO50,30^ADN,36,20^FDDevOneKit Kargo^FS
^FO50,80^ADN,20,10^FDAlici: Ahmet Yilmaz^FS
^FO50,110^ADN,20,10^FDAdres: Ataturk Cad. No:1 Istanbul^FS
^FO50,160^BY3^BCN,100,Y,N,N^FD123456789012^FS
^FO50,290^ADN,20,10^FDGonderi No: TR-2024-001234^FS
^XZ`,
  product: `^XA
^FO100,30^ADN,36,20^FDUrun Adi^FS
^FO100,80^ADN,20,10^FDSKU: DK-001-BLK^FS
^FO50,120^BY3^BCN,120,Y,N,N^FD8690000123456^FS
^FO100,270^ADN,20,10^FDFiyat: 299.90 TL^FS
^XZ`,
  qr: `^XA
^FO50,30^ADN,36,20^FDDevOneKit^FS
^FO50,80^ADN,20,10^FDhttps://devonekit.com^FS
^FO50,110^BQN,2,5^FDQA,https://devonekit.com^FS
^XZ`,
  text: `^XA
^FO50,50^ADN,36,20^FDMerhaba Dunya!^FS
^FO50,120^ADN,28,15^FDDevOneKit ZPL Viewer^FS
^FO50,180^ADN,20,10^FDwww.devonekit.com^FS
^XZ`,
} as const

const LABEL_SIZES = ['4x6', '2x1', '4x3', '4x4', '6x4', 'custom'] as const
type LabelSize = typeof LABEL_SIZES[number]

async function renderZPL(zpl: string, labelW: number, labelH: number, dpi: number): Promise<string> {
  const dpmm = dpi === 203 ? 8 : dpi === 300 ? 12 : 24
  const url = `https://api.labelary.com/v1/printers/${dpmm}dpmm/labels/${labelW}x${labelH}/0/`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'image/png' },
    body: zpl,
  })
  if (!res.ok) throw new Error('Labelary API error: ' + res.status)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

const cardStyle: CSSProperties = {
  background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '1.25rem',
}
const inputStyle: CSSProperties = {
  padding: '7px 10px', borderRadius: 8, border: '0.5px solid var(--border)',
  background: 'var(--surface2)', color: 'var(--text)', fontSize: 13, width: '100%',
}
const labelStyle: CSSProperties = { fontSize: 11, color: 'var(--muted)', marginBottom: 4, display: 'block' }
const pillBtn: CSSProperties = {
  fontSize: 12, fontWeight: 500, color: 'var(--teal)', background: 'var(--teal-dim)',
  border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer',
}

export default function ZplTab() {
  const { en } = useTT()
  const L = en
    ? {
        labelSize: 'Label Size', resolution: 'Resolution', custom: 'Custom', width: 'Width', height: 'Height',
        templates: 'Sample Templates', shipping: 'Shipping Label', product: 'Product Barcode', qr: 'QR Label', text: 'Simple Text',
        zplCode: 'ZPL Code', chars: (n: number) => `${n} characters`,
        preview: 'Preview', clear: 'Clear', previewHdr: 'Preview', dlPng: 'Download PNG',
        empty: 'Write ZPL code and press Preview', loading: 'Rendering label...', error: 'Could not render preview. Check your ZPL code.',
        attribution: 'Preview is rendered using the Labelary API.',
        refToggle: 'ZPL Command Reference', cmd: 'Command', desc: 'Description', ex: 'Example',
      }
    : {
        labelSize: 'Etiket Boyutu', resolution: 'Çözünürlük', custom: 'Özel', width: 'Genişlik', height: 'Yükseklik',
        templates: 'Hazır Şablonlar', shipping: 'Kargo Etiketi', product: 'Ürün Barkodu', qr: 'QR Etiket', text: 'Basit Metin',
        zplCode: 'ZPL Kodu', chars: (n: number) => `${n} karakter`,
        preview: 'Önizle', clear: 'Temizle', previewHdr: 'Önizleme', dlPng: 'PNG İndir',
        empty: 'ZPL kodunu yazın ve Önizle butonuna basın', loading: 'Etiket oluşturuluyor...', error: 'Önizleme oluşturulamadı. ZPL kodunuzu kontrol edin.',
        attribution: 'Önizleme Labelary API kullanılarak oluşturulur.',
        refToggle: 'ZPL Komut Referansı', cmd: 'Komut', desc: 'Açıklama', ex: 'Örnek',
      }

  const REF: [string, string, string][] = en
    ? [
        ['^XA / ^XZ', 'Label start/end', '^XA ... ^XZ'],
        ['^FO x,y', 'Field origin (x,y pixels)', '^FO50,100'],
        ['^FD ... ^FS', 'Field data', '^FDHello^FS'],
        ['^ADN,h,w', 'Font selection', '^ADN,36,20'],
        ['^BY w,r,h', 'Barcode parameters', '^BY3,3,100'],
        ['^BCN,h,Y,N', 'Code128 barcode', '^BCN,100,Y,N,N'],
        ['^BQN,m,s', 'QR code', '^BQN,2,5'],
        ['^GFB,...', 'Graphic field', '^GFB,...'],
        ['^PQ n', 'Print quantity', '^PQ 5'],
      ]
    : [
        ['^XA / ^XZ', 'Etiket başlangıç/bitiş', '^XA ... ^XZ'],
        ['^FO x,y', 'Alan konumu (x,y piksel)', '^FO50,100'],
        ['^FD ... ^FS', 'Alan verisi', '^FDMerhaba^FS'],
        ['^ADN,h,w', 'Font seçimi', '^ADN,36,20'],
        ['^BY w,r,h', 'Barkod parametreleri', '^BY3,3,100'],
        ['^BCN,h,Y,N', 'Code128 barkod', '^BCN,100,Y,N,N'],
        ['^BQN,m,s', 'QR kod', '^BQN,2,5'],
        ['^GFB,...', 'Grafik alan', '^GFB,...'],
        ['^PQ n', 'Baskı adedi', '^PQ 5'],
      ]

  const [labelSize, setLabelSize] = useState<LabelSize>('4x6')
  const [customW, setCustomW] = useState(4)
  const [customH, setCustomH] = useState(6)
  const [dpi, setDpi] = useState(203)
  const [zpl, setZpl] = useState<string>(TEMPLATES.shipping)
  const [state, setState] = useState<'empty' | 'loading' | 'error' | 'success'>('empty')
  const [imgUrl, setImgUrl] = useState('')
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null)
  const [refOpen, setRefOpen] = useState(false)
  const lastUrl = useRef('')

  const dims = (): { w: number; h: number } => labelSize === 'custom'
    ? { w: customW || 1, h: customH || 1 }
    : { w: Number(labelSize.split('x')[0]), h: Number(labelSize.split('x')[1]) }

  const preview = async () => {
    setState('loading')
    try {
      const { w, h } = dims()
      const url = await renderZPL(zpl, w, h, dpi)
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current)
      lastUrl.current = url
      const im = new window.Image()
      im.onload = () => { setImgDims({ w: im.naturalWidth, h: im.naturalHeight }); setImgUrl(url); setState('success') }
      im.onerror = () => setState('error')
      im.src = url
    } catch {
      setState('error')
    }
  }

  const download = () => {
    if (!imgUrl) return
    const a = document.createElement('a')
    a.href = imgUrl; a.download = 'label.png'; a.click()
  }

  const sizeLabel = labelSize === 'custom' ? `${customW}x${customH}` : labelSize

  return (
    <div style={{ padding: '1.25rem', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* LEFT — editor */}
        <div style={{ ...cardStyle, width: 400, maxWidth: '100%', flexShrink: 0 }}>
          {/* settings */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 130 }}>
              <label style={labelStyle}>{L.labelSize}</label>
              <select style={inputStyle} value={labelSize} onChange={e => setLabelSize(e.target.value as LabelSize)}>
                {LABEL_SIZES.map(s => <option key={s} value={s}>{s === 'custom' ? L.custom : s}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 130 }}>
              <label style={labelStyle}>{L.resolution}</label>
              <select style={inputStyle} value={dpi} onChange={e => setDpi(Number(e.target.value))}>
                <option value={203}>203 DPI</option>
                <option value={300}>300 DPI</option>
                <option value={600}>600 DPI</option>
              </select>
            </div>
          </div>

          {labelSize === 'custom' && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{L.width} (in)</label>
                <input type="number" min={1} step={0.5} style={inputStyle} value={customW} onChange={e => setCustomW(Number(e.target.value))} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{L.height} (in)</label>
                <input type="number" min={1} step={0.5} style={inputStyle} value={customH} onChange={e => setCustomH(Number(e.target.value))} />
              </div>
            </div>
          )}

          {/* templates */}
          <label style={labelStyle}>{L.templates}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            <button style={pillBtn} onClick={() => setZpl(TEMPLATES.shipping)}>{L.shipping}</button>
            <button style={pillBtn} onClick={() => setZpl(TEMPLATES.product)}>{L.product}</button>
            <button style={pillBtn} onClick={() => setZpl(TEMPLATES.qr)}>{L.qr}</button>
            <button style={pillBtn} onClick={() => setZpl(TEMPLATES.text)}>{L.text}</button>
          </div>

          {/* editor */}
          <label style={labelStyle}>{L.zplCode}</label>
          <textarea
            value={zpl}
            onChange={e => setZpl(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%', minHeight: 280, fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.6,
              background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 10,
              padding: 12, resize: 'vertical', color: 'var(--text)',
            }}
          />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{L.chars(zpl.length)}</div>

          {/* actions */}
          <button
            onClick={preview}
            style={{ marginTop: 12, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            <Eye size={15} />{L.preview}
          </button>
          <button
            onClick={() => setZpl('')}
            style={{ marginTop: 8, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px', background: 'transparent', color: 'var(--text)', border: '0.5px solid var(--border2)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            {L.clear}
          </button>
        </div>

        {/* RIGHT — preview */}
        <div style={{ ...cardStyle, flex: 1, minWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
              <Eye size={15} style={{ color: 'var(--teal)' }} />{L.previewHdr}
            </div>
            <button
              onClick={download}
              disabled={state !== 'success'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: '0.5px solid var(--border2)', background: 'transparent', fontSize: 12, fontWeight: 500, cursor: state === 'success' ? 'pointer' : 'not-allowed', color: state === 'success' ? 'var(--text)' : 'var(--muted)' }}
            >
              <Download size={14} />{L.dlPng}
            </button>
          </div>

          {state === 'empty' && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
              <Printer size={48} style={{ opacity: .3, marginBottom: 12 }} />
              <div style={{ fontSize: 13 }}>{L.empty}</div>
            </div>
          )}

          {state === 'loading' && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted2)' }}>
              <Loader2 size={32} className="bq-spin" style={{ color: 'var(--teal)', marginBottom: 12 }} />
              <div style={{ fontSize: 13 }}>{L.loading}</div>
            </div>
          )}

          {state === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px', background: 'rgba(220,38,38,.1)', borderRadius: 10 }}>
              <span className="chip chip-err">ERROR</span>
              <span style={{ fontSize: 12.5, color: 'var(--red)' }}>{L.error}</span>
            </div>
          )}

          {state === 'success' && imgUrl && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl} alt="ZPL label" style={{ maxWidth: '100%', objectFit: 'contain', borderRadius: 10, background: '#fff', border: '0.5px solid var(--border)', display: 'block' }} />
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                {sizeLabel} · {dpi} DPI{imgDims ? ` · ${imgDims.w}×${imgDims.h}px` : ''}
              </div>
            </div>
          )}

          {/* attribution */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)', marginTop: 16 }}>
            <Info size={12} />
            <span>
              {en ? 'Preview is rendered using the ' : 'Önizleme '}
              <a href="https://labelary.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal)' }}>Labelary</a>
              {en ? ' API.' : ' API kullanılarak oluşturulur.'}
            </span>
          </div>
        </div>
      </div>

      {/* ZPL REFERENCE */}
      <div style={{ marginTop: 18 }}>
        <button
          onClick={() => setRefOpen(o => !o)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: 'var(--text)' }}
        >
          {L.refToggle} <span style={{ display: 'inline-block', transform: refOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: 'var(--muted)' }}>▼</span>
        </button>
        {refOpen && (
          <table className="tckn-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 12 }}>
            <thead>
              <tr><th>{L.cmd}</th><th>{L.desc}</th><th>{L.ex}</th></tr>
            </thead>
            <tbody>
              {REF.map((row, i) => (
                <tr key={i}>
                  <td className="mono-cell">{row[0]}</td>
                  <td>{row[1]}</td>
                  <td className="mono-cell" style={{ color: 'var(--muted2)' }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
