'use client'

import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import {
  Filter, ListTree, Code2, Trash2, GripVertical, Plus, Copy, Check,
  Zap, Lock,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// ── Types ───────────────────────────────────────────────────────────────────
type Op = '$eq' | '$ne' | '$gt' | '$gte' | '$lt' | '$lte' | '$in' | '$nin' | '$exists' | '$regex'
type Cond = { field: string; op: Op; value: string }
type Operation = 'find' | 'insertOne' | 'updateMany' | 'aggregate'
type StageType = '$group' | '$sort' | '$project' | '$limit' | '$skip' | '$unwind' | '$lookup'
type Fmt = 'shell' | 'node' | 'python'

type Stage = {
  id: number
  type: StageType
  groupBy?: string; outField?: string; acc?: string; accField?: string
  sortField?: string; sortDir?: string
  project?: string
  num?: string
  unwind?: string
  from?: string; localField?: string; foreignField?: string; as?: string
}

const OPERATORS: Op[] = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin', '$exists', '$regex']
const ACCUMULATORS = ['sum', 'avg', 'min', 'max', 'push', 'first', 'last']

let _sid = 100
const nextId = () => ++_sid

// ── Value / code formatting ───────────────────────────────────────────────────
const isNum = (v: string) => /^-?\d+(\.\d+)?$/.test(v.trim())
const isIso = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v.trim())

function qstr(s: string, fmt: Fmt): string {
  return fmt === 'node' ? `'${s}'` : `"${s}"`
}

function key(name: string, fmt: Fmt): string {
  return fmt === 'python' ? `"${name}"` : name
}

function objWrap(body: string, fmt: Fmt): string {
  if (!body) return '{}'
  return fmt === 'python' ? `{${body}}` : `{ ${body} }`
}

function scalar(raw: string, fmt: Fmt): string {
  const v = raw.trim()
  if (v === '') return fmt === 'python' ? '""' : (fmt === 'node' ? "''" : '""')
  if (isNum(v)) return v
  if (v === 'true' || v === 'false') return fmt === 'python' ? (v === 'true' ? 'True' : 'False') : v
  if (isIso(v)) {
    if (fmt === 'shell') return `ISODate("${v}")`
    if (fmt === 'node') return `new Date('${v}')`
    const [y, mo, d] = v.split('-').map(Number)
    return `datetime(${y}, ${mo}, ${d})`
  }
  return qstr(v, fmt)
}

function condValue(op: Op, raw: string, fmt: Fmt): string {
  if (op === '$exists') {
    const t = raw.trim() !== 'false'
    return fmt === 'python' ? (t ? 'True' : 'False') : (t ? 'true' : 'false')
  }
  if (op === '$in' || op === '$nin') {
    const items = raw.split(',').map(s => s.trim()).filter(Boolean).map(s => scalar(s, fmt))
    return '[' + items.join(', ') + ']'
  }
  return scalar(raw, fmt)
}

// Build the filter / $match body object string from conditions
function filterObj(conds: Cond[], fmt: Fmt): string {
  const parts = conds.filter(c => c.field.trim()).map(c => {
    const inner = objWrap(`${key(c.op, fmt)}: ${condValue(c.op, c.value, fmt)}`, fmt)
    return `${key(c.field, fmt)}: ${inner}`
  })
  return objWrap(parts.join(', '), fmt)
}

