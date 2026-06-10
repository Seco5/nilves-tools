import {
  Braces, GitCompareArrows, CodeXml, Database, ArrowLeftRight, FileText,
  Fingerprint, KeyRound, Hash, Pilcrow, Palette, QrCode, Binary, Link2,
  ShieldCheck, Clock, Calculator, AlarmClock, Regex, IdCard, Building2,
  Landmark, CreditCard, GraduationCap, CalendarRange,
  type LucideIcon,
} from 'lucide-react'

/* Central map: route → premium line icon */
export const TOOL_ICONS: Record<string, LucideIcon> = {
  '/json-formatter':        Braces,
  '/diff-checker':          GitCompareArrows,
  '/xml-formatter':         CodeXml,
  '/sql-formatter':         Database,
  '/csv-json':              ArrowLeftRight,
  '/markdown-preview':      FileText,

  '/uuid-generator':        Fingerprint,
  '/password-generator':    KeyRound,
  '/hash-generator':        Hash,
  '/lorem-ipsum':           Pilcrow,
  '/color-converter':       Palette,
  '/barcode-qr':            QrCode,

  '/base64':                Binary,
  '/url-encode-decode':     Link2,
  '/jwt-decoder':           ShieldCheck,

  '/timestamp':             Clock,
  '/number-base':           Calculator,
  '/cron-expression':       AlarmClock,

  '/regex-tester':          Regex,

  '/tckn-generator':        IdCard,
  '/vkn-generator':         Building2,
  '/iban-generator':     Landmark,
  '/credit-card-generator': CreditCard,

  '/project-planner':       CalendarRange,
  '/sql-playground':        GraduationCap,
}

export function ToolIcon({ href, size = 16, className }: { href: string; size?: number; className?: string }) {
  const Icon = TOOL_ICONS[href]
  if (!Icon) return null
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden="true" />
}
