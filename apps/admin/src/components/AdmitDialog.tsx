'use client';
import { useState } from 'react';
import type { Session } from '@df/types';

interface Props {
  session: Session;
  onConfirm: (amount: number, sessions: number, currency: string) => Promise<void>;
  onClose: () => void;
}

export default function AdmitDialog({ session, onConfirm, onClose }: Props) {
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '24px',
        width: '360px', maxWidth: '90vw',
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '4px' }}>Admitir paciente</h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
          {session.patient.name} — {session.patient.email}
        </p>

        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
          Monto por sesión
        </label>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '12px', boxSizing: 'border-box' }}
        />

        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
          Cantidad de sesiones
        </label>
        <input
          type="number"
          min="1"
          value={sessions}
          onChange={e => setSessions(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '12px', boxSizing: 'border-box' }}
        />

        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
          Moneda
        </label>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value as 'PYG' | 'USD')}
          style={{ width: '100%', padding: '8px', marginBottom: '16px', boxSizing: 'border-box' }}
        >
          <option value="PYG">PYG</option>
          <option value="USD">USD</option>
        </select>

        {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={loading}>Cancelar</button>
          <button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Enviando…' : 'Confirmar y enviar link de pago'}
          </button>
        </div>
      </div>
    </div>
  );
}
