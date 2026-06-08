import type { Metadata } from 'next'
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Toast from '@/components/Toast'
import Providers from '@/components/Providers'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Nilves — Developer Toolkit',
    template: '%s | Nilves',
  },
  description:
    'Every utility you need as a developer — formatters, generators, encoders, converters — in one fast, private, browser-based toolkit. No ads. No signup. No nonsense.',
  keywords: [
    'developer tools', 'json formatter', 'difr checker', 'uuid generator',
    'password generator', 'hash generator', 'base64', 'jwt decoder',
    'regex tester', 'tckn generator', 'vkn generator', 'iban generator',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      data-theme="dark"
      className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('nilves-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}var l=localStorage.getItem('nilves-lang');if(l==='tr'||l==='en'){document.documentElement.lang=l;}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="app-shell">
        <Providers>
          <Header />
          <div className="workspace">
            <Sidebar />
            <main className="content">{children}</main>
          </div>
          <Toast />
        </Providers>
      </body>
    </html>
  )
}
