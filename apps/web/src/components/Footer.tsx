'use client'
import * as React from 'react'
import { Box, Typography, Grid } from '@mui/material'
import Link from 'next/link'

const ACCENT = '#EBBF01'

const NAV_LINKS = [
  { label: 'Cómo funciona', href: '/main#identificacion' },
  { label: 'El método',     href: '/main#metodo' },
  { label: 'Para quién es', href: '/main#para-quien' },
  { label: 'Resultados',    href: '/main#cambios' },
  { label: 'Agendar',       href: '/agendar' },
]

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
    </svg>
  )
}

const SOCIALS = [
  { icon: <InstagramIcon />, href: 'https://instagram.com', label: 'Instagram' },
  { icon: <LinkedInIcon />,  href: 'https://linkedin.com',  label: 'LinkedIn' },
  { icon: <YouTubeIcon />,   href: 'https://youtube.com',   label: 'YouTube' },
]

const YEAR = 2025

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ bgcolor: '#050505', color: 'rgba(255,255,255,0.65)', pt: { xs: 8, md: 10 }, pb: 4, px: { xs: 2, md: 4 } }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Grid container spacing={{ xs: 5, md: 8 }} sx={{ mb: 6 }}>
          {/* Columna 1 — Marca */}
          <Grid item xs={12} md={4}>
            <Typography
              sx={{ fontWeight: 900, fontSize: '1.1rem', color: 'white', letterSpacing: 1, mb: 0.5 }}
            >
              DIEGO{' '}
              <Box component="span" sx={{ color: ACCENT }}>
                FERREIRA
              </Box>
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', mb: 2, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Psicólogo Clínico &amp; Deportivo
            </Typography>
            <Typography sx={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.55)', mb: 3 }}>
              Ex atleta olímpico. Entrenamiento mental para deportistas que quieren
              rendir al máximo nivel cuando más importa.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {SOCIALS.map(s => (
                <Box
                  key={s.label}
                  component="a"
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.55)',
                    textDecoration: 'none',
                    transition: 'color 0.2s, border-color 0.2s',
                    '&:hover': { color: ACCENT, borderColor: ACCENT },
                  }}
                >
                  {s.icon}
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Columna 2 — Navegación */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography
              sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', mb: 3 }}
            >
              Navegación
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {NAV_LINKS.map(link => (
                <Box
                  key={link.href}
                  component={Link}
                  href={link.href}
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s',
                    '&:hover': { color: ACCENT },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Columna 3 — CTA */}
          <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid rgba(235,191,1,0.2)`,
                bgcolor: 'rgba(235,191,1,0.04)',
              }}
            >
              <Typography sx={{ fontWeight: 700, color: 'white', mb: 1.5 }}>
                ¿Listo para empezar?
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', mb: 3, lineHeight: 1.6 }}>
                Agendá una entrevista gratuita de 15-20 minutos y evaluamos juntos si el programa
                es para vos.
              </Typography>
              <Box
                component={Link}
                href="/agendar"
                sx={{
                  display: 'inline-block',
                  bgcolor: ACCENT,
                  color: '#0a0a0a',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  px: 3,
                  py: 1.2,
                  borderRadius: 50,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 0.88 },
                }}
              >
                Agendar ahora →
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom bar */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            pt: 3,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
            © {YEAR} Diego Ferreira. Todos los derechos reservados.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {[
              { label: 'Política de privacidad', href: '/privacidad' },
              { label: 'Términos y condiciones',  href: '/terminos' },
            ].map(l => (
              <Box
                key={l.href}
                component={Link}
                href={l.href}
                sx={{
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.3)',
                  textDecoration: 'none',
                  '&:hover': { color: 'rgba(255,255,255,0.6)' },
                }}
              >
                {l.label}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
