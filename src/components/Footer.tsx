'use client'
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { lang } = useLanguage()
  const en = lang === 'en'

  return (
    <footer
      style={{
        borderTop: '0.5px solid var(--border)',
        padding: '1.5rem 1rem',
        marginTop: 'auto',
        fontSize: 12,
        color: 'var(--muted2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <span>
        {en ? '© 2026 DevOneKit — All tools are free' : '© 2026 DevOneKit — Tüm araçlar ücretsizdir'}
      </span>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/contact" className="footer-link">
          <Mail size={13} />
          {en ? 'Contact' : 'İletişim'}
        </Link>
        <Link href="/privacy" className="footer-link">
          <Lock size={13} />
          {en ? 'Privacy' : 'Gizlilik'}
        </Link>
      </div>
    </footer>
  )
}
