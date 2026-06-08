import {
  Html, Head, Body, Container,
  Heading, Text, Button, Hr, Section,
} from '@react-email/components'

interface Props {
  patientName:  string
  patientEmail: string
  sessionDate:  string   // "01/06/2026 a las 14:00 hs"
  sessionType?:  'exploratory' | 'plan'
  adminUrl:     string
}

export function SessionBookedEmail({
  patientName,
  patientEmail,
  sessionDate,
  sessionType,
  adminUrl,
}: Props) {
  const isExploratory = sessionType === 'exploratory'

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
            {isExploratory
              ? 'Nueva sesion exploratoria agendada'
              : 'Nueva sesion de coaching agendada'}
          </Heading>

          <Text style={{ color: '#4A5568', margin: '0 0 16px' }}>
            <strong>{patientName}</strong> ({patientEmail}) agendo
            una sesion para el <strong>{sessionDate}</strong>.
          </Text>

          <Hr style={{ borderColor: '#E2E8F0', margin: '16px 0' }} />

          <Section>
            <Button
              href={adminUrl}
              style={{
                background: '#00727A', color: '#fff',
                padding: '12px 24px', borderRadius: '8px',
                textDecoration: 'none', fontSize: '14px',
              }}
            >
              Ver en el dashboard
            </Button>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}