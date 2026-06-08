import {
  Html, Head, Body, Container,
  Heading, Text, Button, Hr, Section,
} from '@react-email/components'

interface Props {
  patientName:  string
  sessions:     number
  calendarUrl:  string   // link a /registrados para agendar
}

export function WelcomeAfterPaymentEmail({
  patientName,
  sessions,
  calendarUrl,
}: Props) {
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
            Pago confirmado — bienvenido al programa
          </Heading>

          <Text style={{ color: '#4A5568' }}>
            Hola <strong>{patientName}</strong>, tu pago fue
            procesado correctamente.
          </Text>

          <Text style={{ color: '#4A5568', margin: '0 0 16px' }}>
            Tenes <strong>{sessions} sesiones</strong> disponibles
            para agendar con Diego cuando quieras.
          </Text>

          <Hr style={{ borderColor: '#E2E8F0', margin: '16px 0' }} />

          <Section>
            <Button
              href={calendarUrl}
              style={{
                background: '#1E3A5F', color: '#fff',
                padding: '12px 24px', borderRadius: '8px',
                textDecoration: 'none', fontSize: '14px',
              }}
            >
              Agendar mis sesiones
            </Button>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}