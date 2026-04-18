'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: '/', label: '首页', icon: '⌂' },
    { href: '/login', label: '站内入口', icon: '•' },
    { href: '/studio', label: '工作台', icon: '◦' },
    { href: '/blog', label: '博客', icon: '✎' },
    { href: '/album', label: '相册', icon: '◫' },
    { href: '/diary', label: '日记', icon: '□' },
  ]

  return (
    <>
      <button
        className="mobile-nav-btn"
        onClick={() => setIsOpen(true)}
        aria-label="打开导航"
      >
        ☰
      </button>

      <div
        className={`nav-overlay ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`site-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <Link href="/" className="sidebar-logo" onClick={() => setIsOpen(false)}>
            <span className="sidebar-logo__mark">◎</span>
            <span className="sidebar-logo__text">USTCCB</span>
          </Link>
          <button
            className="sidebar-close"
            onClick={() => setIsOpen(false)}
            aria-label="关闭导航"
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`sidebar-link ${pathname === link.href ? 'is-active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sidebar-link__icon">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-meta">
          <div className="sidebar-status">
            <span className="sidebar-status__dot" />
            <span>Personal Hub Online</span>
          </div>
          <div className="sidebar-profile">
            <div className="sidebar-profile__avatar">A</div>
            <div>
              <p>AnranWu</p>
              <span>Digital Builder</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
