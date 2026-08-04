import * as React from 'react'
import { Box, Container, Typography } from '@mui/material'
import { BOOK_DESCRIPTION } from '@/lib/book'

const PRIMARY = '#EBBF01'

const PILLS = [
  'Historia real',
  'Sin filtros',
  'Ex atleta olímpico',
  'Psicólogo clínico',
  '15 capítulos',
  'Descarga inmediata',
]

export default function LibroDescripcion() {
  return (
    <Box component="section" sx={{ bgcolor: '#0a0a0a', color: 'white', py: { xs: 8, md: 12 } }}>
      <Container maxWidth={false} sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ maxWidth: 760, mx: 'auto', textAlign: 'center', mb: 6 }}>
          <Typography
            variant="overline"
            sx={{ color: '#00727A', letterSpacing: 3, fontWeight: 700, display: 'block', mb: 2 }}
          >
            Sobre el libro
          </Typography>
          <Typography sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: 1.85, color: 'rgba(255,255,255,0.85)' }}>
            {BOOK_DESCRIPTION}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2,
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          {PILLS.map(pill => (
            <Box
              key={pill}
              sx={{
                textAlign: 'center',
                py: 1.5,
                px: 2,
                borderRadius: 50,
                border: '1px solid rgba(235,191,1,0.25)',
                bgcolor: 'rgba(235,191,1,0.05)',
                color: PRIMARY,
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {pill}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  )
}
