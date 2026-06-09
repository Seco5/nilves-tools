'use client'
import { useId } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Record<Size, number> = { sm: 30, md: 40, lg: 64, xl: 96 }

export function LogoIcon({ size = 30 }: { size?: number }) {
  const id = useId()
  const clipId = `logo-clip-${id}`
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ flexShrink: 0 }}>
      <defs>
        <clipPath id={clipId}>
          <rect width="64" height="64" rx="14" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="64" height="64" rx="14" fill="#1D9E75" />
        <rect x="0" y="36" width="64" height="28" fill="#085041" />
        <text
          x="32" y="25" textAnchor="middle"
          fontFamily="JetBrains Mono,monospace" fontSize="11" fontWeight="400"
          fill="rgba(255,255,255,0.55)" letterSpacing="2"
        >dev</text>
        <text
          x="32" y="44" textAnchor="middle"
          fontFamily="JetBrains Mono,monospace" fontSize="20" fontWeight="700"
          fill="#fff" letterSpacing="-1"
        >one</text>
        <text
          x="32" y="57" textAnchor="middle"
          fontFamily="JetBrains Mono,monospace" fontSize="10" fontWeight="400"
          fill="#9FE1CB" letterSpacing="2"
        >kit</text>
      </g>
    </svg>
  )
}

type LogoProps = {
  size?: Size
  showText?: boolean
  theme?: 'dark' | 'light' | 'auto'
  href?: string | null
}

export default function Logo({ size = 'sm', showText = true, theme = 'auto', href = '/' }: LogoProps) {
  const { theme: ctxTheme } = useTheme()
  const resolved = theme === 'auto' ? ctxTheme : theme
  const px = SIZES[size]

  const text = showText && (
    resolved === 'light' ? (
      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-.03em' }}>
        Dev<span style={{ color: '#1D9E75' }}>One</span>Kit
      </span>
    ) : (
      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 700, color: '#e4e4f0', letterSpacing: '-.03em' }}>
        Dev<span style={{ color: '#5DCAA5' }}>One</span>Kit
      </span>
    )
  )

  const inner = (
    <>
      <LogoIcon size={px} />
      {text}
    </>
  )

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    fontFamily: 'var(--display)',
    fontSize: size === 'sm' ? '1.05rem' : size === 'md' ? '1.3rem' : size === 'lg' ? '1.8rem' : '2.4rem',
    fontWeight: 700,
    letterSpacing: '-.02em',
  }

  if (href) {
    return <Link href={href} className="logo" style={style}>{inner}</Link>
  }
  return <span className="logo" style={style}>{inner}</span>
}
