'use client'
import { useState, useEffect } from 'react'

function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

const SQL_DB = {
  customers:[{id:1,name:'Alice Johnson',city:'New York',joined_at:'2022-01-15'},{id:2,name:'Bob Smith',city:'London',joined_at:'2022-03-20'},{id:3,name:'Carol White',city:'New York',joined_at:'2022-05-10'},{id:4,name:'David Lee',city:'Tokyo',joined_at:'2022-07-05'},{id:5,name:'Emma Davis',city:'London',joined_at:'2022-09-18'},{id:6,name:'Frank Brown',city:'Berlin',joined_at:'2023-01-22'}],
  orders:[{id:101,customer_id:1,amount:850,status:'completed',date:'2023-06-01'},{id:102,customer_id:2,amount:320,status:'pending',date:'2023-06-03'},{id:103,customer_id:1,amount:1200,status:'completed',date:'2023-06-07'},{id:104,customer_id:3,amount:450,status:'cancelled',date:'2023-06-10'},{id:105,customer_id:4,amount:675,status:'completed',date:'2023-06-12'},{id:106,customer_id:5,amount:290,status:'pending',date:'2023-06-15'}],
  products:[{id:1,name:'Laptop Pro',category:'Electronics',price:1299,stock:15},{id:2,name:'Wireless Mouse',category:'Electronics',price:49,stock:80},{id:3,name:'Standing Desk',category:'Furniture',price:599,stock:20},{id:4,name:'Office Chair',category:'Furniture',price:299,stock:45},{id:5,name:'Notebook',category:'Stationery',price:12,stock:200},{id:6,name:'Pen Set',category:'Stationery',price:18,stock:150}]
}

type Row = Record<string, unknown>

