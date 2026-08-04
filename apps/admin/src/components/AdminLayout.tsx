'use client';
import { useRouter } from 'next/navigation';

export type DashboardView = 'pending' | 'confirmed' | 'all';

interface Props {
  activeView: DashboardView;
  onChangeView: (view: DashboardView) => void;
  pendingCount: number;
  children: React.ReactNode;
}

const NAV_ITEMS: { view: DashboardView; label: string }[] = [
  { view: 'pending',   label: 'Sesiones Pendientes' },
  { view: 'confirmed', label: 'Sesiones Aprobadas' },
  { view: 'all',       label: 'Todas' },
];

export default function AdminLayout({ activeView, onChangeView, pendingCount, children }: Props) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  }

  return (
    <div style={{ display: 'flex', minWidth: '1280px', minHeight: '100vh' }}>
      <aside style={{
        width: '260px', flexShrink: 0,
        background: 'var(--color-bg-elevated)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '0 8px', marginBottom: '32px' }}>
          <p style={{ margin: 0, fontSize: '17px', fontWeight: 800, letterSpacing: '0.02em' }}>
            DIEGO <span style={{ color: 'var(--color-accent)' }}>FERREIRA</span>
          </p>
          <p style={{
            margin: '2px 0 0', fontSize: '11px', color: 'var(--color-text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Panel Admin
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const active = item.view === activeView;
            return (
              <button
                key={item.view}
                onClick={() => onChangeView(item.view)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
                  border: 'none', background: active ? 'var(--color-bg-hover)' : 'transparent',
                  color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontSize: '14px', fontWeight: active ? 600 : 500,
                }}
              >
                <span>{item.label}</span>
                {item.view === 'pending' && pendingCount > 0 && (
                  <span style={{
                    background: 'var(--color-accent)', color: 'var(--color-accent-fg)',
                    borderRadius: '999px', fontSize: '11px', fontWeight: 800,
                    padding: '1px 7px', minWidth: '18px', textAlign: 'center',
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            marginTop: 'auto', padding: '10px 12px', borderRadius: '8px',
            border: '1px solid var(--color-border)', background: 'transparent',
            color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'left',
          }}
        >
          Cerrar sesión
        </button>
      </aside>

      <main style={{ flex: 1, padding: '32px 40px', overflowX: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
