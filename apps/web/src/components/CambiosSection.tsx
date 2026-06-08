'use client'
import * as React from 'react'
import { Box, Typography, Button, Grid } from '@mui/material'
import Link from 'next/link'

const ACCENT = '#EBBF01'
const TEAL   = '#00727A'

const CAMBIOS = [
  { emoji: '🎯', titulo: 'Confianza real', desc: 'No depende del resultado del día anterior. Construís una confianza basada en preparación y procesos.' },
  { emoji: '🧘', titulo: 'Estabilidad emocional', desc: 'Gestionás la presión, el miedo y la ansiedad sin que afecten tu rendimiento en competencia.' },
  { emoji: '🔍', titulo: 'Foco absoluto', desc: 'Aprendés a concentrarte en lo que controlás y a soltar lo que no. Presencia plena en el momento.' },
  { emoji: '💪', titulo: 'Disciplina sostenida', desc: 'Desarrollás la fortaleza mental para mantener el esfuerzo incluso cuando no tenés motivación.' },
  { emoji: '⚡', titulo: 'Claridad de decisión', desc: 'En los momentos más exigentes, tu mente piensa con claridad en lugar de bloquearse.' },
]

export default function CambiosSection() {
  return (
    <Box
      component="section"
      id="cambios"
      sx={{
        bgcolor: '#080808',
        color: 'white',
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grilla sutil de fondo */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', position: 'relative', zIndex: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: TEAL, letterSpacing: 3, fontWeight: 700, display: 'block', mb: 2, textAlign: 'center' }}
        >
          Resultados
        </Typography>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: '1.7rem', md: '2.3rem' },
            fontWeight: 800,
            mb: 8,
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          Qué cambia cuando{' '}
          <Box component="span" sx={{ color: ACCENT }}>
            entrenás tu mente
          </Box>
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {CAMBIOS.map((c, i) => (
            <Grid
              key={c.titulo}
              item
              xs={12}
              sm={6}
              md={i < 2 ? 6 : 4}
            >
              <Box
                sx={{
                  height: '100%',
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.07)',
                  bgcolor: 'rgba(255,255,255,0.02)',
                  transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 16px 40px rgba(0,0,0,0.4)`,
                    borderColor: 'rgba(235,191,1,0.25)',
                  },
                }}
              >
                <Typography sx={{ fontSize: '2rem', mb: 2 }}>{c.emoji}</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 1.5, color: ACCENT }}>
                  {c.titulo}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                  {c.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
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
            Quiero este resultado →
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
