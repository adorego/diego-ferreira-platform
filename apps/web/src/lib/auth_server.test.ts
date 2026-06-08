import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('jose', () => ({ jwtVerify: vi.fn() }))

import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { getCurrentUser } from './auth_server'

describe('getCurrentUser()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test_secret_vitest'
  })

  it('retorna el payload del JWT con cookie válida', async () => {
    const cookieStore = { get: vi.fn().mockReturnValue({ value: 'valid_token' }) }
    vi.mocked(cookies).mockResolvedValue(cookieStore as any)
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: { sub: '1', email: 'user@test.com', role: 'PATIENT' },
    } as any)

    const user = await getCurrentUser()

    expect(user).toMatchObject({ sub: '1', email: 'user@test.com', role: 'PATIENT' })
  })

  it('retorna null cuando no hay cookie', async () => {
    const cookieStore = { get: vi.fn().mockReturnValue(undefined) }
    vi.mocked(cookies).mockResolvedValue(cookieStore as any)

    const user = await getCurrentUser()

    expect(user).toBeNull()
  })

  it('retorna null con token expirado o inválido', async () => {
    const cookieStore = { get: vi.fn().mockReturnValue({ value: 'expired_token' }) }
    vi.mocked(cookies).mockResolvedValue(cookieStore as any)
    vi.mocked(jwtVerify).mockRejectedValue(new Error('JWTExpired'))

    const user = await getCurrentUser()

    expect(user).toBeNull()
  })
})
