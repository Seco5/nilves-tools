import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Toast from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Nilves — Developer Toolkit',
  description: 'Every utility you need as a developer — formatters, generators, encoders, converters — in one fast, private, browser-based toolkit.',
  keywords: 'developer tools, json formatter, diff checker, uuid generator, password generator, hash generator, base64, jwt decoder',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {children}
          </div>
        </div>
        <Toast />
      </body>
    </html>
  )
}
