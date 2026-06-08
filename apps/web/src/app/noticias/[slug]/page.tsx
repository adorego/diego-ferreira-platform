import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import type { Metadata } from 'next'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

interface Noticia {
  id: number
  titulo: string
  contenido: string
  imagen: { url: string }
  fecha: string
  slug: string
}

async function getNoticia(slug: string): Promise<Noticia | null> {
  try {
    const res = await fetch(`${API}/cms/noticias/${slug}`, {
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
  const noticia = await getNoticia(slug)
  if (!noticia) return { title: 'Noticia no encontrada' }
  return {
    title: noticia.titulo,
    openGraph: {
      title: noticia.titulo,
      images: [`${API}${noticia.imagen.url}`],
    },
  }
}

export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const noticia = await getNoticia(slug)
  if (!noticia) notFound()

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-extrabold text-[#1a1a2e] mb-4">
        {noticia.titulo}
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        {new Date(noticia.fecha).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
      <div className="relative w-full mb-8" style={{ aspectRatio: '16/9' }}>
        <Image
          src={`${API}${noticia.imagen.url}`}
          alt={noticia.titulo}
          width={800}
          height={450}
          className="rounded-2xl object-cover w-full h-auto"
          priority
        />
      </div>
      <article className="prose prose-lg max-w-none text-[#1a1a2e]">
        <ReactMarkdown>{noticia.contenido}</ReactMarkdown>
      </article>
    </main>
  )
}
