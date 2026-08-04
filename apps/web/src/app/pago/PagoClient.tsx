'use client'
import { useEffect, useState } from 'react'
import { useSearchParams }     from 'next/navigation'
import Script                  from 'next/script'

export default function PagoClient() {
  const params   = useSearchParams()
  const token    = params.get('token')
  const [processId,   setProcessId]   = useState<string | null>(null)
  const [error,       setError]       = useState('')
  const [scriptReady, setScriptReady] = useState(false)

  // NEXT_PUBLIC_* se inlinea en build time — usar NODE_ENV para distinguir
  // staging/producción no sirve porque `next build` siempre corre en modo
  // producción (Railway staging también hace `next build`), así que
  // NODE_ENV === 'production' termina siendo true en todos los ambientes
  // deployados. La variable de entorno (distinta por servicio en Railway)
  // es la única forma correcta de diferenciarlos.
  const bancardBase = process.env.NEXT_PUBLIC_BANCARD_BASE_URL ?? 'https://vpos.infonet.com.py'

  useEffect(() => {
    if (!token) { setError('Link inválido.'); return }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-link`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ token }),
      credentials: 'include',
    })
      .then(r => r.json())
      .then(d => {
        if (d.processId) setProcessId(String(d.processId))
        else setError('Link inválido o expirado.')
      })
      .catch(() => setError('Error al procesar el pago.'))
  }, [token])

  useEffect(() => {
    if (!processId || !scriptReady) return
    const w = window as any
    if (w.Bancard?.Checkout?.createForm) {
      w.Bancard.Checkout.createForm(
        'bancard-checkout-container',
        processId,
        {
          'form-background-color':   '#ffffff',
          'button-background-color': '#1E3A5F',
          'button-text-color':       '#ffffff',
          'button-border-color':     '#1E3A5F',
          'input-background-color':  '#f7f9fc',
          'input-text-color':        '#2B2B2B',
          'input-placeholder-color': '#A0AEC0',
        },
      )
    }
  }, [processId, scriptReady])

  if (error) return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <p style={{ color: '#C53030', fontSize: '15px' }}>{error}</p>
      <a href="/main#precios" style={{ color: '#1E3A5F', fontSize: '13px' }}>
        Ver planes →
      </a>
    </div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <Script
        src={`${bancardBase}/checkout/javascript/dist/bancard-checkout-4.0.0.js`}
        onReady={() => setScriptReady(true)}
        strategy="afterInteractive"
      />
      <h1 style={{ fontSize: '20px', marginBottom: '1.5rem',
                   color: '#1E3A5F' }}>
        Completá tu pago
      </h1>
      {!processId && (
        <p style={{ color: '#718096' }}>Procesando...</p>
      )}
      <div
        id="bancard-checkout-container"
        style={{ minHeight: '400px', minWidth: '320px' }}
      />
    </div>
  )
}
