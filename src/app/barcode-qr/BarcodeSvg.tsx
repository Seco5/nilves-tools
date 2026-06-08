'use client'
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import JsBarcode from 'jsbarcode'
import { BarcodeFormat } from './barcode-utils'
import { jsbarcodeOptions, BarOpts } from './bq-render'

export interface BarcodeSvgHandle { getSvg: () => SVGSVGElement | null }

interface Props extends BarOpts {
  value: string
  format: BarcodeFormat
  className?: string
}

/* Renders a single barcode into an <svg>. Catches JsBarcode failures so an
   invalid value never crashes the page. */
const BarcodeSvg = forwardRef<BarcodeSvgHandle, Props>(function BarcodeSvg(
  { value, format, displayValue, height, width, lineColor, background, className }, ref,
) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [err, setErr] = useState('')

  useImperativeHandle(ref, () => ({ getSvg: () => svgRef.current }), [])

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    try {
      let bad = false
      JsBarcode(el, value, {
        ...jsbarcodeOptions(format, { displayValue, height, width, lineColor, background }),
        valid: (ok: boolean) => { if (!ok) bad = true },
      })
      if (bad) { el.innerHTML = ''; setErr(`Invalid value for ${format}`) }
      else setErr('')
    } catch (e) {
      el.innerHTML = ''
      setErr((e as Error).message || `Invalid value for ${format}`)
    }
  }, [value, format, displayValue, height, width, lineColor, background])

  return (
    <>
      <svg ref={svgRef} className={className} style={{ display: err ? 'none' : 'block', maxWidth: '100%' }} />
      {err && <div className="bq-inline-err">⚠ {err}</div>}
    </>
  )
})

export default BarcodeSvg
