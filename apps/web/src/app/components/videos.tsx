'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'motion/react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

interface Video {
  id: number
  title: string
  url: string
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/cms/videos`)
      .then((res) => res.json())
      .then((data) => setVideos(data))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="videos" className="py-16 px-4">
      <h2 className="text-3xl font-extrabold text-[#1a1a2e] mb-10 text-center">
        Videos
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <p className="text-center text-gray-500">Próximamente...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl shadow-md overflow-hidden bg-white flex flex-col"
            >
              <div className="w-full">
                <ReactPlayer
                  url={video.url}
                  width="100%"
                  height="220px"
                  controls
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-[#1a1a2e]">
                  {video.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
