'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: '/', label: '首页' },
    { href: '/blog', label: '博客' },
    { href: '/album', label: '相册' },
    { href: '/diary', label: '日记' },
    { href: '/studio', label: '工作台' },
    { href: '/api/health', label: '接口' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(246,242,235,0.78)] backdrop-blur-xl">
      <div className="page-shell">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-semibold text-white">
              CB
            </span>
            <span className="flex flex-col">
              <span className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
                ustccb
              </span>
              <span className="text-lg font-semibold text-[var(--ink)]">
                Personal Hub
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition ${
                  pathname === link.href ? 'font-semibold text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <span className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)]">
              Full Stack Online
            </span>
            <Link
              href="/login"
              className="button-secondary"
            >
              登录站点
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="切换导航"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="space-y-2 border-t border-[var(--line)] py-4 md:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-2xl px-4 py-3 ${
                  pathname === link.href ? 'bg-[var(--surface-alt)] text-[var(--ink)]' : 'text-[var(--muted)]'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[var(--line)] px-1 pt-4">
              <Link
                href="/login"
                className="button-primary flex w-full justify-center"
                onClick={() => setIsOpen(false)}
              >
                登录站点
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
