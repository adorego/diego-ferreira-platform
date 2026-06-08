import {
  Html, Head, Body, Container,
  Heading, Text, Button, Hr, Section,
} from '@react-email/components'

interface Props {
  patientName: string
  sessionDate: string   // "lunes 01/06/2026 a las 14:00 hs"
  meetLink:    string   // meet.google.com/xxx-xxxx-xxx
  hoursUntil:  24 | 1
}

export function ReminderEmail({
  patientName,
  sessionDate,
  meetLink,
  hoursUntil,
}: Props) {
  const isNear = hoursUntil === 1

  return (
    <Html lang="es">
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', background: '#f7f9fc' }}>
        <Container style={{
          maxWidth: '600px', margin: '0 auto',
          background: '#fff', padding: '32px',
          borderRadius: '12px',
        }}>

          <Heading style={{ color: '#1E3A5F', fontSize: '20px', margin: '0 0 8px' }}>
            {isNear
              ? 'Tu sesion empieza en 1 hora'
              : 'Recordatorio: sesion manana'}
          </Heading>

          <Text style={{ color: '#4A5568' }}>
            Hola <strong>{patientName}</strong>, te recordamos
            tu sesion de coaching programada para el{' '}
            <strong>{sessionDate}</strong>.
          </Text>

          <Hr style={{ borderColor: '#E2E8F0', margin: '16px 0' }} />

          <Section>
            <Button
              href={meetLink}
              style={{
                background: '#00727A', color: '#fff',
                padding: '12px 24px', borderRadius: '8px',
                textDecoration: 'none', fontSize: '14px',
              }}
            >
              Entrar a Google Meet
            </Button>
          </Section>

          <Text style={{ color: '#A0AEC0', fontSize: '12px', marginTop: '16px' }}>
            Si no podes asistir, contacta a Diego con anticipacion.
          </Text>

        </Container>
      </Body>
    </Html>
  )
}