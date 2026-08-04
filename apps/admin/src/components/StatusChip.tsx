import { AppStatus } from '@df/types';

const STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  [AppStatus.PENDING]:   { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning)', label: 'Pendiente' },
  [AppStatus.CONFIRMED]: { bg: 'var(--color-success-bg)', fg: 'var(--color-success)', label: 'Aprobada' },
  [AppStatus.COMPLETED]: { bg: 'var(--color-info-bg)',    fg: 'var(--color-info)',    label: 'Completada' },
  [AppStatus.CANCELLED]: { bg: 'var(--color-danger-bg)',  fg: 'var(--color-danger)',  label: 'Rechazada' },
};

export default function StatusChip({ status }: { status: string }) {
  const style = STYLES[status] ?? { bg: 'var(--color-bg-hover)', fg: 'var(--color-text-muted)', label: status };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
      fontSize: '12px', fontWeight: 700, background: style.bg, color: style.fg,
    }}>
      {style.label}
    </span>
  );
}
