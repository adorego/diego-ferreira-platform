'use client'
import * as React from 'react'
import { Box, Typography, Button, Chip } from '@mui/material'
import Link from 'next/link'

const ACCENT = '#EBBF01'
const TEAL   = '#00727A'

const CREDENCIALES = [
  'Ex Atleta Olímpico',
  'Psicólogo Clínico y Deportivo',
  'Formado en Argentina y el exterior',
  '+10 años de experiencia',
  'Trabajo con deportistas de elite',
  'Metodología de alto rendimiento',
]

export default function AutoridadSection() {
  return (
    <Box
      component="section"
      id="autoridad"
      sx={{ bgcolor: '#0e0e0e', color: 'white', py: { xs: 8, md: 12 }, px: { xs: 2, md: 4 } }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 6, md: 10 },
            alignItems: 'center',
          }}
        >
          {/* Foto */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 3,
            }}
          >
            {/* Marco decorativo — alineado perfectamente con la foto */}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                right: -8,
                bottom: -8,
                borderRadius: 4,
                border: '1px solid rgba(235,191,1,0.35)',
                zIndex: 0,
              }}
            />

            {/* Contenedor de la foto — sin overflow hidden para no recortar */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                width: { xs: '100%', sm: 300, md: 340 },
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Box
                component="img"
                src="/images/diego_1.jpeg"
                alt="Diego Ferreira — Psicólogo Deportivo"
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                }}
              />

              {/* Badge olímpico */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: '#EBBF01',
                  color: '#111',
                  borderRadius: 999,
                  px: 2,
                  py: 0.5,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.05em',
                  zIndex: 2,
                }}
              >
                🏅 EX ATLETA OLÍMPICO
              </Box>
            </Box>
          </Box>

          {/* Texto */}
          <Box>
            <Typography
              variant="overline"
              sx={{ color: TEAL, letterSpacing: 3, fontWeight: 700, display: 'block', mb: 2 }}
            >
              Quién es Diego
            </Typography>
            <Typography
              component="h2"
              sx={{ fontSize: { xs: '1.7rem', md: '2.2rem' }, fontWeight: 800, mb: 3, lineHeight: 1.2 }}
            >
              Un deportista que entendió lo que nadie le enseñó
            </Typography>

            <Typography sx={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.8, mb: 3 }}>
              Compití al más alto nivel. Sé lo que es entrenar años para llegar a un momento
              clave y que la mente falle. Por eso estudié psicología deportiva: para entender
              y resolver lo que el entrenamiento físico no puede.
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.8, mb: 4 }}>
              Hoy trabajo con deportistas que tienen el talento y la dedicación, pero necesitan
              la herramienta que les falta: entrenar la mente con la misma seriedad que el cuerpo.
            </Typography>

            {/* Quote */}
            <Box sx={{ borderLeft: `3px solid ${ACCENT}`, pl: 3, mb: 4 }}>
              <Typography
                component="em"
                sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem', fontStyle: 'italic', lineHeight: 1.7 }}
              >
                "El rendimiento no es solo físico. El 80% de lo que te separa del resultado que querés
                está en cómo entrenás y gestionás tu mente."
              </Typography>
            </Box>

            {/* Chips de credenciales */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
              {CREDENCIALES.map(c => (
                <Chip
                  key={c}
                  label={c}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(235,191,1,0.1)',
                    color: ACCENT,
                    border: '1px solid rgba(235,191,1,0.2)',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                  }}
                />
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
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontSize: '0.9rem',
                '&:hover': { bgcolor: '#d4a800' },
              }}
            >
              Agendar videollamada 1:1
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
