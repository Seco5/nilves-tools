'use client'
import { useState, useRef } from 'react'
import { format as sqlFormat } from 'sql-formatter'
import LineNumbers from '@/components/LineNumbers'
import { useLanguage } from '@/contexts/LanguageContext'

const L10N = {
  tr: {
    spaces2: '2 boşluk', spaces4: '4 boşluk', tab: 'Tab',
    upper: 'BÜYÜK HARF', lower: 'küçük harf', formatOnPaste: 'Yapıştırınca biçimlendir',
    sample: 'Örnek', format: 'Biçimlendir', minify: 'Küçült', copy: 'Kopyala', clear: 'Temizle',
    input: 'Girdi', formatted: 'Biçimlendirilmiş', placeholder: 'SQL sorgunuzu buraya yapıştırın…',
    idle: 'BEKLEMEDE', valid: 'GEÇERLİ', error: 'HATA', minified: 'KÜÇÜLTÜLDÜ',
    pasteToBegin: 'Başlamak için SQL yapıştırın', looksValid: 'Geçerli görünüyor', invalidSql: 'Geçersiz SQL', stripped: 'Boşluklar temizlendi',
    lines: 'satır', chars: 'karakter', keywords: 'anahtar kelime',
  },
  en: {
    spaces2: '2 spaces', spaces4: '4 spaces', tab: 'Tab',
    upper: 'UPPERCASE', lower: 'lowercase', formatOnPaste: 'Format on paste',
    sample: 'Sample', format: 'Format', minify: 'Minify', copy: 'Copy', clear: 'Clear',
    input: 'Input', formatted: 'Formatted', placeholder: 'Paste your SQL query here…',
    idle: 'IDLE', valid: 'VALID', error: 'ERROR', minified: 'MINIFIED',
    pasteToBegin: 'Paste SQL to begin', looksValid: 'Looks valid', invalidSql: 'Invalid SQL', stripped: 'Whitespace stripped',
    lines: 'lines', chars: 'chars', keywords: 'keywords',
  },
} as const

type Dialect = 'mysql' | 'postgresql' | 'sqlite' | 'tsql' | 'plsql' | 'bigquery'

const DIALECTS: { id: Dialect; label: string }[] = [
  { id: 'mysql',      label: 'MySQL' },
  { id: 'postgresql', label: 'PostgreSQL' },
  { id: 'sqlite',     label: 'SQLite' },
  { id: 'tsql',       label: 'T-SQL' },
  { id: 'plsql',      label: 'Oracle' },
  { id: 'bigquery',   label: 'BigQuery' },
]

const SAMPLE =
  "SELECT u.id,u.name,u.email,COUNT(o.id) as order_count,SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.created_at >= '2024-01-01' AND u.status='active' GROUP BY u.id,u.name,u.email HAVING COUNT(o.id)>0 ORDER BY total_spent DESC LIMIT 10"

const KEYWORDS = new Set([
  'SELECT','FROM','WHERE','AND','OR','NOT','NULL','IS','IN','LIKE','BETWEEN','AS',
  'JOIN','INNER','LEFT','RIGHT','FULL','OUTER','CROSS','ON','USING','GROUP','BY',
  'ORDER','HAVING','LIMIT','OFFSET','UNION','ALL','DISTINCT','INSERT','INTO','VALUES',
  'UPDATE','SET','DELETE','CREATE','TABLE','ALTER','DROP','INDEX','VIEW','PRIMARY',
  'KEY','FOREIGN','REFERENCES','DEFAULT','UNIQUE','CONSTRAINT','CASE','WHEN','THEN',
  'ELSE','END','ASC','DESC','EXISTS','WITH','RETURNING','TRUNCATE','ADD','COLUMN',
  'TOP','INT','VARCHAR','TEXT','DATE','DATETIME','TIMESTAMP','BOOLEAN','DECIMAL',
  'CHAR','BIGINT','SMALLINT','FLOAT','DOUBLE','NUMERIC','AUTO_INCREMENT','IDENTITY',
])

