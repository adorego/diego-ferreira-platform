'use client'
import * as React from 'react'
import { Box, Typography, Button } from '@mui/material'
import Link from 'next/link'

const ACCENT = '#EBBF01'

export default function CierreSection() {
  return (
    <Box
      component="section"
      id="agendar"
      sx={{
        bgcolor: '#080808',
        color: 'white',
        py: { xs: 10, md: 16 },
        px: { xs: 2, md: 4 },
        textAlign: 'center',
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Tres frases apiladas */}
        <Box sx={{ mb: 6 }}>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.4)', fontSize: { xs: '1.1rem', md: '1.4rem' }, mb: 1.5, fontStyle: 'italic' }}
          >
            "El talento te lleva hasta cierto punto."
          </Typography>
          <Typography
            sx={{ color: 'white', fontSize: { xs: '1.4rem', md: '1.9rem' }, fontWeight: 700, mb: 1.5 }}
          >
            "La mente es lo que te permite llegar lejos."
          </Typography>
          <Typography
            sx={{ color: ACCENT, fontSize: { xs: '1.6rem', md: '2.2rem' }, fontWeight: 900 }}
          >
            "Y eso, se entrena."
          </Typography>
        </Box>

        <Typography
          component="h2"
          sx={{
            fontSize: { xs: '1.6rem', md: '2.2rem' },
            fontWeight: 800,
            mb: 5,
            lineHeight: 1.25,
          }}
        >
          ¿Listo para entrenar lo que realmente importa?
        </Typography>

        <Button
          component={Link}
          href="/agendar"
          variant="contained"
          size="large"
          sx={{
            bgcolor: ACCENT,
            color: '#0a0a0a',
            fontWeight: 800,
            borderRadius: 50,
            px: { xs: 4, md: 7 },
            py: 2,
            fontSize: { xs: '0.9rem', md: '1rem' },
            textTransform: 'uppercase',
            letterSpacing: 1,
            mb: 2,
            '&:hover': { bgcolor: '#d4a800' },
          }}
        >
          Agendar entrevista 1:1 con Diego Ferreira
        </Button>

        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', letterSpacing: 1 }}>
          Entrevista privada · 15/20 minutos · Sin compromiso
        </Typography>
      </Box>
    </Box>
  )
}
