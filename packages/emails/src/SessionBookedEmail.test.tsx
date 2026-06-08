import { describe, it, expect } from 'vitest'
import { render } from '@react-email/render'
import { SessionBookedEmail } from './SessionBookedEmail'

const defaultProps = {
  patientName:  'Juan Pérez',
  patientEmail: 'juan@test.com',
  sessionDate:  '01/06/2026 a las 14:00 hs',
  sessionType:  'exploratory' as const,
  adminUrl:     'https://admin.diegoferreira.com',
}

describe('SessionBookedEmail', () => {
  it('render() no lanza errores', async () => {
    await expect(render(SessionBookedEmail(defaultProps))).resolves.toBeDefined()
  })

  it('el HTML generado contiene el patientName', async () => {
    const html = await render(SessionBookedEmail(defaultProps))
    expect(html).toContain('Juan Pérez')
  })

  it('el HTML generado contiene el adminUrl como href', async () => {
    const html = await render(SessionBookedEmail(defaultProps))
    expect(html).toContain('https://admin.diegoferreira.com')
  })
})
