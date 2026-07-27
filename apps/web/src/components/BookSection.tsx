'use client'
import * as React from 'react'
import { Box, Typography, Button, Collapse } from '@mui/material'
import BookCover from './BookCover'
import BookPurchase from './BookPurchase'
import {
  BOOK_TITLE,
  BOOK_AUTHOR,
  BOOK_DESCRIPTION,
  BOOK_CHAPTERS,
  BOOK_PREVIEW_PDF_URL,
} from '@/lib/book'

const ACCENT = '#EBBF01'
const BG = '#FAFAF5'
const TEXT = '#2B2B2B'

function scrollToCompra(e: React.MouseEvent) {
  e.preventDefault()
  document.getElementById('libro-comprar')?.scrollIntoView({ behavior: 'smooth' })
}

export default function BookSection() {
  const [chaptersOpen, setChaptersOpen] = React.useState(false)

  return (
    <Box component="section" id="libro">
      {/* Bloque 1 — Presentación del libro */}
      <Box sx={{ bgcolor: BG, color: TEXT, py: { xs: 8, md: 12 }, px: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '0.8fr 1.2fr' },
              gap: { xs: 6, md: 10 },
              alignItems: 'center',
            }}
          >
            <BookCover />

            <Box>
              <Typography
                variant="overline"
                sx={{ color: '#00727A', letterSpacing: 3, fontWeight: 700, display: 'block', mb: 2 }}
              >
                El libro
              </Typography>
              <Typography
                component="h2"
                sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, fontWeight: 900, mb: 1, lineHeight: 1.15 }}
              >
                {BOOK_TITLE}
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', color: 'rgba(43,43,43,0.6)', mb: 3 }}>
                Por {BOOK_AUTHOR}
              </Typography>

              <Typography sx={{ lineHeight: 1.8, mb: 4, color: 'rgba(43,43,43,0.85)' }}>
                {BOOK_DESCRIPTION}
              </Typography>

              {/* Tabla de contenidos */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(43,43,43,0.5)', mb: 2 }}>
                  Capítulos
                </Typography>

                <Box sx={{ display: { xs: chaptersOpen ? 'block' : 'none', md: 'block' } }}>
                  <Box
                    component="ol"
                    sx={{
                      m: 0,
                      pl: '1.4em',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      columnGap: 4,
                      rowGap: 1,
                    }}
                  >
                    {BOOK_CHAPTERS.map(chapter => (
                      <Typography
                        key={chapter}
                        component="li"
                        sx={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(43,43,43,0.8)' }}
                      >
                        {chapter}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <Collapse in={chaptersOpen}>
                    <Box component="ol" sx={{ m: 0, pl: '1.4em' }}>
                      {BOOK_CHAPTERS.map(chapter => (
                        <Typography
                          key={chapter}
                          component="li"
                          sx={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(43,43,43,0.8)', mb: 1 }}
                        >
                          {chapter}
                        </Typography>
                      ))}
                    </Box>
                  </Collapse>
                  <Button
                    onClick={() => setChaptersOpen(o => !o)}
                    sx={{ color: '#00727A', fontWeight: 700, textTransform: 'none', px: 0, mt: 1 }}
                  >
                    {chaptersOpen ? 'Ver menos' : `Ver los ${BOOK_CHAPTERS.length} capítulos →`}
                  </Button>
                </Box>
              </Box>

              {/* Bloque 2 — Descarga de preview gratuita */}
              <Box
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 3,
                  border: `1px solid rgba(235,191,1,0.3)`,
                  bgcolor: 'rgba(235,191,1,0.06)',
                }}
              >
                <Button
                  href={BOOK_PREVIEW_PDF_URL}
                  download
                  variant="outlined"
                  sx={{
                    borderColor: ACCENT,
                    color: '#8a6d00',
                    fontWeight: 700,
                    borderRadius: 50,
                    px: 3,
                    py: 1.2,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(235,191,1,0.12)', borderColor: ACCENT },
                  }}
                >
                  Leer los primeros capítulos gratis
                </Button>
                <Typography sx={{ fontSize: '0.8rem', color: 'rgba(43,43,43,0.55)', mt: 1.5 }}>
                  Capítulos 1 al 3 — Sin registro requerido
                </Typography>
              </Box>

              <Button
                onClick={scrollToCompra}
                href="#libro-comprar"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#0a0a0a',
                  color: 'white',
                  fontWeight: 700,
                  borderRadius: 50,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { bgcolor: '#222' },
                }}
              >
                Quiero mi copia
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Bloque 3 — Compra con Bancard */}
      <Box id="libro-comprar">
        <BookPurchase />
      </Box>
    </Box>
  )
}
