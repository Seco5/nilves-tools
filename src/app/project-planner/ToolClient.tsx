'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import * as XLSX from 'xlsx'

/* ─── Constants ──────────────────────────────────────────────── */
const DAY_W = 36
const ROW_H = 36
const HEADER_H = 56
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY2 = ['Su','Mo','Tu','We','Th','Fr','Sa']
const CATS = ['#1D9E75','#60a5fa','#a78bfa','#fbbf24','#f87171','#5DCAA5','#f472b6','#38bdf8','#fb923c']

type Task = { id: number; name: string; days: number; deps: number[]; cat: number }

const DEFAULT_TASKS: Task[] = [
  { id: 1, name: 'Requirements & Analysis', days: 3,  deps: [],     cat: 0 },
  { id: 2, name: 'UI/UX Design',            days: 5,  deps: [1],    cat: 1 },
  { id: 3, name: 'Backend Development',     days: 10, deps: [2],    cat: 2 },
  { id: 4, name: 'Frontend Development',    days: 8,  deps: [2],    cat: 3 },
  { id: 5, name: 'Integration & QA',       days: 4,  deps: [3, 4], cat: 4 },
  { id: 6, name: 'Deployment & Launch',    days: 2,  deps: [5],    cat: 0 },
]

/* ─── Date helpers (all dates normalised to local midnight) ──── */
const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const isWeekend = (d: Date) => { const g = d.getDay(); return g === 0 || g === 6 }
const diffDays = (a: Date, b: Date) => Math.round((midnight(b).getTime() - midnight(a).getTime()) / 86400000)
const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
const fmtDay = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`

function startOnWorkday(d: Date, business: boolean) {
  let x = midnight(d)
  if (business) while (isWeekend(x)) x = addDays(x, 1)
  return x
}
function addDuration(start: Date, days: number, business: boolean) {
  let x = midnight(start), remaining = Math.max(1, days) - 1
  while (remaining > 0) { x = addDays(x, 1); if (!business || !isWeekend(x)) remaining-- }
  return x
}
function dayAfterEnd(end: Date, business: boolean) {
  let x = addDays(midnight(end), 1)
  if (business) while (isWeekend(x)) x = addDays(x, 1)
  return x
}

type Sched = Map<number, { start: Date; end: Date }>
function computeSchedule(tasks: Task[], projectStart: Date, business: boolean): { sched: Sched; cycle: boolean } {
  const byId = new Map(tasks.map(t => [t.id, t]))
  const state = new Map<number, 0|1|2>()
  const order: number[] = []
  let cycle = false
  const dfs = (id: number) => {
    const st = state.get(id)
    if (st === 1) { cycle = true; return }
    if (st === 2) return
    state.set(id, 1)
    const t = byId.get(id)
    if (t) for (const dep of t.deps) if (byId.has(dep)) dfs(dep)
    state.set(id, 2)
    order.push(id)
  }
  for (const t of tasks) dfs(t.id)
  const sched: Sched = new Map()
  if (cycle) return { sched, cycle }
  const base = startOnWorkday(projectStart, business)
  for (const id of order) {
    const t = byId.get(id); if (!t) continue
    const depEnds = t.deps.filter(d => sched.has(d)).map(d => sched.get(d)!.end)
    const start = depEnds.length
      ? dayAfterEnd(new Date(Math.max(...depEnds.map(e => e.getTime()))), business)
      : base
    const end = addDuration(start, t.days, business)
    sched.set(id, { start, end })
  }
  return { sched, cycle }
}

/* ─── Column metadata ────────────────────────────────────────── */
const COLS = [
  { key: 'drag', label: '',          min: 30 },
  { key: 'num',  label: '#',         min: 36 },
  { key: 'name', label: 'Task Name', min: 120 },
  { key: 'days', label: 'Days',      min: 48 },
  { key: 'deps', label: 'Depends On',min: 70 },
  { key: 'start',label: 'Start',     min: 60 },
  { key: 'end',  label: 'End',       min: 60 },
  { key: 'cat',  label: '',          min: 40 },
  { key: 'del',  label: '',          min: 36 },
] as const
const DEFAULT_W = [30, 40, 220, 60, 96, 78, 78, 44, 40]

/* ─── Multi-project model ────────────────────────────────────── */
type Project = { id: string; name: string; tasks: Task[]; start: Date; business: boolean }
const STORAGE_KEY = 'devonekit-planner-v1'
const uid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

function makeDefaultProject(): Project {
  return { id: uid(), name: 'My Project', business: true, start: startOnWorkday(new Date(), true), tasks: DEFAULT_TASKS.map(t => ({ ...t, deps: [...t.deps] })) }
}
function makeBlankProject(n: number): Project {
  return { id: uid(), name: `Project ${n}`, business: true, start: startOnWorkday(new Date(), true), tasks: [] }
}

export default function ProjectPlanner() {
  /* Multiple projects, switchable without leaving the page */
  const firstRef = useRef<Project>(undefined)
  if (!firstRef.current) firstRef.current = makeDefaultProject()
  const [projects, setProjects] = useState<Project[]>(() => [firstRef.current!])
  const [activeId, setActiveId] = useState<string>(() => firstRef.current!.id)
  const loadedRef = useRef(false)

  const active = projects.find(p => p.id === activeId) ?? projects[0]
  const activeIdRef = useRef(active.id)
  activeIdRef.current = active.id

  /* Derived "current project" view used throughout the component */
  const tasks = active.tasks
  const projectName = active.name
  const projectStart = active.start
  const business = active.business

  /* Wrapper setters that write into the active project (stale-closure-safe via ref) */
  const setTasks: React.Dispatch<React.SetStateAction<Task[]>> = (u) =>
    setProjects(ps => ps.map(p => p.id === activeIdRef.current
      ? { ...p, tasks: typeof u === 'function' ? (u as (t: Task[]) => Task[])(p.tasks) : u } : p))
  const setProjectName = (name: string) => setProjects(ps => ps.map(p => p.id === activeIdRef.current ? { ...p, name } : p))
  const setProjectStart = (start: Date) => setProjects(ps => ps.map(p => p.id === activeIdRef.current ? { ...p, start } : p))
  const setBusiness = (b: boolean) => setProjects(ps => ps.map(p => p.id === activeIdRef.current ? { ...p, business: b } : p))

  const [colW, setColW] = useState<number[]>(DEFAULT_W)
  const [selected, setSelected] = useState<number | null>(null)
  const [warning, setWarning] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [pasteKey, setPasteKey] = useState('Ctrl+V')
  const dragIdx = useRef<number | null>(null)
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tableBodyRef = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<HTMLDivElement>(null)
  const syncLock = useRef(false)

  /* Project tab actions */
  const switchProject = (id: string) => { setActiveId(id); setSelected(null); setWarning('') }
  const addProject = () => {
    const p = makeBlankProject(projects.length + 1)
    setProjects(ps => [...ps, p]); setActiveId(p.id); setSelected(null); setWarning('')
  }
  const closeProject = (id: string) => {
    if (projects.length <= 1) return
    const idx = projects.findIndex(p => p.id === id)
    const next = projects.filter(p => p.id !== id)
    setProjects(next)
    if (id === activeId) setActiveId((next[Math.max(0, idx - 1)] || next[0]).id)
    setSelected(null)
  }

  /* Persistence — restore on mount, save on change */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        if (Array.isArray(data.projects) && data.projects.length) {
          const ps: Project[] = data.projects.map((p: { id?: string; name?: string; business?: boolean; start?: string; tasks?: Task[] }) => ({
            id: p.id || uid(),
            name: p.name || 'Project',
            business: !!p.business,
            start: midnight(new Date((p.start || toISO(new Date())) + 'T00:00:00')),
            tasks: Array.isArray(p.tasks) ? p.tasks.map(t => ({ id: t.id, name: t.name || '', days: Math.max(1, t.days || 1), deps: Array.isArray(t.deps) ? t.deps : [], cat: t.cat || 0 })) : [],
          }))
          setProjects(ps)
          setActiveId(data.activeId && ps.some(p => p.id === data.activeId) ? data.activeId : ps[0].id)
        }
      }
    } catch { /* ignore corrupt storage */ }
    loadedRef.current = true
  }, [])

  useEffect(() => {
    if (!loadedRef.current) return
    try {
      const data = { activeId, projects: projects.map(p => ({ ...p, start: toISO(p.start) })) }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch { /* quota / unavailable */ }
  }, [projects, activeId])

  /* Schedule + gantt layout (recomputed live on any change) */
  const { sched, cycle } = useMemo(
    () => computeSchedule(tasks, projectStart, business),
    [tasks, projectStart, business],
  )

  const layout = useMemo(() => {
    const starts = [...sched.values()].map(s => s.start.getTime())
    const ends = [...sched.values()].map(s => s.end.getTime())
    if (!starts.length) {
      const s = addDays(projectStart, -1)
      const days = Array.from({ length: 30 }, (_, i) => addDays(s, i))
      return { rangeStart: s, days }
    }
    const rangeStart = addDays(new Date(Math.min(...starts)), -2)
    const rangeEnd = addDays(new Date(Math.max(...ends)), 3)
    const n = diffDays(rangeStart, rangeEnd) + 1
    const days = Array.from({ length: n }, (_, i) => addDays(rangeStart, i))
    return { rangeStart, days }
  }, [sched, projectStart])

  const totalW = layout.days.length * DAY_W
  const rowIndex = useMemo(() => new Map(tasks.map((t, i) => [t.id, i])), [tasks])

  /* Month header groups */
  const monthGroups = useMemo(() => {
    const groups: { label: string; span: number }[] = []
    layout.days.forEach(d => {
      const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
      const last = groups[groups.length - 1]
      if (last && last.label === label) last.span++
      else groups.push({ label, span: 1 })
    })
    return groups
  }, [layout.days])

  const today = midnight(new Date())
  const todayIdx = diffDays(layout.rangeStart, today)

  /* ── Vertical scroll sync between table + gantt ── */
  const onScroll = (from: 'table' | 'gantt') => {
    if (syncLock.current) { syncLock.current = false; return }
    const src = from === 'table' ? tableBodyRef.current : ganttRef.current
    const dst = from === 'table' ? ganttRef.current : tableBodyRef.current
    if (src && dst && dst.scrollTop !== src.scrollTop) { syncLock.current = true; dst.scrollTop = src.scrollTop }
  }

  /* ── Task mutators ── */
  const update = (id: number, patch: Partial<Task>) =>
    setTasks(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t))
  const toastMsg = (m: string) => {
    const t = document.getElementById('__toast') as HTMLElement | null
    if (t) { t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
  }
  const scrollTableBottom = (focusLast = false) => {
    requestAnimationFrame(() => {
      const el = tableBodyRef.current
      if (!el) return
      el.scrollTop = el.scrollHeight
      if (focusLast) {
        const inp = el.querySelector('.pp-row:last-child .pp-input') as HTMLInputElement | null
        inp?.focus()
      }
    })
  }
  const addTask = () => {
    const nid = tasks.reduce((m, t) => Math.max(m, t.id), 0) + 1
    setTasks(ts => [...ts, { id: nid, name: '', days: 1, deps: [], cat: nid % CATS.length }])
    scrollTableBottom(true)
  }
  /* Bulk-add from pasted/typed text. Accepts tab- or comma-separated columns:
     Name [\t Days [\t Depends-On]]. One task per non-empty line. */
  const bulkAddFromText = (text: string): number => {
    const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim() !== '')
    if (!lines.length) return 0
    setTasks(ts => {
      let nid = ts.reduce((m, t) => Math.max(m, t.id), 0)
      const added: Task[] = lines.map(line => {
        // Excel/Sheets paste separates columns with TAB; a single-column paste has none.
        const parts = line.split('\t')
        const name = (parts[0] ?? '').trim()
        const days = Math.max(1, parseInt((parts[1] ?? '').trim(), 10) || 1)
        const deps = (parts[2] ?? '').split(/[,;]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
        nid += 1
        return { id: nid, name, days, deps, cat: (nid - 1) % CATS.length }
      })
      return [...ts, ...added]
    })
    scrollTableBottom()
    return lines.length
  }
  const pasteRows = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const n = bulkAddFromText(text)
      toastMsg(n ? `${n} task${n === 1 ? '' : 's'} added` : 'Clipboard is empty')
    } catch {
      toastMsg(`Clipboard blocked — click the table and press ${pasteKey}`)
    }
  }
  const removeTask = (id: number) =>
    setTasks(ts => ts.filter(t => t.id !== id).map(t => ({ ...t, deps: t.deps.filter(d => d !== id) })))
  const cycleCat = (id: number) =>
    setTasks(ts => ts.map(t => t.id === id ? { ...t, cat: (t.cat + 1) % CATS.length } : t))

  /* ── Row drag reorder ── */
  const onRowDrop = (toIdx: number) => {
    const from = dragIdx.current
    dragIdx.current = null
    if (from === null || from === toIdx) return
    setTasks(ts => {
      const copy = [...ts]
      const [moved] = copy.splice(from, 1)
      copy.splice(toIdx, 0, moved)
      return copy
    })
  }

  /* ── Column resize ── */
  const startResize = (i: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    const startX = e.clientX, startW = colW[i], min = COLS[i].min
    const move = (ev: MouseEvent) => {
      const w = Math.max(min, startW + ev.clientX - startX)
      setColW(prev => { const c = [...prev]; c[i] = w; return c })
    }
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
  }

  /* ── Generate Plan (validate; gantt is already live) ── */
  const generate = () => {
    const ok = tasks.length > 0 && tasks.every(t => t.name.trim() && t.days > 0)
    if (!ok) {
      setWarning('Add at least one task with a name and duration before generating your roadmap.')
      if (warnTimer.current) clearTimeout(warnTimer.current)
      warnTimer.current = setTimeout(() => setWarning(''), 4000)
      return
    }
    setWarning('')
    const t = document.getElementById('__toast') as HTMLElement | null
    if (t) { t.textContent = 'Roadmap generated'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
  }

  useEffect(() => () => { if (warnTimer.current) clearTimeout(warnTimer.current) }, [])

  /* Platform-aware paste hint */
  useEffect(() => {
    const mac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)
    setPasteKey(mac ? '⌘V' : 'Ctrl+V')
  }, [])

  /* Global paste → bulk-add tasks (unless a cell input is focused) */
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const el = document.activeElement as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      const text = e.clipboardData?.getData('text/plain') || ''
      if (!text.trim()) return
      e.preventDefault()
      const n = bulkAddFromText(text)
      if (n) toastMsg(`${n} task${n === 1 ? '' : 's'} added`)
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Stats ── */
  const totalDays = tasks.reduce((s, t) => s + t.days, 0)   // sum of task durations (effort)
  const depCount = tasks.reduce((s, t) => s + t.deps.length, 0)
  const allEnds = [...sched.values()].map(s => s.end.getTime())
  const allStarts = [...sched.values()].map(s => s.start.getTime())
  const projEnd = allEnds.length ? new Date(Math.max(...allEnds)) : null
  const projBegin = allStarts.length ? new Date(Math.min(...allStarts)) : null
  const calDuration = projBegin && projEnd ? diffDays(projBegin, projEnd) + 1 : 0
  const top3 = [...tasks].sort((a, b) => b.days - a.days).slice(0, 3)

  /* ── Excel export ── */
  const exportExcel = () => {
    const rows = tasks.map(t => ({
      '#': t.id,
      'Task Name': t.name,
      'Days': t.days,
      'Start Date': sched.get(t.id) ? fmtDay(sched.get(t.id)!.start) : '',
      'End Date': sched.get(t.id) ? fmtDay(sched.get(t.id)!.end) : '',
      'Depends On': t.deps.join(', '),
      'Category Color': CATS[t.cat],
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [{ wch: 4 }, { wch: 28 }, { wch: 6 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }]
    // Header styling (honoured by style-capable readers; ignored by the community writer)
    const headers = ['A1','B1','C1','D1','E1','F1','G1']
    headers.forEach(addr => {
      if (ws[addr]) ws[addr].s = { fill: { fgColor: { rgb: '1D9E75' } }, font: { color: { rgb: 'FFFFFF' }, bold: true } }
    })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Roadmap')
    const slug = projectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'
    XLSX.writeFile(wb, `${slug}-roadmap.xlsx`)
  }

  const tableW = colW.reduce((a, b) => a + b, 0)

  /* ── Render a table cell by column key ── */
  const renderCell = (t: Task, ci: number) => {
    const key = COLS[ci].key
    const w = colW[ci]
    const sc = sched.get(t.id)
    const common = { width: w, minWidth: w, maxWidth: w } as React.CSSProperties
    switch (key) {
      case 'drag':
        return <div key={key} className="pp-cell pp-drag" style={common} title="Drag to reorder">⠿</div>
      case 'num':
        return <div key={key} className="pp-cell pp-num" style={common}>{t.id}</div>
      case 'name':
        return <div key={key} className="pp-cell" style={common}>
          <input className="pp-input" value={t.name} placeholder="Task name…"
            onChange={e => update(t.id, { name: e.target.value })} />
        </div>
      case 'days':
        return <div key={key} className="pp-cell" style={common}>
          <input className="pp-input pp-center" type="number" min={1} value={t.days}
            onChange={e => update(t.id, { days: Math.max(1, parseInt(e.target.value) || 1) })} />
        </div>
      case 'deps':
        return <div key={key} className="pp-cell" style={common}>
          <input className="pp-input" value={t.deps.join(',')} placeholder="e.g. 1,2"
            onChange={e => update(t.id, { deps: e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) })} />
        </div>
      case 'start':
        return <div key={key} className="pp-cell pp-ro" style={common}>{sc ? fmtDay(sc.start) : '—'}</div>
      case 'end':
        return <div key={key} className="pp-cell pp-ro" style={common}>{sc ? fmtDay(sc.end) : '—'}</div>
      case 'cat':
        return <div key={key} className="pp-cell pp-catcell" style={common}>
          <button className="pp-dot" style={{ background: CATS[t.cat] }} title="Click to change color"
            onClick={() => cycleCat(t.id)} />
        </div>
      case 'del':
        return <div key={key} className="pp-cell pp-delcell" style={common}>
          <button className="pp-del" title="Delete task" onClick={() => removeTask(t.id)}>×</button>
        </div>
    }
  }

  return (
    <div className="pp-root">
      {/* ── Project tabs ── */}
      <div className="pp-projtabs">
        {projects.map(p => (
          <div
            key={p.id}
            className={`pp-projtab${p.id === activeId ? ' active' : ''}`}
            onClick={() => switchProject(p.id)}
            title={p.name || 'Untitled'}
          >
            <span className="pp-projtab-name">{p.name || 'Untitled'}</span>
            {projects.length > 1 && (
              <button className="pp-projtab-x" title="Close project" onClick={e => { e.stopPropagation(); closeProject(p.id) }}>×</button>
            )}
          </div>
        ))}
        <button className="pp-projtab-add" onClick={addProject} title="New project">+ New</button>
      </div>

      {/* ── Header bar ── */}
      <div className="pp-header">
        <div className="pp-hleft">
          <input className="pp-projname" value={projectName} onChange={e => setProjectName(e.target.value)} aria-label="Project name" />
          <span className="pp-divider" />
          <label className="pp-field">
            <span className="pp-flabel">Start date</span>
            <input className="pp-date" type="date" value={toISO(projectStart)}
              onChange={e => { const v = e.target.value; if (v) setProjectStart(midnight(new Date(v + 'T00:00:00'))) }} />
          </label>
          <div className="pp-toggle" role="tablist" aria-label="Day counting mode">
            <button className={business ? 'active' : ''} onClick={() => setBusiness(true)}>Business Days</button>
            <button className={!business ? 'active' : ''} onClick={() => setBusiness(false)}>Calendar Days</button>
          </div>
          <button className="pp-btn primary" onClick={generate}>Generate Plan</button>
        </div>
        <div className="pp-hright">
          <button className="pp-btn outline" onClick={() => setSummaryOpen(true)}>Summary</button>
          <button className="pp-btn outline" onClick={exportExcel}>Export Excel</button>
          <button className="pp-btn outline" onClick={pasteRows} title={`Paste rows from Excel (${pasteKey})`}>Paste Rows</button>
          <button className="pp-btn primary" onClick={addTask}>Add Task</button>
        </div>
      </div>

      {warning && <div className="pp-warn">{warning}</div>}

      {/* ── Main: table + gantt ── */}
      <div className="pp-main">
        {/* Task table */}
        <div className="pp-table" style={{ width: tableW, maxWidth: '58%' }}>
          <div className="pp-thead" style={{ height: HEADER_H }}>
            {COLS.map((c, ci) => (
              <div key={c.key} className="pp-th" style={{ width: colW[ci], minWidth: colW[ci], maxWidth: colW[ci] }}>
                <span>{c.label}</span>
                <span className="pp-resize" onMouseDown={e => startResize(ci, e)} />
              </div>
            ))}
          </div>
          <div className="pp-tbody" ref={tableBodyRef} onScroll={() => onScroll('table')}>
            {tasks.map((t, ri) => (
              <div
                key={t.id}
                className={`pp-row${selected === t.id ? ' sel' : ''}`}
                style={{ height: ROW_H }}
                draggable
                onDragStart={() => { dragIdx.current = ri }}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onRowDrop(ri)}
                onClick={() => setSelected(t.id)}
              >
                {COLS.map((_, ci) => renderCell(t, ci))}
              </div>
            ))}
          </div>
        </div>

        {/* Gantt */}
        <div className="pp-gantt">
          {cycle ? (
            <div className="pp-cycle">⚠ Circular dependency detected — fix the “Depends On” references to see the timeline.</div>
          ) : (
            <div className="pp-gscroll" ref={ganttRef} onScroll={() => onScroll('gantt')}>
              <div style={{ width: totalW, position: 'relative' }}>
                {/* Sticky header */}
                <div className="pp-ghead" style={{ height: HEADER_H, width: totalW }}>
                  <div className="pp-month-row">
                    {monthGroups.map((g, i) => (
                      <div key={i} className="pp-month" style={{ width: g.span * DAY_W }}>{g.label}</div>
                    ))}
                  </div>
                  <div className="pp-day-row">
                    {layout.days.map((d, i) => (
                      <div key={i} className={`pp-dayhd${business && isWeekend(d) ? ' we' : ''}`} style={{ width: DAY_W }}>
                        <span className="pp-dnum">{d.getDate()}</span>
                        <span className="pp-dname">{DAY2[d.getDay()]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div className="pp-gbody" style={{ width: totalW, height: tasks.length * ROW_H, position: 'relative' }}>
                  {/* weekend columns */}
                  {layout.days.map((d, i) => (
                    business && isWeekend(d)
                      ? <div key={i} className="pp-wecol" style={{ left: i * DAY_W, width: DAY_W }} />
                      : null
                  ))}
                  {/* today line */}
                  {todayIdx >= 0 && todayIdx < layout.days.length && (
                    <div className="pp-today" style={{ left: todayIdx * DAY_W + DAY_W / 2 }} />
                  )}

                  {/* dependency arrows */}
                  <svg className="pp-arrows" width={totalW} height={tasks.length * ROW_H}>
                    <defs>
                      <marker id="pp-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="var(--teal)" />
                      </marker>
                    </defs>
                    {tasks.flatMap(t => {
                      const tc = sched.get(t.id); if (!tc) return []
                      const tr = rowIndex.get(t.id)!
                      return t.deps.map(dep => {
                        const dc = sched.get(dep); if (!dc) return null
                        const dr = rowIndex.get(dep); if (dr === undefined) return null
                        const x1 = (diffDays(layout.rangeStart, dc.end) + 1) * DAY_W
                        const y1 = dr * ROW_H + ROW_H / 2
                        const x2 = diffDays(layout.rangeStart, tc.start) * DAY_W
                        const y2 = tr * ROW_H + ROW_H / 2
                        const cx = Math.max(20, Math.abs(x2 - x1) / 2)
                        return (
                          <path key={`${dep}-${t.id}`} d={`M${x1},${y1} C${x1+cx},${y1} ${x2-cx},${y2} ${x2},${y2}`}
                            className="pp-arrowpath" markerEnd="url(#pp-arrow)" />
                        )
                      }).filter(Boolean)
                    })}
                  </svg>

                  {/* bars */}
                  {tasks.map((t, ri) => {
                    const sc = sched.get(t.id); if (!sc) return null
                    const left = diffDays(layout.rangeStart, sc.start) * DAY_W + 1
                    const width = (diffDays(sc.start, sc.end) + 1) * DAY_W - 2
                    return (
                      <div key={t.id}
                        className={`pp-bar${selected === t.id ? ' sel' : ''}`}
                        style={{ left, width, top: ri * ROW_H + 6, height: ROW_H - 12, background: CATS[t.cat] }}
                        title={`${t.name || 'Untitled'} · ${t.days} day${t.days === 1 ? '' : 's'}`}
                        onClick={() => setSelected(t.id)}>
                        <span className="pp-barlabel">{t.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="statusbar">
        <span className="chip chip-ok">LIVE</span>
        <span>{tasks.length} task{tasks.length === 1 ? '' : 's'}</span>
        <span>·</span>
        <span>{totalDays} work days</span>
        {projEnd && <><span>·</span><span>ends {fmtDay(projEnd)}</span></>}
        <span style={{ marginLeft: 'auto' }}>Paste rows with {pasteKey} · Drag to reorder · Click category dot to change color</span>
      </div>

      {/* ── Summary modal ── */}
      {summaryOpen && (
        <div className="pp-modal-overlay" onClick={() => setSummaryOpen(false)}>
          <div className="pp-modal" onClick={e => e.stopPropagation()}>
            <div className="pp-modal-hd">
              <div>
                <div className="pp-modal-title">{projectName || 'Untitled project'}</div>
                <div className="pp-modal-sub">
                  {projBegin && projEnd ? `${fmtDay(projBegin)} – ${fmtDay(projEnd)}` : 'No schedule yet'}
                </div>
              </div>
              <button className="pp-btn outline" onClick={() => setSummaryOpen(false)}>Close</button>
            </div>

            <div className="pp-stats">
              {[
                ['Tasks', tasks.length, ''],
                ['Calendar Days', calDuration, 'start → finish'],
                ['Dependencies', depCount, 'task links'],
              ].map(([l, v, sub]) => (
                <div key={l as string} className="pp-stat">
                  <div className="pp-stat-num">{v as number}</div>
                  <div className="pp-stat-lbl">{l as string}</div>
                  {sub ? <div className="pp-stat-sub">{sub as string}</div> : null}
                </div>
              ))}
            </div>

            <div className="pp-modal-sec">
              <div className="pp-sec-title">Timeline</div>
              <div className="pp-timeline">
                <div><span className="pp-tl-lbl">Start date</span><span>{projBegin ? fmtDay(projBegin) : '—'}</span></div>
                <div><span className="pp-tl-lbl">End date</span><span>{projEnd ? fmtDay(projEnd) : '—'}</span></div>
                <div><span className="pp-tl-lbl">Calendar span</span><span>{calDuration} days</span></div>
                <div><span className="pp-tl-lbl">Total work effort</span><span>{totalDays} work days</span></div>
                <div><span className="pp-tl-lbl">Counting mode</span><span>{business ? 'Business days' : 'Calendar days'}</span></div>
              </div>
            </div>

            <div className="pp-modal-sec">
              <div className="pp-sec-title">Longest tasks</div>
              <div className="pp-toplist">
                {top3.map(t => (
                  <div key={t.id} className="pp-topitem">
                    <span className="pp-dot" style={{ background: CATS[t.cat], cursor: 'default' }} />
                    <span className="pp-topname">{t.name || 'Untitled'}</span>
                    <span className="pp-topdays">{t.days} days</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pp-modal-ft">
              <button className="pp-btn primary" onClick={exportExcel}>Export Excel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
