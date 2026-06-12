'use client'

import { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react'
import Link from 'next/link'
import {
  Image as ImageIcon, ArrowLeftRight, GripVertical, Download, X,
  MousePointer2, Percent, Lock, Plus,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

type Mode = 'side' | 'slider' | 'diff'
type Img = { src: string; name: string; w: number; h: number }

// ── i18n ──────────────────────────────────────────────────────────────────────
const T = {
  tr: {
    eyebrow: '🖼️ GELİŞTİRİCİ ARAÇLARI',
    title: 'Görsel Karşılaştırma',
    subtitle: 'İki görsel yükleyin, pikseller arasındaki farkları anında görün. Tamamen tarayıcıda çalışır.',
    drop1: 'Birinci görseli bırakın', drop2: 'İkinci görseli bırakın',
    formats: 'jpg, png, webp, gif', browse: 'Gözat',
    modeSide: 'Yan Yana', modeSlider: 'Kaydırmalı', modeDiff: 'Fark Vurgusu',
    compare: 'Karşılaştır',
    emptyState: 'İki görsel yükleyin ve Karşılaştır butonuna basın',
    image1: 'Görsel 1', image2: 'Görsel 2',
    sensitivity: 'Hassasiyet',
    diffPct: 'Fark Yüzdesi',
    pixelsDiff: (d: number, tot: number) => `${d.toLocaleString('tr')} piksel farklı (toplam ${tot.toLocaleString('tr')} piksel)`,
    sizeWarn: (a: string, b: string) => `Görseller farklı boyutlarda (${a} vs ${b}). İkinci görsel ilkinin boyutuna göre yeniden boyutlandırıldı.`,
    download: 'Sonucu İndir (PNG)',
    cardTitles: ['3 Görünüm Modu', 'Fark Yüzdesi', 'Gizlilik Önce'],
    cardDescs: [
      'Yan yana, kaydırmalı veya piksel fark vurgusu ile karşılaştırın.',
      'Görseller arasındaki farkı yüzde olarak hesaplar.',
      'Görseller tarayıcıda işlenir, hiçbir sunucuya yüklenmez.',
    ],
    whatTitle: 'Görsel Karşılaştırma Nedir?',
    what: 'Görsel karşılaştırma (image diff), iki görsel arasındaki farklılıkları piksel düzeyinde tespit etme işlemidir. Web geliştiricileri için tasarım revizyonlarını kontrol etmek, QA mühendisleri için görsel regresyon testleri yapmak, tasarımcılar için iki versiyon arasındaki değişiklikleri görmek amacıyla kullanılır.',
    faqTitle: 'Sık Sorulan Sorular',
    relatedTitle: 'İlgili Araçlar',
    faq: [
      { q: 'Görsellerim sunucuya yükleniyor mu?', a: 'Hayır. Tüm işlemler tarayıcınızda Canvas API kullanılarak yapılır. Görselleriniz hiçbir zaman cihazınızdan çıkmaz.' },
      { q: 'Hassasiyet ayarı ne işe yarar?', a: "Hassasiyet, iki piksel arasındaki renk farkının ne kadarının 'farklı' sayılacağını belirler. Düşük değer (örn. 5) en küçük farkları bile yakalar; yüksek değer (örn. 80) sadece büyük farkları gösterir. Kompresyon artefaktlarından kaynaklanan gürültüyü filtrelemek için hassasiyeti artırabilirsiniz." },
      { q: 'Farklı boyuttaki görselleri karşılaştırabilir miyim?', a: 'Evet. İkinci görsel otomatik olarak birinci görselin boyutuna göre yeniden boyutlandırılır. Ancak en doğru sonuç için aynı boyuttaki görselleri karşılaştırmanızı öneririz.' },
      { q: 'Hangi görsel formatları destekleniyor?', a: "JPG, PNG, WebP ve GIF formatları desteklenir. GIF'lerde sadece ilk kare karşılaştırılır." },
      { q: 'Bu araç ücretsiz mi?', a: 'Evet, tamamen ücretsizdir. Kayıt, üyelik veya ödeme gerekmez. Tüm araçlar tarayıcınızda çalışır ve hiçbir veriniz sunucularımıza gönderilmez.' },
    ],
    related: [
      { name: 'Fark Denetleyici', desc: 'Metin farklarını karşılaştır', href: '/diff-checker' },
      { name: 'Barkod & QR', desc: 'QR kod ve barkod üret', href: '/barcode-qr' },
      { name: 'Renk Dönüştürücü', desc: 'HEX, RGB, HSL dönüşümü', href: '/color-converter' },
    ],
  },
  en: {
    eyebrow: '🖼️ DEVELOPER TOOLS',
    title: 'Image Comparison',
    subtitle: 'Upload two images, instantly see pixel differences. Runs entirely in your browser.',
    drop1: 'Drop first image', drop2: 'Drop second image',
    formats: 'jpg, png, webp, gif', browse: 'Browse',
    modeSide: 'Side by Side', modeSlider: 'Slider', modeDiff: 'Diff Highlight',
    compare: 'Compare',
    emptyState: 'Upload two images and press Compare',
    image1: 'Image 1', image2: 'Image 2',
    sensitivity: 'Sensitivity',
    diffPct: 'Difference Percentage',
    pixelsDiff: (d: number, tot: number) => `${d.toLocaleString('en')} pixels different (of ${tot.toLocaleString('en')} total)`,
    sizeWarn: (a: string, b: string) => `Images have different dimensions (${a} vs ${b}). Second image was resized to match the first.`,
    download: 'Download Result (PNG)',
    cardTitles: ['3 View Modes', 'Difference Percentage', 'Privacy First'],
    cardDescs: [
      'Compare side by side, with a slider, or pixel diff highlight.',
      'Calculates the difference between images as a percentage.',
      'Images are processed in your browser, never uploaded to a server.',
    ],
    whatTitle: 'What is Image Comparison?',
    what: "Image comparison (image diff) is the process of detecting differences between two images at the pixel level. It's used by web developers to review design revisions, QA engineers for visual regression testing, and designers to spot changes between two versions.",
    faqTitle: 'Frequently Asked Questions',
    relatedTitle: 'Related Tools',
    faq: [
      { q: 'Are my images uploaded to a server?', a: 'No. All processing happens in your browser using the Canvas API. Your images never leave your device.' },
      { q: 'What does the sensitivity setting do?', a: "Sensitivity determines how much color difference between two pixels counts as 'different'. A low value (e.g. 5) catches even tiny differences; a high value (e.g. 80) only shows major differences. Increase sensitivity to filter out noise from compression artifacts." },
      { q: 'Can I compare images of different sizes?', a: "Yes. The second image is automatically resized to match the first image's dimensions. However, for the most accurate results, we recommend comparing images of the same size." },
      { q: 'Which image formats are supported?', a: 'JPG, PNG, WebP and GIF formats are supported. For GIFs, only the first frame is compared.' },
      { q: 'Is this tool free?', a: 'Yes, completely free. No registration, membership or payment required. All tools run in your browser and none of your data is sent to our servers.' },
    ],
    related: [
      { name: 'Diff Checker', desc: 'Compare text differences', href: '/diff-checker' },
      { name: 'Barcode & QR', desc: 'Generate QR codes and barcodes', href: '/barcode-qr' },
      { name: 'Color Converter', desc: 'HEX, RGB, HSL conversion', href: '/color-converter' },
    ],
  },
} as const

const sectionTitle: CSSProperties = {
  fontSize: 16, fontWeight: 500, color: 'var(--text)',
  marginBottom: '.875rem', paddingBottom: '.5rem', borderBottom: '0.5px solid var(--border)',
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const im = new window.Image()
    im.onload = () => res(im)
    im.onerror = rej
    im.src = src
  })
}

