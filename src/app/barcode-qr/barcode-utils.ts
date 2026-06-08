/* Shared barcode/QR helpers — pure functions, no DOM. */

export type BarcodeFormat = 'Code128' | 'Code39' | 'EAN-13' | 'EAN-8' | 'UPC-A' | 'ITF-14'

/* Map our display names → JsBarcode format strings */
export const JSBARCODE_FORMAT: Record<BarcodeFormat, string> = {
  'Code128': 'CODE128',
  'Code39': 'CODE39',
  'EAN-13': 'EAN13',
  'EAN-8': 'EAN8',
  'UPC-A': 'UPC',
  'ITF-14': 'ITF14',
}

export const FORMAT_PLACEHOLDER: Record<BarcodeFormat, string> = {
  'Code128': 'Any text or numbers',
  'Code39': 'ABC-123',
  'EAN-13': '12 or 13 digits (e.g. 869123456789)',
  'EAN-8': '7 or 8 digits (e.g. 1234567)',
  'UPC-A': '11 or 12 digits (e.g. 12345678901)',
  'ITF-14': '13 or 14 digits (e.g. 1234567890123)',
}

/* GS1 weighted-sum check digit for a numeric data string (no check digit included). */
export function gs1CheckDigit(digits: string): number {
  const arr = digits.split('').map(Number)
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    const fromRight = arr.length - 1 - i
    sum += arr[i] * (fromRight % 2 === 0 ? 3 : 1)
  }
  return (10 - (sum % 10)) % 10
}

/* Numeric formats accept either the data length (check digit auto-added) or the
   full length (check digit included — it is then verified). */
const GS1_LEN: Record<'EAN-13'|'EAN-8'|'UPC-A'|'ITF-14', number> = {
  'EAN-13': 12, 'EAN-8': 7, 'UPC-A': 11, 'ITF-14': 13,
}

function validateGs1(format: 'EAN-13'|'EAN-8'|'UPC-A'|'ITF-14', v: string): { ok: boolean; error: string } {
  const dataLen = GS1_LEN[format]
  if (!/^\d+$/.test(v) || (v.length !== dataLen && v.length !== dataLen + 1)) {
    return { ok: false, error: `${format} needs ${dataLen} digits (or ${dataLen + 1} with the check digit)` }
  }
  if (v.length === dataLen + 1) {
    const expected = gs1CheckDigit(v.slice(0, dataLen))
    if (parseInt(v[dataLen], 10) !== expected) {
      return { ok: false, error: `Wrong check digit — it should be ${expected}` }
    }
  }
  return { ok: true, error: '' }
}

export function validateBarcode(format: BarcodeFormat, value: string): { ok: boolean; error: string } {
  const v = value.trim()
  if (!v) return { ok: false, error: 'Value is empty' }
  switch (format) {
    case 'EAN-13':
    case 'EAN-8':
    case 'UPC-A':
    case 'ITF-14':
      return validateGs1(format, v)
    case 'Code39':
      if (!/^[0-9A-Za-z\-. $/+%]+$/.test(v)) return { ok: false, error: 'Code39 allows A–Z, 0–9 and - . $ / + %' }
      return { ok: true, error: '' }
    case 'Code128':
      return { ok: true, error: '' }
  }
}

/* ─── QR payload builders ────────────────────────────────────── */
export interface VCardData { first: string; last: string; phone: string; email: string; company: string; website: string }
export interface WifiData { ssid: string; password: string; security: 'WPA' | 'WEP' | 'None' }
export interface EmailData { to: string; subject: string; body: string }
export interface SmsData { phone: string; message: string }

