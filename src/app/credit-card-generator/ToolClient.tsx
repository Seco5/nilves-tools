'use client'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

function ri(a: number, b: number) { return Math.floor(Math.random()*(b-a+1))+a }
function rdig() { return ri(0,9) }
function esc(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

const CC_PREFIXES: Record<string,string[]> = {visa:['4'],mc:['51','52','53','54','55'],amex:['34','37'],troy:['9792']}
const CC_LENS: Record<string,number> = {visa:16,mc:16,amex:15,troy:16}

function luhn(digits: string) {
  let sum=0; const n=digits.length
  for(let i=0;i<n;i++){let d=parseInt(digits[n-1-i]);if(i%2===1){d*=2;if(d>9)d-=9}sum+=d}
  return sum%10===0
}

function genOneCC(type: string) {
  const prefix = CC_PREFIXES[type][ri(0,CC_PREFIXES[type].length-1)]
  const len = CC_LENS[type]
  let digits = prefix.split('')
  while(digits.length<len-1) digits.push(String(rdig()))
  for(let c=0;c<10;c++){
    const cand=[...digits,String(c)]
    if(luhn(cand.join(''))){digits=cand;break}
  }
  return digits.join('').replace(/(\d{4})(?=\d)/g,'$1 ')
}

// ── SEO içerik bölümü (çift dilli) ────────────────────────────────────────────
type Sec = { title: string; body?: string; list?: string[]; faq?: { q: string; a: string }[] }
const SEO = {
  tr: {
    heading: 'Kredi Kartı Numarası Üretici — Geliştiriciler İçin Test Aracı',
    intro:
      'DevOneKit Kredi Kartı Üretici, yazılım geliştiricilerin ve test uzmanlarının ödeme sistemlerini güvenli bir ortamda test etmesine yardımcı olmak amacıyla tasarlanmış ücretsiz bir araçtır.',
    sections: [
      {
        title: 'Luhn Algoritması ile Geçerli Formatta Numara Üretimi',
        body: 'Üretilen kart numaraları, gerçek kredi kartlarında kullanılan Luhn (mod 10) algoritmasını kullanır. Bu sayede numara formatı geçerlidir; ancak gerçek bir banka hesabına bağlı değildir ve herhangi bir finansal işlemde kullanılamaz. Test ortamlarında form doğrulama ve ödeme akışı testleri için idealdir.',
      },
      {
        title: 'Hangi Kart Tipleri Destekleniyor?',
        list: [
          'Visa — 4 ile başlayan 16 haneli kart numaraları',
          'Mastercard — 51-55 arasıyla başlayan 16 haneli numaralar',
          'American Express — 34 veya 37 ile başlayan 15 haneli numaralar',
          "Troy — Türkiye'ye özgü 9792 ile başlayan 16 haneli numaralar",
        ],
      },
      {
        title: 'Kimler Kullanabilir?',
        list: [
          'Ödeme entegrasyonu geliştiren backend ve frontend geliştiriciler',
          'E-ticaret sistemlerini test eden QA mühendisleri',
          'Ödeme akışlarını öğrencilere anlatan eğitimciler',
          'Sandbox ortamlarında form doğrulama yapan tasarımcılar',
          'Stripe, Iyzico, PayTR gibi ödeme altyapılarını entegre eden ekipler',
        ],
      },
      {
        title: 'Sık Sorulan Sorular',
        faq: [
          { q: 'Bu numaralar gerçek alışverişlerde çalışır mı?', a: 'Hayır. Üretilen numaralar yalnızca format olarak geçerlidir. Gerçek bir banka hesabına bağlı olmadığı için herhangi bir ödeme işleminde çalışmaz.' },
          { q: 'CVV ve son kullanma tarihi gerçek mi?', a: 'Hayır. Tüm detaylar rastgele üretilir. Gerçek dünyada hiçbir değeri yoktur.' },
          { q: 'Stripe sandbox testlerinde kullanabilir miyim?', a: 'Hayır. Stripe ve benzeri sistemlerin kendi test kart numaraları bulunur. Stripe için 4242 4242 4242 4242 gibi özel test kartlarını kullanmanız gerekir.' },
        ],
      },
    ] as Sec[],
    warning:
      'Yasal Uyarı: Bu araçla üretilen tüm kart numaraları, son kullanma tarihleri ve CVV kodları tamamen rastgele oluşturulur. Gerçek bir kart sahibine, banka hesabına veya finansal kuruma ait değildir. DevOneKit bir finansal kuruluş değildir. Üretilen bilgilerin gerçek işlemlerde kullanılması yasaktır.',
  },
  en: {
    heading: 'Credit Card Number Generator — Test Tool for Developers',
    intro:
      'DevOneKit Credit Card Generator is a free tool designed to help software developers and QA engineers test payment systems in a safe environment.',
    sections: [
      {
        title: 'Valid Format Numbers with Luhn Algorithm',
        body: 'Generated card numbers use the Luhn (mod 10) algorithm found in real credit cards. The format is valid, but the numbers are not linked to any real bank account and cannot be used in financial transactions. Ideal for form validation and payment flow testing in sandbox environments.',
      },
      {
        title: 'Which Card Types Are Supported?',
        list: [
          'Visa — 16-digit numbers starting with 4',
          'Mastercard — 16-digit numbers starting with 51-55',
          'American Express — 15-digit numbers starting with 34 or 37',
          'Troy — 16-digit Turkish card numbers starting with 9792',
        ],
      },
      {
        title: 'Who Can Use This Tool?',
        list: [
          'Backend and frontend developers building payment integrations',
          'QA engineers testing e-commerce systems',
          'Educators teaching payment flows to students',
          'Designers doing form validation in sandbox environments',
          'Teams integrating payment providers like Stripe, PayTR, Iyzico',
        ],
      },
      {
        title: 'Frequently Asked Questions',
        faq: [
          { q: 'Do these numbers work for real purchases?', a: "No. Generated numbers are format-valid only. Since they're not linked to a real bank account, they won't work in any payment transaction." },
          { q: 'Are the CVV and expiry date real?', a: 'No. All details are randomly generated and have no real-world value.' },
          { q: 'Can I use them in Stripe sandbox tests?', a: 'No. Stripe and similar systems have their own test card numbers. For Stripe, use dedicated test cards like 4242 4242 4242 4242.' },
        ],
      },
    ] as Sec[],
    warning:
      'Legal Notice: All card numbers, expiry dates and CVV codes generated by this tool are randomly generated. They do not belong to any real cardholder, bank account or financial institution. DevOneKit is not a financial institution. Using generated information in real transactions is prohibited.',
  },
} as const

function Accordion({ sec, open, onToggle }: { sec: Sec; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[var(--border)]">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-[var(--text)] transition-colors hover:text-[var(--teal)]"
      >
        <span>{sec.title}</span>
        <ChevronDown
          size={16}
          className="shrink-0 text-[var(--teal)] transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pb-4 text-[13px] leading-[1.7] text-[var(--muted2)]">
            {sec.body && <p>{sec.body}</p>}
            {sec.list && (
              <ul className="space-y-2">
                {sec.list.map((li, i) => (
                  <li key={i} className="flex gap-2.5 pl-1">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--teal)]" />
                    <span>{li}</span>
                  </li>
                ))}
              </ul>
            )}
            {sec.faq && (
              <div className="space-y-4">
                {sec.faq.map((f, i) => (
                  <div key={i} className="space-y-1">
                    <p className="font-medium text-[var(--text)]">{f.q}</p>
                    <p>{f.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SeoContent() {
  const { lang } = useLanguage()
  const s = SEO[lang === 'en' ? 'en' : 'tr']
  const [open, setOpen] = useState(0)

  return (
    <section className="mx-auto mt-12 max-w-[860px] space-y-5 pb-4">
      <h2 className="text-xl font-bold text-[var(--text)]">{s.heading}</h2>
      <p className="text-sm leading-7 text-[var(--muted2)]">{s.intro}</p>

      <div className="mt-2">
        {s.sections.map((sec, i) => (
          <Accordion key={i} sec={sec} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </div>

      <div
        className="mt-8 rounded-r-lg text-xs leading-6 text-[var(--muted2)]"
        style={{ background: 'rgba(251,191,36,0.08)', borderLeft: '3px solid #fbbf24', padding: '12px 16px' }}
      >
        ⚠️ {s.warning}
      </div>
    </section>
  )
}

export default function CreditCardGenerator() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const L = {
    type: en ? 'Type:' : 'Tip:',
    count: en ? 'Count:' : 'Adet:',
    generate: en ? 'Generate' : 'Üret',
    copyAll: en ? 'Copy all' : 'Tümünü Kopyala',
  }
  const [type, setType] = useState('visa')
  const [count, setCount] = useState(6)
  const [grid, setGrid] = useState('')

  const expiry = () => String(ri(1,12)).padStart(2,'0')+'/'+(new Date().getFullYear()%100+ri(1,4))

  const gen = (t = type, n = count) => {
    setGrid(Array.from({length: Math.min(20, n)}, () => {
      const no = genOneCC(t), exp = expiry(), cvv = t==='amex' ? String(ri(1000,9999)) : String(ri(100,999))
      const click = `navigator.clipboard.writeText(${JSON.stringify(no)}).then(()=>{const t=document.getElementById('__toast');if(t){t.textContent='Copied!';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}})`.replace(/"/g, '&quot;')
      return `<div class="gen-card"><div class="gen-card-title">${t.toUpperCase()}</div><div class="gen-result" onclick="${click}"><span class="val">${esc(no)}</span><span class="copy-ic">⎘</span></div><div style="display:flex;gap:12px;font-family:var(--mono);font-size:.7rem;color:var(--muted)"><span>EXP <span style="color:var(--text)">${exp}</span></span><span>CVV <span style="color:var(--text)">${cvv}</span></span></div></div>`
    }).join(''))
  }

  const copyAll = () => {
    const vals = [...document.querySelectorAll('#cc-grid .val')].map(v => v.textContent).join('\n')
    navigator.clipboard.writeText(vals).then(() => {
      const t = document.getElementById('__toast') as HTMLElement
      if (t) { t.textContent = 'Copied!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600) }
    })
  }

  useEffect(() => { gen() }, [])

  return (
    <>
      <div className="gen-wrap">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:'1.25rem' }}>
          <label className="gen-label">{L.type}</label>
          <select className="gen-sel" value={type} onChange={e => setType(e.target.value)}>
            <option value="visa">Visa</option>
            <option value="mc">Mastercard</option>
            <option value="amex">Amex</option>
            <option value="troy">Troy</option>
          </select>
          <label className="gen-label">{L.count}</label>
          <input type="number" min={1} max={20} value={count} className="gen-num" onChange={e => setCount(Number(e.target.value))} />
          <button className="btn primary" onClick={() => gen()}>{L.generate}</button>
          <button className="btn" onClick={copyAll}>{L.copyAll}</button>
        </div>
        <div className="gen-grid" id="cc-grid" dangerouslySetInnerHTML={{ __html: grid }} />
        <SeoContent />
      </div>
      <div className="statusbar">
        <span className="chip chip-ok">CC</span>
        <span>Luhn-valid test card numbers — not real cards</span>
      </div>
    </>
  )
}
