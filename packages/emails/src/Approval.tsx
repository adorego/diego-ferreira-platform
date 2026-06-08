import {
  Html, Head, Body, Container,
  Heading, Text, Button, Hr, Section,
} from '@react-email/components'

interface Props {
  patientName: string
  paymentUrl:  string   // JWT de un uso — expira en 48h
  price:       string
  currency:    string
  sessions:    number
}

export function ApprovalEmail({
  patientName,
  paymentUrl,
  price,
  currency,
  sessions,
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
            Tu solicitud fue aprobada
          </Heading>

          <Text style={{ color: '#4A5568' }}>
            Hola <strong>{patientName}</strong>, Diego reviso tu
            solicitud y estas listo para comenzar.
          </Text>

          <Text style={{ color: '#4A5568', margin: '0 0 8px' }}>
            <strong>Plan:</strong> {sessions} sesiones —{' '}
            <strong>{currency} {price}</strong>
          </Text>

          <Hr style={{ borderColor: '#E2E8F0', margin: '16px 0' }} />

          <Text style={{ color: '#718096', fontSize: '13px' }}>
            Completa tu pago para activar tus sesiones.
            Este link expira en 48 horas.
          </Text>

          <Section>
            <Button
              href={paymentUrl}
              style={{
                background: '#1E3A5F', color: '#fff',
                padding: '12px 24px', borderRadius: '8px',
                textDecoration: 'none', fontSize: '14px',
              }}
            >
              Completar pago
            </Button>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}