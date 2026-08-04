'use client'
import * as React from 'react'
import { Box, Container, Typography, Button, TextField } from '@mui/material'
import Script from 'next/script'

const PRIMARY = '#EBBF01'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INCLUYE = [
  'PDF completo (15 capítulos)',
  'Descarga inmediata tras el pago',
  'Acceso de por vida al archivo',
  'Pagá con tarjeta vía Bancard',
]

export default function LibroCompra() {
  const [email, setEmail]             = React.useState('')
  const [nombre, setNombre]           = React.useState('')
  const [error, setError]             = React.useState('')
  const [loading, setLoading]         = React.useState(false)
  const [processId, setProcessId]     = React.useState<string | null>(null)
  const [scriptReady, setScriptReady] = React.useState(false)

  // NEXT_PUBLIC_BANCARD_BASE_URL debe estar seteada en apps/web/.env.local (local)
  // y en Railway → @df/web → Variables (staging/prod), con el valor
  // https://vpos.infonet.com.py — confirmado en pruebas de staging.
  const bancardBase = process.env.NEXT_PUBLIC_BANCARD_BASE_URL ?? 'https://vpos.infonet.com.py'

  async function handleComprar() {
    setError('')
    if (!nombre.trim()) {
      setError('Ingresá tu nombre completo.')
      return
    }
    if (!EMAIL_RE.test(email)) {
      setError('Ingresá un email válido para recibir el link de descarga.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/libro/initiate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, nombre }),
      })
      const data = await res.json()
      if (!res.ok || !data.processId) {
        setError('No pudimos iniciar el pago. Probá de nuevo en unos minutos.')
        setLoading(false)
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
        'libro-bancard-checkout-container',
        processId,
        {
          'form-background-color':   '#080808',
          'button-background-color': PRIMARY,
          'button-text-color':       '#0a0a0a',
          'button-border-color':     PRIMARY,
          'input-background-color':  'rgba(255,255,255,0.04)',
          'input-text-color':        '#ffffff',
          'input-placeholder-color': 'rgba(255,255,255,0.4)',
        },
      )
    }
  }, [processId, scriptReady])

  return (
    <Box
      id="comprar"
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#080808',
        color: 'white',
        py: { xs: 10, md: 14 },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at bottom, rgba(235,191,1,0.14) 0%, rgba(8,8,8,0) 60%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, position: 'relative' }}>
        <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center' }}>
          <Typography sx={{ fontSize: { xs: '2.4rem', md: '2.8rem' }, fontWeight: 900, color: PRIMARY, mb: 1 }}>
            USD 12.99
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', mb: 5 }}>
            Pago único · Edición digital
          </Typography>

          <Box sx={{ textAlign: 'left', mb: 5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {INCLUYE.map(item => (
              <Typography key={item} sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.95rem' }}>
                ✓ {item}
              </Typography>
            ))}
          </Box>

          {!processId && (
            <>
              <TextField
                placeholder="Nombre completo"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
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
                  bgcolor: PRIMARY,
                  color: '#0a0a0a',
                  fontWeight: 800,
                  borderRadius: 50,
                  py: 1.6,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  mb: 2,
                  '&:hover': { bgcolor: '#d4a800' },
                }}
              >
                {loading ? 'Procesando…' : 'Comprar ahora — USD 12.99'}
              </Button>

              <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', mb: 4 }}>
                Pago seguro procesado por Bancard · Descarga inmediata
              </Typography>

              <Button
                href="/muestra-libro-diego-ferreira.pdf"
                download
                variant="text"
                sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 500, fontSize: '0.85rem', '&:hover': { color: 'white' } }}
              >
                ¿Querés leer una muestra primero? Descargá los primeros capítulos gratis
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
                Completá el pago para descargar el libro
              </Typography>
              <Box
                id="libro-bancard-checkout-container"
                sx={{ minHeight: 400, minWidth: 320, borderRadius: 2, overflow: 'hidden' }}
              />
            </>
          )}
        </Box>
      </Container>
    </Box>
  )
}
