'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ConfirmacionClient() {
  const [fecha, setFecha] = useState('')
  const params = useSearchParams()
  const status = params.get('status')
  const failed = status !== null && status !== 'success'

  useEffect(() => {
    setFecha(new Date().toLocaleString('es-PY', {
      dateStyle: 'long',
      timeStyle: 'short',
    }))
  }, [])

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', color: failed ? '#C53030' : '#1E3A5F', marginBottom: '1rem' }}>
        {failed ? 'La compra no pudo procesarse' : 'Pago confirmado'}
      </h1>
      <p style={{ color: '#2B2B2B', fontSize: '16px', marginBottom: '0.5rem' }}>
        {failed
          ? 'No pudimos procesar tu compra. Podés intentar de nuevo o escribirnos si el problema persiste.'
          : 'Tu compra fue procesada exitosamente. En breve recibirás un email con los detalles de tu libro.'}
      </p>
      {fecha && (
        <p style={{ color: '#718096', fontSize: '13px', marginBottom: '2rem' }}>
          {fecha}
        </p>
      )}
      <a
        href="/main"
        style={{
          display:         'inline-block',
          backgroundColor: '#1E3A5F',
          color:           '#ffffff',
          padding:         '0.75rem 1.5rem',
          borderRadius:    '8px',
          textDecoration:  'none',
          fontSize:        '15px',
        }}
      >
        Ir al inicio
      </a>
    </div>
  )
}
