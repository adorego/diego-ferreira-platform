import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRedirect     = vi.fn()
const mockNext         = vi.fn()
const mockCookieDelete = vi.fn()

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: (url: URL) => {
      mockRedirect(url.toString())
      return { redirected: true, location: url.toString(), cookies: { delete: mockCookieDelete } }
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

  it('ruta /dashboard con token expirado/inválido → redirect a /login y borra la cookie', async () => {
    vi.mocked(jwtVerify).mockRejectedValue(new Error('"exp" claim timestamp check failed'))

    await middleware(makeRequest('/dashboard', 'expired_token') as any)

    expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/login'))
    expect(mockCookieDelete).toHaveBeenCalledWith('access_token')
  })

  it.each(['/main', '/agendar', '/avanza'])(
    'ruta pública %s → siempre permite acceso, con o sin token',
    async (pathname) => {
      await middleware(makeRequest(pathname) as any)
      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()

      vi.clearAllMocks()
      vi.mocked(jwtVerify).mockResolvedValue({ payload: { sub: '1' } } as any)
      await middleware(makeRequest(pathname, 'valid_token') as any)
      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    },
  )
})
