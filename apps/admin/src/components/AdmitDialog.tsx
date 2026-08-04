'use client';
import { useState } from 'react';
import type { Session } from '@df/types';

interface Props {
  session: Session;
  planLabel: string;
  onConfirm: (amount: number, sessions: number, currency: string) => Promise<void>;
  onClose: () => void;
}

const CURRENCY_SYMBOL: Record<string, string> = { PYG: '₲', USD: '$' };

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
  background: 'var(--color-bg)', border: '1px solid var(--color-border)',
  borderRadius: '8px', color: 'var(--color-text)', fontSize: '14px',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px',
};

export default function AdmitDialog({ session, planLabel, onConfirm, onClose }: Props) {
  const [amount, setAmount]     = useState('');
  const [sessions, setSessions] = useState('1');
  const [currency, setCurrency] = useState<'PYG' | 'USD'>('PYG');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleConfirm() {
    const amountNum   = Number(amount);
    const sessionsNum = Number(sessions);
    if (!amountNum || amountNum <= 0) {
      setError('Ingresá un monto válido.');
      return;
    }
    if (!sessionsNum || sessionsNum <= 0) {
      setError('Ingresá una cantidad de sesiones válida.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onConfirm(amountNum, sessionsNum, currency);
    } catch {
      setError('Error al admitir al paciente. Probá de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: 'var(--color-bg-elevated)', borderRadius: '14px', padding: '28px',
        width: '400px', maxWidth: '90vw',
        border: '1px solid var(--color-border)',
      }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 16px', color: 'var(--color-text)' }}>
          Admitir paciente
        </h2>

        <div style={{
          background: 'var(--color-bg)', borderRadius: '10px', padding: '14px 16px',
          marginBottom: '20px', border: '1px solid var(--color-border)',
        }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
            {session.patient.name}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {session.patient.email}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}>
            {planLabel}
          </p>
        </div>

        <label style={labelStyle}>Monto por sesión</label>
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)', fontSize: '14px', pointerEvents: 'none',
          }}>
            {CURRENCY_SYMBOL[currency]}
          </span>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '28px' }}
          />
        </div>

        <label style={labelStyle}>Cantidad de sesiones</label>
        <input
          type="number"
          min="1"
          value={sessions}
          onChange={e => setSessions(e.target.value)}
          style={{ ...inputStyle, marginBottom: '14px' }}
        />

        <label style={labelStyle}>Moneda</label>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value as 'PYG' | 'USD')}
          style={{ ...inputStyle, marginBottom: '20px' }}
        >
          <option value="PYG">PYG — Guaraní</option>
          <option value="USD">USD — Dólar</option>
        </select>

        {error && (
          <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '14px' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-border)',
              background: 'transparent', color: 'var(--color-text-muted)', fontSize: '14px',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '8px', border: 'none',
              background: 'var(--color-accent)', color: 'var(--color-accent-fg)',
              fontSize: '14px', fontWeight: 700,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && (
              <span style={{
                width: '14px', height: '14px', borderRadius: '50%',
                border: '2px solid rgba(15,23,42,0.35)', borderTopColor: '#0f172a',
                animation: 'spin 0.7s linear infinite',
              }} />
            )}
            {loading ? 'Enviando…' : 'Aprobar y enviar link'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
