import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa'

const quickLinks = [
  { label: 'Inicio',    href: '/main#inicio' },
  { label: 'Quién Soy', href: '/main#quien_soy' },
  { label: 'Noticias',  href: '/main#noticias' },
  { label: 'Artículos', href: '/main#articulos' },
  { label: 'Eventos',   href: '/main#eventos' },
  { label: 'Videos',    href: '/main#videos' },
  { label: 'Podcasts',  href: '/main#podcasts' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#1a1a2e] text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Columna 1 — Nombre y descripción */}
          <div>
            <h3 className="text-xl font-bold text-[#EBBF01] mb-3">Diego Ferreira</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Coach de alto rendimiento especializado en transformar la mentalidad
              de empresarios y atletas para alcanzar resultados extraordinarios.
            </p>
          </div>

          {/* Columna 2 — Links rápidos */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-[#EBBF01]">Links rápidos</h3>
            <ul className="flex flex-col gap-2">
              {quickLinks.map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-gray-300 text-sm hover:text-[#EBBF01] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 — Contacto y redes */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-[#EBBF01]">Contacto</h3>
            <p className="text-gray-300 text-sm mb-4">
              ¿Querés dar el siguiente paso?<br />
              Agendá una sesión gratuita hoy.
            </p>
            <Link
              href="/agendar"
              className="inline-block px-5 py-2 rounded-full bg-[#EBBF01] text-[#1a1a2e] font-semibold text-sm hover:bg-yellow-300 transition-colors mb-5"
            >
              Agendar sesión
            </Link>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#EBBF01] hover:text-[#1a1a2e] transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#EBBF01] hover:text-[#1a1a2e] transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={16} />
              </a>
              <a
                href="https://wa.me/595000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#EBBF01] hover:text-[#1a1a2e] transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 text-center text-gray-400 text-sm">
          © {year} Diego Ferreira. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
