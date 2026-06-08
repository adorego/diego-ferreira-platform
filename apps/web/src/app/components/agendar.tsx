'use client'
import * as React from 'react'
import { useState, useEffect } from 'react'
import { Box, Typography, Button, Chip, CircularProgress } from '@mui/material'
import Link from 'next/link'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { handleBookingSession, validateEmail } from '@/app/helpers/sessions-utils'
import type { CalendarData, CalendarEvent } from '@/app/helpers/sessions-utils'

// ─── Constantes ────────────────────────────────────────────────────────────────

const ACCENT = '#EBBF01'
const TEAL   = '#00727A'

const PLANES: Record<string, { nombre: string; precio: string; color: string }> = {
  basico:   { nombre: 'Básico',   precio: '$1,300 USD', color: 'rgba(255,255,255,0.5)' },
  estandar: { nombre: 'Estándar', precio: '$1,800 USD', color: ACCENT },
  premium:  { nombre: 'Premium',  precio: '$2,000 USD', color: TEAL },
}

// ─── CSS para el DatePicker (dark theme) ───────────────────────────────────────

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-yellow-400/60 transition-colors'

const inputErrorClass =
  'w-full rounded-xl border border-red-500/50 bg-white/5 px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-red-500 transition-colors'

// ─── Componentes de UI ─────────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        component="label"
        sx={{
          display: 'block',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.55)',
          mb: 1,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
        {required && <Box component="span" sx={{ color: ACCENT, ml: 0.5 }}>*</Box>}
      </Typography>
      {children}
      {error && (
        <Typography sx={{ fontSize: '0.78rem', color: '#f87171', mt: 0.75 }}>
          {error}
        </Typography>
      )}
    </Box>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AgendarSesionProps {
  planFromUrl: string | null
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AgendarSesion({ planFromUrl }: AgendarSesionProps) {
  const planInfo = planFromUrl ? PLANES[planFromUrl] : null

  // Calendario
  const [events,        setEvents]        = useState<CalendarData>({ events: [], eventsOccupied: [] })
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [calendarError, setCalendarError] = useState(false)
  const [mounted,       setMounted]       = useState(false)
  const today = mounted ? new Date() : null

  // Selección de fecha/hora
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  // Formulario
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [country, setCountry] = useState('')
  const [errors,  setErrors]  = useState<Record<string, string>>({})

  // Estado de envío
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Hidration safety
  useEffect(() => { setMounted(true) }, [])

  // Cargar eventos de disponibilidad
  useEffect(() => {
    setLoadingEvents(true)
    setCalendarError(false)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/calendar/sesiones-exterior`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((data: CalendarData) => {
        setEvents(data)
        // Si no hay eventos disponibles, marcar el error
        if (!data?.events?.length) setCalendarError(true)
      })
      .catch(() => setCalendarError(true))
      .finally(() => setLoadingEvents(false))
  }, [])

  // Slots de hora para el día seleccionado
  const availableSlots: string[] = React.useMemo(() => {
    if (!selectedDate) return []
    const ymd = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    const dayEvents = (events.events ?? []).filter((ev: CalendarEvent) =>
      ev.start.startsWith(ymd) || new Date(ev.start).toISOString().startsWith(ymd)
    )
    const occupied = new Set(
      (events.eventsOccupied ?? []).map((ev: CalendarEvent) => ev.start.substring(0, 16))
    )
    const slots: string[] = []
    dayEvents.forEach((ev: CalendarEvent) => {
      const start = new Date(ev.start)
      const end   = new Date(ev.end)
      const cur   = new Date(start)
      while (cur < end) {
        const slotStr = cur.toISOString().substring(0, 16)
        if (!occupied.has(slotStr)) {
          slots.push(cur.toISOString())
        }
        cur.setHours(cur.getHours() + 1)
      }
    })
    return slots
  }, [selectedDate, events])

  // Validación del formulario
  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim())    e.name    = 'El nombre es obligatorio'
    if (!email.trim())   e.email   = 'El email es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email inválido'
    if (!country.trim()) e.country = 'El país es obligatorio'
    if (!selectedDate)   e.date    = 'Elegí una fecha'
    if (!selectedSlot)   e.slot    = 'Elegí un horario'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)
    setSubmitError('')
    try {
      // Verificar si el email ya existe
      const { exists } = await validateEmail(email)
      if (exists) {
        setErrors({ email: 'Este email ya tiene una sesión agendada. Escribinos a diego@diegoferreira.com para reagendar.' })
        setSubmitting(false)
        return
      }
      // Calcular fin (1h después)
      const start = new Date(selectedSlot!)
      const end   = new Date(start.getTime() + 60 * 60 * 1000)
      await handleBookingSession({
        name, email, country,
        start: start.toISOString(),
        end:   end.toISOString(),
        type:  'exploratory',
      })
      setSuccess(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ocurrió un error. Intentá de nuevo o escribinos por WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Pantalla de éxito ──────────────────────────────────────────────────────

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
        <Box sx={{ maxWidth: 500, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem', mb: 3 }}>✅</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 800, color: 'white', mb: 2 }}>
            ¡Sesión agendada!
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, mb: 4 }}>
            Te enviamos un mail de confirmación con el link de Google Meet.
            Diego se va a poner en contacto si necesita ajustar el horario.
          </Typography>
          <Button
            component={Link}
            href="/main"
            variant="contained"
            sx={{ bgcolor: ACCENT, color: '#0a0a0a', fontWeight: 700, borderRadius: 50, px: 5, py: 1.5, textTransform: 'none', '&:hover': { bgcolor: '#d4a800' } }}
          >
            Volver al inicio
          </Button>
        </Box>
      </Box>
    )
  }

  // ─── Formulario principal ───────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        color: 'white',
        pt: { xs: 14, md: 18 },
        pb: { xs: 8, md: 12 },
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        {/* Header */}
        <Typography variant="overline" sx={{ color: TEAL, letterSpacing: 3, fontWeight: 700, display: 'block', mb: 2 }}>
          Primera sesión · Gratuita · Sin compromiso
        </Typography>
        <Typography component="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, fontWeight: 800, lineHeight: 1.2, mb: 3 }}>
          Agendá tu entrevista{' '}
          <Box component="span" sx={{ color: ACCENT }}>gratuita con Diego</Box>
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, mb: 6 }}>
          15-20 minutos por videollamada. Evaluamos juntos si el programa es para vos y respondemos todas tus preguntas.
        </Typography>

        {/* Plan seleccionado */}
        {planInfo ? (
          <Box sx={{ p: 3, borderRadius: 3, border: `1px solid ${planInfo.color}`, bgcolor: 'rgba(255,255,255,0.02)', mb: 6 }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', mb: 1, letterSpacing: 1, textTransform: 'uppercase' }}>
              Plan seleccionado
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label={planInfo.nombre} size="small" sx={{ bgcolor: `${planInfo.color}20`, color: planInfo.color, fontWeight: 700, border: `1px solid ${planInfo.color}40` }} />
              <Typography sx={{ fontWeight: 700, color: 'white' }}>{planInfo.precio}</Typography>
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', mt: 1.5 }}>
              Podés cambiar o consultar sobre este plan durante la entrevista.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.02)', mb: 6 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', mb: 1.5 }}>
              No elegiste un plan aún. Está bien — lo evaluamos juntos durante la entrevista.
            </Typography>
            <Box component={Link} href="/main#precios" sx={{ color: ACCENT, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'underline', '&:hover': { opacity: 0.8 } }}>
              Ver planes →
            </Box>
          </Box>
        )}

        {/* Formulario */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.02)' }}
        >
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, mb: 4 }}>
            Tus datos
          </Typography>

          {/* Nombre */}
          <Field label="Nombre completo" error={errors.name} required>
            <input
              className={errors.name ? inputErrorClass : inputClass}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre"
            />
          </Field>

          {/* Email */}
          <Field label="Email" error={errors.email} required>
            <input
              type="email"
              className={errors.email ? inputErrorClass : inputClass}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </Field>

          {/* País */}
          <Field label="País" error={errors.country} required>
            <input
              className={errors.country ? inputErrorClass : inputClass}
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="Argentina, Paraguay, Uruguay..."
            />
          </Field>

          {/* Fecha */}
          <Field label="Fecha" error={errors.date} required>
            {calendarError ? (
              <div style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: 'rgba(235,191,1,0.06)',
                border: '1px solid rgba(235,191,1,0.2)',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.5,
              }}>
                No hay fechas disponibles en este momento.
                <br />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                  Escribinos a{' '}
                  <a
                    href="mailto:diego@diegoferreira.com"
                    style={{ color: '#EBBF01', textDecoration: 'underline' }}
                  >
                    diego@diegoferreira.com
                  </a>
                  {' '}y coordinamos una sesión.
                </span>
              </div>
            ) : mounted ? (
              <DatePicker
                selected={selectedDate}
                onChange={(d: Date | null) => { setSelectedDate(d); setSelectedSlot(null) }}
                minDate={today ?? undefined}
                filterDate={(date: Date) => {
                  const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                  return (events.events ?? []).some((ev: CalendarEvent) =>
                    new Date(ev.start).toISOString().startsWith(ymd) || ev.start.startsWith(ymd)
                  )
                }}
                placeholderText={loadingEvents ? 'Cargando disponibilidad...' : 'Elegí un día'}
                dateFormat="dd/MM/yyyy"
                className={errors.date ? inputErrorClass : inputClass}
                disabled={loadingEvents}
              />
            ) : (
              <div className={inputClass} style={{ opacity: 0.4 }}>Cargando...</div>
            )}
          </Field>

          {/* Horario */}
          {selectedDate && !calendarError && (
            <Field label="Horario" error={errors.slot} required>
              {availableSlots.length === 0 ? (
                <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', py: 1 }}>
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
                          px: 2.5,
                          py: 1,
                          borderRadius: 2,
                          border: selected ? `1px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.12)',
                          bgcolor: selected ? `${ACCENT}18` : 'transparent',
                          color: selected ? ACCENT : 'rgba(255,255,255,0.65)',
                          fontWeight: selected ? 700 : 400,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          '&:hover': { borderColor: ACCENT, color: ACCENT },
                        }}
                      >
                        {label}
                      </Box>
                    )
                  })}
                </Box>
              )}
            </Field>
          )}

          {/* Error de submit */}
          {submitError && (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', mb: 3 }}>
              <Typography sx={{ fontSize: '0.875rem', color: '#f87171' }}>{submitError}</Typography>
            </Box>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting || calendarError}
            sx={{
              mt: 2,
              bgcolor: ACCENT,
              color: '#0a0a0a',
              fontWeight: 700,
              borderRadius: 50,
              py: 1.6,
              fontSize: '0.95rem',
              textTransform: 'none',
              '&:hover': { bgcolor: '#d4a800' },
              '&:disabled': { bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' },
            }}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={16} sx={{ color: 'rgba(0,0,0,0.5)' }} />
                Agendando...
              </Box>
            ) : (
              'Agendar ahora →'
            )}
          </Button>

          <Typography sx={{ textAlign: 'center', mt: 2, fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
            Al agendar aceptás recibir un email de confirmación de la sesión.
          </Typography>
        </Box>

        {/* Alternativa WhatsApp */}
        <Typography sx={{ textAlign: 'center', mt: 4, fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>
          ¿Preferís coordinarlo directamente?{' '}
          <Box
            component="a"
            href="https://wa.me/595000000000?text=Hola Diego, quiero agendar mi sesión gratuita"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: ACCENT, textDecoration: 'underline', '&:hover': { opacity: 0.8 } }}
          >
            Escribí por WhatsApp →
          </Box>
        </Typography>
      </Box>
    </Box>
  )
}
