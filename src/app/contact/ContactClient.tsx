'use client'

import { useState, type CSSProperties } from 'react'
import { Mail, Copy, Check, Bug, Lightbulb } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const EMAIL = 'devonekit@gmail.com'

const T = {
  tr: {
    eyebrow: '💬 İLETİŞİM',
    title: 'Bize Ulaşın',
    subtitle: 'Soru, öneri veya hata bildirimi için aşağıdaki formu doldurun. Mail uygulamanız açılacak.',
    subject: 'Konu',
    topics: ['Genel Soru', 'Hata Bildirimi', 'Araç Önerisi', 'İş Birliği', 'Diğer'],
    name: 'Adınız',
    namePlaceholder: 'İsteğe bağlı',
    message: 'Mesajınız',
    messagePlaceholder: 'Mesajınızı buraya yazın…',
    submit: 'Mail Uygulamasında Aç',
    validation: 'Lütfen bir mesaj yazın',
    directTitle: 'Ya da doğrudan e-posta gönderin:',
    bodyKonu: 'Konu', bodyAd: 'Ad',
    cards: [
      { title: 'Hata mı Buldun?', desc: 'Hangi araçta, hangi tarayıcıda olduğunu belirtirsen daha hızlı çözeriz.' },
      { title: 'Araç Önerin', desc: 'Eklemek istediğin bir araç mı var? Bize yaz, değerlendirelim.' },
    ],
  },
  en: {
    eyebrow: '💬 CONTACT',
    title: 'Get in Touch',
    subtitle: 'Fill out the form below for questions, suggestions or bug reports. Your mail app will open.',
    subject: 'Subject',
    topics: ['General Question', 'Bug Report', 'Tool Suggestion', 'Partnership', 'Other'],
    name: 'Your Name',
    namePlaceholder: 'Optional',
    message: 'Your Message',
    messagePlaceholder: 'Write your message here…',
    submit: 'Open in Mail App',
    validation: 'Please write a message',
    directTitle: 'Or email us directly:',
    bodyKonu: 'Subject', bodyAd: 'Name',
    cards: [
      { title: 'Found a Bug?', desc: 'Mention which tool and browser for faster resolution.' },
      { title: 'Suggest a Tool', desc: "Have a tool idea? Write to us, we'll consider it." },
    ],
  },
} as const

const inputStyle: CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8, border: '0.5px solid var(--border)',
  background: 'var(--surface2)', color: 'var(--text)', fontSize: 14,
}
const labelStyle: CSSProperties = { fontSize: 12, color: 'var(--muted2)', marginBottom: 6, display: 'block', fontWeight: 500 }

export default function ContactClient() {
  const { lang } = useLanguage()
  const t = T[lang === 'en' ? 'en' : 'tr']

  const [topic, setTopic] = useState<string>(t.topics[0])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const submit = () => {
    if (!message.trim()) { setError(t.validation); return }
    setError('')
    const subject = encodeURIComponent(topic + (name ? ` — ${name}` : ''))
    const body = encodeURIComponent(`${t.bodyKonu}: ${topic}\n${t.bodyAd}: ${name || '-'}\n\n${message}`)
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* HERO */}
      <section style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ display: 'inline-flex', background: 'var(--teal-dim)', color: 'var(--teal)', fontSize: 11, padding: '3px 12px', borderRadius: 20, letterSpacing: '.04em', fontWeight: 500 }}>
          {t.eyebrow}
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 500, margin: '.75rem 0 .5rem', color: 'var(--text)' }}>{t.title}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted2)', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>{t.subtitle}</p>
      </section>

      {/* FORM CARD */}
      <section style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={labelStyle}>{t.subject}</label>
          <select style={inputStyle} value={topic} onChange={e => setTopic(e.target.value)}>
            {t.topics.map(tp => <option key={tp} value={tp}>{tp}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={labelStyle}>{t.name}</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder={t.namePlaceholder} />
        </div>
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={labelStyle}>{t.message}</label>
          <textarea
            style={{ ...inputStyle, minHeight: 140, resize: 'vertical', fontFamily: 'inherit' }}
            value={message}
            onChange={e => { setMessage(e.target.value); if (error) setError('') }}
            placeholder={t.messagePlaceholder}
          />
          {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>{error}</div>}
        </div>
        <button
          onClick={submit}
          style={{
            width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '11px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}
        >
          <Mail size={16} />
          {t.submit}
        </button>
      </section>

      {/* DIRECT EMAIL */}
      <section style={{ background: 'var(--surface2)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--muted2)' }}>{t.directTitle}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href={`mailto:${EMAIL}`} style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--teal)' }}>{EMAIL}</a>
          <button onClick={copyEmail} aria-label="copy email" style={{ display: 'inline-flex', alignItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer', color: copied ? 'var(--teal)' : 'var(--muted2)' }}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
      </section>

      {/* INFO CARDS */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[Bug, Lightbulb].map((Icon, i) => (
          <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '1rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '.625rem' }}>
              <Icon size={16} style={{ color: 'var(--teal)' }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{t.cards[i].title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.5 }}>{t.cards[i].desc}</div>
          </div>
        ))}
      </section>
    </div>
  )
}
