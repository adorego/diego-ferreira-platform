'use client'
import * as React from 'react'
import { Box, Grid, Button, Typography, IconButton } from '@mui/material'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import Link from 'next/link'

const ACCENT = '#EBBF01'
const TEAL   = '#00727A'

interface HeroSplitProps {
  videoUrl: string
}

export default function HeroSplit({ videoUrl }: HeroSplitProps) {
  const videoRef        = React.useRef<HTMLVideoElement>(null)
  const [muted, setMuted]   = React.useState(true)
  const [volume, setVolume] = React.useState(1)

  function toggleMute() {
    setMuted(prev => {
      const next = !prev
      if (!next) {
        const audibleVolume = volume > 0 ? volume : 1
        setVolume(audibleVolume)
        if (videoRef.current) videoRef.current.volume = audibleVolume
      }
      return next
    })
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value)
    setVolume(v)
    setMuted(v === 0)
    if (videoRef.current) videoRef.current.volume = v
  }

  return (
    <Box
      component="section"
      id="inicio"
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        pt: { xs: 10, md: 0 },
        pb: { xs: 6, md: 0 },
      }}
    >
      {/* Background image */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/hero_image.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          zIndex: 0,
        }}
      />
      {/* Dark overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.45) 60%, rgba(10,10,10,0.25) 100%)',
          zIndex: 1,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, md: 4 },
        }}
      >
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          alignItems="center"
          sx={{ flexDirection: { xs: 'column-reverse', md: 'row' } }}
        >
          {/* Text column */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                display: 'inline-block',
                bgcolor: TEAL,
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                mb: 3,
              }}
            >
              Psicología Deportiva · Alto Rendimiento Mental
            </Box>

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '2rem', md: '2.6rem', lg: '3rem' },
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.15,
                mb: 3,
              }}
            >
              Querés lograr tus sueños deportivos{' '}
              <Box component="span" sx={{ color: ACCENT }}>
                o los sueños deportivos de tu hijo/a
              </Box>
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.78)',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.8,
                mb: 4,
                maxWidth: 560,
              }}
            >
              Soy Diego Ferreira — ex atleta olímpico y psicólogo deportivo.
              En <strong style={{ color: ACCENT }}>6 semanas</strong> entrenamos
              tu mente para que rindas al nivel que ya tenés en el entrenamiento.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/agendar"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: ACCENT,
                  color: '#0a0a0a',
                  fontWeight: 700,
                  borderRadius: 50,
                  px: 4,
                  py: 1.5,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#d4a800' },
                }}
              >
                Agendá tu sesión gratuita (15/20 min)
              </Button>
              <Button
                component={Link}
                href="/agendar"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  borderRadius: 50,
                  px: 4,
                  py: 1.5,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.06)' },
                }}
              >
                Comenzá hoy
              </Button>
            </Box>
          </Grid>

          {/* Video column */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Box
                component="video"
                ref={videoRef}
                src={videoUrl}
                autoPlay
                muted={muted}
                loop
                playsInline
                sx={{ width: '100%', display: 'block', maxHeight: 360, objectFit: 'cover' }}
              />

              {/* Controles de volumen */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: 50,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <IconButton
                  onClick={toggleMute}
                  size="small"
                  aria-label={muted ? 'Activar sonido' : 'Silenciar'}
                  sx={{ color: 'white', p: 0.5 }}
                >
                  {muted
                    ? <VolumeOffIcon fontSize="small" />
                    : <VolumeUpIcon fontSize="small" />}
                </IconButton>
                <Box
                  component="input"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volumen"
                  sx={{
                    width: 64,
                    accentColor: ACCENT,
                    cursor: 'pointer',
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
