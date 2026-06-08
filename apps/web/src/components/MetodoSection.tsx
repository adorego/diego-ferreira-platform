'use client'
import * as React from 'react'
import { Box, Typography, Button } from '@mui/material'
import Link from 'next/link'

const ACCENT = '#EBBF01'
const TEAL   = '#00727A'

const PILARES = [
  {
    num: '01',
    color: '#EBBF01',
    titulo: 'Diagnóstico mental',
    desc: 'Identificamos exactamente qué patrones mentales están afectando tu rendimiento. Sin suposiciones, con datos y herramientas específicas.',
  },
  {
    num: '02',
    color: '#FF7A00',
    titulo: 'Entrenamiento de habilidades',
    desc: 'Desarrollamos las habilidades mentales que necesitás: foco, confianza, gestión de presión, resiliencia. Técnicas probadas en el deporte de alto rendimiento.',
  },
  {
    num: '03',
    color: '#00B894',
    titulo: 'Integración en el entrenamiento',
    desc: 'Las herramientas mentales se integran directamente en tu práctica diaria. No es teoría separada del deporte, es parte del mismo proceso.',
  },
  {
    num: '04',
    color: '#6C63FF',
    titulo: 'Preparación competitiva',
    desc: 'Trabajamos específicamente para los momentos de competencia: rutinas pre-competitivas, gestión de nervios, recuperación ante errores.',
  },
  {
    num: '05',
    color: '#E84393',
    titulo: 'Seguimiento y ajuste',
    desc: 'Evaluamos el progreso semana a semana y ajustamos el programa según tu evolución y los desafíos que van apareciendo.',
  },
]

export default function MetodoSection() {
  return (
    <Box
      component="section"
      id="metodo"
      sx={{ bgcolor: '#0a0a0a', color: 'white', py: { xs: 8, md: 12 }, px: { xs: 2, md: 4 } }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography
          variant="overline"
          sx={{ color: TEAL, letterSpacing: 3, fontWeight: 700, display: 'block', mb: 2 }}
        >
          El programa
        </Typography>
        <Typography
          component="h2"
          sx={{ fontSize: { xs: '1.7rem', md: '2.3rem' }, fontWeight: 800, mb: 3, lineHeight: 1.2 }}
        >
          El método en{' '}
          <Box component="span" sx={{ color: ACCENT }}>5 pilares</Box>
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 8, maxWidth: 600 }}>
          Un programa estructurado de 6 semanas, diseñado con la misma rigurosidad que un plan
          de entrenamiento físico de elite.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 8 }}>
          {PILARES.map(p => (
            <Box
              key={p.num}
              sx={{
                display: 'flex',
                gap: { xs: 3, md: 5 },
                p: { xs: 3, md: 4 },
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.06)',
                bgcolor: 'rgba(255,255,255,0.02)',
                transition: 'transform 0.2s, border-color 0.2s',
                '&:hover': {
                  transform: 'translateX(8px)',
                  borderColor: `${p.color}40`,
                },
              }}
            >
              <Typography
                sx={{
                  color: p.color,
                  fontWeight: 900,
                  fontSize: { xs: '1.4rem', md: '1.8rem' },
                  minWidth: 48,
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                {p.num}
              </Typography>
              <Box>
                <Typography sx={{ color: p.color, fontWeight: 700, fontSize: '1.05rem', mb: 1 }}>
                  {p.titulo}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontSize: '0.93rem' }}>
                  {p.desc}
                </Typography>
              </Box>
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
          Hablar con Diego sobre el programa
        </Button>
      </Box>
    </Box>
  )
}
