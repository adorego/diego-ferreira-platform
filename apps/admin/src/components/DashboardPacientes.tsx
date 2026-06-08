'use client';
import { useState, useEffect } from 'react';
import type { Session, Patient } from '@df/types';

export default function DashboardPacientes() {
  const API = process.env.NEXT_PUBLIC_API_URL;  // no hardcodear localhost
  const [sessions, setSessions]   = useState<Session[]>([]);
  const [admitOpen, setAdmitOpen] = useState(false);
  const [admitSession, setAdmitSession] = useState<Session | null>(null);

  useEffect(() => {
    fetch(`${API}/patients/sessions`, { credentials:'include' })
      .then(r => r.json())
      .then(setSessions);
  }, []);

  // ✅ FIX #1: usa los datos reales del paciente, no hardcodeados
  async function admitPatient(
    patient: Patient,
    amount: number, sessions: number, currency: string,
  ) {
    const res = await fetch(`${API}/patients/admitPatient`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name:     patient.name,    // ← antes era hardcodeado
        email:    patient.email,   // ← antes era hardcodeado
        price:    String(amount * sessions),
        sessions,
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

  return (
    <div>
      {sessions.map(s => (
        <div key={s.id} style={{
          border:'0.5px solid var(--color-border-tertiary)',
          borderRadius:'8px', padding:'1rem', marginBottom:'12px',
        }}>
          <p style={{ fontWeight:500 }}>{s.patient.name}</p>
          <p style={{ fontSize:'13px', color:'#666' }}>{s.patient.email}</p>
          <button onClick={() => handleOpenAdmit(s)}>
            Admitir paciente
          </button>
        </div>
      ))}
      {/* AdmitDialog va acá — recibe admitSession y onConfirm=admitPatient */}
    </div>
  );
}