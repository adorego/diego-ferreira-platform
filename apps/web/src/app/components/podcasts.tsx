'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

interface Podcast {
  id: number
  title: string
  audio: { url: string }
}

export default function Podcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/cms/podcasts`)
      .then((res) => res.json())
      .then((data) => setPodcasts(data))
      .catch(() => setPodcasts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="podcasts" className="py-16 px-4">
      <h2 className="text-3xl font-extrabold text-[#1a1a2e] mb-10 text-center">
        Podcasts
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : podcasts.length === 0 ? (
        <p className="text-center text-gray-500">Próximamente...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {podcasts.map((podcast) => (
            <motion.div
              key={podcast.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl shadow-md overflow-hidden bg-white p-5 flex flex-col gap-3"
            >
              <h3 className="text-base font-bold text-[#1a1a2e]">
                {podcast.title}
              </h3>
              <audio
                controls
                className="w-full"
                src={`${API}${podcast.audio.url}`}
              />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
