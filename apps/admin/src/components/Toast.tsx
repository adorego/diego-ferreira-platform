'use client';
import { useEffect } from 'react';

export interface ToastState {
  message: string;
  variant: 'success' | 'error';
}

export default function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isSuccess = toast.variant === 'success';

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 1100,
      background: 'var(--color-bg-elevated)',
      border: `1px solid ${isSuccess ? 'var(--color-success)' : 'var(--color-danger)'}`,
      borderRadius: '10px', padding: '14px 18px', minWidth: '280px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <span style={{ fontSize: '16px' }}>{isSuccess ? '✅' : '⚠️'}</span>
      <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{toast.message}</span>
    </div>
  );
}
