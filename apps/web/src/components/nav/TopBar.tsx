'use client'
import * as React from 'react'
import {
  AppBar, Toolbar, Box, Button, IconButton,
  Drawer, List, ListItem, ListItemText, Divider,
  useScrollTrigger, Slide,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Cómo funciona', href: '/main#identificacion' },
  { label: 'El Método',     href: '/main#metodo' },
  { label: 'Para quién es', href: '/main#para-quien' },
  { label: 'Precios',       href: '/main#precios' },
]

const NUMBERED_LINKS = [
  { num: '01', label: 'Cómo funciona', href: '/main#identificacion' },
  { num: '02', label: 'El Método',     href: '/main#metodo' },
  { num: '03', label: 'Para quién es', href: '/main#para-quien' },
  { num: '04', label: 'Precios',       href: '/main#precios' },
]

function scrollTo(href: string) {
  const id = href.split('#')[1]
  if (!id) return
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export default function TopBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 })

  return (
    <>
      <AppBar
        position="fixed"
        elevation={trigger ? 4 : 0}
        sx={{
          bgcolor: trigger ? 'rgba(10,10,10,0.97)' : 'transparent',
          backdropFilter: trigger ? 'blur(12px)' : 'none',
          transition: 'background-color 0.3s, backdrop-filter 0.3s',
          borderBottom: trigger ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, md: 4 }, py: 1 }}>
          {/* Logo */}
          <Box sx={{ flexGrow: 1 }}>
            <Link href="/main" style={{ display: 'inline-block' }}>
              <Box
                component="img"
                src="/images/diego_logo_cropped.png"
                alt="Diego Ferreira"
                sx={{ height: { xs: 36, md: 44 }, objectFit: 'contain' }}
              />
            </Link>
          </Box>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {NAV_LINKS.map(link => (
              <Button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                component={Link}
                href={link.href}
                sx={{
                  color: 'rgba(255,255,255,0.82)',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  '&:hover': { color: '#EBBF01' },
                }}
              >
                {link.label}
              </Button>
            ))}
            <Button
              component={Link}
              href="/agendar"
              variant="contained"
              sx={{
                ml: 2,
                bgcolor: '#EBBF01',
                color: '#0a0a0a',
                fontWeight: 700,
                fontSize: '0.85rem',
                borderRadius: 50,
                px: 3,
                py: 1,
                textTransform: 'none',
                '&:hover': { bgcolor: '#d4a800' },
              }}
            >
              Agendá tu lugar hoy
            </Button>
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { bgcolor: '#0a0a0a', color: 'white', width: 280 } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box
            component="img"
            src="/images/diego_logo_transparente_original.png"
            alt="Diego Ferreira"
            sx={{ height: 36, objectFit: 'contain' }}
          />
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <List sx={{ pt: 3 }}>
          {NUMBERED_LINKS.map(link => (
            <ListItem
              key={link.href}
              component={Link}
              href={link.href}
              onClick={() => setDrawerOpen(false)}
              sx={{
                py: 1.5,
                '&:hover': { bgcolor: 'rgba(235,191,1,0.06)' },
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Box sx={{ color: '#EBBF01', fontWeight: 700, fontSize: '0.75rem', mr: 2, minWidth: 24 }}>
                {link.num}
              </Box>
              <ListItemText
                primary={link.label}
                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 3, mt: 'auto' }}>
          <Button
            component={Link}
            href="/agendar"
            fullWidth
            variant="contained"
            sx={{
              bgcolor: '#EBBF01',
              color: '#0a0a0a',
              fontWeight: 700,
              borderRadius: 50,
              py: 1.5,
              textTransform: 'none',
              fontSize: '0.9rem',
              '&:hover': { bgcolor: '#d4a800' },
            }}
          >
            Agendá sesión gratis →
          </Button>
        </Box>
      </Drawer>
    </>
  )
}
