'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppStatus } from '@df/types';
import type { Session } from '@df/types';
import AdminLayout, { DashboardView } from './AdminLayout';
import AdmitDialog from './AdmitDialog';
import StatusChip from './StatusChip';
import Toast, { ToastState } from './Toast';

// SessionType (EXPLORATORY|PLAN) es el único campo real de "tipo de programa" que
// existe en el schema — no hay un campo "plan" separado (tiers como "Estándar" o
// "Premium" solo existen como comentarios sobre el monto en el seed, no como dato).
// Las dos columnas pedidas (Tipo/Plan) muestran el mismo campo con distinto detalle.
const TIPO_LABEL: Record<string, string> = {
  EXPLORATORY: 'Exploratoria',
  PLAN:        'Coaching',
};
const PLAN_LABEL: Record<string, string> = {
  EXPLORATORY: 'Sesión exploratoria',
  PLAN:        'Programa de coaching',
};

function formatFecha(start?: string) {
  if (!start) return '—';
  return new Date(start).toLocaleString('es-PY', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function DashboardPacientes() {
  const router = useRouter();
  const [sessions, setSessions]         = useState<Session[]>([]);
  const [loaded, setLoaded]             = useState(false);
  const [view, setView]                 = useState<DashboardView>('pending');
  const [admitOpen, setAdmitOpen]       = useState(false);
  const [admitSession, setAdmitSession] = useState<Session | null>(null);
  const [rejectingId, setRejectingId]   = useState<number | null>(null);
  const [toast, setToast]               = useState<ToastState | null>(null);

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
        setLoaded(true);
      });
  }, [router]);

  const pendingCount = sessions.filter(s => s.status === AppStatus.PENDING).length;
  const visible = sessions.filter(s => {
    if (view === 'pending')   return s.status === AppStatus.PENDING;
    if (view === 'confirmed') return s.status === AppStatus.CONFIRMED;
    return true;
  });

  async function admitPatient(sessionId: number, amount: number, sessionsCount: number, currency: string) {
    const res = await fetch('/api/patients/admitPatient', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        sessionId,
        price:    String(amount * sessionsCount),
        sessions: sessionsCount,
        currency,
      }),
    });
    if (!res.ok) throw new Error('Error al admitir');
    return res.json();
  }

  function handleOpenAdmit(session: Session) {
    setAdmitSession(session);
    setAdmitOpen(true);
  }

  async function handleConfirmAdmit(amount: number, sessionsCount: number, currency: string) {
    if (!admitSession) return;
    await admitPatient(admitSession.id, amount, sessionsCount, currency);
    setSessions(prev => prev.map(s =>
      s.id === admitSession.id ? { ...s, status: AppStatus.CONFIRMED } : s,
    ));
    setAdmitOpen(false);
    setAdmitSession(null);
    setToast({ message: `Solicitud aprobada — se envió el link de pago a ${admitSession.patient.email}.`, variant: 'success' });
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
      setToast({ message: `Solicitud de ${session.patient.name} rechazada.`, variant: 'success' });
    } catch {
      setToast({ message: 'No se pudo rechazar la solicitud. Probá de nuevo.', variant: 'error' });
    } finally {
      setRejectingId(null);
    }
  }

  return (
    <AdminLayout activeView={view} onChangeView={setView} pendingCount={pendingCount}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 24px', color: 'var(--color-text)' }}>
        {view === 'pending' ? 'Sesiones Pendientes' : view === 'confirmed' ? 'Sesiones Aprobadas' : 'Todas las sesiones'}
      </h1>

      {loaded && visible.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)',
          border: '1px dashed var(--color-border)', borderRadius: '12px',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
          <p style={{ fontSize: '15px', margin: 0 }}>No hay sesiones para mostrar acá.</p>
        </div>
      )}

      {visible.length > 0 && (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-elevated)' }}>
                {['Paciente', 'Email', 'País', 'Fecha/Hora', 'Tipo', 'Plan', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '12px 16px', fontSize: '12px',
                    color: 'var(--color-text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.05em', fontWeight: 700,
                    borderBottom: '1px solid var(--color-border)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(s => (
                <tr
                  key={s.id}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{s.patient.name}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>{s.patient.email}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>{s.patient.country || '—'}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>{formatFecha(s.start)}</td>
                  <td style={{ padding: '14px 16px' }}>{TIPO_LABEL[s.type] ?? s.type}</td>
                  <td style={{ padding: '14px 16px' }}>{PLAN_LABEL[s.type] ?? s.type}</td>
                  <td style={{ padding: '14px 16px' }}><StatusChip status={s.status} /></td>
                  <td style={{ padding: '14px 16px' }}>
                    {s.status === AppStatus.PENDING ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenAdmit(s)}
                          style={{
                            padding: '6px 12px', borderRadius: '6px', border: 'none',
                            background: 'var(--color-accent)', color: 'var(--color-accent-fg)',
                            fontSize: '13px', fontWeight: 700,
                          }}
                        >
                          Admitir
                        </button>
                        <button
                          onClick={() => handleReject(s)}
                          disabled={rejectingId === s.id}
                          style={{
                            padding: '6px 12px', borderRadius: '6px',
                            border: '1px solid var(--color-danger)', background: 'transparent',
                            color: 'var(--color-danger)', fontSize: '13px', fontWeight: 600,
                          }}
                        >
                          {rejectingId === s.id ? 'Rechazando…' : 'Rechazar'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {admitOpen && admitSession && (
        <AdmitDialog
          session={admitSession}
          planLabel={PLAN_LABEL[admitSession.type] ?? admitSession.type}
          onConfirm={handleConfirmAdmit}
          onClose={() => { setAdmitOpen(false); setAdmitSession(null); }}
        />
      )}

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </AdminLayout>
  );
}
