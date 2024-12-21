'use client'

import cn from 'clsx'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Link } from '~/components/link'
import s from './navigation.module.css'

const LINKS = [
  { href: '/', label: 'home' },
  { href: '/r3f', label: 'projects' },
  { href: '/storyblok', label: 'storyblok' },
  { href: '/shopify', label: 'shopify' },
  { href: '/hubspot', label: 'hubspot' },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <nav className={s.nav}>
      <div className={s.container}>
        <div className={s.title}>
          <h1>SILLYBOY</h1>
          <span className={s.pathname}>{pathname}</span>
        </div>

        <button 
          className={cn(s.hamburger, isOpen && s.active)} 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={cn(s.list, isOpen && s.open)}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn('link', s.link, pathname === link.href && s.active)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
