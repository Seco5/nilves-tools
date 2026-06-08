'use client'
import JsBarcode from 'jsbarcode'
import { BarcodeFormat, JSBARCODE_FORMAT } from './barcode-utils'

export interface BarOpts {
  displayValue: boolean
  height: number
  width: number
  lineColor: string
  background: string
}

export function jsbarcodeOptions(format: BarcodeFormat, o: BarOpts) {
  return {
    format: JSBARCODE_FORMAT[format],
    displayValue: o.displayValue,
    height: o.height,
    width: o.width,
    lineColor: o.lineColor,
    background: o.background,
    margin: 10,
    fontSize: 15,
    font: 'monospace',
  }
}

/* Render a barcode onto an offscreen canvas (for PNG export). Returns null on failure. */
export function barcodeToCanvas(value: string, format: BarcodeFormat, o: BarOpts): HTMLCanvasElement | null {
  try {
    const canvas = document.createElement('canvas')
    JsBarcode(canvas, value, jsbarcodeOptions(format, o))
    return canvas
  } catch {
    return null
  }
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise(res => canvas.toBlob(b => res(b), 'image/png'))
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadText(text: string, filename: string, mime = 'image/svg+xml') {
  downloadBlob(new Blob([text], { type: mime }), filename)
}

/* Serialize a live <svg> element to a standalone SVG string. */
export function svgElToString(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone)
}
