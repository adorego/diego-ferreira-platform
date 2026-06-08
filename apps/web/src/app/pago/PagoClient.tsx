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

  const isProduction = process.env.NODE_ENV === 'production'
  const bancardBase  = isProduction
    ? 'https://vpos.infonet.com.py'
    : 'https://vpos.infonet.com.py:8888'

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
