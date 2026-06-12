import type { Metadata } from 'next'
import Script from 'next/script'
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Toast from '@/components/Toast'
import Footer from '@/components/Footer'
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
    default: 'DevOneKit — Developer Toolkit',
    template: '%s | DevOneKit',
  },
  description:
    'Free developer toolkit for developers, analysts and QA engineers. JSON, TCKN, UUID, Regex, SQL and more. Runs in browser, no data stored.',
  keywords: [
    'devonekit', 'developer toolkit', 'json formatter', 'tckn generator',
    'uuid generator', 'regex tester', 'sql playground', 'free developer tools',
    'browser tools',
  ],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      data-theme="light"
      className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="google-site-verification" content="274bad7b262cd5e8" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('devonekit-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}var l=localStorage.getItem('devonekit-lang');if(l==='tr'||l==='en'){document.documentElement.lang=l;}}catch(e){}})();`,
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-52MFVGLKDK"
          strategy="beforeInteractive"
        />
        <Script id="google-analytics" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-52MFVGLKDK');
          `}
        </Script>
      </head>
      <body className="app-shell">
        <Providers>
          <Header />
          <div className="workspace">
            <Sidebar />
            <main className="content">
              {children}
              <Footer />
            </main>
          </div>
          <Toast />
        </Providers>
      </body>
    </html>
  )
}
