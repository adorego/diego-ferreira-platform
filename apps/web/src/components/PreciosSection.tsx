'use client'
import * as React from 'react'
import { Box, Typography, Button, Grid } from '@mui/material'
import Link from 'next/link'

const ACCENT = '#EBBF01'
const TEAL   = '#00727A'

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

interface Feature { text: string; included: boolean }

function FeatureItem({ feature, color }: { feature: Feature; color: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.25 }}>
      {feature.included ? <CheckIcon color={color} /> : <XIcon />}
      <Typography
        sx={{
          fontSize: '0.875rem',
          lineHeight: 1.5,
          color: feature.included ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.3)',
          textDecoration: feature.included ? 'none' : 'line-through',
          opacity: feature.included ? 1 : 0.45,
        }}
      >
        {feature.text}
      </Typography>
    </Box>
  )
}

const PLANS = [
  {
    id: 'basico',
    nombre: 'Básico',
    precio: '$1,300',
    moneda: 'USD',
    badge: null,
    accentColor: 'rgba(255,255,255,0.5)',
    borderColor: 'rgba(255,255,255,0.1)',
    shadow: 'none',
    elevated: false,
    features: [
      { text: '4 sesiones vía Google Meet (50-60 min)', included: true },
      { text: 'Una sesión por semana', included: true },
      { text: 'Tareas escritas diseñadas personalmente', included: true },
      { text: 'Tareas de acción en la vida real', included: true },
      { text: 'Visualización y mindfulness', included: true },
      { text: 'Seguimiento de objetivo estructurado', included: true },
      { text: 'Trabajo sobre carácter y fortaleza mental', included: true },
      { text: 'Mensajes diarios de seguimiento', included: false },
      { text: 'Videos personalizados', included: false },
      { text: 'Disponibilidad 24hs', included: false },
      { text: 'Seguimiento post-programa', included: false },
    ],
    cta: 'Elegir este plan →',
    ctaVariant: 'outlined' as const,
  },
  {
    id: 'estandar',
    nombre: 'Estándar',
    precio: '$1,800',
    moneda: 'USD',
    badge: '⭐ Más elegido',
    accentColor: ACCENT,
    borderColor: ACCENT,
    shadow: `0 0 40px rgba(235,191,1,0.2)`,
    elevated: true,
    features: [
      { text: 'Todo lo del plan Básico', included: true },
      { text: 'Mensajes diarios de seguimiento y motivación', included: true },
      { text: 'Videos personalizados 2-3 veces por semana', included: true },
      { text: 'Elaboración y análisis de agenda diaria', included: true },
      { text: 'Disponibilidad 24hs para preguntas', included: true },
      { text: 'Trabajo profundo sobre carácter y fortaleza', included: true },
      { text: 'Interferencias, obstáculos y competencia', included: true },
      { text: 'Sesión con padres', included: false },
      { text: 'Seguimiento post-programa', included: false },
      { text: 'Videos diarios', included: false },
      { text: 'WhatsApp ilimitado', included: false },
    ],
    cta: 'Quiero este plan →',
    ctaVariant: 'contained' as const,
  },
  {
    id: 'premium',
    nombre: 'Premium',
    precio: '$2,000',
    moneda: 'USD',
    badge: null,
    accentColor: TEAL,
    borderColor: 'rgba(0,114,122,0.4)',
    shadow: 'none',
    elevated: false,
    features: [
      { text: 'Todo lo del plan Básico + Estándar', included: true },
      { text: '5 sesiones + 1 sesión con padres', included: true },
      { text: 'Seguimiento 3 meses post-programa', included: true },
      { text: 'Videos diarios de deportistas exitosos', included: true },
      { text: 'Películas y libros con análisis', included: true },
      { text: 'WhatsApp ilimitado cliente y padres', included: true },
      { text: 'Ajuste continuo del programa', included: true },
      { text: 'Disponibilidad 24hs', included: true },
      { text: 'Agenda diaria + análisis semanal', included: true },
      { text: 'Mensajes y videos de motivación diarios', included: true },
      { text: 'Sesión de cierre + plan de continuidad', included: true },
    ],
    cta: 'Elegir este plan →',
    ctaVariant: 'outlined' as const,
  },
]

export default function PreciosSection() {
  return (
    <Box
      component="section"
      id="precios"
      sx={{ bgcolor: '#0a0a0a', color: 'white', py: { xs: 8, md: 12 }, px: { xs: 2, md: 4 } }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography
          variant="overline"
          sx={{ color: TEAL, letterSpacing: 3, fontWeight: 700, display: 'block', mb: 2, textAlign: 'center' }}
        >
          Inversión
        </Typography>
        <Typography
          component="h2"
          sx={{ fontSize: { xs: '1.7rem', md: '2.3rem' }, fontWeight: 800, mb: 2, textAlign: 'center', lineHeight: 1.2 }}
        >
          Elegí el plan que se adapta a{' '}
          <Box component="span" sx={{ color: ACCENT }}>tu situación</Box>
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', mb: 8 }}>
          Todos los planes incluyen una sesión de diagnóstico inicial gratuita.
        </Typography>

        <Grid container spacing={3} alignItems="stretch">
          {PLANS.map(plan => (
            <Grid key={plan.id} item xs={12} md={4}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${plan.borderColor}`,
                  bgcolor: 'rgba(255,255,255,0.02)',
                  boxShadow: plan.shadow,
                  transform: { md: plan.elevated ? 'translateY(-12px)' : 'none' },
                  position: 'relative',
                  transition: 'transform 0.2s',
                }}
              >
                {plan.badge && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -14,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: ACCENT,
                      color: '#0a0a0a',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      px: 2,
                      py: 0.5,
                      borderRadius: 50,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {plan.badge}
                  </Box>
                )}

                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: plan.accentColor, mb: 1 }}>
                  {plan.nombre}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 4 }}>
                  <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 900, color: 'white' }}>
                    {plan.precio}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>
                    {plan.moneda}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, mb: 4 }}>
                  {plan.features.map(f => (
                    <FeatureItem key={f.text} feature={f} color={plan.accentColor} />
                  ))}
                </Box>

                <Button
                  component={Link}
                  href={`/agendar?plan=${plan.id}`}
                  variant={plan.ctaVariant}
                  fullWidth
                  sx={
                    plan.ctaVariant === 'contained'
                      ? {
                          bgcolor: ACCENT,
                          color: '#0a0a0a',
                          fontWeight: 700,
                          borderRadius: 50,
                          py: 1.4,
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#d4a800' },
                        }
                      : {
                          borderColor: plan.accentColor,
                          color: plan.accentColor,
                          fontWeight: 700,
                          borderRadius: 50,
                          py: 1.4,
                          textTransform: 'none',
                          '&:hover': { bgcolor: `${plan.accentColor}12` },
                        }
                  }
                >
                  {plan.cta}
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Typography sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', mt: 6, fontSize: '0.875rem' }}>
          ¿No sabés cuál elegir?{' '}
          <Box
            component={Link}
            href="/agendar"
            sx={{ color: ACCENT, textDecoration: 'underline', '&:hover': { opacity: 0.8 } }}
          >
            Agendá una entrevista gratuita
          </Box>{' '}
          y lo resolvemos juntos.
        </Typography>
      </Box>
    </Box>
  )
}
