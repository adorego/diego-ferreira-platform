import * as React from 'react'
import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

interface SectionFullBleedProps {
  id?: string
  bg?: string
  color?: string
  /** Espaciado vertical — acepta valor MUI (número, string u objeto responsive) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  py?: any
  /** Espaciado horizontal */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  px?: any
  innerMax?: number | string
  children: React.ReactNode
  sx?: SxProps<Theme>
}

export default function SectionFullBleed({
  id,
  bg = '#0a0a0a',
  color = '#fff',
  py = { xs: 8, md: 12 },
  px = { xs: 2, md: 4 },
  innerMax = 1200,
  children,
  sx,
}: SectionFullBleedProps) {
  return (
    <Box
      component="section"
      id={id}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sx={{ bgcolor: bg, color, py, px, width: '100%', ...(sx as any) } as SxProps<Theme>}
    >
      <Box sx={{ maxWidth: innerMax, mx: 'auto', width: '100%' }}>
        {children}
      </Box>
    </Box>
  )
}
