'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import removeMarkdown from 'remove-markdown'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

interface Evento {
  id: number
  titulo: string
  fecha: string
  hora: string
  lugar: string
  reservas: string
  imagen: { url: string }
}

export default function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/cms/eventos`)
      .then((res) => res.json())
      .then((data) => setEventos(data))
      .catch(() => setEventos([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="eventos" className="py-16 px-4">
      <h2 className="text-3xl font-extrabold text-[#1a1a2e] mb-10 text-center">
        Próximos eventos
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : eventos.length === 0 ? (
        <p className="text-center text-gray-500">Próximamente...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {eventos.map((evento) => (
            <motion.div
              key={evento.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl shadow-md overflow-hidden bg-white flex flex-col"
            >
              <div className="relative w-full h-48">
                <Image
                  src={`${API}${evento.imagen.url}`}
                  alt={evento.titulo}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">
                  {evento.titulo}
                </h3>
                <p className="text-sm text-gray-500 mb-1">
                  {new Date(evento.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  — {evento.hora}
                </p>
                <p className="text-sm text-gray-600 mb-4">{evento.lugar}</p>
                <a
                  href={removeMarkdown(evento.reservas)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-block text-center bg-[#1a1a2e] text-white text-sm font-semibold py-2 px-4 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Reservar
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
