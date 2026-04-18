import type { Metadata } from 'next'
import { DM_Sans, JetBrains_Mono, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'USTCCB Personal Hub',
  description: '一个更完整的个人全栈站点，承载博客、相册、日记与持续创作。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
        <div className="background-glow" />
        <div className="background-grid" />
        <div className="site-shell">
          <Navbar />
          <div className="content-shell">
            <main className="site-main">{children}</main>
            <footer className="site-footer">
              <div className="site-footer__inner">
                <p>&copy; 2026 USTCCB Personal Hub</p>
                <p>Built for writing, memory, and a quieter kind of personal software.</p>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  )
}
