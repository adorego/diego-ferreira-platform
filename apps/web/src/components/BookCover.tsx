'use client'
import * as React from 'react'
import { Box } from '@mui/material'
import { BOOK_COVER_IMAGE, BOOK_TITLE } from '@/lib/book'

export default function BookCover() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        perspective: '1200px',
      }}
    >
      <Box
        component="img"
        src={BOOK_COVER_IMAGE}
        alt={`Tapa del libro — ${BOOK_TITLE}`}
        sx={{
          width: { xs: '78%', sm: '65%', md: '100%' },
          maxWidth: 380,
          borderRadius: 2,
          transform: { xs: 'rotate(-2deg)', md: 'rotate(-4deg) rotateY(4deg)' },
          boxShadow: '0 30px 60px -15px rgba(0,0,0,0.7), 0 10px 20px rgba(0,0,0,0.4)',
        }}
      />
    </Box>
  )
}
