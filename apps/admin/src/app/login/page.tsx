'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    // Pasa por el proxy same-origin /api/auth/login (no directo a la API) — la cookie
    // httpOnly que devuelve el backend queda scopeada al dominio de la API si se pide
    // cross-origin, y el middleware de este admin (que corre en su propio dominio)
    // nunca la ve. El proxy la re-emite como si viniera de este mismo origen.
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      window.location.href = '/dashboard'
    } else {
      setError('Credenciales inválidas')
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '11px 14px', borderRadius: '8px', border: '1px solid var(--color-border)',
    background: 'var(--color-bg-elevated)', color: 'var(--color-text)', fontSize: '14px',
  }

  return (
    <main style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
      background: 'var(--color-bg)',
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex', flexDirection: 'column', gap: 14, width: 340,
        background: 'var(--color-bg-elevated)', padding: '32px',
        borderRadius: '14px', border: '1px solid var(--color-border)',
      }}>
        <div style={{ marginBottom: '8px' }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '0.02em' }}>
            DIEGO <span style={{ color: 'var(--color-accent)' }}>FERREIRA</span>
          </p>
          <p style={{
            margin: '2px 0 0', fontSize: '11px', color: 'var(--color-text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Panel Admin
          </p>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        {error && <p style={{ color: 'var(--color-danger)', fontSize: '13px', margin: 0 }}>{error}</p>}
        <button
          type="submit"
          style={{
            padding: '11px', borderRadius: '8px', border: 'none',
            background: 'var(--color-accent)', color: 'var(--color-accent-fg)',
            fontSize: '14px', fontWeight: 700, marginTop: '4px',
          }}
        >
          Ingresar
        </button>
      </form>
    </main>
  )
}
