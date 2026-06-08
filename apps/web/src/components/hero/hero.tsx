'use client'
import { Box, Grid, Chip, Typography, Button, List, ListItem, ListItemIcon, ListItemText, Card, CardMedia, CardContent } from '@mui/material'
import Link from 'next/link'

// Ícono checkmark inline (no requiere @mui/icons-material)
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00727A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

interface HeroVideoCardProps {
  videoUrl: string
  videoPosterUrl: string
}

function HeroVideoCard({ videoUrl, videoPosterUrl }: HeroVideoCardProps) {
  const timestamps = [
    { time: '0:00', label: 'Presentación' },
    { time: '1:30', label: 'Metodología' },
    { time: '3:00', label: 'Casos de éxito' },
    { time: '5:00', label: 'Próximos pasos' },
  ]

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 6 }}>
      <CardMedia
        component="video"
        src={videoUrl}
        poster={videoPosterUrl}
        autoPlay
        muted
        loop
        playsInline
        sx={{ width: '100%', maxHeight: 320, objectFit: 'cover' }}
      />
      <CardContent sx={{ bgcolor: '#1a1a2e', color: 'white' }}>
        <Typography variant="caption" sx={{ color: '#EBBF01', fontWeight: 600, display: 'block', mb: 1 }}>
          Contenido del video
        </Typography>
        <List dense disablePadding>
          {timestamps.map(t => (
            <ListItem key={t.time} disablePadding sx={{ mb: 0.5 }}>
              <ListItemText
                primary={`${t.time} — ${t.label}`}
                primaryTypographyProps={{ variant: 'body2', color: 'grey.300' }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

interface HeroSectionProps {
  videoUrl: string
  videoPosterUrl: string
}

const credentials = [
  'Más de 10 años de experiencia en coaching',
  'Formado en psicología del deporte de alto rendimiento',
  'Mentor de atletas y empresarios en Latinoamérica',
  'Certificado internacionalmente en PNL y coaching ejecutivo',
]

const benefits = [
  'Claridad mental para tomar mejores decisiones',
  'Metodología probada con resultados medibles',
  'Acompañamiento personalizado y continuo',
  'Comunidad de alto rendimiento',
]

export default function HeroSection({ videoUrl, videoPosterUrl }: HeroSectionProps) {
  return (
    <Box
      component="section"
      id="inicio"
      sx={{
        pt: { xs: 12, md: 16 },
        pb: { xs: 8, md: 12 },
        px: { xs: 2, md: 6, lg: 8 },
        background: 'linear-gradient(135deg, #FAFAF5 0%, #f0f4f8 100%)',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Grid container spacing={4} alignItems="center" sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
        {/* Left column (7/12) */}
        <Grid item xs={12} md={7}>
          <Chip
            label="Para empresarios y atletas de élite"
            sx={{ bgcolor: '#EBBF01', color: '#1a1a2e', fontWeight: 700, mb: 3, fontSize: '0.75rem' }}
          />
          <Typography
            component="h1"
            variant="h2"
            sx={{ fontWeight: 800, color: '#1a1a2e', mb: 2, lineHeight: 1.15, fontSize: { xs: '2rem', md: '2.8rem' } }}
          >
            Coaching de alto rendimiento
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: '#00727A', fontWeight: 600, mb: 3, fontSize: { xs: '1.1rem', md: '1.4rem' } }}
          >
            Para empresarios y atletas
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mb: 4, lineHeight: 1.8 }}>
            Transformá tu mentalidad, maximizá tu rendimiento y alcanzá resultados
            extraordinarios con una metodología probada en los más altos niveles.
          </Typography>

          {/* Credentials */}
          <List disablePadding sx={{ mb: 3 }}>
            {credentials.map(c => (
              <ListItem key={c} disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={c} primaryTypographyProps={{ variant: 'body2', color: '#2B2B2B' }} />
              </ListItem>
            ))}
          </List>

          {/* Benefits */}
          <Box sx={{ mb: 4 }}>
            {benefits.map(b => (
              <Box key={b} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EBBF01', flexShrink: 0 }} />
                <Typography variant="body2" color="#2B2B2B">{b}</Typography>
              </Box>
            ))}
          </Box>

          <Button
            component={Link}
            href="/agendar"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#EBBF01', color: '#1a1a2e', fontWeight: 700,
              borderRadius: 50, px: 5, py: 1.5,
              '&:hover': { bgcolor: '#d4a900' },
              textTransform: 'none', fontSize: '1rem',
            }}
          >
            Agendar una sesión gratuita
          </Button>
        </Grid>

        {/* Right column — Video (5/12) */}
        <Grid item xs={12} md={5}>
          <HeroVideoCard videoUrl={videoUrl} videoPosterUrl={videoPosterUrl} />
        </Grid>
      </Grid>
    </Box>
  )
}