// Build the "value" portion of a single pipeline stage (everything after `$type:`)
function stageValue(st: Stage, fmt: Fmt): string {
  switch (st.type) {
    case '$group': {
      const accVal = (st.accField && isNum(st.accField)) ? st.accField! : qstr('$' + (st.accField || ''), fmt)
      const accObj = objWrap(`${key('$' + (st.acc || 'sum'), fmt)}: ${accVal}`, fmt)
      const body = `${key('_id', fmt)}: ${qstr('$' + (st.groupBy || ''), fmt)}, ${key(st.outField || 'count', fmt)}: ${accObj}`
      return objWrap(body, fmt)
    }
    case '$sort':
      return objWrap(`${key(st.sortField || 'field', fmt)}: ${st.sortDir || '1'}`, fmt)
    case '$project': {
      const toks = (st.project || '').split(',').map(s => s.trim()).filter(Boolean)
      const body = toks.map(t => t.startsWith('-') ? `${key(t.slice(1), fmt)}: 0` : `${key(t, fmt)}: 1`).join(', ')
      return objWrap(body, fmt)
    }
    case '$limit':
    case '$skip':
      return String(st.num ?? '0').trim() || '0'
    case '$unwind':
      return qstr('$' + (st.unwind || ''), fmt)
    case '$lookup': {
      const body = [
        `${key('from', fmt)}: ${qstr(st.from || '', fmt)}`,
        `${key('localField', fmt)}: ${qstr(st.localField || '', fmt)}`,
        `${key('foreignField', fmt)}: ${qstr(st.foreignField || '', fmt)}`,
        `${key('as', fmt)}: ${qstr(st.as || '', fmt)}`,
      ].join(', ')
      return objWrap(body, fmt)
    }
  }
}

function stageElement(st: Stage, fmt: Fmt): string {
  return objWrap(`${key(st.type, fmt)}: ${stageValue(st, fmt)}`, fmt)
}

function matchElement(conds: Cond[], fmt: Fmt): string {
  return objWrap(`${key('$match', fmt)}: ${filterObj(conds, fmt)}`, fmt)
}

// Full code generation
function generate(op: Operation, coll: string, conds: Cond[], stages: Stage[], fmt: Fmt): string {
  const c = coll.trim() || 'collection'
  const hasFilter = conds.some(x => x.field.trim())

  if (op === 'aggregate') {
    const els: string[] = []
    if (hasFilter) els.push(matchElement(conds, fmt))
    stages.forEach(s => els.push(stageElement(s, fmt)))
    const ind = fmt === 'python' ? '    ' : '  '
    const joined = els.length ? '\n' + els.map(e => ind + e).join(',\n') + '\n' : ''
    if (fmt === 'shell') return `db.${c}.aggregate([${joined}])`
    if (fmt === 'node') return `const result = await db.collection('${c}').aggregate([${joined}]).toArray();`
    return `result = list(db.${c}.aggregate([${joined}]))`
  }

  if (op === 'find') {
    const f = filterObj(conds, fmt)
    if (fmt === 'shell') return `db.${c}.find(${f})`
    if (fmt === 'node') return `const result = await db.collection('${c}').find(${f}).toArray();`
    return `result = list(db.${c}.find(${f}))`
  }

  if (op === 'updateMany') {
    const f = filterObj(conds, fmt)
    if (fmt === 'shell') return `db.${c}.updateMany(${f}, { $set: {} })`
    if (fmt === 'node') return `const result = await db.collection('${c}').updateMany(${f}, { $set: {} });`
    return `result = db.${c}.update_many(${f}, {"$set": {}})`
  }

  // insertOne
  if (fmt === 'shell') return `db.${c}.insertOne({})`
  if (fmt === 'node') return `const result = await db.collection('${c}').insertOne({});`
  return `result = db.${c}.insert_one({})`
}

// ── Syntax highlighting ───────────────────────────────────────────────────────
function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
const KEYWORDS = ['db', 'ISODate', 'Date', 'datetime', 'await', 'const', 'new', 'list', 'toArray', 'collection', 'find', 'aggregate', 'updateMany', 'insertOne', 'update_many', 'insert_one', 'result', 'true', 'false', 'True', 'False', 'None']
const TOKEN = new RegExp(
  `("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')|(\\$[a-zA-Z]+)|\\b(\\d+(?:\\.\\d+)?)\\b|\\b(${KEYWORDS.join('|')})\\b`,
  'g',
)
function highlight(code: string): string {
  let out = '', last = 0, m: RegExpExecArray | null
  TOKEN.lastIndex = 0
  while ((m = TOKEN.exec(code))) {
    out += esc(code.slice(last, m.index))
    const txt = esc(m[0])
    let color = 'var(--teal)'
    if (m[1]) color = '#8250df'        // strings → purple
    else if (m[2]) color = '#d6336c'   // $operators → pink
    else if (m[3]) color = '#b66b00'   // numbers → amber
    out += `<span style="color:${color}">${txt}</span>`
    last = m.index + m[0].length
  }
  out += esc(code.slice(last))
  return out
}

