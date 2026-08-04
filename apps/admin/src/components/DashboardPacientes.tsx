'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppStatus } from '@df/types';
import type { Session, Patient } from '@df/types';
import AdmitDialog from './AdmitDialog';

const TIPO_LABEL: Record<string, string> = {
  EXPLORATORY: 'Exploratoria',
  PLAN: 'Plan',
};

export default function DashboardPacientes() {
  const router = useRouter();
  const [sessions, setSessions]         = useState<Session[]>([]);
  const [admitOpen, setAdmitOpen]       = useState(false);
  const [admitSession, setAdmitSession] = useState<Session | null>(null);
  const [rejectingId, setRejectingId]   = useState<number | null>(null);

  useEffect(() => {
    // Pasa por el proxy same-origin /api/patients/sessions — un fetch directo del
    // browser a la API cross-origin nunca incluiría la cookie access_token (queda
    // scopeada al dominio del admin, no al de la API). Ver route.ts del proxy.
    fetch('/api/patients/sessions', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        if (!res.ok) {
          console.error('Error fetching sessions:', res.status);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) setSessions(data);
      });
  }, [router]);

  // Dashboard de aprobaciones: solo pendientes. El endpoint sigue devolviendo
  // todas las sesiones (no se cambió el contrato del backend) — el filtro es acá.
  const pendientes = sessions.filter(s => s.status === AppStatus.PENDING);

  // ✅ FIX #1: usa los datos reales del paciente, no hardcodeados
  async function admitPatient(
    patient: Patient,
    amount: number, sessionsCount: number, currency: string,
  ) {
    const res = await fetch('/api/patients/admitPatient', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name:     patient.name,    // ← antes era hardcodeado
        email:    patient.email,   // ← antes era hardcodeado
        price:    String(amount * sessionsCount),
        sessions: sessionsCount,
        currency,
      }),
    });
    if (!res.ok) throw new Error('Error al admitir');
    return res.json();
  }

  // ✅ FIX #2: abre el dialog, no llama admitPatient directamente
  function handleOpenAdmit(session: Session) {
    setAdmitSession(session);
    setAdmitOpen(true);         // ← antes llamaba admitPatient() aquí
  }

  async function handleConfirmAdmit(amount: number, sessionsCount: number, currency: string) {
    if (!admitSession) return;
    await admitPatient(admitSession.patient, amount, sessionsCount, currency);
    setSessions(prev => prev.map(s =>
      s.id === admitSession.id ? { ...s, status: AppStatus.CONFIRMED } : s,
    ));
    setAdmitOpen(false);
    setAdmitSession(null);
  }

  async function handleReject(session: Session) {
    if (!confirm(`¿Rechazar la solicitud de ${session.patient.name}? Se le enviará un email.`)) {
      return;
    }
    setRejectingId(session.id);
    try {
      const res = await fetch(`/api/patients/sessions/${session.id}/reject`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al rechazar');
      setSessions(prev => prev.map(s =>
        s.id === session.id ? { ...s, status: AppStatus.CANCELLED } : s,
      ));
    } catch {
      alert('No se pudo rechazar la solicitud. Probá de nuevo.');
    } finally {
      setRejectingId(null);
    }
  }

  return (
    <div>
      {pendientes.length === 0 && (
        <p style={{ color: '#666', fontSize: '14px' }}>No hay solicitudes pendientes.</p>
      )}
      {pendientes.map(s => (
        <div key={s.id} style={{
          border:'0.5px solid var(--color-border-tertiary)',
          borderRadius:'8px', padding:'1rem', marginBottom:'12px',
        }}>
          <p style={{ fontWeight:500 }}>{s.patient.name}</p>
          <p style={{ fontSize:'13px', color:'#666' }}>{s.patient.email}</p>
          <p style={{ fontSize:'13px', color:'#666' }}>
            {TIPO_LABEL[s.type] ?? s.type}
            {s.start && ` · ${new Date(s.start).toLocaleString('es-PY', { dateStyle: 'medium', timeStyle: 'short' })}`}
            {s.price != null && ` · ${s.price}`}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button onClick={() => handleOpenAdmit(s)}>
              Admitir paciente
            </button>
            <button onClick={() => handleReject(s)} disabled={rejectingId === s.id}>
              {rejectingId === s.id ? 'Rechazando…' : 'Rechazar'}
            </button>
          </div>
        </div>
      ))}
      {admitOpen && admitSession && (
        <AdmitDialog
          session={admitSession}
          onConfirm={handleConfirmAdmit}
          onClose={() => { setAdmitOpen(false); setAdmitSession(null); }}
        />
      )}
    </div>
  );
}
