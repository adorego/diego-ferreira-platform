'use client';
import { useEffect, useState } from 'react';
import { useSearchParams }     from 'next/navigation';

export default function PagoPage() {
  const params = useSearchParams();
  const token  = params.get('token');
  const [processId, setProcessId] = useState<string | null>(null);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-link`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token }),
      credentials: 'include',
    })
      .then(r => r.json())
      .then(d => {
        if (d.processId) setProcessId(d.processId);
        else setError('Link inválido o expirado.');
      })
      .catch(() => setError('Error al procesar el pago.'));
  }, [token]);

  if (error) return (
    <div style={{ padding:'2rem', color:'#C53030' }}>{error}</div>
  );

  if (!processId) return (
    <div style={{ padding:'2rem' }}>Cargando...</div>
  );

  const bancardUrl = process.env.NODE_ENV === 'production'
    ? 'https://vpos.infonet.com.py'
    : 'https://staging.vpos.com.py';

  return (
    <div style={{ padding:'2rem', maxWidth:'600px', margin:'0 auto' }}>
      <h1 style={{ fontSize:'22px', marginBottom:'1rem' }}>
        Completá tu pago
      </h1>
      <iframe
        src={`${bancardUrl}/vpos/api/0.3/single_buy/iframe?process_id=${processId}`}
        style={{ width:'100%', height:'500px', border:'none',
                 borderRadius:'12px' }}
        title="Pago con tarjeta"
      />
    </div>
  );
}