'use client'
import { useLanguage } from '@/contexts/LanguageContext'

/* Shared bilingual strings for the simpler tool pages.
   Use via: const { tt, lang } = useTT()  →  tt.input, tt.copy ... */
const COMMON = {
  tr: {
    input: 'Girdi', output: 'Çıktı', copy: 'Kopyala', copyAll: 'Tümünü Kopyala',
    generate: 'Üret', clear: 'Temizle', encode: 'Kodla', decode: 'Çöz',
    count: 'Adet', sample: 'Örnek', format: 'Biçimlendir', minify: 'Küçült',
    options: 'Seçenekler', length: 'Uzunluk', type: 'Tür',
    uppercase: 'Büyük harf', lowercase: 'Küçük harf', numbers: 'Rakamlar', symbols: 'Semboller',
    paragraphs: 'Paragraf', sentences: 'Cümle', words: 'Kelime',
    inputText: 'Girdi metni', result: 'Sonuç',
    copied: 'Kopyalandı!', invalid: 'Geçersiz', error: 'Hata',
    lines: 'satır', characters: 'karakter',
  },
  en: {
    input: 'Input', output: 'Output', copy: 'Copy', copyAll: 'Copy all',
    generate: 'Generate', clear: 'Clear', encode: 'Encode', decode: 'Decode',
    count: 'Count', sample: 'Sample', format: 'Format', minify: 'Minify',
    options: 'Options', length: 'Length', type: 'Type',
    uppercase: 'Uppercase', lowercase: 'Lowercase', numbers: 'Numbers', symbols: 'Symbols',
    paragraphs: 'Paragraphs', sentences: 'Sentences', words: 'Words',
    inputText: 'Input text', result: 'Result',
    copied: 'Copied!', invalid: 'Invalid', error: 'Error',
    lines: 'lines', characters: 'chars',
  },
} as const

export function useTT() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  return { tt: COMMON[en ? 'en' : 'tr'], lang, en }
}
