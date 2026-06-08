'use client'
import * as React from 'react'
import { Box, Typography, Button, Grid } from '@mui/material'
import Link from 'next/link'

const ACCENT = '#EBBF01'
const TEAL   = '#00727A'

const PERFILES = [
  { emoji: '🏃', titulo: 'Deportistas', desc: 'Que tienen el talento y la dedicación pero su mente no acompaña en la competencia.' },
  { emoji: '🎓', titulo: 'Atletas que buscan becas', desc: 'Que necesitan rendir al máximo en pruebas de selección o torneos clave.' },
  { emoji: '📉', titulo: 'Deportistas estancados', desc: 'Que llevan tiempo sin mejorar y sienten que el problema no es físico.' },
  { emoji: '👨‍👩‍👧', titulo: 'Padres de atletas', desc: 'Que quieren darle a su hijo/a la herramienta mental que marca la diferencia.' },
]

export default function ParaQuienSection() {
  return (
    <Box component="section" id="para-quien" sx={{ color: 'white' }}>
      {/* Bloque 1 — Para quién es */}
      <Box sx={{ bgcolor: '#0a0a0a', py: { xs: 8, md: 12 }, px: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Typography
            variant="overline"
            sx={{ color: TEAL, letterSpacing: 3, fontWeight: 700, display: 'block', mb: 2 }}
          >
            Para quién es
          </Typography>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.7rem', md: '2.3rem' }, fontWeight: 800, mb: 8, lineHeight: 1.2 }}
          >
            Este programa es para:
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {PERFILES.map(p => (
              <Grid key={p.titulo} item xs={12} sm={6}>
                <Box
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.07)',
                    bgcolor: 'rgba(255,255,255,0.02)',
                    transition: 'border-color 0.2s, transform 0.2s',
                    '&:hover': { borderColor: `rgba(235,191,1,0.25)`, transform: 'translateY(-4px)' },
                  }}
                >
                  <Typography sx={{ fontSize: '1.8rem', mb: 1.5 }}>{p.emoji}</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 1, color: ACCENT }}>
                    {p.titulo}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                    {p.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Button
            component={Link}
            href="/agendar"
            variant="outlined"
            sx={{
              borderColor: ACCENT,
              color: ACCENT,
              fontWeight: 700,
              borderRadius: 50,
              px: 5,
              py: 1.5,
              fontSize: '0.95rem',
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(235,191,1,0.08)', borderColor: ACCENT },
            }}
          >
            Agendar entrevista privada
          </Button>
        </Box>
      </Box>

      {/* Bloque 2 — Para padres */}
      <Box sx={{ bgcolor: '#111', py: { xs: 8, md: 12 }, px: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', textAlign: 'center' }}>
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: '1.6rem', md: '2.4rem' },
              fontWeight: 800,
              lineHeight: 1.2,
              mb: 6,
            }}
          >
            Tu hijo no necesita{' '}
            <Box
              component="span"
              sx={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.35)' }}
            >
              entrenar más
            </Box>
            . Necesita{' '}
            <Box component="span" sx={{ color: ACCENT }}>
              pensar mejor cuando compite
            </Box>
            .
          </Typography>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: 1.8, mb: 6, maxWidth: 650, mx: 'auto' }}
          >
            El esfuerzo ya está. La disciplina ya está. Lo que le falta es aprender a gestionar
            la presión, la confianza y el foco en el momento que más importa.
          </Typography>
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
            Hablar con Diego →
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