const FUNCTIONS = new Set([
  'COUNT','SUM','AVG','MIN','MAX','COALESCE','NULLIF','CAST','CONVERT','LOWER','UPPER',
  'TRIM','LENGTH','LEN','SUBSTRING','SUBSTR','REPLACE','CONCAT','ROUND','FLOOR','CEIL',
  'CEILING','ABS','NOW','CURRENT_TIMESTAMP','CURRENT_DATE','DATE_ADD','DATEDIFF','EXTRACT',
  'ROW_NUMBER','RANK','DENSE_RANK','LAG','LEAD','OVER','PARTITION','IFNULL','GREATEST','LEAST',
])

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/* Token-based SQL syntax highlighter → returns HTML */
function highlight(sql: string): string {
  // Matches: block comment, line comment, single-quote string, double-quote/backtick ident,
  // number, word, operator, whitespace/other
  const re = /(\/\*[\s\S]*?\*\/)|(--[^\n]*)|('(?:''|[^'])*')|("(?:""|[^"])*"|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([+\-*/%=<>!|&^~]+)|([\s\S])/g
  let out = ''
  let m: RegExpExecArray | null
  while ((m = re.exec(sql))) {
    if (m[1] || m[2]) out += `<span class="sq-com">${esc(m[1] || m[2])}</span>`
    else if (m[3]) out += `<span class="sq-str">${esc(m[3])}</span>`
    else if (m[4]) out += `<span class="sq-id">${esc(m[4])}</span>`
    else if (m[5]) out += `<span class="sq-num">${esc(m[5])}</span>`
    else if (m[6]) {
      const up = m[6].toUpperCase()
      if (KEYWORDS.has(up)) out += `<span class="sq-kw">${esc(m[6])}</span>`
      else if (FUNCTIONS.has(up)) out += `<span class="sq-fn">${esc(m[6])}</span>`
      else out += esc(m[6])
    }
    else if (m[7]) out += `<span class="sq-op">${esc(m[7])}</span>`
    else out += esc(m[8])
  }
  return out
}

