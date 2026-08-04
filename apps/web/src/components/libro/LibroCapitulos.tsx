import * as React from 'react'
import { Box, Container, Typography } from '@mui/material'
import { BOOK_CHAPTERS } from '@/lib/book'

const PRIMARY = '#EBBF01'

// Capítulos más impactantes emocionalmente — se destacan con borde dorado.
const HIGHLIGHTED_CHAPTERS = new Set([12, 13, 14])

export default function LibroCapitulos() {
  return (
    <Box component="section" sx={{ bgcolor: '#080808', color: 'white', py: { xs: 8, md: 12 } }}>
      <Container maxWidth={false} sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant="overline"
          sx={{ color: '#00727A', letterSpacing: 3, fontWeight: 700, display: 'block', mb: 2, textAlign: 'center' }}
        >
          Índice
        </Typography>
        <Typography component="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, fontWeight: 800, textAlign: 'center', mb: 8 }}>
          Los 15 capítulos
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
            maxWidth: 1100,
            mx: 'auto',
          }}
        >
          {BOOK_CHAPTERS.map((chapter, i) => {
            const num = i + 1
            const isHighlighted = HIGHLIGHTED_CHAPTERS.has(num)
            return (
              <Box
                key={chapter}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: isHighlighted ? `1px solid ${PRIMARY}` : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Typography
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    top: -14,
                    right: 8,
                    fontSize: '5rem',
                    fontWeight: 900,
                    color: 'rgba(255,255,255,0.04)',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  {String(num).padStart(2, '0')}
                </Typography>
                <Typography
                  sx={{
                    position: 'relative',
                    color: isHighlighted ? PRIMARY : 'rgba(255,255,255,0.4)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    mb: 1,
                  }}
                >
                  Capítulo {num}
                </Typography>
                <Typography sx={{ position: 'relative', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5 }}>
                  {chapter}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Container>
    </Box>
  )
}
