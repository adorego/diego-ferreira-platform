import { Suspense } from 'react'
import PagoClient  from './PagoClient'

export default function PagoPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '2rem', color: '#718096' }}>
        Cargando...
      </div>
    }>
      <PagoClient />
    </Suspense>
  )
}
