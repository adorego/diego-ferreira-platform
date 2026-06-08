'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'

const especialidades = [
  'Coaching ejecutivo y liderazgo',
  'Psicología del deporte',
  'Programación Neurolingüística (PNL)',
  'Gestión del estrés y alta presión',
  'Comunicación efectiva y negociación',
  'Desarrollo de equipos de alto rendimiento',
]

export default function QuienSoy() {
  return (
    <section id="quien_soy" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative w-full aspect-[3/4] max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/diego_4.jpeg"
                alt="Diego Ferreira"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-[#EBBF01] opacity-20" />
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-[#00727A] opacity-20" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <span className="text-[#00727A] font-semibold text-sm uppercase tracking-widest mb-2 block">
              Mi historia
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-5">
              Quién es Diego Ferreira
            </h2>
            <div className="space-y-4 text-[#555] leading-relaxed mb-6">
              <p>
                Soy Diego Ferreira, coach de alto rendimiento con más de una década de
                experiencia trabajando con empresarios y atletas de élite en Paraguay y
                Latinoamérica.
              </p>
              <p>
                Mi camino comenzó en el deporte, donde descubrí que la diferencia entre
                el éxito y el fracaso no está solo en el físico o las habilidades técnicas,
                sino en la fortaleza mental y la claridad de propósito.
              </p>
              <p>
                Hoy combino esa experiencia deportiva con formación en PNL, psicología del
                deporte y coaching ejecutivo para ayudar a mis clientes a desbloquear su
                máximo potencial.
              </p>
            </div>

            {/* Especialidades */}
            <h3 className="font-bold text-[#1a1a2e] mb-3">Mis especialidades</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
              {especialidades.map(e => (
                <li key={e} className="flex items-center gap-2 text-sm text-[#2B2B2B]">
                  <span className="w-2 h-2 rounded-full bg-[#EBBF01] flex-shrink-0" />
                  {e}
                </li>
              ))}
            </ul>

            <Link
              href="/agendar"
              className="inline-block px-6 py-3 rounded-full bg-[#00727A] text-white font-semibold hover:bg-teal-700 transition-colors"
            >
              Quiero saber más
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
