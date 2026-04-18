'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: '/', label: 'Overview', icon: '01' },
    { href: '/blog', label: 'Writing', icon: '02' },
    { href: '/album', label: 'Gallery', icon: '03' },
    { href: '/diary', label: 'Journal', icon: '04' },
    { href: '/studio', label: 'Studio', icon: '05' },
    { href: '/login', label: 'Access', icon: '06' },
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
            <span className="sidebar-logo__mark">U</span>
            <span className="sidebar-logo__text">
              <strong>USTCCB</strong>
              <small>Personal Hub</small>
            </span>
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
          <p className="sidebar-nav__label">Navigate</p>
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
          <div className="sidebar-note">
            <span>Publishing stack</span>
            <strong>Workers + Vercel</strong>
          </div>
          <div className="sidebar-status">
            <span className="sidebar-status__dot" />
            <span>System online</span>
          </div>
          <div className="sidebar-profile">
            <div className="sidebar-profile__avatar">AW</div>
            <div>
              <p>AnranWu</p>
              <span>Writer / Builder / Archivist</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
