'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

interface Articulo {
  id: number
  titulo: string
  descripcion: string
  contenido: string
  imagen: { url: string }
  fecha: string
  autor: string
  slug: string
}

export default function Articulos() {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/cms/articulos`)
      .then((res) => res.json())
      .then((data) => setArticulos(data))
      .catch(() => setArticulos([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="articulos" className="py-16 px-4">
      <h2 className="text-3xl font-extrabold text-[#1a1a2e] mb-10 text-center">
        Artículos
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : articulos.length === 0 ? (
        <p className="text-center text-gray-500">Próximamente...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {articulos.map((articulo) => (
            <motion.div
              key={articulo.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl shadow-md overflow-hidden bg-white flex flex-col"
            >
              <div className="relative w-full h-48">
                <Image
                  src={`${API}${articulo.imagen.url}`}
                  alt={articulo.titulo}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs text-blue-500 font-semibold mb-1">
                  {articulo.autor}
                </p>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">
                  {articulo.titulo}
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-1">
                  {articulo.descripcion.length > 120
                    ? `${articulo.descripcion.slice(0, 120)}…`
                    : articulo.descripcion}
                </p>
                <Link
                  href={`/articulos/${articulo.slug}`}
                  className="text-sm font-semibold text-blue-600 hover:underline mt-auto"
                >
                  Leer más →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