const SQL_TOPICS = [
  {title:'SELECT & FROM',badge:'Basic',desc:'<b>SELECT</b> specifies which columns to return, <b>FROM</b> specifies the table.',tips:['All columns','Specific columns','With alias'],queries:['SELECT *\nFROM customers;','SELECT name, city\nFROM customers;','SELECT name AS customer,\n       city AS location\nFROM customers;'],run:()=>SQL_DB.customers.map(r=>({...r}))},
  {title:'WHERE',badge:'Basic',desc:'<b>WHERE</b> filters rows.',tips:['Filter by city','Filter by amount','LIKE pattern'],queries:["SELECT * FROM customers\nWHERE city = 'New York';",'SELECT * FROM orders\nWHERE amount > 500;',"SELECT * FROM customers\nWHERE name LIKE 'A%';"],run:()=>SQL_DB.customers.filter(r=>r.city==='New York')},
  {title:'ORDER BY',badge:'Basic',desc:'<b>ORDER BY</b> sorts results.',tips:['Name A-Z','Amount high-low','Multi-column sort'],queries:['SELECT * FROM customers\nORDER BY name ASC;','SELECT * FROM orders\nORDER BY amount DESC;','SELECT * FROM customers\nORDER BY city ASC, name ASC;'],run:()=>[...SQL_DB.customers].sort((a,b)=>a.name.localeCompare(b.name))},
  {title:'LIMIT & OFFSET',badge:'Basic',desc:'<b>LIMIT</b> caps row count. <b>OFFSET</b> skips rows.',tips:['First 3 rows','Page 2','Top 3 orders'],queries:['SELECT * FROM customers\nLIMIT 3;','SELECT * FROM customers\nLIMIT 3 OFFSET 3;','SELECT * FROM orders\nORDER BY amount DESC\nLIMIT 3;'],run:()=>SQL_DB.customers.slice(0,3)},
  {title:'GROUP BY',badge:'Grouping',desc:'<b>GROUP BY</b> groups rows. Use with aggregate functions.',tips:['Count by city','Sum by status','Avg price by category'],queries:['SELECT city, COUNT(*) AS total\nFROM customers\nGROUP BY city;','SELECT status, SUM(amount) AS total\nFROM orders\nGROUP BY status;','SELECT category, AVG(price) AS avg_price\nFROM products\nGROUP BY category;'],run:()=>{const g:Record<string,number>={};SQL_DB.customers.forEach(r=>{g[r.city]=(g[r.city]||0)+1});return Object.entries(g).map(([city,total])=>({city,total}))}},
  {title:'HAVING',badge:'Grouping',desc:'<b>HAVING</b> filters groups.',tips:['Cities with 2+ customers','Status > $500'],queries:['SELECT city, COUNT(*) AS total\nFROM customers\nGROUP BY city\nHAVING COUNT(*) > 1;','SELECT status, SUM(amount) AS total\nFROM orders\nGROUP BY status\nHAVING SUM(amount) > 500;'],run:()=>{const g:Record<string,number>={};SQL_DB.customers.forEach(r=>{g[r.city]=(g[r.city]||0)+1});return Object.entries(g).filter(([,v])=>v>1).map(([city,total])=>({city,total}))}},
  {title:'INNER JOIN',badge:'Joins',desc:'<b>INNER JOIN</b> returns rows that match in both tables.',tips:['Orders with customer','Filtered join'],queries:['SELECT c.name, o.amount, o.status\nFROM customers c\nINNER JOIN orders o\n  ON c.id = o.customer_id;',"SELECT c.name, o.id, o.amount\nFROM customers c\nINNER JOIN orders o\n  ON c.id = o.customer_id\nWHERE o.status = 'completed';"],run:()=>SQL_DB.orders.map(o=>{const c=SQL_DB.customers.find(c=>c.id===o.customer_id);return{name:c?.name,amount:o.amount,status:o.status}})},
  {title:'LEFT JOIN',badge:'Joins',desc:'<b>LEFT JOIN</b> returns all rows from left table.',tips:['All customers + orders','No-order customers'],queries:['SELECT c.name, o.id AS order_id\nFROM customers c\nLEFT JOIN orders o\n  ON c.id = o.customer_id;','SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nWHERE o.id IS NULL;'],run:()=>SQL_DB.customers.map(c=>{const os=SQL_DB.orders.filter(o=>o.customer_id===c.id);return os.length?os.map(o=>({name:c.name,order_id:o.id})):[{name:c.name,order_id:null}]}).flat()},
  {title:'Subquery',badge:'Advanced',desc:'A query nested inside another query.',tips:['Above avg orders','Most expensive product'],queries:['SELECT * FROM orders\nWHERE amount > (\n  SELECT AVG(amount)\n  FROM orders\n);','SELECT * FROM products\nWHERE price = (\n  SELECT MAX(price)\n  FROM products\n);'],run:()=>{const avg=SQL_DB.orders.reduce((a,o)=>a+o.amount,0)/SQL_DB.orders.length;return SQL_DB.orders.filter(o=>o.amount>avg)}},
  {title:'Window Functions',badge:'Advanced',desc:'ROW_NUMBER(), RANK(), SUM() OVER() work without collapsing rows.',tips:['Running total','Price ranking'],queries:['SELECT id, amount,\n  SUM(amount) OVER (\n    ORDER BY date\n  ) AS running_total\nFROM orders;','SELECT name, price,\n  RANK() OVER (\n    ORDER BY price DESC\n  ) AS price_rank\nFROM products;'],run:()=>{let c=0;return[...SQL_DB.orders].sort((a,b)=>a.date.localeCompare(b.date)).map(o=>{c+=o.amount;return{id:o.id,amount:o.amount,date:o.date,running_total:Math.round(c*100)/100}})}},
]

const GROUPS = [['Basic',[0,1,2,3]],['Grouping',[4,5]],['Joins',[6,7]],['Advanced',[8,9]]] as const

