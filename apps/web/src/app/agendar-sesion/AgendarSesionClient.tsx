'use client'
import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// Misma paleta que el resto del sitio (/agendar, /avanza, /main) — #0a0a0a / #EBBF01,
// no la del panel admin (#0f172a / #EAB308) que pedía el brief. Esta página vive en el
// mismo recorrido que /agendar y debe verse consistente con esas páginas, no con el admin.
const ACCENT = '#EBBF01'

interface CalendarEvent { id: string; title: string; start: string; end: string }
interface CalendarData { events: CalendarEvent[]; eventsOccupied: CalendarEvent[] }

interface ValidateResponse {
  name: string
  email: string
  plan: string
  type: string
  totalSessions: number
  bookedSessions: number
  remainingSessions: number
}

const PLAN_LABEL: Record<string, string> = {
  EXPLORATORY: 'Sesión exploratoria',
  PLAN:        'Programa de coaching',
}

export default function AgendarSesionClient() {
  const params = useSearchParams()
  const token = params.get('token')

  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState('')
  const [status, setStatus]     = useState<ValidateResponse | null>(null)

  const [events, setEvents]         = useState<CalendarData>({ events: [], eventsOccupied: [] })
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [booking, setBooking]       = useState(false)
  const [bookError, setBookError]   = useState('')
  const [confirmation, setConfirmation] = useState<{ start: string; meetLink: string | null } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!token) { setLoadError('Este link no es válido.'); setLoading(false); return }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/scheduling/validate?token=${encodeURIComponent(token)}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then((data: ValidateResponse) => setStatus(data))
      .catch(() => setLoadError('Este link venció o no es válido. Escribinos a diego@diegoferreira.coach.'))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!status || status.remainingSessions <= 0) return
    setLoadingSlots(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/calendar/sesiones-exterior`)
      .then(r => (r.ok ? r.json() : { events: [], eventsOccupied: [] }))
      .then(setEvents)
      .finally(() => setLoadingSlots(false))
  }, [status])

  const availableSlots: string[] = useMemo(() => {
    if (!selectedDate) return []
    const ymd = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    const dayEvents = (events.events ?? []).filter(ev =>
      ev.start.startsWith(ymd) || new Date(ev.start).toISOString().startsWith(ymd)
    )
    const occupied = new Set((events.eventsOccupied ?? []).map(ev => ev.start.substring(0, 16)))
    const slots: string[] = []
    dayEvents.forEach(ev => {
      const start = new Date(ev.start)
      const end   = new Date(ev.end)
      const cur   = new Date(start)
      while (cur < end) {
        const slotStr = cur.toISOString().substring(0, 16)
        if (!occupied.has(slotStr)) slots.push(cur.toISOString())
        cur.setHours(cur.getHours() + 1)
      }
    })
    return slots
  }, [selectedDate, events])

  async function handleBook() {
    if (!token || !selectedSlot) return
    setBooking(true)
    setBookError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scheduling/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, start: selectedSlot }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message ?? 'No pudimos agendar ese horario.')
      }
      const data = await res.json()
      setConfirmation({ start: data.start, meetLink: data.meetLink ?? null })
      setStatus(prev => prev ? {
        ...prev,
        bookedSessions: prev.bookedSessions + 1,
        remainingSessions: Math.max(prev.remainingSessions - 1, 0),
      } : prev)
      setSelectedDate(null)
      setSelectedSlot(null)
    } catch (err) {
      setBookError(err instanceof Error ? err.message : 'Ocurrió un error. Probá de nuevo.')
    } finally {
      setBooking(false)
    }
  }

  const wrapperSx = {
    minHeight: '100vh', bgcolor: '#0a0a0a', color: 'white',
    pt: { xs: 14, md: 18 }, pb: { xs: 8, md: 12 }, px: { xs: 2, md: 4 },
  }

  if (loading || !mounted) {
    return (
      <Box sx={{ ...wrapperSx, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: ACCENT }} />
      </Box>
    )
  }

  if (loadError || !status) {
    return (
      <Box sx={{ ...wrapperSx, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Box sx={{ maxWidth: 480 }}>
          <Typography sx={{ fontSize: '2rem', mb: 2 }}>⚠️</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>{loadError}</Typography>
        </Box>
      </Box>
    )
  }

  const planLabel = PLAN_LABEL[status.type] ?? status.plan

  return (
    <Box sx={wrapperSx}>
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        <Typography component="h1" sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, fontWeight: 800, mb: 1 }}>
          Hola {status.name} 👋
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 4 }}>
          Agendá tu{status.totalSessions > 1 ? 's sesiones' : ' sesión'} con Diego cuando quieras.
        </Typography>

        <Box sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.02)', mb: 5 }}>
          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', mb: 1.5, letterSpacing: 1, textTransform: 'uppercase' }}>
            Tu programa
          </Typography>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{planLabel}</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            {status.bookedSessions} de {status.totalSessions} sesiones agendadas
            {status.remainingSessions > 0 && ` · ${status.remainingSessions} pendiente${status.remainingSessions > 1 ? 's' : ''}`}
          </Typography>
        </Box>

        {confirmation && (
          <Box sx={{ p: 3, borderRadius: 3, border: `1px solid ${ACCENT}`, bgcolor: 'rgba(235,191,1,0.06)', mb: 5 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>✅ Sesión agendada</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', mb: confirmation.meetLink ? 1 : 0 }}>
              {new Date(confirmation.start).toLocaleString('es-PY', { dateStyle: 'long', timeStyle: 'short' })}
            </Typography>
            {confirmation.meetLink && (
              <Typography sx={{ fontSize: '0.9rem' }}>
                <a href={confirmation.meetLink} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>
                  Link de Google Meet →
                </a>
              </Typography>
            )}
          </Box>
        )}

        {status.remainingSessions === 0 ? (
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
            Ya agendaste todas tus sesiones.
            Para más info escribí a{' '}
            <a href="mailto:diego@diegoferreira.coach" style={{ color: ACCENT }}>diego@diegoferreira.coach</a>
          </Typography>
        ) : (
          <Box sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.02)' }}>
            <Typography sx={{ fontWeight: 700, mb: 3 }}>Elegí fecha y horario</Typography>

            <DatePicker
              selected={selectedDate}
              onChange={(d: Date | null) => { setSelectedDate(d); setSelectedSlot(null) }}
              minDate={new Date()}
              filterDate={(date: Date) => {
                const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                return (events.events ?? []).some(ev =>
                  new Date(ev.start).toISOString().startsWith(ymd) || ev.start.startsWith(ymd)
                )
              }}
              placeholderText={loadingSlots ? 'Cargando disponibilidad...' : 'Elegí un día'}
              dateFormat="dd/MM/yyyy"
              disabled={loadingSlots}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-yellow-400/60 transition-colors"
            />

            {selectedDate && (
              <Box sx={{ mt: 3 }}>
                {availableSlots.length === 0 ? (
                  <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                    No hay horarios disponibles para este día. Elegí otro día.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {availableSlots.map(slot => {
                      const t = new Date(slot)
                      const label = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
                      const selected = selectedSlot === slot
                      return (
                        <Box
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          sx={{
                            px: 2.5, py: 1, borderRadius: 2, cursor: 'pointer',
                            border: selected ? `1px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.12)',
                            bgcolor: selected ? `${ACCENT}18` : 'transparent',
                            color: selected ? ACCENT : 'rgba(255,255,255,0.65)',
                            fontWeight: selected ? 700 : 400, fontSize: '0.875rem',
                            '&:hover': { borderColor: ACCENT, color: ACCENT },
                          }}
                        >
                          {label}
                        </Box>
                      )
                    })}
                  </Box>
                )}
              </Box>
            )}

            {bookError && (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', mt: 3 }}>
                <Typography sx={{ fontSize: '0.875rem', color: '#f87171' }}>{bookError}</Typography>
              </Box>
            )}

            <Button
              onClick={handleBook}
              disabled={!selectedSlot || booking}
              variant="contained"
              fullWidth
              sx={{
                mt: 3, bgcolor: ACCENT, color: '#0a0a0a', fontWeight: 700,
                borderRadius: 50, py: 1.6, fontSize: '0.95rem', textTransform: 'none',
                '&:hover': { bgcolor: '#d4a800' },
                '&:disabled': { bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' },
              }}
            >
              {booking ? 'Agendando...' : 'Confirmar horario'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}
