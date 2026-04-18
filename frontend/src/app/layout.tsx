import type { Metadata } from 'next'
import { Noto_Serif_SC, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})

const serif = Noto_Serif_SC({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
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
      <body className={`${display.variable} ${serif.variable}`}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="mt-20 border-t border-[var(--line)] bg-[rgba(17,24,39,0.98)] py-10 text-white">
          <div className="page-shell flex flex-col gap-4 text-sm text-white/72 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; 2026 USTCCB Personal Hub</p>
            <p>Built with Next.js, route handlers, and a cleaner deployment path.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