// ── FAQ item ────────────────────────────────────────────────────────────────
function FaqItem({ q, a, last }: { q: string; a: string; last: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: last ? 'none' : '0.5px solid var(--border)' }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '12px 0', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text)', background: 'none', border: 'none', textAlign: 'left' }}>
        <span>{q}</span>
        <Plus size={16} style={{ flexShrink: 0, marginLeft: 16, color: open ? 'var(--teal)' : 'var(--muted)', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s, color .2s' }} />
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .25s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7, paddingBottom: 12 }}>{a}</p>
        </div>
      </div>
    </div>
  )
}

// ── Dropzone ──────────────────────────────────────────────────────────────────
function Dropzone({ img, label, formats, browse, onFile, onClear }: {
  img: Img | null; label: string; formats: string; browse: string
  onFile: (f: File) => void; onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const pick = (files: FileList | null) => {
    const f = files?.[0]
    if (f && f.type.startsWith('image/')) onFile(f)
  }

  if (img) {
    return (
      <div style={{ position: 'relative', border: '1.5px solid var(--border)', borderRadius: 14, padding: '1rem', background: 'var(--surface2)', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <button onClick={onClear} aria-label="remove" style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--surface3)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={15} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.src} alt={img.name} style={{ maxHeight: 150, maxWidth: '100%', objectFit: 'contain', borderRadius: 6 }} />
        <div style={{ fontSize: 12, color: 'var(--muted2)', textAlign: 'center', wordBreak: 'break-all' }}>
          {img.name} · {img.w}×{img.h}
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files) }}
      style={{
        border: `1.5px dashed ${over ? 'var(--teal)' : 'var(--border2)'}`, borderRadius: 14,
        padding: '2.5rem 1rem', background: 'var(--surface2)', minHeight: 200, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center',
        transition: 'border-color .15s',
      }}
    >
      <ImageIcon size={32} style={{ color: 'var(--muted)' }} />
      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{formats}</div>
      <span style={{ marginTop: 6, fontSize: 12, fontWeight: 500, color: 'var(--teal)', background: 'var(--teal-dim)', padding: '5px 14px', borderRadius: 7 }}>{browse}</span>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => pick(e.target.files)} />
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function ImageDiff() {
  const { lang } = useLanguage()
  const t = T[lang === 'en' ? 'en' : 'tr']

  const [img1, setImg1] = useState<Img | null>(null)
  const [img2, setImg2] = useState<Img | null>(null)
  const [mode, setMode] = useState<Mode>('side')
  const [compared, setCompared] = useState(false)
  const [slider, setSlider] = useState(50)
  const [threshold, setThreshold] = useState(30)
  const [diffUrl, setDiffUrl] = useState('')
  const [stats, setStats] = useState<{ pct: number; diff: number; total: number } | null>(null)

  const sliderRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const diffCanvas = useRef<HTMLCanvasElement | null>(null)

  const readFile = (f: File, set: (i: Img) => void) => {
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const im = new window.Image()
      im.onload = () => set({ src, name: f.name, w: im.naturalWidth, h: im.naturalHeight })
      im.src = src
    }
    reader.readAsDataURL(f)
  }

  const reset = () => { setCompared(false); setDiffUrl(''); setStats(null) }

  // ── pixel diff ──
  const runDiff = useCallback(async () => {
    if (!img1 || !img2) return
    const a = await loadImage(img1.src)
    const b = await loadImage(img2.src)
    const w = a.naturalWidth, h = a.naturalHeight
    const mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
    const ca = mk(), cb = mk()
    const ctxA = ca.getContext('2d')!, ctxB = cb.getContext('2d')!
    ctxA.drawImage(a, 0, 0, w, h)
    ctxB.drawImage(b, 0, 0, w, h) // resize image 2 to match image 1
    const da = ctxA.getImageData(0, 0, w, h)
    const db = ctxB.getImageData(0, 0, w, h)
    const out = ctxA.createImageData(w, h)
    let diff = 0
    const total = w * h
    for (let i = 0; i < da.data.length; i += 4) {
      const dr = Math.abs(da.data[i] - db.data[i])
      const dg = Math.abs(da.data[i + 1] - db.data[i + 1])
      const dbl = Math.abs(da.data[i + 2] - db.data[i + 2])
      if (Math.max(dr, dg, dbl) > threshold) {
        out.data[i] = 255; out.data[i + 1] = 0; out.data[i + 2] = 0; out.data[i + 3] = 255
        diff++
      } else {
        const gray = (da.data[i] * 0.299 + da.data[i + 1] * 0.587 + da.data[i + 2] * 0.114) | 0
        out.data[i] = gray; out.data[i + 1] = gray; out.data[i + 2] = gray; out.data[i + 3] = 76
      }
    }
    const oc = mk()
    oc.getContext('2d')!.putImageData(out, 0, 0)
    diffCanvas.current = oc
    setDiffUrl(oc.toDataURL('image/png'))
    setStats({ pct: (diff / total) * 100, diff, total })
  }, [img1, img2, threshold])

  // recompute diff when in diff mode after compare, or threshold changes
  useEffect(() => {
    if (compared && mode === 'diff' && img1 && img2) runDiff()
  }, [compared, mode, threshold, runDiff, img1, img2])

  const onCompare = () => { setCompared(true); setSlider(50) }

  // ── slider drag (pointer events) ──
  const moveSlider = useCallback((clientX: number) => {
    const el = sliderRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const pct = ((clientX - r.left) / r.width) * 100
    setSlider(Math.min(100, Math.max(0, pct)))
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => { if (dragging.current) moveSlider(e.clientX) }
    const onUp = () => { dragging.current = false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [moveSlider])

  const download = () => {
    diffCanvas.current?.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'image-diff.png'; a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const bothLoaded = !!img1 && !!img2
  const dimsMismatch = bothLoaded && (img1!.w !== img2!.w || img1!.h !== img2!.h)
  const pillBase: CSSProperties = { fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', background: 'transparent' }
  const pill = (active: boolean): CSSProperties => ({ ...pillBase, border: `0.5px solid ${active ? 'var(--teal)' : 'var(--border2)'}`, color: active ? 'var(--teal)' : 'var(--muted2)' })

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* HERO */}
      <section style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ display: 'inline-flex', background: 'var(--teal-dim)', color: 'var(--teal)', fontSize: 11, padding: '3px 12px', borderRadius: 20, letterSpacing: '.04em', fontWeight: 500 }}>{t.eyebrow}</span>
        <h1 style={{ fontSize: 28, fontWeight: 500, margin: '.75rem 0 .5rem', color: 'var(--text)' }}>{t.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted2)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>{t.subtitle}</p>
      </section>

      {/* UPLOAD */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
        <Dropzone img={img1} label={t.drop1} formats={t.formats} browse={t.browse}
          onFile={f => { readFile(f, setImg1); reset() }} onClear={() => { setImg1(null); reset() }} />
        <Dropzone img={img2} label={t.drop2} formats={t.formats} browse={t.browse}
          onFile={f => { readFile(f, setImg2); reset() }} onClear={() => { setImg2(null); reset() }} />
      </section>

      {/* TOOLBAR */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button style={pill(mode === 'side')} onClick={() => setMode('side')}>{t.modeSide}</button>
          <button style={pill(mode === 'slider')} onClick={() => setMode('slider')}>{t.modeSlider}</button>
          <button style={pill(mode === 'diff')} onClick={() => setMode('diff')}>{t.modeDiff}</button>
        </div>
        <button
          onClick={onCompare}
          disabled={!bothLoaded}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 8, border: 'none',
            background: bothLoaded ? 'var(--teal)' : 'var(--surface3)', color: bothLoaded ? '#fff' : 'var(--muted)',
            fontSize: 13, fontWeight: 500, cursor: bothLoaded ? 'pointer' : 'not-allowed',
          }}
        >
          <ArrowLeftRight size={15} />
          {t.compare}
        </button>
      </section>

      {/* RESULT */}
      {!compared || !bothLoaded ? (
        <section style={{ background: 'var(--surface2)', borderRadius: 14, padding: '2.5rem', textAlign: 'center', color: 'var(--muted2)' }}>
          <ArrowLeftRight size={36} style={{ opacity: .4, marginBottom: 12 }} />
          <div style={{ fontSize: 14 }}>{t.emptyState}</div>
        </section>
      ) : (
        <section>
          {/* MODE 1 — SIDE BY SIDE */}
          {mode === 'side' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[{ im: img1!, l: t.image1 }, { im: img2!, l: t.image2 }].map((x, i) => (
                <div key={i}>
                  <div style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 6 }}>{x.l}</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={x.im.src} alt={x.l} style={{ width: '100%', objectFit: 'contain', borderRadius: 10, background: 'var(--surface2)' }} />
                </div>
              ))}
            </div>
          )}

          {/* MODE 2 — SLIDER */}
          {mode === 'slider' && (
            <div ref={sliderRef} style={{ position: 'relative', overflow: 'hidden', borderRadius: 14, background: 'var(--surface2)', userSelect: 'none', lineHeight: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img1!.src} alt={t.image1} style={{ width: '100%', display: 'block' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img2!.src} alt={t.image2} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', clipPath: `inset(0 0 0 ${slider}%)` }} />
              {/* labels */}
              <span style={badge('left')}>{t.image1}</span>
              <span style={badge('right')}>{t.image2}</span>
              {/* divider */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${slider}%`, width: 2, background: 'var(--teal)', transform: 'translateX(-1px)' }}>
                <div
                  onPointerDown={() => { dragging.current = true }}
                  style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 32, height: 32, borderRadius: '50%', background: 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'ew-resize', boxShadow: '0 1px 6px rgba(0,0,0,.3)', touchAction: 'none' }}
                >
                  <GripVertical size={16} style={{ transform: 'rotate(90deg)' }} />
                </div>
              </div>
            </div>
          )}

          {/* MODE 3 — DIFF HIGHLIGHT */}
          {mode === 'diff' && (
            <div>
              {dimsMismatch && (
                <div style={{ background: 'rgba(245,158,11,.12)', border: '0.5px solid rgba(245,158,11,.4)', color: '#b45309', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, lineHeight: 1.5, marginBottom: 12 }}>
                  {t.sizeWarn(`${img1!.w}×${img1!.h}`, `${img2!.w}×${img2!.h}`)}
                </div>
              )}

              {/* threshold + stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted2)', marginBottom: 6 }}>
                    <span>{t.sensitivity}</span><span style={{ fontFamily: 'var(--mono)' }}>{threshold}</span>
                  </div>
                  <input type="range" min={0} max={100} value={threshold} onChange={e => setThreshold(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--teal)' }} />
                </div>
                {stats && (
                  <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{t.diffPct}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--teal)', fontFamily: 'var(--mono)' }}>{stats.pct.toFixed(2)}%</div>
                    <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{t.pixelsDiff(stats.diff, stats.total)}</div>
                  </div>
                )}
              </div>

              {diffUrl && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={diffUrl} alt="diff" style={{ width: '100%', borderRadius: 14, background: 'var(--surface2)' }} />
                  <button onClick={download} style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, border: '0.5px solid var(--border2)', background: 'transparent', color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    <Download size={15} />
                    {t.download}
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      )}

      {/* INFO CARDS */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, margin: '1.5rem 0' }}>
        {[MousePointer2, Percent, Lock].map((Icon, i) => (
          <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '1rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '.625rem' }}>
              <Icon size={16} style={{ color: 'var(--teal)' }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{t.cardTitles[i]}</div>
            <div style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.5 }}>{t.cardDescs[i]}</div>
          </div>
        ))}
      </section>

      {/* WHAT IS */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={sectionTitle}>{t.whatTitle}</h2>
        <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.7 }}>{t.what}</p>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={sectionTitle}>{t.faqTitle}</h2>
        {t.faq.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} last={i === t.faq.length - 1} />)}
      </section>

      {/* RELATED */}
      <section>
        <h2 style={sectionTitle}>{t.relatedTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {t.related.map(r => (
            <Link key={r.href} href={r.href} className="tckn-related-card">
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{lang === 'en' ? 'Tool' : 'Araç'}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{r.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function badge(side: 'left' | 'right'): CSSProperties {
  return {
    position: 'absolute', top: 8, [side]: 8, zIndex: 2,
    fontSize: 11, color: '#fff', background: 'rgba(0,0,0,.55)', padding: '3px 9px', borderRadius: 20, lineHeight: 1.4,
  }
}
