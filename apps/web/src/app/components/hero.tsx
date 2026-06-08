'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'

type Segment = 'empresario' | 'deportista'

const segmentData: Record<Segment, { title: string; subtitle: string; bullets: string[] }> = {
  empresario: {
    title: 'Liderá tu empresa con mentalidad de campeón',
    subtitle: 'Estrategias de alto rendimiento para CEOs y emprendedores',
    bullets: [
      'Tomá decisiones más claras bajo presión',
      'Construí equipos de alto rendimiento',
      'Equilibrá vida personal y profesional',
      'Escalá tu negocio con propósito',
    ],
  },
  deportista: {
    title: 'Alcanzá tu máximo potencial deportivo',
    subtitle: 'Coaching mental para atletas que quieren llegar al siguiente nivel',
    bullets: [
      'Superá bloqueos mentales y miedos',
      'Desarrollá resiliencia y concentración',
      'Optimizá tu recuperación física y mental',
      'Competí con confianza en momentos clave',
    ],
  },
}

export default function Hero() {
  const [segment, setSegment] = useState<Segment>('empresario')
  const data = segmentData[segment]

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAFAF5] to-[#e8f4f5] px-4 pt-20 pb-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Segment tabs */}
        <div className="inline-flex rounded-full bg-white shadow-md p-1 mb-10">
          {(['empresario', 'deportista'] as Segment[]).map(s => (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                segment === s
                  ? 'bg-[#EBBF01] text-[#1a1a2e] shadow'
                  : 'text-gray-500 hover:text-[#2B2B2B]'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={segment}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35 }}
          >
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#1a1a2e] leading-tight mb-4">
              {data.title}
            </h1>
            <p className="text-[#00727A] text-lg md:text-xl font-medium mb-8">
              {data.subtitle}
            </p>
            <ul className="text-left max-w-md mx-auto mb-10 space-y-3">
              {data.bullets.map(b => (
                <li key={b} className="flex items-start gap-3 text-[#2B2B2B]">
                  <span className="mt-1 w-2 h-2 rounded-full bg-[#EBBF01] flex-shrink-0" />
                  <span className="text-base">{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/agendar"
              className="inline-block px-8 py-3 rounded-full bg-[#EBBF01] text-[#1a1a2e] font-bold text-base hover:bg-yellow-400 transition-colors shadow-lg"
            >
              Agendá una sesión gratuita
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
