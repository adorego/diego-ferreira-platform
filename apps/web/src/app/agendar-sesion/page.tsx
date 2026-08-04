import { Suspense } from 'react'
import AgendarSesionClient from './AgendarSesionClient'

export const metadata = {
  title: 'Agendá tu sesión | Diego Ferreira',
}

export default function AgendarSesionPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a0a' }} />
    }>
      <AgendarSesionClient />
    </Suspense>
  )
}
