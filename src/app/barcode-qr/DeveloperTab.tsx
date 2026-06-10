'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import BarcodeSvg, { BarcodeSvgHandle } from './BarcodeSvg'
import {
  BarcodeFormat, FORMAT_PLACEHOLDER, validateBarcode,
  buildVCard, buildWifi, buildEmail, buildSms,
} from './barcode-utils'
import { barcodeToCanvas, canvasToPngBlob, downloadBlob, downloadText, svgElToString } from './bq-render'
import { useTT } from '@/lib/toolText'

type QrType = 'URL' | 'Text' | 'vCard' | 'WiFi' | 'Email' | 'SMS'
const QR_TYPES: QrType[] = ['URL', 'Text', 'vCard', 'WiFi', 'Email', 'SMS']
const EC_LEVELS = ['L', 'M', 'Q', 'H'] as const
const BAR_FORMATS: BarcodeFormat[] = ['Code128', 'Code39', 'EAN-13', 'EAN-8', 'UPC-A', 'ITF-14']

function toast(m: string) {
  const t = document.getElementById('__toast') as HTMLElement | null
  if (t) { t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
}

export default function DeveloperTab() {
  const { en } = useTT()
  const D = en
    ? { text: 'Text', firstName: 'First name', lastName: 'Last name', phone: 'Phone', email: 'Email', company: 'Company', website: 'Website', network: 'Network (SSID)', password: 'Password', security: 'Security', none: 'None', to: 'To', subject: 'Subject', body: 'Body', phoneNo: 'Phone number', message: 'Message', size: 'Size', fg: 'Foreground', bg: 'Background', ec: 'Error correction', format: 'Format', value: 'Value', height: 'Height', width: 'Width', showText: 'Show text', qrPreview: 'QR Preview', barPreview: 'Barcode Preview', enterContent: 'Enter content…', fixValue: 'Fix the value to preview', dlPng: 'Download PNG', dlSvg: 'Download SVG', copyPng: 'Copy PNG', anyText: 'Any text…', qrCopied: 'QR copied', copyUnsup: 'Copy not supported' }
    : { text: 'Metin', firstName: 'Ad', lastName: 'Soyad', phone: 'Telefon', email: 'E-posta', company: 'Şirket', website: 'Web sitesi', network: 'Ağ (SSID)', password: 'Şifre', security: 'Güvenlik', none: 'Yok', to: 'Kime', subject: 'Konu', body: 'İçerik', phoneNo: 'Telefon numarası', message: 'Mesaj', size: 'Boyut', fg: 'Ön plan', bg: 'Arka plan', ec: 'Hata düzeltme', format: 'Biçim', value: 'Değer', height: 'Yükseklik', width: 'Genişlik', showText: 'Metni göster', qrPreview: 'QR Önizleme', barPreview: 'Barkod Önizleme', enterContent: 'İçerik girin…', fixValue: 'Önizleme için değeri düzeltin', dlPng: 'PNG indir', dlSvg: 'SVG indir', copyPng: 'PNG kopyala', anyText: 'Herhangi bir metin…', qrCopied: 'QR kopyalandı', copyUnsup: 'Kopyalama desteklenmiyor' }
  /* QR state */
  const [qrType, setQrType] = useState<QrType>('URL')
  const [url, setUrl] = useState('https://devonekit.com')
  const [text, setText] = useState('Hello from DevOneKit')
  const [vc, setVc] = useState({ first: 'Ada', last: 'Lovelace', phone: '+905551112233', email: 'ada@devonekit.com', company: 'DevOneKit', website: 'https://devonekit.com' })
  const [wifi, setWifi] = useState<{ ssid: string; password: string; security: 'WPA' | 'WEP' | 'None' }>({ ssid: 'DevOneKitGuest', password: 'supersecret', security: 'WPA' })
  const [email, setEmail] = useState({ to: 'hi@devonekit.com', subject: 'Hello', body: 'Sent from a QR code' })
  const [sms, setSms] = useState({ phone: '+905551112233', message: 'Hi!' })
  const [qrSize, setQrSize] = useState(256)
  const [qrFg, setQrFg] = useState('#e4e4f0')
  const [qrBg, setQrBg] = useState('#0e0e11')
  const [qrEC, setQrEC] = useState<'L' | 'M' | 'Q' | 'H'>('M')

  /* Barcode state */
  const [barFormat, setBarFormat] = useState<BarcodeFormat>('Code128')
  const [barValue, setBarValue] = useState('DEVONEKIT-2026')
  const [barDisplay, setBarDisplay] = useState(true)
  const [barHeight, setBarHeight] = useState(80)
  const [barWidth, setBarWidth] = useState(2)
  const [barFg, setBarFg] = useState('#0e0e11')
  const [barBg, setBarBg] = useState('#ffffff')

  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const barSvgRef = useRef<BarcodeSvgHandle>(null)

  /* Build QR payload from the active type */
  const qrData = useMemo(() => {
    switch (qrType) {
      case 'URL': return url.trim()
      case 'Text': return text
      case 'vCard': return buildVCard(vc)
      case 'WiFi': return buildWifi(wifi)
      case 'Email': return buildEmail(email)
      case 'SMS': return buildSms(sms)
    }
  }, [qrType, url, text, vc, wifi, email, sms])

  const urlInvalid = qrType === 'URL' && url.trim() !== '' && !/^https?:\/\/.+/i.test(url.trim())

  /* Render QR live */
  useEffect(() => {
    const canvas = qrCanvasRef.current
    if (!canvas) return
    if (!qrData) { const ctx = canvas.getContext('2d'); ctx?.clearRect(0, 0, canvas.width, canvas.height); return }
    QRCode.toCanvas(canvas, qrData, {
      width: qrSize, margin: 1, errorCorrectionLevel: qrEC,
      color: { dark: qrFg, light: qrBg },
    }).catch(() => {})
  }, [qrData, qrSize, qrFg, qrBg, qrEC])

  const barErr = validateBarcode(barFormat, barValue)

  /* QR downloads */
  const dlQrPng = () => {
    qrCanvasRef.current?.toBlob(b => { if (b) downloadBlob(b, 'qr.png') }, 'image/png')
  }
  const dlQrSvg = async () => {
    if (!qrData) return
    const svg = await QRCode.toString(qrData, { type: 'svg', margin: 1, errorCorrectionLevel: qrEC, color: { dark: qrFg, light: qrBg } })
    downloadText(svg, 'qr.svg')
  }
  const copyQr = async () => {
    const canvas = qrCanvasRef.current
    if (!canvas) return
    canvas.toBlob(async b => {
      if (!b) return
      try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]); toast(D.qrCopied) }
      catch { toast(D.copyUnsup) }
    }, 'image/png')
  }

  /* Barcode downloads */
  const dlBarPng = async () => {
    if (!barErr.ok) return
    const c = barcodeToCanvas(barValue, barFormat, { displayValue: barDisplay, height: barHeight, width: barWidth, lineColor: barFg, background: barBg })
    if (!c) return
    const b = await canvasToPngBlob(c)
    if (b) downloadBlob(b, `barcode-${barValue}.png`)
  }
  const dlBarSvg = () => {
    const svg = barSvgRef.current?.getSvg()
    if (svg) downloadText(svgElToString(svg), `barcode-${barValue}.svg`)
  }

  const field = (label: string, node: React.ReactNode) => (
    <label className="bq-field"><span className="bq-flabel">{label}</span>{node}</label>
  )

  return (
    <div className="bq-dev">
      {/* LEFT — controls */}
      <div className="bq-controls">
        {/* QR section */}
        <div className="bq-section-title">QR Code</div>
        <div className="bq-pills">
          {QR_TYPES.map(t => (
            <button key={t} className={`bq-pill${qrType === t ? ' active' : ''}`} onClick={() => setQrType(t)}>{t}</button>
          ))}
        </div>

        <div className="bq-form">
          {qrType === 'URL' && field('URL', (
            <input className={`tool-input${urlInvalid ? ' bq-bad' : ''}`} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
          ))}
          {qrType === 'Text' && field(D.text, (
            <textarea className="tool-textarea" style={{ height: 70 }} value={text} onChange={e => setText(e.target.value)} placeholder={D.anyText} />
          ))}
          {qrType === 'vCard' && (
            <div className="bq-grid2">
              {field(D.firstName, <input className="tool-input" value={vc.first} onChange={e => setVc({ ...vc, first: e.target.value })} />)}
              {field(D.lastName, <input className="tool-input" value={vc.last} onChange={e => setVc({ ...vc, last: e.target.value })} />)}
              {field(D.phone, <input className="tool-input" value={vc.phone} onChange={e => setVc({ ...vc, phone: e.target.value })} />)}
              {field(D.email, <input className="tool-input" value={vc.email} onChange={e => setVc({ ...vc, email: e.target.value })} />)}
              {field(D.company, <input className="tool-input" value={vc.company} onChange={e => setVc({ ...vc, company: e.target.value })} />)}
              {field(D.website, <input className="tool-input" value={vc.website} onChange={e => setVc({ ...vc, website: e.target.value })} />)}
            </div>
          )}
          {qrType === 'WiFi' && (
            <div className="bq-grid2">
              {field(D.network, <input className="tool-input" value={wifi.ssid} onChange={e => setWifi({ ...wifi, ssid: e.target.value })} />)}
              {field(D.password, <input className="tool-input" value={wifi.password} onChange={e => setWifi({ ...wifi, password: e.target.value })} disabled={wifi.security === 'None'} />)}
              {field(D.security, (
                <select className="tool-input" value={wifi.security} onChange={e => setWifi({ ...wifi, security: e.target.value as 'WPA' | 'WEP' | 'None' })}>
                  <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="None">{D.none}</option>
                </select>
              ))}
            </div>
          )}
          {qrType === 'Email' && (
            <div className="bq-grid2">
              {field(D.to, <input className="tool-input" value={email.to} onChange={e => setEmail({ ...email, to: e.target.value })} />)}
              {field(D.subject, <input className="tool-input" value={email.subject} onChange={e => setEmail({ ...email, subject: e.target.value })} />)}
              <div style={{ gridColumn: '1 / -1' }}>{field(D.body, <textarea className="tool-textarea" style={{ height: 60 }} value={email.body} onChange={e => setEmail({ ...email, body: e.target.value })} />)}</div>
            </div>
          )}
          {qrType === 'SMS' && (
            <div className="bq-grid2">
              {field(D.phoneNo, <input className="tool-input" value={sms.phone} onChange={e => setSms({ ...sms, phone: e.target.value })} />)}
              {field(D.message, <input className="tool-input" value={sms.message} onChange={e => setSms({ ...sms, message: e.target.value })} />)}
            </div>
          )}

          <div className="bq-row3">
            {field(`${D.size} — ${qrSize}px`, <input type="range" min={128} max={512} step={8} value={qrSize} onChange={e => setQrSize(+e.target.value)} />)}
            {field(D.fg, <input type="color" className="bq-color" value={qrFg} onChange={e => setQrFg(e.target.value)} />)}
            {field(D.bg, <input type="color" className="bq-color" value={qrBg} onChange={e => setQrBg(e.target.value)} />)}
          </div>
          {field(D.ec, (
            <div className="bq-pills">
              {EC_LEVELS.map(l => <button key={l} className={`bq-pill sm${qrEC === l ? ' active' : ''}`} onClick={() => setQrEC(l)}>{l}</button>)}
            </div>
          ))}
        </div>

        <div className="bq-divider" />

        {/* Barcode section */}
        <div className="bq-section-title">Barcode</div>
        {field(D.format, (
          <div className="bq-pills">
            {BAR_FORMATS.map(f => <button key={f} className={`bq-pill sm${barFormat === f ? ' active' : ''}`} onClick={() => setBarFormat(f)}>{f}</button>)}
          </div>
        ))}
        {field(D.value, (
          <input className={`tool-input${!barErr.ok ? ' bq-bad' : ''}`} value={barValue} onChange={e => setBarValue(e.target.value)} placeholder={FORMAT_PLACEHOLDER[barFormat]} />
        ))}
        {!barErr.ok && <div className="bq-inline-err">⚠ {barErr.error}</div>}
        <div className="bq-row3">
          {field(`${D.height} — ${barHeight}px`, <input type="range" min={40} max={120} value={barHeight} onChange={e => setBarHeight(+e.target.value)} />)}
          {field(`${D.width} — ${barWidth}x`, <input type="range" min={1} max={3} step={1} value={barWidth} onChange={e => setBarWidth(+e.target.value)} />)}
        </div>
        <div className="bq-row3">
          {field(D.fg, <input type="color" className="bq-color" value={barFg} onChange={e => setBarFg(e.target.value)} />)}
          {field(D.bg, <input type="color" className="bq-color" value={barBg} onChange={e => setBarBg(e.target.value)} />)}
          <label className="bq-check"><input type="checkbox" checked={barDisplay} onChange={e => setBarDisplay(e.target.checked)} /> {D.showText}</label>
        </div>
      </div>

      {/* RIGHT — preview */}
      <div className="bq-preview">
        <div className="bq-pcard">
          <div className="bq-pcard-hd">{D.qrPreview}</div>
          <div className="bq-pcanvas" style={{ background: qrData ? qrBg : 'transparent' }}>
            <canvas ref={qrCanvasRef} style={{ display: qrData ? 'block' : 'none', maxWidth: '100%' }} />
            {!qrData && <span className="bq-empty">{D.enterContent}</span>}
          </div>
          <div className="bq-pbtns">
            <button className="btn" onClick={dlQrPng}>{D.dlPng}</button>
            <button className="btn" onClick={dlQrSvg}>{D.dlSvg}</button>
            <button className="btn" onClick={copyQr}>{D.copyPng}</button>
          </div>
        </div>

        <div className="bq-pcard">
          <div className="bq-pcard-hd">{D.barPreview}</div>
          <div className="bq-pcanvas" style={{ background: barErr.ok ? barBg : 'transparent' }}>
            {barErr.ok
              ? <BarcodeSvg ref={barSvgRef} value={barValue} format={barFormat} displayValue={barDisplay} height={barHeight} width={barWidth} lineColor={barFg} background={barBg} />
              : <span className="bq-empty">{D.fixValue}</span>}
          </div>
          <div className="bq-pbtns">
            <button className="btn" onClick={dlBarPng} disabled={!barErr.ok}>{D.dlPng}</button>
            <button className="btn" onClick={dlBarSvg} disabled={!barErr.ok}>{D.dlSvg}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
