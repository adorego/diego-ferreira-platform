'use client'
import { useEffect, useState } from 'react'

export default function CanceladoPage() {
  const [savedToken, setSavedToken] = useState<string | null>(null)

  useEffect(() => {
    setSavedToken(sessionStorage.getItem('pago_token'))
  }, [])

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', color: '#1E3A5F', marginBottom: '1rem' }}>
        Pago cancelado
      </h1>
      <p style={{ color: '#2B2B2B', fontSize: '16px', marginBottom: '2rem' }}>
        Cancelaste el proceso de pago. Podés intentarlo de nuevo cuando quieras.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <a
          href={savedToken ? `/pago?token=${savedToken}` : '/pago'}
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
          Intentar de nuevo
        </a>
        <a
          href="/main#precios"
          style={{
            display:        'inline-block',
            border:         '1px solid #1E3A5F',
            color:          '#1E3A5F',
            padding:        '0.75rem 1.5rem',
            borderRadius:   '8px',
            textDecoration: 'none',
            fontSize:       '15px',
          }}
        >
          Ver planes
        </a>
      </div>
    </div>
  )
}
