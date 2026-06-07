'use client'
export default function Header() {
  return (
    <header style={{
      height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
      padding: '0 1.25rem', gap: '1rem',
      background: 'var(--surface)', borderBottom: '1px solid var(--border)'
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: 'var(--teal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg viewBox="0 0 24 24" width={16} height={16} fill="#fff" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 4v16l7-4 7 4V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-.02em' }}>
          nilves<span style={{ color: 'var(--teal2)' }}>.dev</span>
        </span>
      </a>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: '.68rem', color: 'var(--muted)' }}>
        <div className="pulse" />
        <span>50+ tools · all free · no signup</span>
      </div>
    </header>
  )
}
