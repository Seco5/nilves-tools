'use client'

import { type CSSProperties } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

const T = {
  tr: {
    eyebrow: '🔒 GİZLİLİK',
    title: 'Gizlilik Politikası',
    updated: 'Son güncelleme: 12 Haziran 2026',
    sections: [
      {
        h: 'Verileriniz Tarayıcınızda Kalır',
        p: "DevOneKit'teki tüm araçlar tamamen sizin tarayıcınızda çalışır. Yapıştırdığınız, yazdığınız veya ürettiğiniz hiçbir veri sunucularımıza gönderilmez, kaydedilmez veya üçüncü taraflarla paylaşılmaz. İşleminiz bittiğinde veriniz yalnızca sizde kalır.",
      },
      {
        h: 'Çerezler ve Yerel Depolama',
        p: 'Tema (açık/koyu) ve dil tercihiniz gibi ayarları hatırlamak için tarayıcınızın yerel depolama (localStorage) alanını kullanırız. Bu bilgiler cihazınızdan dışarı çıkmaz.',
      },
      {
        h: 'Anonim Analitik',
        p: "Siteyi geliştirmek için anonim ziyaret istatistikleri (Google Analytics) toplayabiliriz. Bu veriler kişisel olarak sizi tanımlamaz; yalnızca hangi araçların ne sıklıkla kullanıldığını anlamamıza yardımcı olur.",
      },
      {
        h: 'İletişim',
        p: 'Gizlilik ile ilgili sorularınız için',
        link: { text: 'iletişim sayfamızı', href: '/contact' },
        after: ' kullanabilir veya devonekit@gmail.com adresine yazabilirsiniz.',
      },
    ],
  },
  en: {
    eyebrow: '🔒 PRIVACY',
    title: 'Privacy Policy',
    updated: 'Last updated: June 12, 2026',
    sections: [
      {
        h: 'Your Data Stays in Your Browser',
        p: 'All tools on DevOneKit run entirely in your browser. None of the data you paste, type or generate is sent to our servers, stored, or shared with third parties. Once you are done, your data remains only with you.',
      },
      {
        h: 'Cookies and Local Storage',
        p: 'We use your browser\'s local storage to remember settings such as your theme (light/dark) and language preference. This information never leaves your device.',
      },
      {
        h: 'Anonymous Analytics',
        p: 'To improve the site, we may collect anonymous visit statistics (Google Analytics). This data does not personally identify you; it only helps us understand which tools are used and how often.',
      },
      {
        h: 'Contact',
        p: 'For privacy-related questions you can use our',
        link: { text: 'contact page', href: '/contact' },
        after: ' or write to devonekit@gmail.com.',
      },
    ],
  },
} as const

const sectionTitle: CSSProperties = {
  fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: '.5rem',
}

export default function PrivacyClient() {
  const { lang } = useLanguage()
  const t = T[lang === 'en' ? 'en' : 'tr']

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>
      <section style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ display: 'inline-flex', background: 'var(--teal-dim)', color: 'var(--teal)', fontSize: 11, padding: '3px 12px', borderRadius: 20, letterSpacing: '.04em', fontWeight: 500 }}>
          {t.eyebrow}
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 500, margin: '.75rem 0 .5rem', color: 'var(--text)' }}>{t.title}</h1>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>{t.updated}</p>
      </section>

      {t.sections.map((s, i) => (
        <section key={i} style={{ marginBottom: '1.75rem' }}>
          <h2 style={sectionTitle}>{s.h}</h2>
          <p style={{ fontSize: 14, color: 'var(--muted2)', lineHeight: 1.7 }}>
            {s.p}
            {'link' in s && s.link && (
              <>
                {' '}
                <Link href={s.link.href} style={{ color: 'var(--teal)' }}>{s.link.text}</Link>
                {(s as { after?: string }).after}
              </>
            )}
          </p>
        </section>
      ))}
    </div>
  )
}
