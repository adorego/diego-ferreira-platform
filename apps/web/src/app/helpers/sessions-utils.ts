const API = process.env.NEXT_PUBLIC_API_URL ?? ""

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
}

export interface CalendarData {
  events: CalendarEvent[]
  eventsOccupied: CalendarEvent[]
}

export interface BookingPayload {
  name: string
  email: string
  country: string
  start: string
  end: string
  type: string
}

// ─── Crear evento en Google Calendar ─────────────────────────────────────────

export async function handleBookingSession(
  payload: BookingPayload,
): Promise<{ ok: boolean; eventId?: string; meetLink?: string; updatedEvents?: CalendarData }> {
  const response = await fetch(
    `${API}/calendar/create-event`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        summary:     `Sesión exploratoria - ${payload.name}`,
        description: `Paciente: ${payload.name} | Email: ${payload.email} | País: ${payload.country}`,
        start:       payload.start,
        end:         payload.end,
        attendees:   [{ email: payload.email, name: payload.name }],
        type:        payload.type,
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.message ?? "Error al crear el evento")
  }

  const data = await response.json()

  // Refrescar la disponibilidad después de crear el evento
  const updatedEvents = await fetch(
    `${API}/calendar/sesiones-exterior`
  )
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)

  return { ok: true, ...data, updatedEvents }
}

// ─── Validar email (verifica si ya existe como paciente) ──────────────────────

export async function validateEmail(
  email: string,
): Promise<{ exists: boolean }> {
  const emailTrim = email.trim()
  const res = await fetch(
    `${API}/patients/exists?email=${encodeURIComponent(emailTrim)}`,
  )
  if (!res.ok) return { exists: false }
  return res.json()
}

// ─── Editar fecha de una sesión ───────────────────────────────────────────────

export async function editSessionDate(
  sessionId: number,
  data: { start: string; end: string },
): Promise<{ ok: boolean }> {
  const res = await fetch(
    `${API}/sessions/${sessionId}/date`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }
  )
  return res.ok ? { ok: true } : { ok: false }
}
