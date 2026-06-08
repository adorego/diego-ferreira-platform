'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HiMenuAlt3, HiX } from 'react-icons/hi'

const navLinks = [
  { label: 'Inicio',    href: '/main#inicio' },
  { label: 'Quién Soy', href: '/main#quien_soy' },
  { label: 'Noticias',  href: '/main#noticias' },
  { label: 'Artículos', href: '/main#articulos' },
  { label: 'Eventos',   href: '/main#eventos' },
  { label: 'Videos',    href: '/main#videos' },
  { label: 'Podcasts',  href: '/main#podcasts' },
]

export default function NavBar() {
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
      style={{ '--header-h': '72px' } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/main" aria-label="Inicio">
          <Image
            src="/logo.png"
            alt="Diego Ferreira"
            width={140}
            height={48}
            priority
            style={{ objectFit: 'contain' }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[#2B2B2B] hover:text-[#EBBF01] font-medium text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/agendar"
            className="ml-2 px-4 py-2 rounded-full bg-[#EBBF01] text-[#2B2B2B] font-semibold text-sm hover:bg-yellow-400 transition-colors"
          >
            Agendar sesión
          </Link>
        </nav>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 text-[#2B2B2B]"
          onClick={() => setOpen(prev => !prev)}
          aria-label="Menú"
        >
          {open ? <HiX size={28} /> : <HiMenuAlt3 size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="flex flex-col px-4 py-4 gap-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#2B2B2B] font-medium py-1 border-b border-gray-100"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/agendar"
              className="mt-2 px-4 py-2 rounded-full bg-[#EBBF01] text-[#2B2B2B] font-semibold text-center"
              onClick={() => setOpen(false)}
            >
              Agendar sesión
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