// ── i18n ──────────────────────────────────────────────────────────────────────
const T = {
  tr: {
    eyebrow: '🛢️ GELİŞTİRİCİ ARAÇLARI',
    title: 'MongoDB Sorgu Oluşturucu',
    subtitle: "Filter ve aggregate pipeline'ları görsel olarak oluşturun, Shell, Node.js veya Python kodu olarak alın.",
    collection: 'Koleksiyon',
    operation: 'İşlem',
    filterBuilder: 'Filter Oluşturucu',
    addCondition: '+ Koşul Ekle',
    field: 'alan', value: 'değer',
    aggregatePipeline: 'Aggregate Pipeline',
    addStage: '+ Aşama Ekle',
    chooseStage: 'Aşama türü seç…',
    output: 'Çıktı Formatı',
    copy: 'Kopyala', copied: 'Kopyalandı!',
    groupBy: 'Grupla (_id)', accumulator: 'Toplama', accField: 'Alan/değer', outField: 'Çıktı alanı',
    sortField: 'Alan', dir: 'Yön', asc: '1 (artan)', desc: '-1 (azalan)',
    projectFields: 'Alanlar (virgülle, - ile hariç tut)',
    number: 'Sayı', unwindPath: 'Array alanı',
    from: 'from (koleksiyon)', localField: 'localField', foreignField: 'foreignField', as: 'as',
    edit: 'Düzenle',
    whatTitle: 'MongoDB Aggregate Pipeline Nedir?',
    what: "MongoDB Aggregation Pipeline, verileri sıralı aşamalardan (stage) geçirerek dönüştürmenizi ve özetlemenizi sağlayan güçlü bir araçtır. Her aşama bir öncekinin çıktısını girdi olarak alır. $match ile filtreleme, $group ile gruplama, $sort ile sıralama gibi aşamalar birleştirilerek SQL'deki GROUP BY, JOIN ve WHERE işlemlerinin karşılığı elde edilebilir.",
    opTitle: 'MongoDB Operatörleri',
    opCols: ['Operatör', 'Açıklama', 'Örnek'],
    cardTitles: ['Görsel Sorgu Oluşturma', '3 Dilde Kod Çıktısı', 'Gizlilik Önce'],
    cardDescs: [
      "MongoDB syntax'ını ezberlemeden filter ve pipeline oluşturun.",
      'Shell, Node.js veya Python formatında anında kod alın.',
      'Tamamen tarayıcıda çalışır, hiçbir veri sunucuya gönderilmez.',
    ],
    faqTitle: 'Sık Sorulan Sorular',
    relatedTitle: 'İlgili Araçlar',
    operators: [
      ['$eq', 'Eşittir', '{ status: { $eq: "active" } }'],
      ['$gt / $gte', 'Büyüktür / büyük eşit', '{ age: { $gt: 18 } }'],
      ['$lt / $lte', 'Küçüktür / küçük eşit', '{ price: { $lt: 100 } }'],
      ['$in / $nin', 'Listede var / yok', '{ status: { $in: ["active","pending"] } }'],
      ['$exists', 'Alan mevcut mu', '{ email: { $exists: true } }'],
      ['$match', 'Pipeline filtre aşaması', '{ $match: { status: "active" } }'],
      ['$group', 'Gruplama ve toplama', '{ $group: { _id: "$status", count: { $sum: 1 } } }'],
      ['$sort', 'Sıralama (1 artan, -1 azalan)', '{ $sort: { count: -1 } }'],
      ['$project', 'Alan seçimi/dönüşümü', '{ $project: { name: 1, _id: 0 } }'],
      ['$limit / $skip', 'Sayfalama', '{ $limit: 10 }, { $skip: 20 }'],
      ['$unwind', "Array'i ayrı dokümanlara açar", '{ $unwind: "$tags" }'],
      ['$lookup', 'Başka collection ile join', '{ $lookup: { from: "orders", ... } }'],
    ],
    faq: [
      { q: "Bu araç gerçek bir MongoDB'ye bağlanır mı?", a: 'Hayır. Bu araç sadece sorgu metni/kodu üretir. Hiçbir veritabanına bağlanmaz, hiçbir veri okumaz veya yazmaz. Üretilen kodu kendi uygulamanızda kullanırsınız.' },
      { q: '$match ile find() arasındaki fark nedir?', a: "find() doğrudan bir koleksiyon sorgusu çalıştırır ve dokümanları döner. $match ise aggregate pipeline'ın içinde bir filtreleme aşamasıdır ve sonraki aşamalara (gruplama, sıralama vb.) veri aktarır." },
      { q: 'ISODate ne zaman kullanılır?', a: "MongoDB'de tarih alanları genellikle Date tipinde saklanır. String olarak \"2026-01-01\" yazarsanız karşılaştırmalar çalışmaz. ISODate(\"2026-01-01\") veya new Date(\"2026-01-01\") kullanmanız gerekir." },
      { q: '$group ile SQL GROUP BY aynı mı?', a: "Kavramsal olarak benzerdir. $group, belirttiğiniz alana göre dokümanları gruplar ve $sum, $avg, $max, $min gibi accumulator'larla özet değerler hesaplar — SQL'deki GROUP BY + aggregate fonksiyonlarının karşılığıdır." },
      { q: 'Bu araç ücretsiz mi?', a: 'Evet, tamamen ücretsizdir. Kayıt, üyelik veya ödeme gerekmez. Tüm araçlar tarayıcınızda çalışır ve hiçbir veriniz sunucularımıza gönderilmez.' },
    ],
    related: [
      { name: 'SQL Formatlayıcı', desc: 'SQL sorgularını formatla', href: '/sql-formatter' },
      { name: 'SQL Playground', desc: 'SQL öğren ve test et', href: '/sql-playground' },
      { name: 'JSON Formatlayıcı', desc: 'JSON formatla ve doğrula', href: '/json-formatter' },
    ],
  },
  en: {
    eyebrow: '🛢️ DEVELOPER TOOLS',
    title: 'MongoDB Query Builder',
    subtitle: 'Build filters and aggregate pipelines visually, get code as Shell, Node.js or Python.',
    collection: 'Collection',
    operation: 'Operation',
    filterBuilder: 'Filter Builder',
    addCondition: '+ Add Condition',
    field: 'field', value: 'value',
    aggregatePipeline: 'Aggregate Pipeline',
    addStage: '+ Add Stage',
    chooseStage: 'Choose stage type…',
    output: 'Output Format',
    copy: 'Copy', copied: 'Copied!',
    groupBy: 'Group by (_id)', accumulator: 'Accumulator', accField: 'Field/value', outField: 'Output field',
    sortField: 'Field', dir: 'Direction', asc: '1 (asc)', desc: '-1 (desc)',
    projectFields: 'Fields (comma-separated, - to exclude)',
    number: 'Number', unwindPath: 'Array field',
    from: 'from (collection)', localField: 'localField', foreignField: 'foreignField', as: 'as',
    edit: 'Edit',
    whatTitle: 'What is MongoDB Aggregation Pipeline?',
    what: "MongoDB Aggregation Pipeline is a powerful tool that lets you transform and summarize data by passing it through sequential stages. Each stage takes the previous stage's output as input. Stages like $match for filtering, $group for grouping, $sort for ordering can be combined to achieve the equivalent of SQL's GROUP BY, JOIN and WHERE operations.",
    opTitle: 'MongoDB Operators',
    opCols: ['Operator', 'Description', 'Example'],
    cardTitles: ['Visual Query Building', '3 Language Output', 'Privacy First'],
    cardDescs: [
      'Build filters and pipelines without memorizing MongoDB syntax.',
      'Get instant code in Shell, Node.js or Python format.',
      'Runs entirely in browser, no data is sent to any server.',
    ],
    faqTitle: 'Frequently Asked Questions',
    relatedTitle: 'Related Tools',
    operators: [
      ['$eq', 'Equal to', '{ status: { $eq: "active" } }'],
      ['$gt / $gte', 'Greater than / or equal', '{ age: { $gt: 18 } }'],
      ['$lt / $lte', 'Less than / or equal', '{ price: { $lt: 100 } }'],
      ['$in / $nin', 'In / not in array', '{ status: { $in: ["active","pending"] } }'],
      ['$exists', 'Field exists', '{ email: { $exists: true } }'],
      ['$match', 'Pipeline filter stage', '{ $match: { status: "active" } }'],
      ['$group', 'Grouping and aggregation', '{ $group: { _id: "$status", count: { $sum: 1 } } }'],
      ['$sort', 'Sorting (1 asc, -1 desc)', '{ $sort: { count: -1 } }'],
      ['$project', 'Field selection/transformation', '{ $project: { name: 1, _id: 0 } }'],
      ['$limit / $skip', 'Pagination', '{ $limit: 10 }, { $skip: 20 }'],
      ['$unwind', 'Unpacks array into documents', '{ $unwind: "$tags" }'],
      ['$lookup', 'Join with another collection', '{ $lookup: { from: "orders", ... } }'],
    ],
    faq: [
      { q: 'Does this tool connect to a real MongoDB?', a: "No. This tool only generates query text/code. It doesn't connect to any database or read/write any data. You use the generated code in your own application." },
      { q: "What's the difference between $match and find()?", a: 'find() directly runs a collection query and returns documents. $match is a filtering stage inside an aggregate pipeline that passes data to subsequent stages (grouping, sorting, etc.).' },
      { q: 'When should I use ISODate?', a: 'Date fields in MongoDB are typically stored as Date type. If you write "2026-01-01" as a string, comparisons won\'t work. You need to use ISODate("2026-01-01") or new Date("2026-01-01").' },
      { q: 'Is $group the same as SQL GROUP BY?', a: "Conceptually similar. $group groups documents by a specified field and computes summary values with accumulators like $sum, $avg, $max, $min — equivalent to SQL's GROUP BY + aggregate functions." },
      { q: 'Is this tool free?', a: 'Yes, completely free. No registration, membership or payment required. All tools run in your browser and none of your data is sent to our servers.' },
    ],
    related: [
      { name: 'SQL Formatter', desc: 'Format SQL queries', href: '/sql-formatter' },
      { name: 'SQL Playground', desc: 'Learn and test SQL', href: '/sql-playground' },
      { name: 'JSON Formatter', desc: 'Format and validate JSON', href: '/json-formatter' },
    ],
  },
} as const

