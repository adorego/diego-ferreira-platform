'use client'
import * as React from 'react'
import { Box, Typography, Button } from '@mui/material'
import Link from 'next/link'

const ACCENT = '#EBBF01'
const TEAL   = '#00727A'

const DOLORES = [
  { num: '01', text: 'Entrenás duro pero cuando llega la competencia te bloqueás o rendís por debajo de tu nivel.' },
  { num: '02', text: 'Tenés el físico y la técnica, pero te falta algo que no podés identificar.' },
  { num: '03', text: 'La presión, el miedo a fallar o las expectativas te paralizan en los momentos clave.' },
  { num: '04', text: 'Después de un error o una derrota tardás demasiado en recuperarte.' },
  { num: '05', text: 'Sentís que tu rendimiento en competencia no refleja lo que realmente podés hacer.' },
]

export default function IdentificacionSection() {
  return (
    <Box
      component="section"
      id="identificacion"
      sx={{ bgcolor: '#0a0a0a', color: 'white', py: { xs: 8, md: 12 }, px: { xs: 2, md: 4 } }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography
          variant="overline"
          sx={{ color: TEAL, letterSpacing: 3, fontWeight: 700, display: 'block', mb: 2 }}
        >
          ¿Te identificás?
        </Typography>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: '1.6rem', md: '2.2rem' },
            fontWeight: 800,
            color: 'white',
            mb: 6,
            maxWidth: 700,
            lineHeight: 1.25,
          }}
        >
          Si sos deportista, tenés talento y no estás logrando tus objetivos:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 8 }}>
          {DOLORES.map(({ num, text }) => (
            <Box
              key={num}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 3,
                p: 3,
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.06)',
                bgcolor: 'rgba(255,255,255,0.02)',
                cursor: 'default',
                transition: 'transform 0.2s, border-color 0.2s',
                '&:hover': {
                  transform: 'translateX(8px)',
                  borderColor: `rgba(235,191,1,0.3)`,
                },
              }}
            >
              <Typography
                sx={{ color: ACCENT, fontWeight: 800, fontSize: '1.1rem', minWidth: 28, flexShrink: 0 }}
              >
                {num}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, fontSize: '0.97rem' }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            borderLeft: `4px solid ${ACCENT}`,
            pl: 4,
            mb: 6,
          }}
        >
          <Typography
            component="em"
            sx={{
              display: 'block',
              fontSize: { xs: '1.3rem', md: '1.7rem' },
              fontWeight: 700,
              fontStyle: 'italic',
              color: 'white',
            }}
          >
            Es mental. Y{' '}
            <Box component="span" sx={{ color: TEAL }}>
              se entrena.
            </Box>
          </Typography>
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
          Quiero hablar esto con Diego
        </Button>
      </Box>
    </Box>
  )
}
