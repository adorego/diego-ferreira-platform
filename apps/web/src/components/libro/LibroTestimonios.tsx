import * as React from 'react'
import { Box, Container, Typography } from '@mui/material'

const PRIMARY = '#EBBF01'

const TESTIMONIOS = [
  { rol: 'Deportista' },
  { rol: 'Padre de atleta' },
  { rol: 'Paciente' },
]

export default function LibroTestimonios() {
  return (
    <Box component="section" sx={{ bgcolor: '#0e0e0e', color: 'white', py: { xs: 8, md: 12 } }}>
      <Container maxWidth={false} sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography component="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, fontWeight: 800, textAlign: 'center', mb: 8 }}>
          Lo que dicen los lectores
        </Typography>

        {/* TODO: reemplazar con testimonios reales */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 3,
            maxWidth: 1100,
            mx: 'auto',
          }}
        >
          {TESTIMONIOS.map(testimonio => (
            <Box
              key={testimonio.rol}
              sx={{ p: 4, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Typography aria-hidden sx={{ fontSize: '3rem', fontWeight: 900, color: PRIMARY, lineHeight: 1, mb: 1 }}>
                &ldquo;
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', lineHeight: 1.7, mb: 3 }}>
                [Testimonio pendiente — agregar texto real]
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                — Nombre Apellido
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                {testimonio.rol}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  )
}
