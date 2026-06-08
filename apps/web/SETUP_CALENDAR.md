# Cómo configurar la disponibilidad en Google Calendar

Para que los pacientes puedan ver y elegir fechas en el
formulario de agendamiento, Diego necesita crear bloques
de disponibilidad en su Google Calendar.

## Pasos

1. Abrir Google Calendar (calendar.google.com)

2. Para cada bloque de tiempo disponible para sesiones,
   crear un evento nuevo con:
   - **Título:** `DISPONIBLE` (en mayúsculas, exactamente así)
   - **Fecha y hora de inicio:** cuando empieza el bloque
   - **Fecha y hora de fin:** cuando termina el bloque
   - Ejemplo: "DISPONIBLE" de 9:00 a 13:00 un lunes

3. El sistema lee esos bloques y genera slots de 1 hora.
   Ejemplo: un bloque 9:00-13:00 genera los slots
   09:00, 10:00, 11:00, 12:00.

4. Si ya hay una sesión reservada en ese horario, el slot
   desaparece automáticamente del calendario del paciente.

## Notas importantes

- El título debe ser exactamente `DISPONIBLE` (mayúsculas,
  sin tildes, sin espacios extra)
- Se pueden crear bloques recurrentes (ej: todos los lunes
  de 9 a 13) para no tener que crearlos uno a uno
- Los bloques pueden ser de cualquier duración; el sistema
  los divide en slots de 1 hora automáticamente
- Se recomienda crear disponibilidad con al menos 2 semanas
  de anticipación

## Variables de entorno necesarias en apps/api

Estas variables deben estar configuradas en `apps/api/.env`:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_CALENDAR_ID=...   # El ID del calendario de Diego
```

Ver instrucciones de obtención en la documentación de Google Calendar API.