export default function SqlPlayground() {
  const [topicIdx, setTopicIdx] = useState(0)
  const [query, setQuery] = useState(SQL_TOPICS[0].queries[0])
  const [result, setResult] = useState('')
  const [rowCount, setRowCount] = useState('')
  const [chip, setChip] = useState<'idle'|'ok'|'err'>('idle')
  const [msg, setMsg] = useState('Select a topic and run a query')
  const [time, setTime] = useState('')

  const setTopic = (i: number) => {
    setTopicIdx(i)
    setQuery(SQL_TOPICS[i].queries[0])
    setResult('<span style="color:var(--muted);font-size:.77rem;font-family:var(--mono)">▶ Press Run</span>')
    setRowCount(''); setChip('idle'); setMsg('Query loaded'); setTime('')
  }

  const loadQ = (ti: number, qi: number) => { setQuery(SQL_TOPICS[ti].queries[qi] || '') }

  const run = () => {
    const t0 = Date.now()
    try {
      const rows = SQL_TOPICS[topicIdx].run() as Row[]
      const ms = Date.now()-t0
      if (!rows?.length) { setResult('<span style="color:var(--muted);font-size:.77rem">No results</span>'); return }
      const cols = Object.keys(rows[0])
      let html = '<table class="res-table"><thead><tr>'+cols.map(c=>`<th>${c}</th>`).join('')+'</tr></thead><tbody>'
      rows.forEach(r => { html+='<tr>'+cols.map(c=>`<td>${r[c]??'<span style="color:var(--muted)">NULL</span>'}</td>`).join('')+'</tr>' })
      html+='</tbody></table>'
      setResult(html); setRowCount(rows.length+' rows')
      setChip('ok'); setMsg(rows.length+' rows returned'); setTime(ms+'ms')
    } catch(e: unknown) {
      setResult('<span style="color:var(--red);font-size:.77rem">'+esc((e as Error).message)+'</span>')
      setChip('err'); setMsg((e as Error).message)
    }
  }

  const t = SQL_TOPICS[topicIdx]

  return (
    <>
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* Topics */}
        <div style={{ width:185, flexShrink:0, background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'8px 10px', borderBottom:'1px solid var(--border)', fontSize:'.62rem', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)' }}>Topics</div>
          <div style={{ flex:1, overflowY:'auto', padding:'6px 6px' }}>
            {GROUPS.map(([grp, idxs]) => (
              <div key={grp}>
                <div className="sql-group">{grp}</div>
                {idxs.map(i => (
                  <button key={i} className={`sql-topic${i===topicIdx?' active':''}`} onClick={() => setTopic(i)}>
                    {SQL_TOPICS[i].title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Main */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', borderRight:'1px solid var(--border)' }}>
          <div style={{ padding:'8px 14px', borderBottom:'1px solid var(--border)', background:'var(--surface)', display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
            <span style={{ fontSize:'.85rem', fontWeight:600, color:'var(--text)', fontFamily:'var(--display)' }}>{t.title}</span>
            <span style={{ fontSize:'.6rem', padding:'2px 8px', borderRadius:10, background:'var(--teal-dim)', color:'var(--teal2)', fontWeight:700, letterSpacing:'.04em' }}>{t.badge}</span>
          </div>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', background:'var(--bg)', flexShrink:0 }}>
            <div style={{ fontSize:'.79rem', color:'var(--muted2)', lineHeight:1.7, marginBottom:8 }} dangerouslySetInnerHTML={{ __html: t.desc }} />
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {t.tips.map((tip, j) => (
                <span key={j} className="sql-tip" onClick={() => loadQ(topicIdx, j)}>{tip}</span>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
            <div style={{ padding:'6px 14px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:7, flexShrink:0 }}>
              <span style={{ fontSize:'.62rem', fontWeight:600, letterSpacing:'.09em', textTransform:'uppercase', color:'var(--muted)' }}>Query</span>
              <div className="btn-group">
                <button className="btn" onClick={() => setQuery('')}>clear</button>
                <button className="btn primary" onClick={run}>▶ Run</button>
              </div>
            </div>
            <textarea style={{ flex:1, padding:'12px 14px', fontFamily:'var(--mono)', fontSize:'.79rem', lineHeight:1.75, background:'var(--bg)', color:'var(--text)', border:'none', outline:'none', resize:'none', tabSize:2, minHeight:80 }} placeholder="Write SQL here…" value={query} onChange={e => setQuery(e.target.value)} spellCheck={false} />
          </div>
          <div style={{ background:'var(--surface)', borderTop:'1px solid var(--border)', flexShrink:0, display:'flex', flexDirection:'column', maxHeight:200 }}>
            <div style={{ padding:'5px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
              <span style={{ fontSize:'.62rem', fontWeight:600, letterSpacing:'.09em', textTransform:'uppercase', color:'var(--muted)' }}>Result</span>
              <span style={{ fontSize:'.7rem', color:'var(--teal2)', fontFamily:'var(--mono)' }}>{rowCount}</span>
            </div>
            <div style={{ flex:1, overflow:'auto', padding:'8px 14px' }} dangerouslySetInnerHTML={{ __html: result || '<span style="color:var(--muted);font-size:.77rem;font-family:var(--mono)">▶ Press Run</span>' }} />
          </div>
        </div>
        {/* Schema */}
        <div style={{ width:180, flexShrink:0, background:'var(--surface)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'8px 12px', borderBottom:'1px solid var(--border)', fontSize:'.62rem', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--muted)' }}>Schema</div>
          <div style={{ flex:1, overflowY:'auto', padding:'10px 12px', fontFamily:'var(--mono)', fontSize:'.7rem' }}>
            <div style={{ color:'var(--teal2)', fontWeight:700, marginBottom:3 }}>customers</div>
            <div style={{ color:'var(--yellow)', paddingLeft:7 }}>id <span style={{ color:'var(--muted)' }}>PK</span></div>
            <div style={{ color:'var(--muted2)', paddingLeft:7 }}>name <span style={{ color:'var(--muted)' }}>VARCHAR</span></div>
            <div style={{ color:'var(--muted2)', paddingLeft:7 }}>city <span style={{ color:'var(--muted)' }}>VARCHAR</span></div>
            <div style={{ color:'var(--muted2)', paddingLeft:7 }}>joined_at <span style={{ color:'var(--muted)' }}>DATE</span></div>
            <div style={{ color:'var(--teal2)', fontWeight:700, marginTop:9, marginBottom:3 }}>orders</div>
            <div style={{ color:'var(--yellow)', paddingLeft:7 }}>id <span style={{ color:'var(--muted)' }}>PK</span></div>
            <div style={{ color:'var(--blue)', paddingLeft:7 }}>customer_id <span style={{ color:'var(--muted)' }}>FK</span></div>
            <div style={{ color:'var(--muted2)', paddingLeft:7 }}>amount <span style={{ color:'var(--muted)' }}>DECIMAL</span></div>
            <div style={{ color:'var(--muted2)', paddingLeft:7 }}>status <span style={{ color:'var(--muted)' }}>VARCHAR</span></div>
            <div style={{ color:'var(--muted2)', paddingLeft:7 }}>date <span style={{ color:'var(--muted)' }}>DATE</span></div>
            <div style={{ color:'var(--teal2)', fontWeight:700, marginTop:9, marginBottom:3 }}>products</div>
            <div style={{ color:'var(--yellow)', paddingLeft:7 }}>id <span style={{ color:'var(--muted)' }}>PK</span></div>
            <div style={{ color:'var(--muted2)', paddingLeft:7 }}>name <span style={{ color:'var(--muted)' }}>VARCHAR</span></div>
            <div style={{ color:'var(--muted2)', paddingLeft:7 }}>category <span style={{ color:'var(--muted)' }}>VARCHAR</span></div>
            <div style={{ color:'var(--muted2)', paddingLeft:7 }}>price <span style={{ color:'var(--muted)' }}>DECIMAL</span></div>
            <div style={{ color:'var(--muted2)', paddingLeft:7 }}>stock <span style={{ color:'var(--muted)' }}>INT</span></div>
          </div>
        </div>
      </div>
      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chip==='idle'?'IDLE':chip==='ok'?'OK':'ERROR'}</span>
        <span>{msg}</span>
        <span style={{ marginLeft:'auto' }}>{time}</span>
      </div>
    </>
  )
}
