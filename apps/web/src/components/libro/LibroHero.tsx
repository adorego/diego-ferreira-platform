'use client'
import * as React from 'react'
import { Box, Container, Typography, Button } from '@mui/material'
import { BOOK_COVER_IMAGE, BOOK_TITLE } from '@/lib/book'

const PRIMARY = '#EBBF01'

function scrollToComprar(e: React.MouseEvent) {
  e.preventDefault()
  document.getElementById('comprar')?.scrollIntoView({ behavior: 'smooth' })
}

export default function LibroHero() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: 'auto', md: '100vh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        bgcolor: '#080808',
        pt: { xs: 14, md: 0 },
        pb: { xs: 10, md: 0 },
      }}
    >
      {/* Fondo: tapa del libro con overlay oscuro */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${BOOK_COVER_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(8,8,8,0.65)', zIndex: 1 }} />

      <Container
        maxWidth={false}
        sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 2 }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            gap: { xs: 6, md: 10 },
            alignItems: 'center',
          }}
        >
          {/* Columna texto */}
          <Box>
            <Box
              sx={{
                display: 'inline-block',
                bgcolor: 'rgba(235,191,1,0.12)',
                border: '1px solid rgba(235,191,1,0.35)',
                color: PRIMARY,
                fontSize: '0.8rem',
                fontWeight: 700,
                px: 2,
                py: 0.75,
                borderRadius: 50,
                mb: 3,
              }}
            >
              📖 PDF Completo · 15 capítulos · Descarga inmediata
            </Box>

            <Typography
              component="h1"
              sx={{ color: 'white', fontWeight: 900, fontSize: { xs: '2.8rem', md: '4rem' }, lineHeight: 1.05, mb: 3 }}
            >
              Despertá. Avanzá. Carajo.
            </Typography>

            <Typography
              sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '1.05rem', md: '1.2rem' }, lineHeight: 1.7, mb: 4, maxWidth: 520 }}
            >
              La historia real de un chico que se sentía inútil y llegó a los Juegos Olímpicos.
            </Typography>

            <Typography sx={{ color: PRIMARY, fontWeight: 900, fontSize: { xs: '2rem', md: '2.4rem' }, mb: 4 }}>
              USD 12.99
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' } }}>
              <Button
                href="#comprar"
                onClick={scrollToComprar}
                variant="contained"
                size="large"
                sx={{
                  bgcolor: PRIMARY,
                  color: '#0a0a0a',
                  fontWeight: 800,
                  borderRadius: 50,
                  px: 4,
                  py: 1.6,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { bgcolor: '#d4a800' },
                }}
              >
                Comprar ahora — USD 12.99
              </Button>
              <Button
                href="/muestra-libro-diego-ferreira.pdf"
                download
                variant="text"
                sx={{ color: 'rgba(255,255,255,0.75)', textTransform: 'none', fontWeight: 600, '&:hover': { color: 'white' } }}
              >
                Leer muestra gratis (PDF)
              </Button>
            </Box>
          </Box>

          {/* Columna: tapa con efecto 3D */}
          <Box sx={{ display: 'flex', justifyContent: 'center', perspective: '1400px' }}>
            <Box sx={{ position: 'relative', width: { xs: '70%', sm: 280, md: 320 } }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '2%',
                  left: -10,
                  width: 10,
                  height: '96%',
                  bgcolor: '#4a3600',
                  transform: 'rotateY(-20deg)',
                  transformOrigin: 'right center',
                  borderRadius: '3px 0 0 3px',
                }}
              />
              <Box
                component="img"
                src={BOOK_COVER_IMAGE}
                alt={`Tapa del libro — ${BOOK_TITLE}`}
                sx={{
                  width: '100%',
                  display: 'block',
                  borderRadius: '2px 6px 6px 2px',
                  transform: 'rotateY(-20deg)',
                  boxShadow: '-18px 26px 55px rgba(0,0,0,0.65), -36px 46px 90px rgba(0,0,0,0.4)',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
