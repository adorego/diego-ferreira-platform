'use client'
import * as React from 'react'
import { Box, Typography, Button, TextField } from '@mui/material'
import Script from 'next/script'
import { BOOK_PRICE, BOOK_TITLE } from '@/lib/book'

const ACCENT = '#EBBF01'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function BookPurchase() {
  const [email, setEmail]             = React.useState('')
  const [error, setError]             = React.useState('')
  const [loading, setLoading]         = React.useState(false)
  const [processId, setProcessId]     = React.useState<string | null>(null)
  const [scriptReady, setScriptReady] = React.useState(false)

  const isProduction = process.env.NODE_ENV === 'production'
  const bancardBase  = isProduction
    ? 'https://vpos.infonet.com.py'
    : 'https://vpos.infonet.com.py:8888'

  async function handleComprar() {
    setError('')
    if (!EMAIL_RE.test(email)) {
      setError('Ingresá un email válido para recibir la confirmación de compra.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/libro/initiate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok || !data.processId) {
        setError('No pudimos iniciar el pago. Probá de nuevo en unos minutos.')
        return
      }
      setProcessId(String(data.processId))
    } catch {
      setError('Error de conexión. Probá de nuevo en unos minutos.')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (!processId || !scriptReady) return
    const w = window as any
    if (w.Bancard?.Checkout?.createForm) {
      w.Bancard.Checkout.createForm(
        'bancard-checkout-libro-container',
        processId,
        {
          'form-background-color':   '#111111',
          'button-background-color': ACCENT,
          'button-text-color':       '#111111',
          'button-border-color':     ACCENT,
          'input-background-color':  '#1a1a1a',
          'input-text-color':        '#ffffff',
          'input-placeholder-color': 'rgba(255,255,255,0.4)',
        },
      )
    }
  }, [processId, scriptReady])

  return (
    <Box
      component="section"
      sx={{ bgcolor: '#0a0a0a', color: 'white', py: { xs: 8, md: 10 }, px: { xs: 2, md: 4 } }}
    >
      <Box sx={{ maxWidth: 560, mx: 'auto', textAlign: 'center' }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', mb: 1 }}>
          Edición digital
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, mb: 4 }}>
          <Typography sx={{ fontSize: { xs: '2.2rem', md: '2.6rem' }, fontWeight: 900 }}>
            {BOOK_PRICE.display}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>
            {BOOK_PRICE.currency}
          </Typography>
        </Box>

        {!processId && (
          <>
            <TextField
              type="email"
              placeholder="Tu email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.04)',
                  borderRadius: 2,
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                },
              }}
            />
            {error && (
              <Typography sx={{ color: '#f87171', fontSize: '0.85rem', mb: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              onClick={handleComprar}
              disabled={loading}
              variant="contained"
              fullWidth
              size="large"
              sx={{
                bgcolor: ACCENT,
                color: '#0a0a0a',
                fontWeight: 800,
                borderRadius: 50,
                py: 1.6,
                textTransform: 'uppercase',
                letterSpacing: 1,
                '&:hover': { bgcolor: '#d4a800' },
              }}
            >
              {loading ? 'Procesando…' : 'Comprar ahora'}
            </Button>
          </>
        )}

        {processId && (
          <>
            <Script
              src={`${bancardBase}/checkout/javascript/dist/bancard-checkout-4.0.0.js`}
              onReady={() => setScriptReady(true)}
              strategy="afterInteractive"
            />
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', mb: 3 }}>
              Completá el pago de {BOOK_TITLE}
            </Typography>
            <Box
              id="bancard-checkout-libro-container"
              sx={{ minHeight: 400, borderRadius: 2, overflow: 'hidden' }}
            />
          </>
        )}
      </Box>
    </Box>
  )
}
