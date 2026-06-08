'use client'
import * as React from 'react'
import { Box, Typography, Button } from '@mui/material'
import Link from 'next/link'

const ACCENT = '#EBBF01'
const TEAL   = '#00727A'

export default function PromesaSection() {
  return (
    <Box
      component="section"
      id="promesa"
      sx={{
        bgcolor: TEAL,
        color: 'white',
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Número decorativo de fondo */}
      <Typography
        aria-hidden
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: { xs: '16rem', md: '22rem' },
          fontWeight: 900,
          color: 'rgba(255,255,255,0.05)',
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        6
      </Typography>

      <Box sx={{ maxWidth: 900, mx: 'auto', position: 'relative', zIndex: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 3, fontWeight: 700, display: 'block', mb: 2 }}
        >
          La promesa
        </Typography>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: '1.8rem', md: '2.6rem' },
            fontWeight: 800,
            mb: 4,
            lineHeight: 1.2,
          }}
        >
          En 6 semanas entrenamos tu mente para que rindas al nivel que ya tenés
          en el{' '}
          <Box component="span" sx={{ color: ACCENT }}>
            entrenamiento
          </Box>
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: 1.8, mb: 6 }}>
          No vas a "aprender a pensar positivo". Vas a desarrollar habilidades mentales concretas
          que se reflejan directamente en tu rendimiento deportivo.
        </Typography>

        {/* Aclaración */}
        <Box
          sx={{
            bgcolor: 'rgba(0,0,0,0.25)',
            borderRadius: 3,
            p: { xs: 3, md: 4 },
            mb: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {[
            { icon: '❌', text: 'No es motivación que dura 2 días', cross: true },
            { icon: '❌', text: 'No es terapia ni psicoanálisis', cross: true },
            { icon: '✅', text: 'Es entrenamiento mental de alto rendimiento, medible y orientado a resultados deportivos', cross: false },
          ].map(({ icon, text, cross }) => (
            <Box key={text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Typography sx={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</Typography>
              <Typography
                sx={{
                  color: cross ? 'rgba(255,255,255,0.55)' : 'white',
                  textDecoration: cross ? 'line-through' : 'none',
                  fontWeight: cross ? 400 : 600,
                  fontSize: '0.97rem',
                  lineHeight: 1.6,
                }}
              >
                {text}
              </Typography>
            </Box>
          ))}
        </Box>

        <Button
          component={Link}
          href="/agendar"
          variant="contained"
          sx={{
            bgcolor: ACCENT,
            color: '#0a0a0a',
            fontWeight: 700,
            borderRadius: 50,
            px: 5,
            py: 1.5,
            fontSize: '0.95rem',
            textTransform: 'none',
            '&:hover': { bgcolor: '#d4a800' },
          }}
        >
          Reservar mi lugar en el calendario
        </Button>
      </Box>
    </Box>
  )
}
