'use client'
import { useState, useEffect } from 'react'

function ri(a: number, b: number) { return Math.floor(Math.random()*(b-a+1))+a }
function rdig() { return ri(0,9) }
function rI<T>(a: T[]) { return a[ri(0,a.length-1)] }

const NM=['Ahmet','Mehmet','Mustafa','Ali','Hüseyin','İbrahim','Fatih','Burak','Emre','Serkan']
const NF=['Ayşe','Fatma','Zeynep','Emine','Elif','Seda','Büşra','Merve','İrem','Deniz']
const SN=['Yılmaz','Kaya','Demir','Şahin','Çelik','Yıldız','Öztürk','Aydın','Arslan','Doğan']
const CI=['Istanbul','Ankara','Izmir','Bursa','Antalya','Adana','Konya','Gaziantep']
const ST=['Atatürk Cd.','Cumhuriyet Sk.','İstiklal Cd.','Bağlar Sk.','Gül Sk.']
const BK=['Ziraat Bankası','İş Bankası','Garanti BBVA','Akbank','Yapı Kredi']

function genTCKN(): string {
  const d: number[] = [ri(1,9)]
  for(let i=1;i<9;i++) d[i]=rdig()
  const d10=(((d[0]+d[2]+d[4]+d[6]+d[8])*7)-(d[1]+d[3]+d[5]+d[7]))%10
  if(d10<0) return genTCKN()
  d[9]=d10
  d[10]=(d[0]+d[1]+d[2]+d[3]+d[4]+d[5]+d[6]+d[7]+d[8]+d[9])%10
  return d.join('')
}

function genIBAN() {
  let bban = ''
  for(let i=0;i<22;i++) bban+=rdig()
  const num='TR'+bban
  const rearr=num.slice(2)+num.slice(0,2)
  const numeric=rearr.split('').map(c=>/[A-Z]/.test(c)?c.charCodeAt(0)-55:c).join('')
  let r=BigInt(0)
  for(const ch of numeric) r=(r*10n+BigInt(ch))%97n
  return 'TR'+String(98-Number(r)).padStart(2,'0')+bban
}

interface Person {
  name: string; gender: string; birthDate: string; tckn: string;
  phone: string; email: string; city: string; address: string; iban: string; bank: string;
}

function genOne(): Person {
  const f = Math.random() > .5
  const fn = rI(f?NF:NM), ln = rI(SN)
  const by=ri(1965,2000),bm=String(ri(1,12)).padStart(2,'0'),bd=String(ri(1,28)).padStart(2,'0')
  const city = rI(CI)
  const ph='05'+rI(['30','31','32','35','40','44','50','53','55','58'])+String(ri(1000000,9999999))
  const email=fn.toLowerCase().replace(/[^a-z]/g,'')+'.'+ln.toLowerCase().replace(/[^a-z]/g,'')+'@'+rI(['gmail.com','hotmail.com','outlook.com','yahoo.com'])
  return {name:`${fn} ${ln}`,gender:f?'Female':'Male',birthDate:`${bd}.${bm}.${by}`,tckn:genTCKN(),phone:ph,email,city,address:`${rI(ST)} No:${ri(1,120)} D:${ri(1,20)}, ${city}`,iban:genIBAN(),bank:rI(BK)}
}

export default function FakePersonData() {
  const [count, setCount] = useState(1)
  const [persons, setPersons] = useState<Person[]>([])

  const gen = (n = count) => {
    setPersons(Array.from({length: Math.min(10, n)}, genOne))
  }

  useEffect(() => { gen() }, [])

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  const copyJSON = () => copy(JSON.stringify(persons, null, 2))

  const renderField = (label: string, val: string, fullWidth = false) => (
    <div key={label} className="fd-row" style={fullWidth ? { gridColumn:'1/-1' } : {}}>
      <div className="fd-field">{label}</div>
      <div className="fd-val" onClick={() => copy(val)}>{val}</div>
    </div>
  )

  return (
    <>
      <div className="tool-wrap">
        <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap', alignItems:'center' }}>
          <button className="btn primary" onClick={() => gen()}>Generate</button>
          <input type="number" min={1} max={10} value={count} className="gen-num" onChange={e => setCount(Number(e.target.value))} />
          <span className="gen-label">persons</span>
          <button className="btn" onClick={copyJSON}>Copy as JSON</button>
        </div>
        <div className="fd-grid">
          {persons.map((p, pi) => (
            <>
              {pi > 0 && <div key={`sep-${pi}`} style={{ gridColumn:'1/-1', borderTop:'1px solid var(--border)', margin:'2px 0' }} />}
              {renderField('Name', p.name)}
              {renderField('Gender', p.gender)}
              {renderField('Birth date', p.birthDate)}
              {renderField('TCKN', p.tckn)}
              {renderField('Phone', p.phone)}
              {renderField('Email', p.email)}
              {renderField('Address', p.address, true)}
              {renderField('IBAN', p.iban.replace(/(.{4})/g,'$1 ').trim(), true)}
              {renderField('Bank', p.bank)}
            </>
          ))}
        </div>
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">FAKE</span>
        <span>Turkish fake person data for testing — not real individuals</span>
      </div>
    </>
  )
}