/* Basic structural validation (sql-formatter never throws). */
function validate(sql: string): { ok: boolean; error: string } {
  const s = sql.trim()
  if (!s) return { ok: false, error: '' }
  // strip strings & comments before checking parens
  const stripped = s
    .replace(/'(?:''|[^'])*'/g, "''")
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[^\n]*/g, '')
  let depth = 0
  for (const ch of stripped) {
    if (ch === '(') depth++
    else if (ch === ')') { depth--; if (depth < 0) return { ok: false, error: 'Unbalanced parentheses — extra closing ")"' } }
  }
  if (depth > 0) return { ok: false, error: `Unbalanced parentheses — ${depth} unclosed "("` }
  // unclosed single-quote string
  const quotes = (s.replace(/''/g, '').match(/'/g) || []).length
  if (quotes % 2 !== 0) return { ok: false, error: 'Unclosed string literal (odd number of quotes)' }
  // SELECT without FROM (allow SELECT of literals e.g. SELECT 1)
  if (/\bSELECT\b/i.test(stripped) && !/\bFROM\b/i.test(stripped) && /\bFROM\b/i.test('') === false) {
    // only warn if it references a table-ish identifier with a dot or *
    if (/\b[A-Za-z_]\w*\.\w+/.test(stripped) || /\bSELECT\b[\s\S]*\*/.test(stripped)) {
      return { ok: false, error: 'SELECT references columns but has no FROM clause' }
    }
  }
  return { ok: true, error: '' }
}

function countKeywords(sql: string): number {
  const words = sql.toUpperCase().match(/[A-Z_]+/g) || []
  return words.filter(w => KEYWORDS.has(w)).length
}

export default function SqlFormatter() {
  const { lang } = useLanguage()
  const L = L10N[lang === 'en' ? 'en' : 'tr']
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [outLines, setOutLines] = useState(1)
  const [chip, setChip] = useState<'idle' | 'ok' | 'err' | 'min'>('idle')
  const [chipTxt, setChipTxt] = useState<string>(L.idle)
  const [msg, setMsg] = useState<string>(L.pasteToBegin)
  const [stats, setStats] = useState('')

  const [dialect, setDialect] = useState<Dialect>('mysql')
  const [indent, setIndent] = useState<'2' | '4' | 'tab'>('2')
  const [upper, setUpper] = useState(true)
  const [fmtOnPaste, setFmtOnPaste] = useState(false)

  const outRef = useRef<HTMLDivElement>(null)
  const inGutter = useRef<HTMLDivElement>(null)
  const outGutter = useRef<HTMLDivElement>(null)

  const showOut = (text: string) => {
    setOutput(
      '<pre style="font-family:inherit;font-size:inherit;line-height:inherit;background:none;border:none;padding:0;margin:0;white-space:pre-wrap;word-break:break-word">' +
      highlight(text) + '</pre>'
    )
    setOutLines(Math.max(1, text.split('\n').length))
  }

  const setStatsFor = (text: string, src: string) => {
    setStats(`${text.split('\n').length} ${L.lines} · ${src.length} ${L.chars} · ${countKeywords(src)} ${L.keywords}`)
  }

  const doFormat = (raw: string) => {
    const src = raw ?? input
    if (!src.trim()) {
      setOutput(''); setOutLines(1)
      setChip('idle'); setChipTxt(L.idle); setMsg(L.pasteToBegin); setStats('')
      return
    }
    const v = validate(src)
    let formatted: string
    try {
      formatted = sqlFormat(src, {
        language: dialect,
        tabWidth: indent === 'tab' ? 2 : Number(indent),
        useTabs: indent === 'tab',
        keywordCase: upper ? 'upper' : 'lower',
      })
    } catch {
      formatted = src // never crash
    }
    showOut(formatted)
    setStatsFor(formatted, src)
    if (v.ok) {
      setChip('ok'); setChipTxt(L.valid); setMsg(L.looksValid)
    } else {
      setChip('err'); setChipTxt(L.error); setMsg(v.error || L.invalidSql)
    }
  }

  const handleInput = (val: string) => setInput(val)

  const minify = () => {
    if (!input.trim()) return
    const min = input
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/--[^\n]*/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s*([(),])\s*/g, '$1')
      .trim()
    showOut(min)
    setStatsFor(min, min)
    setChip('min'); setChipTxt(L.minified); setMsg(L.stripped)
  }

  const loadSample = () => { setInput(SAMPLE); doFormat(SAMPLE) }
  const clearAll = () => {
    setInput(''); setOutput(''); setOutLines(1)
    setChip('idle'); setChipTxt(L.idle); setMsg(L.pasteToBegin); setStats('')
  }

  const onPaste = () => {
    if (fmtOnPaste) setTimeout(() => doFormat(''), 0)
  }

  const copyOut = () => {
    const pre = outRef.current?.querySelector('pre')
    const txt = pre ? pre.textContent || '' : outRef.current?.textContent || ''
    navigator.clipboard.writeText(txt).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  const syncIn = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (inGutter.current) inGutter.current.scrollTop = e.currentTarget.scrollTop
  }
  const syncOut = (e: React.UIEvent<HTMLDivElement>) => {
    if (outGutter.current) outGutter.current.scrollTop = e.currentTarget.scrollTop
  }

  return (
    <>
      <div className="sql-toolbar">
        <div className="sql-toolbar-left">
          <select className="indent-sel" value={dialect} onChange={e => setDialect(e.target.value as Dialect)} aria-label="SQL dialect">
            {DIALECTS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
          <select className="indent-sel" value={indent} onChange={e => setIndent(e.target.value as '2'|'4'|'tab')} aria-label="Indent">
            <option value="2">{L.spaces2}</option>
            <option value="4">{L.spaces4}</option>
            <option value="tab">{L.tab}</option>
          </select>
          <div className="sql-case">
            <button className={`sql-case-btn${upper ? ' active' : ''}`} onClick={() => setUpper(true)}>{L.upper}</button>
            <button className={`sql-case-btn${!upper ? ' active' : ''}`} onClick={() => setUpper(false)}>{L.lower}</button>
          </div>
          <label className="sql-paste-toggle">
            <input type="checkbox" checked={fmtOnPaste} onChange={e => setFmtOnPaste(e.target.checked)} />
            {L.formatOnPaste}
          </label>
        </div>
        <div className="sql-toolbar-right btn-group">
          <button className="btn-action ghost" onClick={loadSample}>{L.sample}</button>
          <button className="btn-action format" onClick={() => doFormat('')}>{L.format} ↵</button>
          <button className="btn-action minify" onClick={minify}>{L.minify}</button>
          <button className="btn-action copy" onClick={copyOut}>{L.copy}</button>
          <button className="btn-action ghost" onClick={clearAll}>{L.clear}</button>
        </div>
      </div>

      <div className="split" style={{ flex: 1 }}>
        <div className="pane">
          <div className="pane-hdr"><span className="pane-label">{L.input}</span></div>
          <div className="code-area">
            <LineNumbers ref={inGutter} count={Math.max(1, input.split('\n').length)} />
            <textarea
              value={input}
              onChange={e => handleInput(e.target.value)}
              onScroll={syncIn}
              onPaste={onPaste}
              placeholder={L.placeholder}
              spellCheck={false}
            />
          </div>
        </div>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">{L.formatted}</span>
            <span className={`chip chip-${chip}`}>{chipTxt}</span>
          </div>
          <div className="code-area">
            <LineNumbers ref={outGutter} count={outLines} />
            <div className="output-box" ref={outRef} onScroll={syncOut} dangerouslySetInnerHTML={{ __html: output }} />
          </div>
        </div>
      </div>

      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chipTxt}</span>
        <span>{msg}</span>
        <span style={{ marginLeft: 'auto' }}>{stats}</span>
      </div>
    </>
  )
}
