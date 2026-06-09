'use client'
import { useState, useRef } from 'react'
import LineNumbers from '@/components/LineNumbers'

const SAMPLE =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<catalog>' +
  '<product id="p1"><name>Wireless Mouse</name><price currency="USD">24.99</price><inStock>true</inStock></product>' +
  '<product id="p2"><name>Mechanical Keyboard</name><price currency="USD">89.00</price><inStock>false</inStock></product>' +
  '</catalog>'

/* ─── Helpers ────────────────────────────────────────────────── */
function escX(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/* Serialize a DOM node tree into pretty-printed XML.
   Tracks tag count and max nesting depth via `state`. */
function serialize(
  node: Node,
  level: number,
  unit: string,
  state: { tags: number; depth: number },
): string {
  let out = ''
  node.childNodes.forEach((child) => {
    const pad = unit.repeat(level)
    switch (child.nodeType) {
      case 1: { // ELEMENT
        const el = child as Element
        state.tags++
        state.depth = Math.max(state.depth, level + 1)
        const attrs = Array.from(el.attributes)
          .map((a) => ` ${a.name}="${a.value}"`)
          .join('')
        const kids = Array.from(el.childNodes)
        const hasElementChild = kids.some((c) => c.nodeType === 1 || c.nodeType === 8 || c.nodeType === 4)
        if (kids.length === 0) {
          out += `${pad}<${el.tagName}${attrs}/>\n`
        } else if (!hasElementChild) {
          // text-only node — keep it inline
          out += `${pad}<${el.tagName}${attrs}>${(el.textContent || '').trim()}</${el.tagName}>\n`
        } else {
          out += `${pad}<${el.tagName}${attrs}>\n`
          out += serialize(el, level + 1, unit, state)
          out += `${pad}</${el.tagName}>\n`
        }
        break
      }
      case 8: // COMMENT
        out += `${pad}<!--${(child as Comment).nodeValue}-->\n`
        break
      case 4: // CDATA
        out += `${pad}<![CDATA[${(child as CDATASection).nodeValue}]]>\n`
        break
      case 3: { // TEXT — skip whitespace-only nodes
        const txt = (child.nodeValue || '').trim()
        if (txt) out += `${pad}${txt}\n`
        break
      }
    }
  })
  return out
}

/* Highlight a single tag: tag name, attribute names, attribute values, brackets. */
function highlightTag(tag: string): string {
  const m = tag.match(/^(<\/?)([\w:.\-]+)([\s\S]*?)(\/?>)$/)
  if (!m) return `<span class="x-punct">${escX(tag)}</span>`
  const [, open, name, attrsPart, close] = m
  const attrHtml = attrsPart.replace(
    /([\w:.\-]+)(\s*=\s*)("[^"]*"|'[^']*')/g,
    (_full, an: string, eq: string, av: string) =>
      `<span class="x-attr">${escX(an)}</span>${escX(eq)}<span class="x-val">${escX(av)}</span>`,
  )
  return (
    `<span class="x-punct">${escX(open)}</span>` +
    `<span class="x-tag">${escX(name)}</span>` +
    attrHtml +
    `<span class="x-punct">${escX(close)}</span>`
  )
}

/* Tokenise formatted XML and wrap each token in a highlight span. */
function highlightXml(xml: string): string {
  const tokenRe =
    /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>|<!DOCTYPE[\s\S]*?>|<\/?[^>]+>|[^<]+/g
  return xml.replace(tokenRe, (tok) => {
    if (tok.startsWith('<!--')) return `<span class="x-comment">${escX(tok)}</span>`
    if (tok.startsWith('<?')) return `<span class="x-decl">${escX(tok)}</span>`
    if (tok.startsWith('<![CDATA[')) return `<span class="x-val">${escX(tok)}</span>`
    if (tok.startsWith('<!DOCTYPE')) return `<span class="x-decl">${escX(tok)}</span>`
    if (tok.startsWith('<')) return highlightTag(tok)
    return escX(tok)
  })
}

/* Parse with native DOMParser, throwing a helpful error (with line no. when available). */
function parseXml(raw: string): Document {
  const doc = new DOMParser().parseFromString(raw, 'application/xml')
  const errNode = doc.querySelector('parsererror')
  if (errNode) {
    const text = errNode.textContent || 'Invalid XML'
    const lineMatch = text.match(/line\s*(?:number\s*)?(\d+)/i)
    const colMatch = text.match(/column\s*(\d+)/i)
    // The browser embeds a verbose message; surface the first meaningful line.
    const firstLine = text.split('\n').map((l) => l.trim()).filter(Boolean)[0] || 'Invalid XML'
    let msg = firstLine
    if (lineMatch) msg += ` (line ${lineMatch[1]}${colMatch ? `, col ${colMatch[1]}` : ''})`
    throw new Error(msg)
  }
  return doc
}

const DECL_RE = /^\s*<\?xml[^>]*\?>/i

export default function XmlFormatterClient() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [chip, setChip] = useState<'idle' | 'ok' | 'err'>('idle')
  const [chipTxt, setChipTxt] = useState('IDLE')
  const [msg, setMsg] = useState('Paste XML to begin')
  const [stats, setStats] = useState('')
  const [indent, setIndent] = useState('2')
  const [outLines, setOutLines] = useState(1)
  const outRef = useRef<HTMLDivElement>(null)
  const inGutter = useRef<HTMLDivElement>(null)
  const outGutter = useRef<HTMLDivElement>(null)

  const getUnit = () => (indent === '1' ? '\t' : ' '.repeat(Number(indent)))

  const format = (raw: string) => {
    if (!raw.trim()) {
      setOutput(''); setOutLines(1)
      setChip('idle'); setChipTxt('IDLE'); setMsg('Paste XML to begin'); setStats('')
      return
    }
    try {
      const doc = parseXml(raw)
      const state = { tags: 0, depth: 0 }
      const declMatch = raw.match(DECL_RE)
      const body = serialize(doc, 0, getUnit(), state).trimEnd()
      const formatted = (declMatch ? declMatch[0].trim() + '\n' : '') + body
      setOutput(
        '<pre style="font-family:inherit;font-size:inherit;line-height:inherit;background:none;border:none;padding:0;margin:0">' +
          highlightXml(formatted) +
          '</pre>',
      )
      setOutLines(formatted.split('\n').length)
      setChip('ok'); setChipTxt('VALID'); setMsg('Valid XML')
      setStats(
        `${state.tags} tag${state.tags === 1 ? '' : 's'} · depth ${state.depth} · ${raw.length} chars`,
      )
    } catch (e: unknown) {
      const err = (e as Error).message
      setOutput('<span style="color:var(--red)">' + escX(err) + '</span>'); setOutLines(1)
      setChip('err'); setChipTxt('ERROR'); setMsg(err); setStats('')
    }
  }

  const handleInput = (v: string) => { setInput(v); format(v) }
  const loadSample = () => { setInput(SAMPLE); format(SAMPLE) }

  const syncIn = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (inGutter.current) inGutter.current.scrollTop = e.currentTarget.scrollTop
  }
  const syncOut = (e: React.UIEvent<HTMLDivElement>) => {
    if (outGutter.current) outGutter.current.scrollTop = e.currentTarget.scrollTop
  }

  const minify = () => {
    if (!input.trim()) return
    try {
      const doc = parseXml(input)
      const state = { tags: 0, depth: 0 }
      const declMatch = input.match(DECL_RE)
      const body = serialize(doc, 0, '', state)
        .replace(/\n/g, '')          // drop the per-line newlines from serialize
        .replace(/>\s+</g, '><')      // collapse any residual inter-tag whitespace
        .trim()
      const compact = (declMatch ? declMatch[0].trim() : '') + body
      setInput(compact)
      format(compact)
    } catch {
      /* keep current error state from format() */
      format(input)
    }
  }

  const copyOut = () => {
    const pre = outRef.current?.querySelector('pre')
    const txt = pre ? pre.textContent || '' : outRef.current?.textContent || ''
    navigator.clipboard.writeText(txt).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  return (
    <>
      <div className="split" style={{ flex: 1 }}>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">Input</span>
            <div className="btn-group">
              <select className="indent-sel" value={indent} onChange={(e) => { setIndent(e.target.value); format(input) }}>
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="1">tab</option>
              </select>
              <button className="btn-action ghost" onClick={loadSample}>Sample</button>
              <button className="btn-action ghost" onClick={() => handleInput('')}>Clear</button>
              <button className="btn-action format" onClick={() => format(input)}>Format ↵</button>
            </div>
          </div>
          <div className="code-area">
            <LineNumbers ref={inGutter} count={input.split('\n').length} />
            <textarea
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              onScroll={syncIn}
              placeholder={'Paste XML here…\n<note><to>DevOneKit</to><from>Dev</from></note>'}
              spellCheck={false}
            />
          </div>
        </div>
        <div className="pane">
          <div className="pane-hdr">
            <span className="pane-label">Output</span>
            <div className="btn-group">
              <button className="btn-action minify" onClick={minify}>Minify</button>
              <button className="btn-action copy" onClick={copyOut}>Copy</button>
            </div>
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
