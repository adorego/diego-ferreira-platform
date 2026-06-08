import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRedirect = vi.fn()
const mockNext     = vi.fn()

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: (url: URL) => {
      mockRedirect(url.toString())
      return { redirected: true, location: url.toString() }
    },
    next: () => {
      mockNext()
      return { redirected: false }
    },
  },
}))

vi.mock('jose', () => ({ jwtVerify: vi.fn() }))

import { jwtVerify } from 'jose'
import { middleware } from './middleware'

const makeRequest = (pathname: string, token?: string) => ({
  cookies: {
    get: (name: string) =>
      token && name === 'access_token' ? { value: token } : undefined,
  },
  nextUrl: new URL(`http://localhost:3000${pathname}`),
  url:     `http://localhost:3000${pathname}`,
})

describe('middleware()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test_secret_vitest'
  })

  it('ruta /dashboard sin token → redirect a /login', async () => {
    await middleware(makeRequest('/dashboard') as any)
    expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/login'))
  })

  it('ruta /dashboard con token válido → NextResponse.next()', async () => {
    vi.mocked(jwtVerify).mockResolvedValue({ payload: { sub: '1' } } as any)
    await middleware(makeRequest('/dashboard', 'valid_token') as any)
    expect(mockNext).toHaveBeenCalled()
  })

  it('ruta /login con token válido → redirect a /dashboard', async () => {
    vi.mocked(jwtVerify).mockResolvedValue({ payload: { sub: '1' } } as any)
    await middleware(makeRequest('/login', 'valid_token') as any)
    expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/dashboard'))
  })
})
