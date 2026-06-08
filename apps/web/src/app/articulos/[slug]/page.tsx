import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import type { Metadata } from 'next'

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

async function getArticulo(slug: string): Promise<Articulo | null> {
  try {
    const res = await fetch(`${API}/cms/articulos/${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const articulo = await getArticulo(slug)
  if (!articulo) return { title: 'Artículo no encontrado' }
  return {
    title: articulo.titulo,
    description: articulo.descripcion,
    openGraph: {
      title: articulo.titulo,
      description: articulo.descripcion,
      images: [`${API}${articulo.imagen.url}`],
    },
  }
}

export default async function ArticuloPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const articulo = await getArticulo(slug)
  if (!articulo) notFound()

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-extrabold text-[#1a1a2e] mb-4">
        {articulo.titulo}
      </h1>
      <p className="text-sm text-gray-400 mb-1">
        {new Date(articulo.fecha).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      <p className="text-sm font-semibold text-blue-500 mb-6">
        {articulo.autor}
      </p>
      <div className="relative w-full mb-8" style={{ aspectRatio: '16/9' }}>
        <Image
          src={`${API}${articulo.imagen.url}`}
          alt={articulo.titulo}
          width={800}
          height={450}
          className="rounded-2xl object-cover w-full h-auto"
          priority
        />
      </div>
      <article className="prose prose-lg max-w-none text-[#1a1a2e]">
        <ReactMarkdown>{articulo.contenido}</ReactMarkdown>
      </article>
    </main>
  )
}
