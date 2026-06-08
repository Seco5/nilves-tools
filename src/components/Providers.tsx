'use client'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { SidebarProvider } from '@/contexts/SidebarContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