const sectionTitle: CSSProperties = {
  fontSize: 16, fontWeight: 500, color: 'var(--text)',
  marginBottom: '.875rem', paddingBottom: '.5rem', borderBottom: '0.5px solid var(--border)',
}
const inputStyle: CSSProperties = {
  padding: '7px 10px', borderRadius: 8, border: '0.5px solid var(--border)',
  background: 'var(--surface2)', color: 'var(--text)', fontSize: 13, width: '100%',
}
const labelStyle: CSSProperties = { fontSize: 11, color: 'var(--muted)', marginBottom: 4, display: 'block' }

// ── FAQ item ───────────────────────────────────────────────────────────────────
function FaqItem({ q, a, last }: { q: string; a: string; last: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: last ? 'none' : '0.5px solid var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
          padding: '12px 0', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text)',
          background: 'none', border: 'none', textAlign: 'left',
        }}
      >
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

// ── Main ────────────────────────────────────────────────────────────────────
export default function MongoQueryBuilder() {
  const { lang } = useLanguage()
  const t = T[lang === 'en' ? 'en' : 'tr']
  const en = lang === 'en'

  const [coll, setColl] = useState('users')
  const [op, setOp] = useState<Operation>('aggregate')
  const [conds, setConds] = useState<Cond[]>([
    { field: 'status', op: '$eq', value: 'active' },
    { field: 'createdAt', op: '$gt', value: '2026-01-01' },
  ])
  const [stages, setStages] = useState<Stage[]>([
    { id: 1, type: '$group', groupBy: 'status', outField: 'count', acc: 'sum', accField: '1' },
    { id: 2, type: '$sort', sortField: 'count', sortDir: '-1' },
  ])
  const [fmt, setFmt] = useState<Fmt>('shell')
  const [copied, setCopied] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [dragId, setDragId] = useState<number | null>(null)
  const [addType, setAddType] = useState('')

  const showFilter = op === 'find' || op === 'updateMany' || op === 'aggregate'
  const showPipeline = op === 'aggregate'

  const code = generate(op, coll, conds, stages, fmt)

  // ── condition ops ──
  const addCond = () => setConds([...conds, { field: '', op: '$eq', value: '' }])
  const updCond = (i: number, patch: Partial<Cond>) => setConds(conds.map((c, j) => j === i ? { ...c, ...patch } : c))
  const delCond = (i: number) => setConds(conds.filter((_, j) => j !== i))

  // ── stage ops ──
  const addStage = (type: StageType) => {
    const defs: Record<StageType, Omit<Stage, 'id' | 'type'>> = {
      '$group': { groupBy: 'field', outField: 'total', acc: 'sum', accField: '1' },
      '$sort': { sortField: 'field', sortDir: '1' },
      '$project': { project: 'field1, field2' },
      '$limit': { num: '10' },
      '$skip': { num: '0' },
      '$unwind': { unwind: 'field' },
      '$lookup': { from: 'orders', localField: '_id', foreignField: 'userId', as: 'orders' },
    }
    const id = nextId()
    setStages([...stages, { id, type, ...defs[type] }])
    setEditId(id)
  }
  const updStage = (id: number, patch: Partial<Stage>) => setStages(stages.map(s => s.id === id ? { ...s, ...patch } : s))
  const delStage = (id: number) => setStages(stages.filter(s => s.id !== id))

  const onDrop = (targetId: number) => {
    if (dragId === null || dragId === targetId) return
    const from = stages.findIndex(s => s.id === dragId)
    const to = stages.findIndex(s => s.id === targetId)
    if (from < 0 || to < 0) return
    const next = [...stages]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setStages(next)
    setDragId(null)
  }

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* HERO */}
      <section style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ display: 'inline-flex', background: 'var(--teal-dim)', color: 'var(--teal)', fontSize: 11, padding: '3px 12px', borderRadius: 20, letterSpacing: '.04em', fontWeight: 500 }}>
          {t.eyebrow}
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 500, margin: '.75rem 0 .5rem', color: 'var(--text)' }}>{t.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted2)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>{t.subtitle}</p>
      </section>

      {/* TOOL CARD */}
      <section style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Row 1: collection + operation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.25rem' }}>
          <div>
            <label style={labelStyle}>{t.collection}</label>
            <input style={inputStyle} value={coll} onChange={e => setColl(e.target.value)} placeholder="users" />
          </div>
          <div>
            <label style={labelStyle}>{t.operation}</label>
            <select style={inputStyle} value={op} onChange={e => setOp(e.target.value as Operation)}>
              <option value="find">find</option>
              <option value="insertOne">insertOne</option>
              <option value="updateMany">updateMany</option>
              <option value="aggregate">aggregate</option>
            </select>
          </div>
        </div>

        {/* FILTER BUILDER */}
        {showFilter && (
          <div style={{ marginBottom: showPipeline ? '1.25rem' : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                <Filter size={15} style={{ color: 'var(--teal)' }} />
                {t.filterBuilder}
                {showPipeline && <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>($match)</span>}
              </div>
              <button onClick={addCond} style={pillBtn}>{t.addCondition}</button>
            </div>
            {conds.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input style={inputStyle} placeholder={t.field} value={c.field} onChange={e => updCond(i, { field: e.target.value })} />
                <select style={inputStyle} value={c.op} onChange={e => updCond(i, { op: e.target.value as Op })}>
                  {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                {c.op === '$exists' ? (
                  <select style={inputStyle} value={c.value === 'false' ? 'false' : 'true'} onChange={e => updCond(i, { value: e.target.value })}>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <input style={inputStyle} placeholder={(c.op === '$in' || c.op === '$nin') ? 'a, b, c' : t.value} value={c.value} onChange={e => updCond(i, { value: e.target.value })} />
                )}
                <button onClick={() => delCond(i)} style={iconBtn} aria-label="delete"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}

        {/* AGGREGATE PIPELINE */}
        {showPipeline && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                <ListTree size={15} style={{ color: 'var(--teal)' }} />
                {t.aggregatePipeline}
              </div>
              <select
                value={addType}
                onChange={e => { if (e.target.value) { addStage(e.target.value as StageType); setAddType('') } }}
                style={{ ...pillBtn, paddingRight: 24 }}
              >
                <option value="">{t.addStage}</option>
                <option value="$group">$group</option>
                <option value="$sort">$sort</option>
                <option value="$project">$project</option>
                <option value="$limit">$limit</option>
                <option value="$skip">$skip</option>
                <option value="$unwind">$unwind</option>
                <option value="$lookup">$lookup</option>
              </select>
            </div>

            {/* auto $match preview */}
            {conds.some(c => c.field.trim()) && (
              <div style={stageRow}>
                <span style={{ color: 'var(--muted)' }}><GripVertical size={15} /></span>
                <span style={{ ...badge, opacity: .7 }}>$match</span>
                <span style={stagePreview}>{filterObj(conds, 'shell')}</span>
              </div>
            )}

            {/* user stages */}
            {stages.map(st => (
              <div
                key={st.id}
                draggable
                onDragStart={() => setDragId(st.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(st.id)}
                style={{ ...stageRow, opacity: dragId === st.id ? 0.4 : 1 }}
              >
                <span style={{ color: 'var(--muted)', cursor: 'grab' }}><GripVertical size={15} /></span>
                <span style={badge}>{st.type}</span>
                <span style={stagePreview}>{stageValue(st, 'shell')}</span>
                <button onClick={() => setEditId(editId === st.id ? null : st.id)} style={iconBtn} aria-label="edit"><Code2 size={14} /></button>
                <button onClick={() => delStage(st.id)} style={iconBtn} aria-label="delete"><Trash2 size={14} /></button>

                {editId === st.id && (
                  <div style={{ gridColumn: '1 / -1', display: 'grid', gap: 8, padding: '10px 0 4px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    {st.type === '$group' && <>
                      <div><label style={labelStyle}>{t.groupBy}</label><input style={inputStyle} value={st.groupBy || ''} onChange={e => updStage(st.id, { groupBy: e.target.value })} /></div>
                      <div><label style={labelStyle}>{t.outField}</label><input style={inputStyle} value={st.outField || ''} onChange={e => updStage(st.id, { outField: e.target.value })} /></div>
                      <div><label style={labelStyle}>{t.accumulator}</label>
                        <select style={inputStyle} value={st.acc} onChange={e => updStage(st.id, { acc: e.target.value })}>
                          {ACCUMULATORS.map(a => <option key={a} value={a}>${a}</option>)}
                        </select>
                      </div>
                      <div><label style={labelStyle}>{t.accField}</label><input style={inputStyle} value={st.accField || ''} onChange={e => updStage(st.id, { accField: e.target.value })} /></div>
                    </>}
                    {st.type === '$sort' && <>
                      <div><label style={labelStyle}>{t.sortField}</label><input style={inputStyle} value={st.sortField || ''} onChange={e => updStage(st.id, { sortField: e.target.value })} /></div>
                      <div><label style={labelStyle}>{t.dir}</label>
                        <select style={inputStyle} value={st.sortDir} onChange={e => updStage(st.id, { sortDir: e.target.value })}>
                          <option value="1">{t.asc}</option>
                          <option value="-1">{t.desc}</option>
                        </select>
                      </div>
                    </>}
                    {st.type === '$project' && (
                      <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>{t.projectFields}</label><input style={inputStyle} value={st.project || ''} onChange={e => updStage(st.id, { project: e.target.value })} placeholder="name, email, -_id" /></div>
                    )}
                    {(st.type === '$limit' || st.type === '$skip') && (
                      <div><label style={labelStyle}>{t.number}</label><input style={inputStyle} type="number" value={st.num || ''} onChange={e => updStage(st.id, { num: e.target.value })} /></div>
                    )}
                    {st.type === '$unwind' && (
                      <div><label style={labelStyle}>{t.unwindPath}</label><input style={inputStyle} value={st.unwind || ''} onChange={e => updStage(st.id, { unwind: e.target.value })} /></div>
                    )}
                    {st.type === '$lookup' && <>
                      <div><label style={labelStyle}>{t.from}</label><input style={inputStyle} value={st.from || ''} onChange={e => updStage(st.id, { from: e.target.value })} /></div>
                      <div><label style={labelStyle}>{t.as}</label><input style={inputStyle} value={st.as || ''} onChange={e => updStage(st.id, { as: e.target.value })} /></div>
                      <div><label style={labelStyle}>{t.localField}</label><input style={inputStyle} value={st.localField || ''} onChange={e => updStage(st.id, { localField: e.target.value })} /></div>
                      <div><label style={labelStyle}>{t.foreignField}</label><input style={inputStyle} value={st.foreignField || ''} onChange={e => updStage(st.id, { foreignField: e.target.value })} /></div>
                    </>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* OUTPUT */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
              <Code2 size={15} style={{ color: 'var(--teal)' }} />
              {t.output}
            </div>
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', padding: 3, borderRadius: 8 }}>
              {(['shell', 'node', 'python'] as Fmt[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFmt(f)}
                  style={{
                    padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    background: fmt === f ? 'var(--teal)' : 'transparent',
                    color: fmt === f ? '#fff' : 'var(--muted2)',
                  }}
                >
                  {f === 'shell' ? 'Shell' : f === 'node' ? 'Node.js' : 'Python'}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{ background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre', overflowX: 'auto', color: 'var(--text)' }}
            dangerouslySetInnerHTML={{ __html: highlight(code) }}
          />
          <button
            onClick={copy}
            style={{
              marginTop: 12, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px', background: copied ? 'var(--teal-dim)' : 'var(--teal)', color: copied ? 'var(--teal)' : '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </section>

      {/* INFO CARDS */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
        {[Zap, Code2, Lock].map((Icon, i) => (
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

      {/* OPERATORS TABLE */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={sectionTitle}>{t.opTitle}</h2>
        <table className="tckn-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>{t.opCols.map((c, i) => <th key={i}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {t.operators.map((row, i) => (
              <tr key={i}>
                <td className="mono-cell">{row[0]}</td>
                <td>{row[1]}</td>
                <td className="mono-cell" style={{ color: 'var(--muted2)' }}>{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={sectionTitle}>{t.faqTitle}</h2>
        {t.faq.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} last={i === t.faq.length - 1} />
        ))}
      </section>

      {/* RELATED */}
      <section>
        <h2 style={sectionTitle}>{t.relatedTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {t.related.map(r => (
            <Link key={r.href} href={r.href} className="tckn-related-card">
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{en ? 'Tool' : 'Araç'}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>{r.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

// shared inline styles referencing CSS vars
const pillBtn: CSSProperties = {
  fontSize: 12, fontWeight: 500, color: 'var(--teal)', background: 'var(--teal-dim)',
  border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer',
}
const iconBtn: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30,
  border: '0.5px solid var(--border)', borderRadius: 7, background: 'transparent', color: 'var(--muted2)', cursor: 'pointer',
}
const stageRow: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
  background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 8,
  padding: '8px 10px', marginBottom: 8,
}
const badge: CSSProperties = {
  fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--teal)',
  background: 'var(--teal-dim)', padding: '2px 8px', borderRadius: 6, flexShrink: 0,
}
const stagePreview: CSSProperties = {
  fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--muted2)', flex: 1, minWidth: 120,
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
}