const esc = (s: string) => s.replace(/([\\;,:"])/g, '\\$1')

export function buildVCard(d: VCardData): string {
  return [
    'BEGIN:VCARD', 'VERSION:3.0',
    `N:${esc(d.last)};${esc(d.first)}`,
    `FN:${esc(`${d.first} ${d.last}`.trim())}`,
    d.phone ? `TEL;TYPE=CELL:${d.phone}` : '',
    d.email ? `EMAIL:${d.email}` : '',
    d.company ? `ORG:${esc(d.company)}` : '',
    d.website ? `URL:${d.website}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\n')
}

export function buildWifi(d: WifiData): string {
  if (d.security === 'None') return `WIFI:T:nopass;S:${esc(d.ssid)};;`
  return `WIFI:T:${d.security};S:${esc(d.ssid)};P:${esc(d.password)};;`
}

export function buildEmail(d: EmailData): string {
  const params: string[] = []
  if (d.subject) params.push(`subject=${encodeURIComponent(d.subject)}`)
  if (d.body) params.push(`body=${encodeURIComponent(d.body)}`)
  return `mailto:${d.to}${params.length ? '?' + params.join('&') : ''}`
}

export function buildSms(d: SmsData): string {
  return `SMSTO:${d.phone}:${d.message}`
}

/* ─── GS1 country prefixes (representative subset, ~60 ranges) ── */
const GS1: { from: number; to: number; name: string }[] = [
  { from: 0,   to: 19,  name: 'USA & Canada' },
  { from: 20,  to: 29,  name: 'In-store / restricted' },
  { from: 30,  to: 39,  name: 'USA (drugs)' },
  { from: 40,  to: 49,  name: 'In-store / restricted' },
  { from: 50,  to: 59,  name: 'Coupons' },
  { from: 60,  to: 139, name: 'USA & Canada' },
  { from: 300, to: 379, name: 'France & Monaco' },
  { from: 380, to: 380, name: 'Bulgaria' },
  { from: 383, to: 383, name: 'Slovenia' },
  { from: 385, to: 385, name: 'Croatia' },
  { from: 387, to: 387, name: 'Bosnia & Herzegovina' },
  { from: 389, to: 389, name: 'Montenegro' },
  { from: 400, to: 440, name: 'Germany' },
  { from: 450, to: 459, name: 'Japan' },
  { from: 460, to: 469, name: 'Russia' },
  { from: 470, to: 470, name: 'Kyrgyzstan' },
  { from: 471, to: 471, name: 'Taiwan' },
  { from: 474, to: 474, name: 'Estonia' },
  { from: 475, to: 475, name: 'Latvia' },
  { from: 476, to: 476, name: 'Azerbaijan' },
  { from: 477, to: 477, name: 'Lithuania' },
  { from: 478, to: 478, name: 'Uzbekistan' },
  { from: 479, to: 479, name: 'Sri Lanka' },
  { from: 480, to: 480, name: 'Philippines' },
  { from: 481, to: 481, name: 'Belarus' },
  { from: 482, to: 482, name: 'Ukraine' },
  { from: 484, to: 484, name: 'Moldova' },
  { from: 485, to: 485, name: 'Armenia' },
  { from: 486, to: 486, name: 'Georgia' },
  { from: 487, to: 487, name: 'Kazakhstan' },
  { from: 489, to: 489, name: 'Hong Kong' },
  { from: 490, to: 499, name: 'Japan' },
  { from: 500, to: 509, name: 'United Kingdom' },
  { from: 520, to: 521, name: 'Greece' },
  { from: 528, to: 528, name: 'Lebanon' },
  { from: 529, to: 529, name: 'Cyprus' },
  { from: 531, to: 531, name: 'North Macedonia' },
  { from: 535, to: 535, name: 'Malta' },
  { from: 539, to: 539, name: 'Ireland' },
  { from: 540, to: 549, name: 'Belgium & Luxembourg' },
  { from: 560, to: 560, name: 'Portugal' },
  { from: 569, to: 569, name: 'Iceland' },
  { from: 570, to: 579, name: 'Denmark' },
  { from: 590, to: 590, name: 'Poland' },
  { from: 594, to: 594, name: 'Romania' },
  { from: 599, to: 599, name: 'Hungary' },
  { from: 600, to: 601, name: 'South Africa' },
  { from: 608, to: 608, name: 'Bahrain' },
  { from: 609, to: 609, name: 'Mauritius' },
  { from: 611, to: 611, name: 'Morocco' },
  { from: 613, to: 613, name: 'Algeria' },
  { from: 616, to: 616, name: 'Kenya' },
  { from: 619, to: 619, name: 'Tunisia' },
  { from: 621, to: 621, name: 'Syria' },
  { from: 622, to: 622, name: 'Egypt' },
  { from: 625, to: 625, name: 'Jordan' },
  { from: 626, to: 626, name: 'Iran' },
  { from: 627, to: 627, name: 'Kuwait' },
  { from: 628, to: 628, name: 'Saudi Arabia' },
  { from: 629, to: 629, name: 'United Arab Emirates' },
  { from: 640, to: 649, name: 'Finland' },
  { from: 690, to: 699, name: 'China' },
  { from: 700, to: 709, name: 'Norway' },
  { from: 729, to: 729, name: 'Israel' },
  { from: 730, to: 739, name: 'Sweden' },
  { from: 740, to: 745, name: 'Central America' },
  { from: 746, to: 746, name: 'Dominican Republic' },
  { from: 750, to: 750, name: 'Mexico' },
  { from: 754, to: 755, name: 'Canada' },
  { from: 759, to: 759, name: 'Venezuela' },
  { from: 760, to: 769, name: 'Switzerland & Liechtenstein' },
  { from: 770, to: 771, name: 'Colombia' },
  { from: 773, to: 773, name: 'Uruguay' },
  { from: 775, to: 775, name: 'Peru' },
  { from: 777, to: 777, name: 'Bolivia' },
  { from: 778, to: 779, name: 'Argentina' },
  { from: 780, to: 780, name: 'Chile' },
  { from: 784, to: 784, name: 'Paraguay' },
  { from: 786, to: 786, name: 'Ecuador' },
  { from: 789, to: 790, name: 'Brazil' },
  { from: 800, to: 839, name: 'Italy, San Marino & Vatican' },
  { from: 840, to: 849, name: 'Spain & Andorra' },
  { from: 850, to: 850, name: 'Cuba' },
  { from: 858, to: 858, name: 'Slovakia' },
  { from: 859, to: 859, name: 'Czech Republic' },
  { from: 860, to: 860, name: 'Serbia' },
  { from: 865, to: 865, name: 'Mongolia' },
  { from: 867, to: 867, name: 'North Korea' },
  { from: 868, to: 869, name: 'Turkey' },
  { from: 870, to: 879, name: 'Netherlands' },
  { from: 880, to: 880, name: 'South Korea' },
  { from: 884, to: 884, name: 'Cambodia' },
  { from: 885, to: 885, name: 'Thailand' },
  { from: 888, to: 888, name: 'Singapore' },
  { from: 890, to: 890, name: 'India' },
  { from: 893, to: 893, name: 'Vietnam' },
  { from: 896, to: 896, name: 'Pakistan' },
  { from: 899, to: 899, name: 'Indonesia' },
  { from: 900, to: 919, name: 'Austria' },
  { from: 930, to: 939, name: 'Australia' },
  { from: 940, to: 949, name: 'New Zealand' },
  { from: 955, to: 955, name: 'Malaysia' },
  { from: 958, to: 958, name: 'Macau' },
]

export function gs1Country(ean13: string): string {
  if (!/^\d{3}/.test(ean13)) return 'Unknown'
  const p = parseInt(ean13.slice(0, 3), 10)
  const hit = GS1.find(r => p >= r.from && p <= r.to)
  return hit ? hit.name : 'Unknown / unassigned'
}

/* Full EAN-13 validation with breakdown. Input may be 12 or 13 digits. */
export function analyzeEan13(input: string) {
  const v = input.replace(/\s/g, '')
  if (!/^\d{12,13}$/.test(v)) {
    return { valid: false as const, reason: 'Enter 12 or 13 digits' }
  }
  const data = v.slice(0, 12)
  const expected = gs1CheckDigit(data)
  const provided = v.length === 13 ? parseInt(v[12], 10) : null
  const full = data + expected
  return {
    valid: provided === null ? true : provided === expected,
    hasCheck: provided !== null,
    provided,
    expected,
    full,
    country: gs1Country(full),
    countryPrefix: full.slice(0, 3),
    manufacturer: full.slice(3, 7),
    product: full.slice(7, 12),
    check: full.slice(12, 13),
  }
}
