import { Suspense } from 'react'
import ConfirmacionClient from './ConfirmacionClient'

export default function ConfirmacionLibroPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '2rem', color: '#718096' }}>
        Cargando...
      </div>
    }>
      <ConfirmacionClient />
    </Suspense>
  )
}
